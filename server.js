/**
 * Root Server Entrypoint for Cloud Deployments (Render, Heroku, AWS, Railway)
 * Automatically delegates to compiled backend dist/server.js
 */
const path = require('path');
const fs = require('fs');

const backendDist = path.join(__dirname, 'apps', 'backend', 'dist', 'server.js');

if (fs.existsSync(backendDist)) {
  console.log('🚀 Launching backend from apps/backend/dist/server.js...');
  require(backendDist);
} else {
  console.log('⚡ apps/backend/dist/server.js not found, compiling typescript or using ts-node...');
  try {
    require('ts-node/register');
    require(path.join(__dirname, 'apps', 'backend', 'src', 'server.ts'));
  } catch (err) {
    console.error('❌ Failed to launch server from root:', err);
    process.exit(1);
  }
}
