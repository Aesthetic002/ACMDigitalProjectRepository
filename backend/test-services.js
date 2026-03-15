/**
 * Microservices Health Check Test
 *
 * Tests that all microservices and the API gateway are running
 * and responding correctly on their designated ports.
 *
 * Usage: node test-services.js
 */

const http = require("http");

const services = [
  { name: "API Gateway", port: 3000, path: "/health" },
  { name: "User Service", port: 3001, path: "/health" },
  { name: "Project Service", port: 3002, path: "/health" },
  { name: "Asset Service", port: 3003, path: "/health" },
  { name: "Search Service", port: 3004, path: "/health" },
];

// Also test proxy routing through the gateway
const proxyTests = [
  { name: "Gateway -> User Service", port: 3000, path: "/api/v1/auth", expectProxy: true },
  { name: "Gateway -> Project Service", port: 3000, path: "/api/v1/projects", expectProxy: true },
  { name: "Gateway -> Asset Service", port: 3000, path: "/api/v1/assets", expectProxy: true },
  { name: "Gateway -> Search Service", port: 3000, path: "/api/v1/search", expectProxy: true },
];

function checkService(service) {
  return new Promise((resolve) => {
    const req = http.get(
      { hostname: "localhost", port: service.port, path: service.path, timeout: 5000 },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve({
              ...service,
              status: "UP",
              statusCode: res.statusCode,
              response: json,
            });
          } catch {
            resolve({
              ...service,
              status: res.statusCode < 500 ? "UP" : "ERROR",
              statusCode: res.statusCode,
              response: data.substring(0, 100),
            });
          }
        });
      }
    );

    req.on("error", (err) => {
      resolve({
        ...service,
        status: "DOWN",
        error: err.code || err.message,
      });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ ...service, status: "TIMEOUT" });
    });
  });
}

async function runTests() {
  console.log("=".repeat(60));
  console.log("  ACM Digital Project Repository - Microservices Health Check");
  console.log("=".repeat(60));
  console.log();

  // 1. Direct health checks
  console.log("--- Direct Service Health Checks ---\n");

  const healthResults = await Promise.all(services.map(checkService));

  let allHealthy = true;
  for (const result of healthResults) {
    const icon = result.status === "UP" ? "[PASS]" : "[FAIL]";
    if (result.status !== "UP") allHealthy = false;

    console.log(`  ${icon} ${result.name} (port ${result.port})`);
    if (result.status === "UP") {
      console.log(`        Status: ${result.statusCode} - ${JSON.stringify(result.response)}`);
    } else {
      console.log(`        Error: ${result.error || result.status}`);
    }
  }

  console.log();

  // 2. Proxy routing tests (only if gateway is up)
  const gatewayUp = healthResults[0].status === "UP";

  if (gatewayUp) {
    console.log("--- API Gateway Proxy Routing Tests ---\n");

    const proxyResults = await Promise.all(proxyTests.map(checkService));

    for (const result of proxyResults) {
      // A proxied request that returns any non-502/503/504 status means the proxy is working
      const proxyWorking =
        result.status === "UP" &&
        result.statusCode !== 502 &&
        result.statusCode !== 503 &&
        result.statusCode !== 504;

      const icon = proxyWorking ? "[PASS]" : "[FAIL]";
      if (!proxyWorking) allHealthy = false;

      console.log(`  ${icon} ${result.name} (${result.path})`);
      if (proxyWorking) {
        console.log(`        Proxied OK - Status: ${result.statusCode}`);
      } else {
        console.log(`        Proxy failed - ${result.error || `Status: ${result.statusCode}`}`);
      }
    }

    console.log();
  } else {
    console.log("--- Skipping proxy tests (gateway is down) ---\n");
    allHealthy = false;
  }

  // Summary
  console.log("=".repeat(60));
  if (allHealthy) {
    console.log("  RESULT: ALL SERVICES HEALTHY - Microservices are fully operational!");
  } else {
    console.log("  RESULT: SOME SERVICES FAILED - Check the output above for details.");
  }
  console.log("=".repeat(60));

  process.exit(allHealthy ? 0 : 1);
}

runTests();
