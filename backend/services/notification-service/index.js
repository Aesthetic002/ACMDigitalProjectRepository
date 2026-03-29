/**
 * Notification Service - gRPC Microservice
 * Handles:
 * - Event notifications
 * - Event management
 * - Platform analytics
 */

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
require("dotenv").config();

const { db } = require("../firebase");

// Load notification proto
const notificationProtoPath = path.join(__dirname, "../proto/notification.proto");
const notificationPackageDef = protoLoader.loadSync(notificationProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const notificationProto = grpc.loadPackageDefinition(notificationPackageDef);

/**
 * SendNotification - Fire-and-forget notification
 */
async function sendNotification(call, callback) {
  try {
    const { user_id, message } = call.request;

    if (!user_id || !message) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "User ID and message are required",
      });
    }

    // In a real implementation, would send notification via Firebase Cloud Messaging,
    // email, SMS, etc. For now, just log it.
    console.log(
      `📬 Notification for user ${user_id}:`,
      message.title,
      message.body
    );

    // Optionally store notification record
    await db.collection("notifications").add({
      userId: user_id,
      title: message.title,
      body: message.body,
      type: message.type,
      data: message.data || {},
      read: false,
      createdAt: Date.now(),
    });

    // Return immediately (fire-and-forget)
    callback(null, {
      success: true,
      message: "Notification sent",
    });
  } catch (error) {
    // Don't fail the RPC for notifications
    console.error("SendNotification error:", error);
    callback(null, {
      success: false,
      message: error.message,
    });
  }
}

/**
 * ListEvents - Get all events
 */
async function listEvents(call, callback) {
  try {
    const { limit = 50, offset = 0 } = call.request;

    const snapshot = await db
      .collection("events")
      .orderBy("startDate", "desc")
      .limit(limit)
      .offset(offset)
      .get();

    const events = [];
    snapshot.forEach((doc) => {
      const eventData = doc.data();
      events.push({
        id: doc.id,
        title: eventData.title,
        description: eventData.description,
        start_date: eventData.startDate || 0,
        end_date: eventData.endDate || 0,
        type: eventData.type || "general",
        created_at: eventData.createdAt || 0,
        updated_at: eventData.updatedAt || 0,
      });
    });

    // Get total
    const totalSnapshot = await db.collection("events").get();

    callback(null, {
      events,
      total: totalSnapshot.size,
    });
  } catch (error) {
    console.error("ListEvents error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * GetEvent - Get a single event
 */
async function getEvent(call, callback) {
  try {
    const { event_id } = call.request;

    if (!event_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Event ID is required",
      });
    }

    const eventDoc = await db.collection("events").doc(event_id).get();

    if (!eventDoc.exists) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "Event not found",
      });
    }

    const eventData = eventDoc.data();

    callback(null, {
      id: eventDoc.id,
      title: eventData.title,
      description: eventData.description,
      start_date: eventData.startDate || 0,
      end_date: eventData.endDate || 0,
      type: eventData.type || "general",
      created_at: eventData.createdAt || 0,
      updated_at: eventData.updatedAt || 0,
    });
  } catch (error) {
    console.error("GetEvent error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * CreateEvent - Create a new event (admin only - checked at gateway)
 */
async function createEvent(call, callback) {
  try {
    const { title, description, start_date, end_date, type } = call.request;

    if (!title) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Title is required",
      });
    }

    const eventData = {
      title,
      description: description || "",
      startDate: start_date || Date.now(),
      endDate: end_date || Date.now() + 86400000, // 24 hours later
      type: type || "general",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await db.collection("events").add(eventData);

    callback(null, {
      id: docRef.id,
      title: eventData.title,
      description: eventData.description,
      start_date: eventData.startDate,
      end_date: eventData.endDate,
      type: eventData.type,
      created_at: eventData.createdAt,
      updated_at: eventData.updatedAt,
    });
  } catch (error) {
    console.error("CreateEvent error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * UpdateEvent - Update an existing event
 */
async function updateEvent(call, callback) {
  try {
    const { event_id, title, description, start_date, end_date, type } =
      call.request;

    if (!event_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Event ID is required",
      });
    }

    const eventDoc = await db.collection("events").doc(event_id).get();

    if (!eventDoc.exists) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "Event not found",
      });
    }

    const updateData = {
      updatedAt: Date.now(),
    };

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (start_date) updateData.startDate = start_date;
    if (end_date) updateData.endDate = end_date;
    if (type) updateData.type = type;

    await db.collection("events").doc(event_id).update(updateData);

    const updatedDoc = await db.collection("events").doc(event_id).get();
    const eventData = updatedDoc.data();

    callback(null, {
      id: updatedDoc.id,
      title: eventData.title,
      description: eventData.description,
      start_date: eventData.startDate,
      end_date: eventData.endDate,
      type: eventData.type,
      created_at: eventData.createdAt,
      updated_at: eventData.updatedAt,
    });
  } catch (error) {
    console.error("UpdateEvent error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * DeleteEvent - Delete an event
 */
async function deleteEvent(call, callback) {
  try {
    const { event_id } = call.request;

    if (!event_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Event ID is required",
      });
    }

    await db.collection("events").doc(event_id).delete();

    callback(null, {
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("DeleteEvent error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * GetAnalytics - Get platform analytics
 */
async function getAnalytics(call, callback) {
  try {
    // Count projects
    const projectsSnapshot = await db
      .collection("projects")
      .where("isDeleted", "==", false)
      .get();
    const totalProjects = projectsSnapshot.size;

    // Count users
    const usersSnapshot = await db.collection("users").get();
    const totalUsers = usersSnapshot.size;

    // Count admins
    let totalAdmins = 0;
    usersSnapshot.forEach((doc) => {
      if (doc.data().role === "admin") totalAdmins++;
    });

    // Count featured projects
    let featuredProjects = 0;
    projectsSnapshot.forEach((doc) => {
      if (doc.data().isFeatured) featuredProjects++;
    });

    // Count projects by status
    const projectsByStatus = {
      draft: 0,
      approved: 0,
      featured: 0,
    };

    projectsSnapshot.forEach((doc) => {
      const data = doc.data();
      const status = data.status || "draft";
      if (projectsByStatus[status] !== undefined) {
        projectsByStatus[status]++;
      }
    });

    // Count tech stack distribution
    const techStackDistribution = {};
    projectsSnapshot.forEach((doc) => {
      const data = doc.data();
      (data.techStack || []).forEach((tech) => {
        techStackDistribution[tech] =
          (techStackDistribution[tech] || 0) + 1;
      });
    });

    callback(null, {
      total_projects: totalProjects,
      total_users: totalUsers,
      total_admins: totalAdmins,
      featured_projects: featuredProjects,
      projects_by_status: projectsByStatus,
      tech_stack_distribution: techStackDistribution,
      total_assets: 0, // Would calculate from all projects
      total_storage_used: 0, // Would track from Cloudinary
    });
  } catch (error) {
    console.error("GetAnalytics error:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
}

/**
 * Create and start gRPC server
 */
function startNotificationService() {
  const server = new grpc.Server();

  server.addService(notificationProto.acm.notification.NotificationService.service, {
    sendNotification,
    listEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    getAnalytics,
  });

  const PORT = process.env.NOTIFICATION_SERVICE_PORT || 50055;

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("❌ Failed to start Notification Service:", err);
        process.exit(1);
      }

      console.log(`\n🔔 Notification Service started`);
      console.log(`📡 Listening on port ${port}`);
      console.log(`⏰ Started at ${new Date().toISOString()}\n`);
    }
  );
}

// Start service
startNotificationService();

console.log("🚀 Notification Service initializing...");
