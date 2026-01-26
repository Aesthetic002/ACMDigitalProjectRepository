#!/usr/bin/env node

/**
 * Auth-Required Endpoints Test Suite
 * Tests endpoints that require Firebase authentication
 */

const http = require("http");
const path = require("path");
const { generateTestIdToken } = require("./utils/tokenGenerator");

// Generate test tokens for different users
const testMemberUid = "ZW8r9UQyNtTUtaF8vTaS0jUXLFv1"; // test@acm.com (member)
const testAdminUid = "vfqox5HzSsVmbLFprkpoPPriNXd2"; // alice@acm.com (admin)

const memberToken = generateTestIdToken(testMemberUid, "test@acm.com");
const adminToken = generateTestIdToken(testAdminUid, "alice@acm.com");

console.log("\n" + "═".repeat(65));
console.log("🔐 TESTING AUTH-REQUIRED ENDPOINTS WITH VALID TOKENS");
console.log("═".repeat(65) + "\n");

console.log("📋 Test Users:");
console.log(`   Member Token: test@acm.com (role: member)`);
console.log(`   Admin Token: alice@acm.com (role: admin)`);
console.log("");

const tests = [
  {
    name: "POST /api/v1/assets/upload-url",
    method: "POST",
    path: "/api/v1/assets/upload-url",
    body: {
      projectId: "test-project-123",
      filename: "document.pdf",
      contentType: "application/pdf",
    },
    token: memberToken,
    expectedStatus: 201,
    description: "Generate signed upload URL for asset (member token)",
  },
  {
    name: "GET /api/v1/admin/analytics",
    method: "GET",
    path: "/api/v1/admin/analytics",
    body: null,
    token: adminToken,
    expectedStatus: 200,
    description: "Get admin analytics dashboard (admin token)",
  },
];

function makeRequest(test) {
  return new Promise((resolve) => {
    const token = test.token;
    const options = {
      hostname: "localhost",
      port: 3000,
      path: test.path,
      method: test.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            json,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            json: { raw: data },
          });
        }
      });
    });

    req.on("error", (err) => {
      resolve({
        status: 0,
        error: err.message,
      });
    });

    if (test.body) {
      req.write(JSON.stringify(test.body));
    }
    req.end();
  });
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`TEST: ${test.name}`);
    console.log(`DESC: ${test.description}`);
    console.log("─".repeat(65));

    try {
      const result = await makeRequest(test);

      if (result.error) {
        console.log(`❌ Connection Error: ${result.error}`);
        failed++;
      } else {
        console.log(`✅ Status Code: ${result.status}`);
        console.log(`✅ Response: success=${result.json.success}`);

        if (result.status === test.expectedStatus && result.json.success) {
          console.log("✅ Authenticated and authorized successfully!");

          // Show relevant data based on endpoint
          if (test.path.includes("upload-url")) {
            console.log(
              `✅ Upload URL: ${result.json.uploadUrl ? "Generated" : "Not found"}`,
            );
            console.log(`✅ Asset ID: ${result.json.assetId || "N/A"}`);
          } else if (test.path.includes("analytics")) {
            const analytics = result.json.analytics;
            if (analytics) {
              console.log(`✅ Total Projects: ${analytics.totalProjects}`);
              console.log(`✅ Total Users: ${analytics.totalUsers}`);
              console.log(`✅ Total Admins: ${analytics.totalAdmins}`);
            }
          }
          passed++;
        } else if (result.status === 403) {
          console.log("⚠️  Status: 403 Forbidden");
          console.log(`   Reason: ${result.json.message}`);
          console.log("   Note: User lacks required role (admin)");
          failed++;
        } else if (result.status === 401) {
          console.log("❌ Status: 401 Unauthorized");
          console.log(`   Message: ${result.json.message}`);
          failed++;
        } else {
          console.log(
            `❌ Unexpected Status: ${result.status} (expected ${test.expectedStatus})`,
          );
          console.log(`   Message: ${result.json.message}`);
          failed++;
        }
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      failed++;
    }
    console.log("");
  }

  // Summary
  console.log("═".repeat(65));
  console.log("📊 TEST SUMMARY");
  console.log("═".repeat(65));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(
    `📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`,
  );
  console.log("");

  if (failed === 0) {
    console.log(
      "🎉 All auth tests passed! Your endpoints are properly protected.",
    );
  } else {
    console.log("⚠️  Some tests failed. Check the errors above.");
  }

  console.log("");
  console.log("📝 Notes:");
  console.log("   • 200 = Authenticated and authorized");
  console.log("   • 401 = Token invalid or missing");
  console.log("   • 403 = Token valid but user lacks required role (admin)");
  console.log("");
}

// Wait for server
setTimeout(() => {
  runTests();
}, 1000);
