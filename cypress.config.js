import { defineConfig } from "cypress";
import { existsSync, mkdirSync } from 'fs';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5174',
    setupNodeEvents(on, config) {
      on('task', {
        fileExists(filePath) {
          return existsSync(filePath);
        },
        mkdir(dirPath) {
          mkdirSync(dirPath, { recursive: true });
          return null;
        },
      });
    },
  },
  env: {
    apiUrl: 'http://localhost:3001',
  },
  video: false,
  screenshotOnRunFailure: true,
  viewportWidth: 1280,
  viewportHeight: 720,
  defaultCommandTimeout: 10000,
  retries: {
    runMode: 2,
    openMode: 0,
  },
});
