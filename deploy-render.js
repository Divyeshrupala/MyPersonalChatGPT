#!/usr/bin/env node

/**
 * Render Deployment Helper Script
 * This script helps ensure the app starts correctly on Render
 */

console.log('🚀 Starting Multi-AI Chat on Render...');
console.log('📍 Current directory:', process.cwd());
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', process.env.PORT || 3000);

// Check if server.js exists
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'server.js');

if (!existsSync(serverPath)) {
  console.error('❌ server.js not found at:', serverPath);
  process.exit(1);
}

console.log('✅ server.js found, starting application...');

// Import and start the server
try {
  await import('./server.js');
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}