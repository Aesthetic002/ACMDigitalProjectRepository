/**
 * API Gateway - REST to gRPC Translator
 *
 * Converts REST requests from frontend into gRPC calls to microservices
 * and translates responses back to REST/JSON format.
 *
 * Port: 3000
 * API Routes: /api/v1/*
 */

const express = require("express");
const cors = require("cors");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ============================================================
// Load gRPC Service Protos
// ============================================================

const protoPath = path.join(__dirname, "../proto");

const authPackageDef = protoLoader.loadSync(
  path.join(protoPath, "auth.proto"),
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
);
const userPackageDef = protoLoader.loadSync(
  path.join(protoPath, "user.proto"),
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
);
const projectPackageDef = protoLoader.loadSync(
  path.join(protoPath, "project.proto"),
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
);
const assetPackageDef = protoLoader.loadSync(
  path.join(protoPath, "asset.proto"),
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
);
const notificationPackageDef = protoLoader.loadSync(
  path.join(protoPath, "notification.proto"),
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
);

const authProto = grpc.loadPackageDefinition(authPackageDef);
const userProto = grpc.loadPackageDefinition(userPackageDef);
const projectProto = grpc.loadPackageDefinition(projectPackageDef);
const assetProto = grpc.loadPackageDefinition(assetPackageDef);
const notificationProto = grpc.loadPackageDefinition(notificationPackageDef);

// ============================================================
// Create gRPC Service Clients
// ============================================================

const authClient = new authProto.acm.auth.AuthService(
  process.env.AUTH_SERVICE_ADDR || "localhost:50051",
  grpc.credentials.createInsecure()
);

const userClient = new userProto.acm.user.UserService(
  process.env.USER_SERVICE_ADDR || "localhost:50052",
  grpc.credentials.createInsecure()
);

const projectClient = new projectProto.acm.project.ProjectService(
  process.env.PROJECT_SERVICE_ADDR || "localhost:50053",
  grpc.credentials.createInsecure()
);

const assetClient = new assetProto.acm.asset.AssetService(
  process.env.ASSET_SERVICE_ADDR || "localhost:50054",
  grpc.credentials.createInsecure()
);

const notificationClient = new notificationProto.acm.notification.NotificationService(
  process.env.NOTIFICATION_SERVICE_ADDR || "localhost:50055",
  grpc.credentials.createInsecure()
);

// ============================================================
// Middleware: Authentication & Authorization
// ============================================================

// Extract token from Authorization header
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

// Middleware: Verify token and attach user to request
function verifyToken(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "No authentication token provided",
    });
  }

  authClient.validateToken({ token }, (err, response) => {
    if (err) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: err.message,
      });
    }

    req.user = {
      uid: response.user_id,
      email: response.email,
      role: response.role,
      emailVerified: response.email_verified,
    };

    next();
  });
}

// Middleware: Verify admin role
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Authentication required",
    });
  }

  authClient.checkAdmin({ user_id: req.user.uid }, (err, response) => {
    if (err || !response.is_admin) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Admin access required",
      });
    }

    next();
  });
}

// ============================================================
// Helper: Convert gRPC error to HTTP response
// ============================================================

function handleGrpcError(err, res) {
  if (!err) return false;

  console.error("gRPC Error:", err);

  let statusCode = 500;
  let message = err.message || "Internal server error";

  if (err.code === grpc.status.INVALID_ARGUMENT) statusCode = 400;
  else if (err.code === grpc.status.NOT_FOUND) statusCode = 404;
  else if (err.code === grpc.status.PERMISSION_DENIED) statusCode = 403;
  else if (err.code === grpc.status.UNAUTHENTICATED) statusCode = 401;

  res.status(statusCode).json({
    success: false,
    error: err.code || "InternalServerError",
    message: message,
  });

  return true;
}

// ============================================================
// Routes: Authentication
// ============================================================

app.post("/api/v1/auth/verify", (req, res) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(400).json({
      success: false,
      error: "BadRequest",
      message: "Token is required",
    });
  }

  authClient.verifyIdToken({ token }, (err, response) => {
    if (handleGrpcError(err, res)) return;

    res.status(200).json({
      success: true,
      data: {
        user: {
          uid: response.uid,
          email: response.email,
          name: response.name,
          role: response.role,
          avatar: response.avatar,
          emailVerified: response.email_verified,
          createdAt: response.created_at,
          updatedAt: response.updated_at,
        },
      },
    });
  });
});

// ============================================================
// Routes: Users
// ============================================================

app.get("/api/v1/users/:userId", (req, res) => {
  const { userId } = req.params;

  userClient.getUser({ user_id: userId }, (err, response) => {
    if (handleGrpcError(err, res)) return;

    res.status(200).json({
      success: true,
      data: {
        user: {
          uid: response.uid,
          email: response.email,
          name: response.name,
          role: response.role,
          avatar: response.avatar,
          emailVerified: response.email_verified,
          createdAt: response.created_at,
          updatedAt: response.updated_at,
          projects: response.projects,
        },
      },
    });
  });
});

app.get("/api/v1/users", verifyToken, requireAdmin, (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const role = req.query.role || "";

  userClient.listUsers({ limit, offset, role }, (err, response) => {
    if (handleGrpcError(err, res)) return;

    res.status(200).json({
      success: true,
      data: {
        users: response.users.map((u) => ({
          uid: u.uid,
          email: u.email,
          name: u.name,
          role: u.role,
          avatar: u.avatar,
          emailVerified: u.email_verified,
          createdAt: u.created_at,
          updatedAt: u.updated_at,
        })),
        total: response.total,
      },
    });
  });
});

app.post("/api/v1/users", verifyToken, requireAdmin, (req, res) => {
  const { email, name, password, role, avatar } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "BadRequest",
      message: "Email and password are required",
    });
  }

  userClient.createUser(
    { email, name: name || "", password, role: role || "viewer", avatar: avatar || "" },
    (err, response) => {
      if (handleGrpcError(err, res)) return;

      res.status(201).json({
        success: true,
        data: {
          user: {
            uid: response.uid,
            email: response.email,
            name: response.name,
            role: response.role,
            avatar: response.avatar,
            emailVerified: response.email_verified,
          },
        },
      });
    }
  );
});

app.put("/api/v1/users/:userId", verifyToken, (req, res) => {
  const { userId } = req.params;
  const { name, avatar, role } = req.body;

  // Users can only update their own profile (or admin can update anyone)
  if (req.user.uid !== userId && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "You can only update your own profile",
    });
  }

  userClient.updateUser({ user_id: userId, name, avatar, role }, (err, response) => {
    if (handleGrpcError(err, res)) return;

    res.status(200).json({
      success: true,
      data: {
        user: {
          uid: response.uid,
          email: response.email,
          name: response.name,
          role: response.role,
          avatar: response.avatar,
        },
      },
    });
  });
});

app.delete("/api/v1/users/:userId", verifyToken, requireAdmin, (req, res) => {
  const { userId } = req.params;

  userClient.deleteUser({ user_id: userId }, (err, response) => {
    if (handleGrpcError(err, res)) return;

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  });
});

// ============================================================
// Routes: Projects
// ============================================================

app.get("/api/v1/projects", (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const status = req.query.status || "";
  const techStack = req.query.techStack?.split(",") || [];
  const ownerId = req.query.ownerId || "";
  const tagIds = req.query.tagIds?.split(",") || [];

  projectClient.listProjects(
    { limit, offset, status, tech_stack: techStack, owner_id: ownerId, tag_ids: tagIds },
    (err, response) => {
      if (handleGrpcError(err, res)) return;

      res.status(200).json({
        success: true,
        data: {
          projects: response.projects,
          total: response.total,
        },
      });
    }
  );
});

app.get("/api/v1/projects/:projectId", (req, res) => {
  const { projectId } = req.params;

  projectClient.getProject({ project_id: projectId }, (err, response) => {
    if (handleGrpcError(err, res)) return;

    res.status(200).json({
      success: true,
      data: {
        project: response,
      },
    });
  });
});

app.post("/api/v1/projects", verifyToken, (req, res) => {
  const { title, description, tags, techStack, contributors } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      error: "BadRequest",
      message: "Title is required",
    });
  }

  projectClient.createProject(
    {
      title,
      description: description || "",
      owner_id: req.user.uid,
      tags: tags || [],
      tech_stack: techStack || [],
      contributors: contributors || [],
    },
    (err, response) => {
      if (handleGrpcError(err, res)) return;

      res.status(201).json({
        success: true,
        data: {
          project: response,
        },
      });
    }
  );
});

app.put("/api/v1/projects/:projectId", verifyToken, (req, res) => {
  const { projectId } = req.params;
  const { title, description, tags, techStack, contributors, status } = req.body;

  projectClient.updateProject(
    {
      project_id: projectId,
      user_id: req.user.uid,
      title: title || "",
      description: description || "",
      tags: tags || [],
      tech_stack: techStack || [],
      contributors: contributors || [],
      status: status || "",
    },
    (err, response) => {
      if (handleGrpcError(err, res)) return;

      res.status(200).json({
        success: true,
        data: {
          project: response,
        },
      });
    }
  );
});

app.delete("/api/v1/projects/:projectId", verifyToken, (req, res) => {
  const { projectId } = req.params;

  projectClient.deleteProject(
    { project_id: projectId, user_id: req.user.uid },
    (err, response) => {
      if (handleGrpcError(err, res)) return;

      res.status(200).json({
        success: true,
        message: "Project deleted successfully",
      });
    }
  );
});

// ============================================================
// Routes: Search
// ============================================================

app.get("/api/v1/search", (req, res) => {
  const query = req.query.q || "";
  const type = req.query.type || "all";
  const limit = parseInt(req.query.limit) || 20;

  if (!query) {
    return res.status(400).json({
      success: false,
      error: "BadRequest",
      message: "Search query is required",
    });
  }

  // Search projects
  if (type === "projects" || type === "all") {
    projectClient.searchProjects({ query, limit }, (err, projectResponse) => {
      if (handleGrpcError(err, res)) return;

      // Search users if requested
      if (type === "all") {
        projectClient.searchUsers({ query, limit }, (userErr, userResponse) => {
          res.status(200).json({
            success: true,
            data: {
              results: {
                projects: projectResponse.projects || [],
                users: userResponse.users || [],
              },
            },
          });
        });
      } else {
        res.status(200).json({
          success: true,
          data: {
            results: {
              projects: projectResponse.projects || [],
            },
          },
        });
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: "BadRequest",
      message: "Invalid search type",
    });
  }
});

// ============================================================
// Routes: Tags
// ============================================================

app.get("/api/v1/tags", (req, res) => {
  projectClient.getTags({}, (err, response) => {
    if (handleGrpcError(err, res)) return;

    res.status(200).json({
      success: true,
      data: {
        tags: response.tags,
      },
    });
  });
});

app.post("/api/v1/tags", verifyToken, requireAdmin, (req, res) => {
  const { name, slug } = req.body;

  if (!name || !slug) {
    return res.status(400).json({
      success: false,
      error: "BadRequest",
      message: "Name and slug are required",
    });
  }

  projectClient.createTag({ name, slug }, (err, response) => {
    if (handleGrpcError(err, res)) return;

    res.status(201).json({
      success: true,
      data: {
        tag: response,
      },
    });
  });
});

app.put("/api/v1/tags/:tagId", verifyToken, requireAdmin, (req, res) => {
  const { tagId } = req.params;
  const { name, slug } = req.body;

  projectClient.updateTag({ tag_id: tagId, name, slug }, (err, response) => {
    if (handleGrpcError(err, res)) return;

    res.status(200).json({
      success: true,
      data: {
        tag: response,
      },
    });
  });
});

app.delete("/api/v1/tags/:tagId", verifyToken, requireAdmin, (req, res) => {
  const { tagId } = req.params;

  projectClient.deleteTag({ tag_id: tagId }, (err, response) => {
    if (handleGrpcError(err, res)) return;

    res.status(200).json({
      success: true,
      message: "Tag deleted successfully",
    });
  });
});

// ============================================================
// Routes: Events
// ============================================================

app.get("/api/v1/events", (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  notificationClient.listEvents({ limit, offset }, (err, response) => {
    if (handleGrpcError(err, res)) return;

    res.status(200).json({
      success: true,
      data: {
        events: response.events,
        total: response.total,
      },
    });
  });
});

app.get("/api/v1/events/:eventId", (req, res) => {
  const { eventId } = req.params;

  notificationClient.getEvent({ event_id: eventId }, (err, response) => {
    if (handleGrpcError(err, res)) return;

    res.status(200).json({
      success: true,
      data: {
        event: response,
      },
    });
  });
});

app.post("/api/v1/events", verifyToken, requireAdmin, (req, res) => {
  const { title, description, startDate, endDate, type } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      error: "BadRequest",
      message: "Title is required",
    });
  }

  notificationClient.createEvent(
    { title, description: description || "", start_date: startDate, end_date: endDate, type: type || "general" },
    (err, response) => {
      if (handleGrpcError(err, res)) return;

      res.status(201).json({
        success: true,
        data: {
          event: response,
        },
      });
    }
  );
});

app.put("/api/v1/events/:eventId", verifyToken, requireAdmin, (req, res) => {
  const { eventId } = req.params;
  const { title, description, startDate, endDate, type } = req.body;

  notificationClient.updateEvent(
    { event_id: eventId, title, description, start_date: startDate, end_date: endDate, type },
    (err, response) => {
      if (handleGrpcError(err, res)) return;

      res.status(200).json({
        success: true,
        data: {
          event: response,
        },
      });
    }
  );
});

app.delete("/api/v1/events/:eventId", verifyToken, requireAdmin, (req, res) => {
  const { eventId } = req.params;

  notificationClient.deleteEvent({ event_id: eventId }, (err, response) => {
    if (handleGrpcError(err, res)) return;

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  });
});

// ============================================================
// Routes: Assets
// ============================================================

app.get("/api/v1/projects/:projectId/assets", (req, res) => {
  const { projectId } = req.params;

  assetClient.listAssets({ project_id: projectId }, (err, response) => {
    if (handleGrpcError(err, res)) return;

    res.status(200).json({
      success: true,
      data: {
        assets: response.assets,
      },
    });
  });
});

app.post("/api/v1/assets/upload-url", verifyToken, (req, res) => {
  const { projectId, fileName, fileType } = req.body;

  if (!projectId || !fileName) {
    return res.status(400).json({
      success: false,
      error: "BadRequest",
      message: "Project ID and file name are required",
    });
  }

  assetClient.getUploadUrl(
    { project_id: projectId, user_id: req.user.uid, file_name: fileName, file_type: fileType || "" },
    (err, response) => {
      if (handleGrpcError(err, res)) return;

      res.status(200).json({
        success: true,
        data: response,
      });
    }
  );
});

app.delete("/api/v1/assets/:assetId", verifyToken, (req, res) => {
  const { assetId } = req.params;
  const { projectId } = req.query;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      error: "BadRequest",
      message: "Project ID is required",
    });
  }

  assetClient.deleteAsset(
    { asset_id: assetId, project_id: projectId, user_id: req.user.uid },
    (err, response) => {
      if (handleGrpcError(err, res)) return;

      res.status(200).json({
        success: true,
        message: "Asset deleted successfully",
      });
    }
  );
});

// ============================================================
// Routes: Admin
// ============================================================

app.get("/api/v1/admin/analytics", verifyToken, requireAdmin, (req, res) => {
  notificationClient.getAnalytics({}, (err, response) => {
    if (handleGrpcError(err, res)) return;

    res.status(200).json({
      success: true,
      data: response,
    });
  });
});

// ============================================================
// Health Check & Root Endpoint
// ============================================================

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ACM Project Archive Platform - API Gateway is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ACM Project Archive Platform API",
    version: "2.0.0",
    architecture: "Microservices with gRPC",
    endpoints: {
      auth: "/api/v1/auth",
      users: "/api/v1/users",
      projects: "/api/v1/projects",
      search: "/api/v1/search",
      tags: "/api/v1/tags",
      events: "/api/v1/events",
      assets: "/api/v1/assets",
      admin: "/api/v1/admin",
    },
  });
});

// ============================================================
// Error Handlers
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "NotFound",
    message: "The requested endpoint does not exist",
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  res.status(err.status || 500).json({
    success: false,
    error: err.name || "InternalServerError",
    message: err.message || "An unexpected error occurred",
  });
});

// ============================================================
// Start Gateway Server
// ============================================================

const PORT = process.env.GATEWAY_PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚪 API Gateway started`);
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`⏰ Started at ${new Date().toISOString()}`);
  console.log("\n📡 Connected to services:");
  console.log(`   - Auth Service: ${process.env.AUTH_SERVICE_ADDR || "localhost:50051"}`);
  console.log(`   - User Service: ${process.env.USER_SERVICE_ADDR || "localhost:50052"}`);
  console.log(`   - Project Service: ${process.env.PROJECT_SERVICE_ADDR || "localhost:50053"}`);
  console.log(`   - Asset Service: ${process.env.ASSET_SERVICE_ADDR || "localhost:50054"}`);
  console.log(`   - Notification Service: ${process.env.NOTIFICATION_SERVICE_ADDR || "localhost:50055"}\n`);
});

module.exports = app;
