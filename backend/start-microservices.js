/**
 * Microservices Startup Script
 * 
 * Starts all gRPC microservices and the API Gateway for local development.
 * Run from the backend directory: node start-microservices.js
 */

const { spawn } = require('child_process');
const path = require('path');

// Service configurations
const services = [
  {
    name: 'Auth Service',
    emoji: '🔐',
    port: 50051,
    dir: path.join(__dirname, 'services', 'auth-service'),
    script: 'index.js'
  },
  {
    name: 'User Service',
    emoji: '👥',
    port: 50052,
    dir: path.join(__dirname, 'services', 'user-service'),
    script: 'index.js'
  },
  {
    name: 'Project Service',
    emoji: '📁',
    port: 50053,
    dir: path.join(__dirname, 'services', 'project-service'),
    script: 'index.js'
  },
  {
    name: 'Asset Service',
    emoji: '🖼️',
    port: 50054,
    dir: path.join(__dirname, 'services', 'asset-service'),
    script: 'index.js'
  },
  {
    name: 'Notification Service',
    emoji: '🔔',
    port: 50055,
    dir: path.join(__dirname, 'services', 'notification-service'),
    script: 'index.js'
  }
];

const gateway = {
  name: 'API Gateway',
  emoji: '🚪',
  port: 3000,
  dir: path.join(__dirname, 'gateway'),
  script: 'index.js'
};

// Track running processes
const processes = [];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Service colors
const serviceColors = [
  colors.cyan,
  colors.green,
  colors.yellow,
  colors.magenta,
  colors.blue
];

function startService(service, color, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`${color}${service.emoji} Starting ${service.name}...${colors.reset}`);
      
      const child = spawn('node', [service.script], {
        cwd: service.dir,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      child.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            console.log(`${color}[${service.name}]${colors.reset} ${line}`);
          }
        });
      });

      child.stderr.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            console.error(`${colors.red}[${service.name}]${colors.reset} ${line}`);
          }
        });
      });

      child.on('error', (error) => {
        console.error(`${colors.red}[${service.name}] Failed to start: ${error.message}${colors.reset}`);
      });

      child.on('exit', (code) => {
        if (code !== 0 && code !== null) {
          console.error(`${colors.red}[${service.name}] Exited with code ${code}${colors.reset}`);
        }
      });

      processes.push({ name: service.name, process: child });
      
      // Wait a bit for service to start
      setTimeout(resolve, 1500);
    }, delay);
  });
}

async function startAll() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 ACM Digital Repository - Microservices Architecture');
  console.log('='.repeat(60) + '\n');

  console.log('Starting gRPC Microservices...\n');

  // Start all gRPC services in parallel, but with slight delays
  const servicePromises = services.map((service, index) => 
    startService(service, serviceColors[index], index * 500)
  );

  await Promise.all(servicePromises);

  console.log('\n' + '-'.repeat(60) + '\n');

  // Wait for services to be ready, then start gateway
  console.log('Waiting for services to be ready...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Start API Gateway
  await startService(gateway, colors.white);

  console.log('\n' + '='.repeat(60));
  console.log('✅ All services started successfully!');
  console.log('='.repeat(60));
  console.log('\n📡 Service Endpoints:');
  services.forEach(s => {
    console.log(`   ${s.emoji} ${s.name}: localhost:${s.port} (gRPC)`);
  });
  console.log(`   ${gateway.emoji} ${gateway.name}: http://localhost:${gateway.port} (REST)`);
  console.log('\n🔗 Frontend should connect to: http://localhost:3000/api/v1');
  console.log('\n💡 Press Ctrl+C to stop all services\n');
}

// Graceful shutdown
function shutdown() {
  console.log('\n\n🛑 Shutting down all services...\n');
  
  processes.forEach(({ name, process: child }) => {
    console.log(`   Stopping ${name}...`);
    child.kill('SIGTERM');
  });

  // Force kill after 5 seconds
  setTimeout(() => {
    processes.forEach(({ process: child }) => {
      if (!child.killed) {
        child.kill('SIGKILL');
      }
    });
    process.exit(0);
  }, 5000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start everything
startAll().catch(error => {
  console.error(`\n${colors.red}Failed to start services: ${error.message}${colors.reset}\n`);
  shutdown();
});
