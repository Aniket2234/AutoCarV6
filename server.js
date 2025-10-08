#!/usr/bin/env node

// This file is used as the entry point for cPanel Node.js applications
// It loads the main application from the compiled dist folder

import('./dist/index.js').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
