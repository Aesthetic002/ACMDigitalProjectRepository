/**
 * Storage Service
 *
 * Handles Firebase Storage operations for project assets.
 * Generates signed URLs for uploads and downloads.
 */

const { admin, db } = require("../firebase");

const storage = admin.storage().bucket();

/**
 * Generate a signed upload URL for a file
 *
 * @param {string} filePath - Path in Firebase Storage (e.g., "projects/proj123/file.pdf")
 * @param {number} expirationMinutes - URL expiry time in minutes (default: 15)
 * @returns {Promise<string>} Signed upload URL
 */
const generateSignedUploadUrl = async (filePath, expirationMinutes = 15) => {
  try {
    const file = storage.file(filePath);

    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + expirationMinutes * 60 * 1000,
    });

    return url;
  } catch (error) {
    console.error("Generate upload URL error:", error.message);
    throw new Error(`Failed to generate upload URL: ${error.message}`);
  }
};

/**
 * Generate a signed download URL for a file
 *
 * @param {string} filePath - Path in Firebase Storage
 * @param {number} expirationMinutes - URL expiry time in minutes (default: 60)
 * @returns {Promise<string>} Signed download URL
 */
const generateSignedDownloadUrl = async (filePath, expirationMinutes = 60) => {
  try {
    const file = storage.file(filePath);

    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + expirationMinutes * 60 * 1000,
    });

    return url;
  } catch (error) {
    console.error("Generate download URL error:", error.message);
    throw new Error(`Failed to generate download URL: ${error.message}`);
  }
};

/**
 * Delete a file from Firebase Storage
 *
 * @param {string} filePath - Path in Firebase Storage
 * @returns {Promise<void>}
 */
const deleteFile = async (filePath) => {
  try {
    const file = storage.file(filePath);
    await file.delete();
  } catch (error) {
    console.error("Delete file error:", error.message);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

/**
 * Get file metadata from Firebase Storage
 *
 * @param {string} filePath - Path in Firebase Storage
 * @returns {Promise<object>} File metadata
 */
const getFileMetadata = async (filePath) => {
  try {
    const file = storage.file(filePath);
    const [metadata] = await file.getMetadata();
    return metadata;
  } catch (error) {
    console.error("Get file metadata error:", error.message);
    throw new Error(`Failed to get file metadata: ${error.message}`);
  }
};

/**
 * Create asset record in Firestore
 *
 * @param {string} projectId - Project ID
 * @param {object} assetData - Asset metadata
 * @returns {Promise<string>} Asset ID
 */
const createAssetRecord = async (projectId, assetData) => {
  try {
    const assetRef = await db
      .collection("projects")
      .doc(projectId)
      .collection("assets")
      .add({
        ...assetData,
        createdAt: new Date().toISOString(),
      });

    return assetRef.id;
  } catch (error) {
    console.error("Create asset record error:", error.message);
    throw new Error(`Failed to create asset record: ${error.message}`);
  }
};

/**
 * Get asset record from Firestore
 *
 * @param {string} projectId - Project ID
 * @param {string} assetId - Asset ID
 * @returns {Promise<object>} Asset data
 */
const getAssetRecord = async (projectId, assetId) => {
  try {
    const assetDoc = await db
      .collection("projects")
      .doc(projectId)
      .collection("assets")
      .doc(assetId)
      .get();

    if (!assetDoc.exists) {
      throw new Error("Asset not found");
    }

    return assetDoc.data();
  } catch (error) {
    console.error("Get asset record error:", error.message);
    throw error;
  }
};

/**
 * Delete asset record from Firestore
 *
 * @param {string} projectId - Project ID
 * @param {string} assetId - Asset ID
 * @returns {Promise<void>}
 */
const deleteAssetRecord = async (projectId, assetId) => {
  try {
    await db
      .collection("projects")
      .doc(projectId)
      .collection("assets")
      .doc(assetId)
      .delete();
  } catch (error) {
    console.error("Delete asset record error:", error.message);
    throw new Error(`Failed to delete asset record: ${error.message}`);
  }
};

/**
 * List assets for a project
 *
 * @param {string} projectId - Project ID
 * @returns {Promise<array>} List of assets
 */
const listProjectAssets = async (projectId) => {
  try {
    const assetsSnapshot = await db
      .collection("projects")
      .doc(projectId)
      .collection("assets")
      .orderBy("createdAt", "desc")
      .get();

    const assets = [];
    for (const doc of assetsSnapshot.docs) {
      const assetData = doc.data();
      assets.push({
        id: doc.id,
        ...assetData,
      });
    }

    return assets;
  } catch (error) {
    console.error("List assets error:", error.message);
    throw new Error(`Failed to list assets: ${error.message}`);
  }
};

module.exports = {
  generateSignedUploadUrl,
  generateSignedDownloadUrl,
  deleteFile,
  getFileMetadata,
  createAssetRecord,
  getAssetRecord,
  deleteAssetRecord,
  listProjectAssets,
};
