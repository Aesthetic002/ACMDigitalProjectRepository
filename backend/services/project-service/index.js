/**
 * Project Service - gRPC Microservice
 * Handles:
 * - Project CRUD operations
 * - Tag management
 * - Project search
 * - User search
 */

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
require("dotenv").config();

const { db } = require("../firebase");

// Load protos
const projectProtoPath = path.join(__dirname, "../proto/project.proto");
const userProtoPath = path.join(__dirname, "../proto/user.proto");

const projectPackageDef = protoLoader.loadSync(projectProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userPackageDef = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const projectProto = grpc.loadPackageDefinition(projectPackageDef);
const userProto = grpc.loadPackageDefinition(userPackageDef);

// Create User Service client
const userServiceAddr = process.env.USER_SERVICE_ADDR || "localhost:50052";
const userServiceClient = new userProto.acm.user.UserService(
  userServiceAddr,
  grpc.credentials.createInsecure()
);

/**
 * ListProjects - List projects with filters
 */
async function listProjects(call, callback) {
  try {
    const {
      limit = 50,
      offset = 0,
      status,
      tech_stack,
      owner_id,
      tag_ids,
    } = call.request;

    let query = db
      .collection("projects")
      .where("isDeleted", "==", false);

    if (status) {
      query = query.where("status", "==", status);
    }

    if (owner_id) {
      query = query.where("ownerId", "==", owner_id);
    }

    const snapshot = await query.limit(limit).offset(offset).get();

    const projects = [];
    snapshot.forEach((doc) => {
      const projectData = doc.data();

      // Filter by tech stack if provided
      if (
        tech_stack &&
        tech_stack.length > 0 &&
        !tech_stack.some((t) =>
          (projectData.techStack || []).includes(t)
        )
      ) {
        return;
      }

      // Filter by tags if provided
      if (
        tag_ids &&
        tag_ids.length > 0 &&
        !tag_ids.some((t) => (projectData.tags || []).includes(t))
      ) {
        return;
      }

      projects.push({
        id: doc.id,
        title: projectData.title,
        description: projectData.description,
        owner_id: projectData.ownerId,
        owner_name: projectData.ownerName || "Unknown",
        status: projectData.status || "draft",
        tags: projectData.tags || [],
        tech_stack: projectData.techStack || [],
        contributors: projectData.contributors || [],
        is_featured: projectData.isFeatured || false,
        is_deleted: projectData.isDeleted || false,
        assets: (projectData.assets || []).map((a) => ({
          id: a.id || "",
          name: a.name || "",
          url: a.url || "",
          type: a.type || "",
          size: a.size || 0,
        })),
        created_at: projectData.createdAt || 0,
        updated_at: projectData.updatedAt || 0,
        is_approved: projectData.isApproved || false,
      });
    });

    // Get total count
    const totalSnapshot = await db
      .collection("projects")
      .where("isDeleted", "==", false)
      .get();

    callback(null, {
      projects,
      total: totalSnapshot.size,
    });
  } catch (error) {
    console.error("ListProjects error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * GetProject - Get a single project
 */
async function getProject(call, callback) {
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

    if (projectData.isDeleted) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "Project not found",
      });
    }

    callback(null, {
      id: projectDoc.id,
      title: projectData.title,
      description: projectData.description,
      owner_id: projectData.ownerId,
      owner_name: projectData.ownerName || "Unknown",
      status: projectData.status || "draft",
      tags: projectData.tags || [],
      tech_stack: projectData.techStack || [],
      contributors: projectData.contributors || [],
      is_featured: projectData.isFeatured || false,
      is_deleted: projectData.isDeleted || false,
      assets: (projectData.assets || []).map((a) => ({
        id: a.id || "",
        name: a.name || "",
        url: a.url || "",
        type: a.type || "",
        size: a.size || 0,
      })),
      created_at: projectData.createdAt || 0,
      updated_at: projectData.updatedAt || 0,
      is_approved: projectData.isApproved || false,
    });
  } catch (error) {
    console.error("GetProject error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * CreateProject - Create a new project
 */
async function createProject(call, callback) {
  try {
    const { title, description, owner_id, tags, tech_stack, contributors } =
      call.request;

    if (!title || !owner_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Title and owner ID are required",
      });
    }

    // Get owner info from User Service
    userServiceClient.getUser({ user_id: owner_id }, (err, userResponse) => {
      if (err) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "Owner not found",
        });
      }

      const projectData = {
        title,
        description: description || "",
        ownerId: owner_id,
        ownerName: userResponse.name || "Unknown",
        status: "draft",
        tags: tags || [],
        techStack: tech_stack || [],
        contributors: [owner_id, ...(contributors || [])],
        isFeatured: false,
        isDeleted: false,
        isApproved: false,
        assets: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      db.collection("projects")
        .add(projectData)
        .then((docRef) => {
          callback(null, {
            id: docRef.id,
            title: projectData.title,
            description: projectData.description,
            owner_id: projectData.ownerId,
            owner_name: projectData.ownerName,
            status: projectData.status,
            tags: projectData.tags,
            tech_stack: projectData.techStack,
            contributors: projectData.contributors,
            is_featured: projectData.isFeatured,
            is_deleted: projectData.isDeleted,
            assets: [],
            created_at: projectData.createdAt,
            updated_at: projectData.updatedAt,
            is_approved: projectData.isApproved,
          });
        })
        .catch((error) => {
          callback({
            code: grpc.status.INTERNAL,
            message: error.message,
          });
        });
    });
  } catch (error) {
    console.error("CreateProject error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * UpdateProject - Update existing project
 */
async function updateProject(call, callback) {
  try {
    const { project_id, user_id, title, description, tags, tech_stack, contributors, status } =
      call.request;

    if (!project_id || !user_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Project ID and user ID are required",
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

    // Check authorization (owner or contributor or admin)
    if (
      projectData.ownerId !== user_id &&
      !projectData.contributors.includes(user_id)
    ) {
      return callback({
        code: grpc.status.PERMISSION_DENIED,
        message: "You do not have permission to update this project",
      });
    }

    const updateData = {
      updatedAt: Date.now(),
    };

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (tags) updateData.tags = tags;
    if (tech_stack) updateData.techStack = tech_stack;
    if (contributors) updateData.contributors = contributors;
    if (status) updateData.status = status;

    await db.collection("projects").doc(project_id).update(updateData);

    const updatedDoc = await db.collection("projects").doc(project_id).get();
    const updatedData = updatedDoc.data();

    callback(null, {
      id: updatedDoc.id,
      title: updatedData.title,
      description: updatedData.description,
      owner_id: updatedData.ownerId,
      owner_name: updatedData.ownerName,
      status: updatedData.status,
      tags: updatedData.tags || [],
      tech_stack: updatedData.techStack || [],
      contributors: updatedData.contributors || [],
      is_featured: updatedData.isFeatured || false,
      is_deleted: updatedData.isDeleted || false,
      assets: (updatedData.assets || []).map((a) => ({
        id: a.id || "",
        name: a.name || "",
        url: a.url || "",
        type: a.type || "",
        size: a.size || 0,
      })),
      created_at: updatedData.createdAt || 0,
      updated_at: updatedData.updatedAt || 0,
      is_approved: updatedData.isApproved || false,
    });
  } catch (error) {
    console.error("UpdateProject error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * DeleteProject - Soft delete a project
 */
async function deleteProject(call, callback) {
  try {
    const { project_id, user_id } = call.request;

    if (!project_id || !user_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Project ID and user ID are required",
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

    // Check authorization
    if (
      projectData.ownerId !== user_id &&
      !projectData.contributors.includes(user_id)
    ) {
      return callback({
        code: grpc.status.PERMISSION_DENIED,
        message: "You do not have permission to delete this project",
      });
    }

    await db
      .collection("projects")
      .doc(project_id)
      .update({ isDeleted: true, updatedAt: Date.now() });

    callback(null, {
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("DeleteProject error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * SearchProjects - Search projects by query
 */
async function searchProjects(call, callback) {
  try {
    const { query, limit = 20 } = call.request;

    if (!query) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Query is required",
      });
    }

    const snapshot = await db
      .collection("projects")
      .where("isDeleted", "==", false)
      .limit(limit * 3)
      .get();

    const results = [];
    const queryLower = query.toLowerCase();

    snapshot.forEach((doc) => {
      const projectData = doc.data();
      const titleLower = (projectData.title || "").toLowerCase();
      const descLower = (projectData.description || "").toLowerCase();

      let rank = 0;

      // Rank results
      if (titleLower === queryLower) rank = 3;
      else if (titleLower.startsWith(queryLower)) rank = 2;
      else if (titleLower.includes(queryLower)) rank = 1;
      else if (descLower.includes(queryLower)) rank = 1;

      if (rank > 0) {
        results.push({
          project: {
            id: doc.id,
            title: projectData.title,
            description: projectData.description,
            owner_id: projectData.ownerId,
            owner_name: projectData.ownerName,
            status: projectData.status || "draft",
            tags: projectData.tags || [],
            tech_stack: projectData.techStack || [],
            contributors: projectData.contributors || [],
            is_featured: projectData.isFeatured || false,
            is_deleted: projectData.isDeleted || false,
            assets: [],
            created_at: projectData.createdAt || 0,
            updated_at: projectData.updatedAt || 0,
            is_approved: projectData.isApproved || false,
          },
          rank,
        });
      }
    });

    // Sort by rank descending
    results.sort((a, b) => b.rank - a.rank);

    const topResults = results.slice(0, limit).map((r) => r.project);

    callback(null, {
      projects: topResults,
      total: topResults.length,
    });
  } catch (error) {
    console.error("SearchProjects error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * GetTags - Get all tags sorted by usage
 */
async function getTags(call, callback) {
  try {
    const snapshot = await db
      .collection("tags")
      .orderBy("usageCount", "desc")
      .get();

    const tags = [];
    snapshot.forEach((doc) => {
      const tagData = doc.data();
      tags.push({
        id: doc.id,
        name: tagData.name,
        slug: tagData.slug,
        usage_count: tagData.usageCount || 0,
      });
    });

    callback(null, { tags });
  } catch (error) {
    console.error("GetTags error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * CreateTag - Create new tag (admin only handled at gateway level)
 */
async function createTag(call, callback) {
  try {
    const { name, slug } = call.request;

    if (!name || !slug) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Name and slug are required",
      });
    }

    const tagData = {
      name,
      slug: slug.toLowerCase(),
      usageCount: 0,
      createdAt: Date.now(),
    };

    const docRef = await db.collection("tags").add(tagData);

    callback(null, {
      id: docRef.id,
      name: tagData.name,
      slug: tagData.slug,
      usage_count: tagData.usageCount,
    });
  } catch (error) {
    console.error("CreateTag error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * UpdateTag - Update existing tag
 */
async function updateTag(call, callback) {
  try {
    const { tag_id, name, slug } = call.request;

    if (!tag_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Tag ID is required",
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug.toLowerCase();

    await db.collection("tags").doc(tag_id).update(updateData);

    const updatedDoc = await db.collection("tags").doc(tag_id).get();
    const tagData = updatedDoc.data();

    callback(null, {
      id: updatedDoc.id,
      name: tagData.name,
      slug: tagData.slug,
      usage_count: tagData.usageCount || 0,
    });
  } catch (error) {
    console.error("UpdateTag error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * DeleteTag - Delete a tag
 */
async function deleteTag(call, callback) {
  try {
    const { tag_id } = call.request;

    if (!tag_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Tag ID is required",
      });
    }

    await db.collection("tags").doc(tag_id).delete();

    callback(null, {
      success: true,
      message: "Tag deleted successfully",
    });
  } catch (error) {
    console.error("DeleteTag error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * SearchUsers - Search users by name or email
 */
async function searchUsers(call, callback) {
  try {
    const { query, limit = 20 } = call.request;

    if (!query) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Query is required",
      });
    }

    const snapshot = await db.collection("users").limit(limit * 3).get();

    const results = [];
    const queryLower = query.toLowerCase();

    snapshot.forEach((doc) => {
      const userData = doc.data();
      const nameLower = (userData.name || "").toLowerCase();
      const emailLower = (userData.email || "").toLowerCase();

      let rank = 0;

      if (nameLower === queryLower || emailLower === queryLower) rank = 3;
      else if (nameLower.startsWith(queryLower) || emailLower.startsWith(queryLower)) rank = 2;
      else if (nameLower.includes(queryLower) || emailLower.includes(queryLower)) rank = 1;

      if (rank > 0) {
        results.push({
          user: {
            id: userData.uid,
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar || "",
          },
          rank,
        });
      }
    });

    results.sort((a, b) => b.rank - a.rank);

    const topResults = results.slice(0, limit).map((r) => r.user);

    callback(null, { users: topResults });
  } catch (error) {
    console.error("SearchUsers error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * Create and start gRPC server
 */
function startProjectService() {
  const server = new grpc.Server();

  server.addService(projectProto.acm.project.ProjectService.service, {
    listProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    searchProjects,
    getTags,
    createTag,
    updateTag,
    deleteTag,
    searchUsers,
  });

  const PORT = process.env.PROJECT_SERVICE_PORT || 50053;

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("❌ Failed to start Project Service:", err);
        process.exit(1);
      }

      console.log(`\n📁 Project Service started`);
      console.log(`📡 Listening on port ${port}`);
      console.log(`⏰ Started at ${new Date().toISOString()}\n`);
    }
  );
}

// Start service
startProjectService();

console.log("🚀 Project Service initializing...");
