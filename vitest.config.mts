import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${src}/` },
      // `server-only` throws outside React Server bundles; tests import server modules directly.
      { find: "server-only", replacement: fileURLToPath(new URL("./tests/empty.ts", import.meta.url)) },
    ],
  },
  test: {
    // Pure modules run in node (fast); component tests opt in with `// @vitest-environment jsdom`.
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
    env: { TZ: "Africa/Nairobi" },
    restoreMocks: true,
    pool: "threads",
    maxWorkers: 2,
  },
});
