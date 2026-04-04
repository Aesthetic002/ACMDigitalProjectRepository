/**
 * Asset Service - gRPC Microservice
 * Handles:
 * - File uploads with Cloudinary integration
 * - Streaming uploads for large files
 * - Asset management
 * - Signed URLs for downloads
 */

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
require("dotenv").config();

const { db } = require("../firebase");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Load asset proto
const assetProtoPath = path.join(__dirname, "../proto/asset.proto");
const assetPackageDef = protoLoader.loadSync(assetProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const assetProto = grpc.loadPackageDefinition(assetPackageDef);

/**
 * GetUploadUrl - Get a signed Cloudinary upload URL
 */
async function getUploadUrl(call, callback) {
  try {
    const { project_id, user_id, file_name, file_type } = call.request;

    if (!project_id || !user_id || !file_name) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Project ID, user ID, and file name are required",
      });
    }

    // Verify project exists and user is contributor
    const projectDoc = await db.collection("projects").doc(project_id).get();
    if (!projectDoc.exists) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "Project not found",
      });
    }

    const projectData = projectDoc.data();
    if (
      projectData.ownerId !== user_id &&
      !projectData.contributors.includes(user_id)
    ) {
      return callback({
        code: grpc.status.PERMISSION_DENIED,
        message: "You do not have permission to upload assets for this project",
      });
    }

    // Generate Cloudinary upload preset (if using unsigned uploads)
    // Or generate API signature for signed uploads
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: `acm/${project_id}`,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    callback(null, {
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/auto/upload`,
      asset_id: `${project_id}_${Date.now()}`,
      public_id: `acm/${project_id}/${file_name}`,
    });
  } catch (error) {
    console.error("GetUploadUrl error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * UploadAsset - Stream-based file upload
 */
async function uploadAsset(call, callback) {
  try {
    const chunks = [];
    let assetId = null;
    let projectId = null;
    let userId = null;

    // Receive chunks from stream
    call.on("data", async (request) => {
      if (!assetId) {
        assetId = request.asset_id;
        projectId = request.project_id;
        userId = request.user_id;
      }

      if (request.chunk && request.chunk.length > 0) {
        chunks.push(request.chunk);
      }
    });

    call.on("end", async () => {
      try {
        if (chunks.length === 0) {
          return callback({
            code: grpc.status.INVALID_ARGUMENT,
            message: "No file data received",
          });
        }

        // Combine chunks into buffer
        const fileBuffer = Buffer.concat(chunks);

        // Upload to Cloudinary (in practice, would handle actual streaming)
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `acm/${projectId}`,
              public_id: assetId,
              resource_type: "auto",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(fileBuffer);
        });

        // Save asset metadata to Firestore
        const assetMetadata = {
          id: result.public_id,
          name: assetId,
          url: result.secure_url,
          type: result.resource_type,
          size: result.bytes,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          uploadedBy: userId,
        };

        await db
          .collection("projects")
          .doc(projectId)
          .update({
            assets: grpc.firestore.FieldValue.arrayUnion(assetMetadata),
          });

        callback(null, {
          success: true,
          asset_id: result.public_id,
          url: result.secure_url,
          message: "Asset uploaded successfully",
        });
      } catch (error) {
        callback({
          code: grpc.status.INTERNAL,
          message: error.message,
        });
      }
    });

    call.on("error", (error) => {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message,
      });
    });
  } catch (error) {
    console.error("UploadAsset error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * ListAssets - Get all assets for a project
 */
async function listAssets(call, callback) {
  try {
    const { project_id } = call.request;

    if (!project_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Project ID is required",
      });
    }

    const projectDoc = await db.collection("projects").doc(project_id).get();

    if (!projectDoc.exists) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "Project not found",
      });
    }

    const projectData = projectDoc.data();
    const assets = (projectData.assets || []).map((a) => ({
      id: a.id || "",
      name: a.name || "",
      url: a.url || "",
      type: a.type || "",
      size: a.size || 0,
      created_at: a.createdAt || 0,
      updated_at: a.updatedAt || 0,
    }));

    callback(null, { assets });
  } catch (error) {
    console.error("ListAssets error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * DeleteAsset - Delete an asset from project
 */
async function deleteAsset(call, callback) {
  try {
    const { asset_id, project_id, user_id } = call.request;

    if (!asset_id || !project_id || !user_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Asset ID, project ID, and user ID are required",
      });
    }

    // Verify user has permission
    const projectDoc = await db.collection("projects").doc(project_id).get();
    if (!projectDoc.exists) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "Project not found",
      });
    }

    const projectData = projectDoc.data();
    if (
      projectData.ownerId !== user_id &&
      !projectData.contributors.includes(user_id)
    ) {
      return callback({
        code: grpc.status.PERMISSION_DENIED,
        message: "You do not have permission to delete this asset",
      });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(asset_id);
    } catch (cloudinaryError) {
      console.warn(`Could not delete from Cloudinary: ${cloudinaryError}`);
    }

    // Remove from Firestore
    const assets = projectData.assets || [];
    const updatedAssets = assets.filter((a) => a.id !== asset_id);

    await db.collection("projects").doc(project_id).update({
      assets: updatedAssets,
    });

    callback(null, {
      success: true,
      message: "Asset deleted successfully",
    });
  } catch (error) {
    console.error("DeleteAsset error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * GenerateSignedUrl - Generate a signed download URL
 */
async function generateSignedUrl(call, callback) {
  try {
    const { file_path, expiration = 3600 } = call.request;

    if (!file_path) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "File path is required",
      });
    }

    // Generate signed URL using Cloudinary
    const signedUrl = cloudinary.utils.private_download_url(
      file_path,
      "pdf",
      {
        expires_at: Math.floor(Date.now() / 1000) + expiration,
      }
    );

    callback(null, {
      signed_url: signedUrl,
      expires_at: Date.now() + expiration * 1000,
    });
  } catch (error) {
    console.error("GenerateSignedUrl error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * Create and start gRPC server
 */
function startAssetService() {
  const server = new grpc.Server();

  server.addService(assetProto.acm.asset.AssetService.service, {
    getUploadUrl,
    uploadAsset,
    listAssets,
    deleteAsset,
    generateSignedUrl,
  });

  const PORT = process.env.ASSET_SERVICE_PORT || 50054;

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("❌ Failed to start Asset Service:", err);
        process.exit(1);
      }

      console.log(`\n🖼️  Asset Service started`);
      console.log(`📡 Listening on port ${port}`);
      console.log(`⏰ Started at ${new Date().toISOString()}\n`);
    }
  );
}

// Start service
startAssetService();

console.log("🚀 Asset Service initializing...");
