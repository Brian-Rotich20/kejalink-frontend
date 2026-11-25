"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { publicEnv } from "@/lib/env/public";

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
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string", required: true, input: true },
        status: { type: "string", required: false, input: false },
      },
    }),
  ],
});

export const { useSession, signIn, signUp, signOut } = authClient;
