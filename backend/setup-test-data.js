#!/usr/bin/env node

/**
 * Setup Test Data in Firestore
 * Creates test projects and other data needed for testing
 */

const admin = require("firebase-admin");
const path = require("path");

async function setupTestData() {
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
    console.log("📁 SETTING UP TEST DATA IN FIRESTORE");
    console.log("═".repeat(65) + "\n");

    // Create test project
    const testProjectId = "test-project-123";
    const testProject = {
      id: testProjectId,
      title: "Test Project",
      description: "A test project for API testing",
      ownerId: "ZW8r9UQyNtTUtaF8vTaS0jUXLFv1", // test@acm.com
      status: "approved",
      techStack: ["React", "Node.js", "Firebase"],
      contributors: ["vfqox5HzSsVmbLFprkpoPPriNXd2"], // alice@acm.com
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection("projects").doc(testProjectId).set(testProject);
    console.log("✅ Test project created");
    console.log(`   ID: ${testProjectId}`);
    console.log(`   Title: ${testProject.title}`);
    console.log(`   Owner: test@acm.com`);
    console.log("");

    // Create test tags
    const testTags = [
      { name: "React", slug: "react", count: 5 },
      { name: "Node.js", slug: "nodejs", count: 3 },
      { name: "Firebase", slug: "firebase", count: 2 },
    ];

    for (const tag of testTags) {
      const tagId = tag.slug;
      await db.collection("tags").doc(tagId).set(
        {
          id: tagId,
          name: tag.name,
          slug: tag.slug,
          count: tag.count,
          createdAt: new Date().toISOString(),
          createdBy: "vfqox5HzSsVmbLFprkpoPPriNXd2",
        },
        { merge: true },
      );

      console.log(`✅ Test tag created: ${tag.name}`);
    }

    console.log("");
    console.log("═".repeat(65));
    console.log("✅ Test data created successfully!\n");
    console.log("Available for testing:");
    console.log(`  - Project ID: ${testProjectId}`);
    console.log("  - Tags: React, Node.js, Firebase\n");
    console.log("Run: node test-with-auth.js\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

setupTestData();
