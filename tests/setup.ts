import { afterEach } from "vitest";

// DOM helpers only where a DOM exists (component tests opt into jsdom per file).
if (typeof document !== "undefined") {
  await import("@testing-library/jest-dom/vitest");
  const { cleanup } = await import("@testing-library/react");
  afterEach(() => cleanup());
}
