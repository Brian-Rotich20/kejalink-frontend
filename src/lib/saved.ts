"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import { ApiError, messageFor } from "@/lib/api/errors";
import { useSession } from "@/lib/auth/client";

const SAVED_IDS = ["saved", "ids"] as const;
const savedIds = z.array(z.uuid());
const savedResult = z.object({ propertyId: z.uuid(), saved: z.boolean() });

/** Saving is a seeker feature; listers and admins don't see the bookmark. */
export function useCanSave(): { signedIn: boolean; canSave: boolean; pending: boolean } {
  const { data, isPending } = useSession();
  const role = data?.user.role;
  return { signedIn: Boolean(data?.user), canSave: role === "SEEKER", pending: isPending };
}

/** The ids the signed-in seeker has saved (one request, shared by every card on the page). */
export function useSavedIds() {
  const { canSave } = useCanSave();
  return useQuery({
    queryKey: SAVED_IDS,
    queryFn: async ({ signal }) => (await apiFetch("/saved/ids", { schema: savedIds, signal })).data,
    enabled: canSave,
    staleTime: 60_000,
    select: (ids) => new Set(ids),
  });
}

/** Save or unsave with an optimistic mark; rolls back and explains on failure. */
export function useToggleSaved() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, save }: { propertyId: string; save: boolean }) =>
      apiFetch(`/saved/${propertyId}`, { method: save ? "PUT" : "DELETE", schema: savedResult }),
    onMutate: async ({ propertyId, save }) => {
      await client.cancelQueries({ queryKey: SAVED_IDS });
      const previous = client.getQueryData<string[]>(SAVED_IDS);
      client.setQueryData<string[]>(SAVED_IDS, (ids = []) =>
        save ? [propertyId, ...ids.filter((id) => id !== propertyId)] : ids.filter((id) => id !== propertyId),
      );
      return { previous };
    },
    onError: (error, { save }, context) => {
      client.setQueryData(SAVED_IDS, context?.previous);
      const unavailable = error instanceof ApiError && error.status === 404 && error.code === "NOT_FOUND";
      toast.error(save ? "Couldn't save this place" : "Couldn't remove this place", {
        description: unavailable ? "Saving isn't available on this server yet." : messageFor(error),
      });
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: ["saved"] });
    },
  });
}
