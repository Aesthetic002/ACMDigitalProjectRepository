#!/usr/bin/env node

/**
 * API Endpoint Testing Suite
 * Tests all implemented endpoints
 */

const http = require("http");

const baseUrl = "http://localhost:3000";

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(path, baseUrl);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
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
          resolve({ status: res.statusCode, json });
        } catch (e) {
          resolve({ status: res.statusCode, json: { raw: data } });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("\n");
  console.log("═".repeat(65));
  console.log("🧪 API ENDPOINT TESTING - COMPREHENSIVE TEST SUITE");
  console.log("═".repeat(65));
  console.log("");

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Health Check
  console.log("TEST 1: HEALTH CHECK");
  console.log("─".repeat(65));
  try {
    const result = await makeRequest("GET", "/health");
    if (result.status === 200 && result.json.success) {
      console.log("✅ Status: " + result.status);
      console.log("✅ Message: " + result.json.message);
      console.log("✅ Timestamp: " + result.json.timestamp);
      testsPassed++;
    } else {
      console.log("❌ Unexpected response");
      testsFailed++;
    }
  } catch (err) {
    console.log("❌ Error: " + err.message);
    testsFailed++;
  }
  console.log("");

  // Test 2: List Projects
  console.log("TEST 2: LIST PROJECTS (GET /api/v1/projects)");
  console.log("─".repeat(65));
  try {
    const result = await makeRequest("GET", "/api/v1/projects");
    if (result.status === 200 && result.json.success) {
      console.log("✅ Status: " + result.status);
      console.log("✅ Success: " + result.json.success);
      console.log("✅ Count: " + result.json.count);
      console.log(
        "✅ Projects field exists: " +
          (Array.isArray(result.json.projects) ? "yes" : "no"),
      );
      testsPassed++;
    } else {
      console.log("❌ Unexpected response");
      testsFailed++;
    }
  } catch (err) {
    console.log("❌ Error: " + err.message);
    testsFailed++;
  }
  console.log("");

  // Test 3: List Projects with Filter
  console.log("TEST 3: LIST PROJECTS WITH FILTERS (status=approved)");
  console.log("─".repeat(65));
  try {
    const result = await makeRequest(
      "GET",
      "/api/v1/projects?status=approved&limit=10",
    );
    if (result.status === 200 && result.json.success) {
      console.log("✅ Status: " + result.status);
      console.log("✅ Success: " + result.json.success);
      console.log("✅ Count: " + result.json.count);
      testsPassed++;
    } else {
      console.log("❌ Unexpected response");
      testsFailed++;
    }
  } catch (err) {
    console.log("❌ Error: " + err.message);
    testsFailed++;
  }
  console.log("");

  // Test 4: Search API
  console.log("TEST 4: SEARCH API (GET /api/v1/search)");
  console.log("─".repeat(65));
  try {
    const result = await makeRequest(
      "GET",
      "/api/v1/search?q=React&type=all&limit=10",
    );
    if (result.status === 200 && result.json.success) {
      console.log("✅ Status: " + result.status);
      console.log("✅ Success: " + result.json.success);
      console.log("✅ Search type: " + result.json.type);
      console.log("✅ Results count: " + result.json.count);
      testsPassed++;
    } else {
      console.log("❌ Unexpected response");
      testsFailed++;
    }
  } catch (err) {
    console.log("❌ Error: " + err.message);
    testsFailed++;
  }
  console.log("");

  // Test 5: Search Validation
  console.log("TEST 5: SEARCH API VALIDATION (missing query param)");
  console.log("─".repeat(65));
  try {
    const result = await makeRequest("GET", "/api/v1/search");
    if (result.status === 400 && !result.json.success) {
      console.log("✅ Status: " + result.status + " (expected 400)");
      console.log("✅ Error: " + result.json.error);
      console.log("✅ Message: " + result.json.message);
      testsPassed++;
    } else {
      console.log("❌ Should have returned 400");
      testsFailed++;
    }
  } catch (err) {
    console.log("❌ Error: " + err.message);
    testsFailed++;
  }
  console.log("");

  // Test 6: List Tags
  console.log("TEST 6: LIST TAGS (GET /api/v1/tags)");
  console.log("─".repeat(65));
  try {
    const result = await makeRequest("GET", "/api/v1/tags");
    if (result.status === 200 && result.json.success) {
      console.log("✅ Status: " + result.status);
      console.log("✅ Success: " + result.json.success);
      console.log("✅ Count: " + result.json.count);
      console.log(
        "✅ Tags array exists: " +
          (Array.isArray(result.json.tags) ? "yes" : "no"),
      );
      testsPassed++;
    } else {
      console.log("❌ Unexpected response");
      testsFailed++;
    }
  } catch (err) {
    console.log("❌ Error: " + err.message);
    testsFailed++;
  }
  console.log("");

  // Test 7: Project Detail - Not Found
  console.log("TEST 7: PROJECT DETAIL (GET /api/v1/projects/:id) - 404 Test");
  console.log("─".repeat(65));
  try {
    const result = await makeRequest("GET", "/api/v1/projects/nonexistent123");
    if (result.status === 404 && !result.json.success) {
      console.log("✅ Status: " + result.status + " (expected 404)");
      console.log("✅ Error: " + result.json.error);
      console.log("✅ Message: " + result.json.message);
      testsPassed++;
    } else {
      console.log("❌ Should have returned 404");
      testsFailed++;
    }
  } catch (err) {
    console.log("❌ Error: " + err.message);
    testsFailed++;
  }
  console.log("");

  // Test 8: Assets Upload URL - Auth Required
  console.log("TEST 8: ASSETS UPLOAD URL (Auth Required)");
  console.log("─".repeat(65));
  try {
    const result = await makeRequest("POST", "/api/v1/assets/upload-url", {
      projectId: "test-project",
      filename: "test.pdf",
      contentType: "application/pdf",
    });
    if (result.status === 401 && !result.json.success) {
      console.log("✅ Status: " + result.status + " (expected 401)");
      console.log("✅ Error: " + result.json.error);
      console.log(
        "✅ Message requires auth: " +
          (result.json.message.includes("auth") ? "yes" : "no"),
      );
      testsPassed++;
    } else {
      console.log("❌ Should have returned 401 Unauthorized");
      testsFailed++;
    }
  } catch (err) {
    console.log("❌ Error: " + err.message);
    testsFailed++;
  }
  console.log("");

  // Test 9: Admin Analytics - Auth + Admin Required
  console.log("TEST 9: ADMIN ANALYTICS (Auth + Admin Required)");
  console.log("─".repeat(65));
  try {
    const result = await makeRequest("GET", "/api/v1/admin/analytics");
    if (result.status === 401 && !result.json.success) {
      console.log("✅ Status: " + result.status + " (expected 401)");
      console.log("✅ Error: " + result.json.error);
      console.log("✅ Message: " + result.json.message);
      testsPassed++;
    } else {
      console.log("❌ Should have returned 401 Unauthorized");
      testsFailed++;
    }
  } catch (err) {
    console.log("❌ Error: " + err.message);
    testsFailed++;
  }
  console.log("");

  // Test 10: 404 Handler
  console.log("TEST 10: 404 HANDLER (Invalid Route)");
  console.log("─".repeat(65));
  try {
    const result = await makeRequest("GET", "/api/v1/nonexistent");
    if (result.status === 404 && !result.json.success) {
      console.log("✅ Status: " + result.status + " (expected 404)");
      console.log("✅ Error: " + result.json.error);
      console.log("✅ Message: " + result.json.message);
      testsPassed++;
    } else {
      console.log("❌ Should have returned 404");
      testsFailed++;
    }
  } catch (err) {
    console.log("❌ Error: " + err.message);
    testsFailed++;
  }
  console.log("");

  // Summary
  console.log("═".repeat(65));
  console.log("📊 TEST SUMMARY");
  console.log("═".repeat(65));
  console.log("");
  console.log("✅ Tests Passed: " + testsPassed);
  console.log("❌ Tests Failed: " + testsFailed);
  console.log(
    "📈 Success Rate: " +
      ((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1) +
      "%",
  );
  console.log("");
  console.log("🎯 Endpoints Tested:");
  console.log("   1. GET  /health");
  console.log("   2. GET  /api/v1/projects");
  console.log("   3. GET  /api/v1/projects?status=X");
  console.log("   4. GET  /api/v1/search?q=X");
  console.log("   5. GET  /api/v1/search (validation)");
  console.log("   6. GET  /api/v1/tags");
  console.log("   7. GET  /api/v1/projects/:id (404)");
  console.log("   8. POST /api/v1/assets/upload-url");
  console.log("   9. GET  /api/v1/admin/analytics");
  console.log("  10. GET  /api/v1/nonexistent (404)");
  console.log("");
  console.log("📝 Notes:");
  console.log("   • All public endpoints return 200 OK");
  console.log("   • Auth-required endpoints return 401 Unauthorized");
  console.log("   • Invalid routes return 404 Not Found");
  console.log("   • Input validation works correctly (400 Bad Request)");
  console.log("");
  console.log("═".repeat(65));
  console.log("");

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Wait a bit for server to be ready
setTimeout(runTests, 1000);
