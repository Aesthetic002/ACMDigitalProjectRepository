#!/usr/bin/env node

/**
 * Seed Comments Data in Firestore
 * Creates 10 mock comments per project with varied timestamps and likes
 */

const admin = require("firebase-admin");
const path = require("path");

// Mock comment templates
const commentTemplates = [
  "This project is absolutely brilliant! The implementation is clean and the architecture is well thought out. Great work!",
  "I love the approach you took here. Very innovative solution to a common problem.",
  "Excellent documentation! Made it super easy to understand and contribute.",
  "The UI/UX is phenomenal. Really smooth user experience.",
  "Amazing work! This solved exactly what I was looking for.",
  "Well done! The code quality is top-notch and the performance is impressive.",
  "This is a game-changer. Can't wait to see where this project goes!",
  "Great attention to detail. Everything works flawlessly.",
  "Impressive implementation! The technical decisions made here are solid.",
  "Really appreciate the effort put into this. Learned a lot from the codebase.",
  "The testing coverage is excellent. Shows great software engineering practices.",
  "Love the creativity in this project. Very unique approach!",
  "This project has huge potential. Keep up the great work!",
  "The modularity of the code makes it so easy to extend. Well architected!",
  "Outstanding work! This is exactly what the community needed.",
  "The performance optimizations are clever. Really efficient implementation.",
  "Great use of modern technologies. The stack choice is perfect for this use case.",
  "The accessibility features are commendable. Inclusive design at its best!",
  "Solid project! The documentation and examples make it easy to get started.",
  "This is inspiring! Definitely going to use this as a reference for my own projects.",
  "Fantastic job on the error handling. Very robust implementation.",
  "The scalability considerations are impressive. Built for growth!",
  "Really clean code. Following best practices throughout.",
  "The responsive design is perfect. Works great on all devices!",
  "Innovative solution! Haven't seen this approach before.",
  "The API design is intuitive and well-documented. Developer experience is great!",
  "Love the attention to security. Very thorough implementation.",
  "The feature set is comprehensive. Covers all the bases!",
  "Great collaboration tool! This will definitely improve our workflow.",
  "The integration possibilities are exciting. Can't wait to implement this!",
];

// Mock user data for comment authors
const mockUsers = [
  {
    name: "Alex Johnson",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    name: "Sarah Chen",
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  {
    name: "Michael Brown",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    name: "Emily Davis",
    avatar: "https://i.pravatar.cc/150?img=4",
  },
  {
    name: "David Wilson",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    name: "Jessica Martinez",
    avatar: "https://i.pravatar.cc/150?img=6",
  },
  {
    name: "Ryan Thompson",
    avatar: "https://i.pravatar.cc/150?img=7",
  },
  {
    name: "Olivia Garcia",
    avatar: "https://i.pravatar.cc/150?img=8",
  },
  {
    name: "James Lee",
    avatar: "https://i.pravatar.cc/150?img=9",
  },
  {
    name: "Sophia Anderson",
    avatar: "https://i.pravatar.cc/150?img=10",
  },
];

// Generate random timestamp within last 6 months
function getRandomTimestamp() {
  const now = Date.now();
  const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000; // 180 days
  const randomTime = sixMonthsAgo + Math.random() * (now - sixMonthsAgo);
  return new Date(randomTime).toISOString();
}

// Generate random likes count (weighted towards lower numbers)
function getRandomLikes() {
  const rand = Math.random();
  if (rand < 0.4) return Math.floor(Math.random() * 10); // 40% chance: 0-9 likes
  if (rand < 0.7) return Math.floor(Math.random() * 30) + 10; // 30% chance: 10-39 likes
  if (rand < 0.9) return Math.floor(Math.random() * 50) + 30; // 20% chance: 30-79 likes
  return Math.floor(Math.random() * 70) + 80; // 10% chance: 80-150 likes
}

// Generate mock liked by user IDs
function generateLikedBy(likesCount) {
  const userIds = [];
  for (let i = 0; i < likesCount; i++) {
    userIds.push(`user_${Math.floor(Math.random() * 1000)}`);
  }
  return userIds;
}

async function seedComments() {
  try {
    // Initialize Firebase
    const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
    const serviceAccount = require(serviceAccountPath);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.project_id}.appspot.com`,
      });
    }

    const db = admin.firestore();

    console.log("\n" + "═".repeat(65));
    console.log("💬 SEEDING COMMENTS DATA IN FIRESTORE");
    console.log("═".repeat(65) + "\n");

    // Get all projects
    const projectsSnapshot = await db.collection("projects").get();

    if (projectsSnapshot.empty) {
      console.log("⚠️  No projects found. Please create projects first.");
      process.exit(1);
    }

    console.log(`📊 Found ${projectsSnapshot.size} projects`);
    console.log("📝 Creating 10 comments per project...\n");

    let totalCommentsCreated = 0;

    // Create 10 comments for each project
    for (const projectDoc of projectsSnapshot.docs) {
      const projectId = projectDoc.id;
      const projectData = projectDoc.data();

      console.log(`\n📁 Project: ${projectData.title || projectId}`);

      // Shuffle comment templates for variety
      const shuffledTemplates = [...commentTemplates].sort(
        () => Math.random() - 0.5,
      );

      for (let i = 0; i < 10; i++) {
        const commentRef = db.collection("comments").doc();
        const mockUser = mockUsers[i % mockUsers.length];
        const likes = getRandomLikes();

        const commentData = {
          id: commentRef.id,
          projectId: projectId,
          userId: `mock_user_${i % mockUsers.length}`,
          authorName: mockUser.name,
          authorAvatar: mockUser.avatar,
          text: shuffledTemplates[i % shuffledTemplates.length],
          likes: likes,
          likedBy: generateLikedBy(likes),
          timestamp: getRandomTimestamp(),
          edited: Math.random() < 0.1, // 10% chance of being edited
          editedAt: Math.random() < 0.1 ? getRandomTimestamp() : null,
        };

        await commentRef.set(commentData);
        totalCommentsCreated++;
        console.log(
          `  ✅ Comment ${i + 1}/10 - ${mockUser.name} (${likes} likes)`,
        );
      }

      // Update project comment count
      await db.collection("projects").doc(projectId).update({
        commentCount: 10,
        updatedAt: new Date().toISOString(),
      });

      console.log(`  📊 Updated project comment count: 10`);
    }

    console.log("\n" + "═".repeat(65));
    console.log(`✅ Successfully seeded ${totalCommentsCreated} comments!`);
    console.log(
      `📊 ${projectsSnapshot.size} projects updated with comment counts`,
    );
    console.log("═".repeat(65) + "\n");

    console.log("Sample comment data:");
    console.log("  - Authors: 10 unique users");
    console.log("  - Likes range: 0-150 (weighted distribution)");
    console.log("  - Timestamps: Spread over last 6 months");
    console.log("  - ~10% comments marked as edited\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run seed function
seedComments();
