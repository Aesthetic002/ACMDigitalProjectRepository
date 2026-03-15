/**
 * API Gateway Entry Point
 * Port 3000
 * Receives all frontend traffic and proxies it to internal microservices.
 */

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();

app.use(cors());

// Health Check for the Gateway itself
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'api-gateway' });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ACM Project Archive - API Gateway',
    version: '1.0.0'
  });
});

/**
 * Proxy Routes Configuration
 */
const services = {
  user: `http://localhost:${process.env.USER_SERVICE_PORT || 3001}`,
  project: `http://localhost:${process.env.PROJECT_SERVICE_PORT || 3002}`,
  asset: `http://localhost:${process.env.ASSET_SERVICE_PORT || 3003}`,
  search: `http://localhost:${process.env.SEARCH_SERVICE_PORT || 3004}`
};

// 1. User & Auth Service Routes (includes dev test/diagnose routes)
app.use(createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathFilter: ['/api/v1/users', '/api/v1/auth', '/api/v1/test', '/api/v1/diagnose']
}));

// 2. Project Service Routes
app.use(createProxyMiddleware({
  target: services.project,
  changeOrigin: true,
  pathFilter: ['/api/v1/projects', '/api/v1/admin', '/api/v1/tags']
}));

// 3. Asset Service Route
app.use(createProxyMiddleware({
  target: services.asset,
  changeOrigin: true,
  pathFilter: ['/api/v1/assets']
}));

// 4. Search Service Route
app.use(createProxyMiddleware({
  target: services.search,
  changeOrigin: true,
  pathFilter: ['/api/v1/search']
}));

// Gateway global error handler
app.use((err, req, res, next) => {
  console.error("API Gateway Error:", err.message);
  res.status(500).json({ success: false, error: 'GatewayError', message: 'API Gateway encountered an error routing your request.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`   -> User Service: ${services.user}`);
  console.log(`   -> Project Service: ${services.project}`);
  console.log(`   -> Asset Service: ${services.asset}`);
  console.log(`   -> Search Service: ${services.search}`);
});

module.exports = app;
