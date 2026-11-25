/**
 * E2E backend: the real KejaLink API (backend/src, unchanged) on a throwaway database, with the
 * image host replaced by a fake that never calls Cloudinary. Local development and tests only.
 *
 *   E2E_DATABASE_URL=postgresql://…/kejalink_e2e_test  npm run e2e:backend
 *
 * Refuses to start unless the database name contains "test". Never point it at a real database.
 */
import { randomBytes, randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(here, "../../../backend");

const databaseUrl = process.env.E2E_DATABASE_URL;
if (!databaseUrl) {
  console.error("E2E_DATABASE_URL is required (a throwaway Postgres database whose name contains 'test').");
  process.exit(1);
}
const dbName = new URL(databaseUrl).pathname.replace(/^\//, "");
if (!dbName.includes("test")) {
  console.error(`Refusing to run: database name "${dbName}" does not contain "test".`);
  process.exit(1);
}

const port = Number(process.env.E2E_API_PORT ?? 5100);
const frontends =
  process.env.E2E_FRONTEND_URLS ?? "http://localhost:3100,http://127.0.0.1:3100,http://localhost:3000";

// Explicit values for every variable the API reads, so nothing comes from backend/.env.
Object.assign(process.env, {
  NODE_ENV: "test",
  DATABASE_URL: databaseUrl,
  BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
  BETTER_AUTH_URL: `http://127.0.0.1:${port}`,
  FRONTEND_URL: frontends,
  PORT: String(port),
  HOST: "127.0.0.1",
  TRUST_PROXY: "1",
  AUTH_RATE_LIMIT_MAX: "10000",
  LOG_LEVEL: process.env.E2E_LOG_LEVEL ?? "warn",
  CLOUDINARY_CLOUD_NAME: "e2e-fake",
  CLOUDINARY_API_KEY: "e2e-fake",
  CLOUDINARY_API_SECRET: "e2e-fake",
  MIGRATE_ON_START: "false",
  CROSS_SITE_COOKIES: "false",
});

// The migrator resolves its folder from the working directory.
process.chdir(backendDir);

/** Cloudinary's public demo images: real JPEGs on res.cloudinary.com, so the frontend loader works. */
const DEMO_IMAGES = [
  "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/beach-boat.jpg",
];
let uploaded = 0;

async function main() {
  const { runMigrations } = await import(pathToFileURL(path.join(backendDir, "src/scripts/migrate.ts")).href);
  const { setImageStorage } = await import(
    pathToFileURL(path.join(backendDir, "src/modules/uploads/upload.storage.ts")).href
  );
  const { buildApp } = await import(pathToFileURL(path.join(backendDir, "src/app.ts")).href);
  const { seedAdmin } = await import(pathToFileURL(path.join(backendDir, "src/scripts/seed-admin.ts")).href);

  await runMigrations();

  setImageStorage({
    async upload() {
      const url = DEMO_IMAGES[uploaded % DEMO_IMAGES.length] as string;
      uploaded += 1;
      return { publicId: `e2e/${randomUUID()}`, url };
    },
    async delete() {},
  });

  if (process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD) {
    await seedAdmin({
      ...process.env,
      ADMIN_EMAIL: process.env.E2E_ADMIN_EMAIL,
      ADMIN_PASSWORD: process.env.E2E_ADMIN_PASSWORD,
      ADMIN_NAME: "E2E Admin",
    });
  }

  const app = await buildApp({ rateLimitMax: 10_000 });
  await app.listen({ port, host: "127.0.0.1" });
  console.log(`E2E API ready on http://127.0.0.1:${port} (database ${dbName}, fake image host)`);

  const stop = async () => {
    await app.close();
    process.exit(0);
  };
  process.on("SIGINT", () => void stop());
  process.on("SIGTERM", () => void stop());
}

main().catch((error: unknown) => {
  console.error("E2E API failed to start:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
