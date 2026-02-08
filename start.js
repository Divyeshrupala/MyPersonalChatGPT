#!/usr/bin/env node

// Simple start script that imports and runs the main server
import('./server.js').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});