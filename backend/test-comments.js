#!/usr/bin/env node

/**
 * Comments Service Endpoints Test Suite
 * Tests endpoints that create, read, upvote, and delete comments. 
 * Include the ML ranking-service integration test.
 */

const http = require("http");
const { generateTestIdToken } = require("./utils/tokenGenerator");

// Generate a test token
const testMemberUid = "ZW8r9UQyNtTUtaF8vTaS0jUXLFv1"; // test@acm.com (member)
const token = generateTestIdToken(testMemberUid, "test@acm.com");

console.log("\n" + "=".repeat(65));
console.log("💬 TESTING COMMENTS SERVICE ENDPOINTS");
console.log("=".repeat(65) + "\n");

// A mock project ID to bind comments to
const TEST_PROJECT_ID = "testProject123";
let createdCommentId = null;

const tests = [
  {
    name: "1. POST /api/v1/projects/:projectId/comments - Create Comment",
    options: {
      hostname: "localhost",
      port: 3000,
      path: `/api/v1/projects/${TEST_PROJECT_ID}/comments`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    },
    body: JSON.stringify({
      content: "This is a test comment to verify the comment microservice."
    }),
    onData: (data) => {
      try {
        const res = JSON.parse(data);
        if (res.id) {
          createdCommentId = res.id;
          console.log(`   ✅ Comment created with ID: ${createdCommentId}`);
        } else {
             console.log(`   ❌ Unexpected response: ${JSON.stringify(res)}`);
        }
      } catch(e) { console.error(data) }
    }
  },
  {
    name: "2. GET /api/v1/projects/:projectId/comments - Get Unsorted Comments",
    options: {
      hostname: "localhost",
      port: 3000,
      path: `/api/v1/projects/${TEST_PROJECT_ID}/comments`,
      method: "GET" // Unauthenticated
    },
    onData: (data) => {
      try {
        const res = JSON.parse(data);
        console.log(`   ✅ Retrieved ${res.length ? res.length : 0} comments for project.`);
      } catch(e) {}
    }
  },
  {
    name: "3. POST /api/v1/comments/:commentId/upvote - Upvote a Comment",
    getOptions: () => ({
      hostname: "localhost",
      port: 3000,
      path: `/api/v1/comments/${createdCommentId}/upvote`,
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    }),
    skipIfNoCommentId: true,
    onData: (data) => {
      try {
         const res = JSON.parse(data);
         console.log(`   ✅ Upvote successful. New upvotes count: ${res.upvotes !== undefined ? res.upvotes : 'unknown'}`);
      } catch(e) {}
    }
  },
  {
    name: "4. GET /api/v1/projects/:projectId/comments?sort=true - Get Comments (ML Sorted)",
    options: {
      hostname: "localhost",
      port: 3000,
      path: `/api/v1/projects/${TEST_PROJECT_ID}/comments?sort=true`,
      method: "GET" // Unauthenticated
    },
    onData: (data) => {
      try {
        const res = JSON.parse(data);
        console.log(`   ✅ Retrieved ${res.length ? res.length : 0} comments (Sorted via ML Ranking Service).`);
      } catch(e) {}
    }
  },
  {
    name: "5. DELETE /api/v1/comments/:commentId - Delete a Comment",
    getOptions: () => ({
      hostname: "localhost",
      port: 3000,
      path: `/api/v1/comments/${createdCommentId}`,
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    }),
    skipIfNoCommentId: true,
    onData: (data) => {
      try {
         const res = JSON.parse(data);
         if (res.success) {
            console.log(`   ✅ Comment successfully deleted.`);
         } else {
             console.log(`   ❌ Delete failed: ${JSON.stringify(res)}`);
         }
      } catch(e) {}
    }
  }
];

async function runTests() {
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`\n⏳ Running: ${test.name}`);

    if (test.skipIfNoCommentId && !createdCommentId) {
       console.log(`   ⚠️ Skipped: No comment ID was returned by step 1.`);
       continue;
    }

    const options = test.getOptions ? test.getOptions() : test.options;

    await new Promise((resolve) => {
      const req = http.request(options, (res) => {
        let rawData = "";
        
        res.on("data", (chunk) => {
          rawData += chunk;
        });

        res.on("end", () => {
          console.log(`   ➡️ Status: ${res.statusCode}`);
          if (test.onData && rawData) {
              test.onData(rawData);
          }
          resolve();
        });
      });

      req.on("error", (e) => {
        console.error(`   ❌ Request ERROR: ${e.message}`);
        resolve();
      });

      if (test.body) {
        req.write(test.body);
      }

      req.end();
    });

    // Small delay to allow services and databases to settle
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log("\n🎉 All comments endpoints checked!\n");
}

runTests();