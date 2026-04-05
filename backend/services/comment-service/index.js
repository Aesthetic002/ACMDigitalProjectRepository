const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
require("dotenv").config();

const { db } = require("../firebase");

const PROTO_PATH = path.join(__dirname, "../../proto/comment.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const commentService = protoDescriptor.acm.comment.CommentService;

async function createComment(call, callback) {
  const { projectId, userId, content } = call.request;

  if (content.length > 1000) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: "Max length is 1000 characters.",
    });
  }

  try {
    const userCommentsSnap = await db
      .collection("comments")
      .where("projectId", "==", projectId)
      .where("userId", "==", userId)
      .get();

    if (userCommentsSnap.size >= 5) {
      return callback({
        code: grpc.status.RESOURCE_EXHAUSTED,
        message: "Limit of 5 comments per user per project reached.",
      });
    }

    const docRef = db.collection("comments").doc();
    const commentData = {
      projectId,
      userId,
      content,
      upvotes: 0,
      createdAt: new Date().toISOString(),
    };

    await docRef.set(commentData);
    callback(null, { id: docRef.id, ...commentData });
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
}

async function deleteComment(call, callback) {
  const { commentId, userId, role } = call.request;

  try {
    const commentRef = db.collection("comments").doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "Comment not found.",
      });
    }

    const commentData = commentDoc.data();
    if (role !== "admin" && commentData.userId !== userId) {
      return callback({
        code: grpc.status.PERMISSION_DENIED,
        message: "Not allowed to delete.",
      });
    }

    await commentRef.delete();
    callback(null, { success: true, message: "Deleted successfully" });
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
}

async function getProjectComments(call, callback) {
  const { projectId } = call.request;
  try {
    const snap = await db
      .collection("comments")
      .where("projectId", "==", projectId)
      .get();
    const comments = [];
    snap.forEach((doc) => comments.push({ id: doc.id, ...doc.data() }));
    callback(null, { comments });
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
}

async function upvoteComment(call, callback) {
  const { commentId } = call.request;
  try {
    const docRef = db.collection("comments").doc(commentId);
    const doc = await docRef.get();
    if (!doc.exists) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "Comment not found.",
      });
    }
    const updatedUpvotes = (doc.data().upvotes || 0) + 1;
    await docRef.update({ upvotes: updatedUpvotes });
    callback(null, { id: doc.id, ...doc.data(), upvotes: updatedUpvotes });
  } catch (error) {
    callback({ code: grpc.status.INTERNAL, message: error.message });
  }
}

function main() {
  const server = new grpc.Server();
  server.addService(commentService.service, {
    createComment,
    deleteComment,
    getProjectComments,
    upvoteComment,
  });

  const port = process.env.COMMENT_SERVICE_PORT || "50056";
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) throw err;
      console.log(`💬 Comment Service running on port ${boundPort}`);
    },
  );
}

main();
