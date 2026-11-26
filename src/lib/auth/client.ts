"use client";

import type { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { publicEnv } from "@/lib/env/public";

/** Fields the API adds to the user (backend/src/config/auth/better-auth.ts). */
type UserFields = {
  role: { type: "string"; required: true; input: true };
  status: { type: "string"; required: false; input: false };
};

type AdditionalFields = ReturnType<typeof inferAdditionalFields<unknown, { user: UserFields }>>;

/**
 * The additional-fields client plugin is a type-level marker; at runtime it is this object.
 * Importing it from `better-auth/client/plugins` pulls that barrel's other plugins (and Zod,
 * ~40 KB gzipped) into every page, so it is built here. Its type still comes from Better Auth.
 */
// The cast only re-attaches the type-level `$InferServerPlugin`; the runtime value matches the library's.
const additionalFields = {
  id: "additional-fields-client",
  version: "local",
  $InferServerPlugin: {},
} as unknown as AdditionalFields;

/**
 * Better Auth client. Its base URL is this site (or NEXT_PUBLIC_API_BASE once app and API share
 * a domain), so every auth call goes through the same-origin /api proxy and cookies stay first-party.
 */
const baseURL =
  publicEnv.NEXT_PUBLIC_API_BASE ??
  (typeof window === "undefined" ? publicEnv.NEXT_PUBLIC_SITE_URL : window.location.origin);

export const authClient = createAuthClient({
  baseURL,
  basePath: "/api/auth",
  fetchOptions: { credentials: "include" },
  plugins: [additionalFields],
});

export const { useSession, signIn, signUp, signOut } = authClient;
