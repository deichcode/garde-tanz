import { defineConfig } from 'vitest/config';

// Nur für die Sicherheitsregeln, läuft im Firestore-Emulator (npm run test:rules).
export default defineConfig({
  test: { environment: 'node', include: ['rules-test/**/*.test.ts'], testTimeout: 15000, fileParallelism: false },
});
