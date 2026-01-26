#!/usr/bin/env node

/**
 * Setup Test Users in Firestore
 * Creates test user documents so auth tests work properly
 */

const admin = require("firebase-admin");
const path = require("path");

async function setupTestUsers() {
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
    console.log("👤 SETTING UP TEST USERS IN FIRESTORE");
    console.log("═".repeat(65) + "\n");

    // Test users to create
    const testUsers = [
      {
        uid: "ZW8r9UQyNtTUtaF8vTaS0jUXLFv1",
        email: "test@acm.com",
        name: "Test User",
        role: "member",
        description: "Regular member for testing",
      },
      {
        uid: "vfqox5HzSsVmbLFprkpoPPriNXd2",
        email: "alice@acm.com",
        name: "Alice",
        role: "admin",
        description: "Admin user for testing",
      },
    ];

    // Create or update users
    for (const user of testUsers) {
      await db.collection("users").doc(user.uid).set(
        {
          uid: user.uid,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: user.description,
        },
        { merge: true },
      );

      console.log(`✅ ${user.description}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log("");
    }

    console.log("═".repeat(65));
    console.log("✅ Test users created successfully!\n");
    console.log("Now you can test with:");
    console.log("  - test@acm.com (member role)");
    console.log("  - alice@acm.com (admin role)\n");
    console.log("Run: node test-with-auth.js\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

setupTestUsers();
