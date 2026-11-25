"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, EyeOff, SearchX } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { toast } from "sonner";
import { ListLoading, QueryError } from "@/components/domain/query-states";
import { PropertyStatusPlate } from "@/components/domain/status";
import { PageTitle } from "@/components/layout/area-shell";
import { StateBlock } from "@/components/ui/state";
import { isApiError } from "@/lib/api/errors";
import { getProperty, keys, updateProperty } from "@/lib/api/resources";
import { toFormValues, toPatchBody } from "@/lib/validation/property";
import { AvailabilitySwitch, DeleteListing } from "../listing-controls";
import { PropertyForm } from "../property-form";
import { PhotoManager } from "./photo-manager";

export function EditListing({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: keys.property(id), queryFn: () => getProperty(id) });
  const property = query.data?.data;
  const initial = useMemo(() => (property ? toFormValues(property) : null), [property]);

  const mutation = useMutation({
    mutationFn: (body: Parameters<typeof updateProperty>[1]) => updateProperty(id, body),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(keys.property(id), { data, meta: null });
      void queryClient.invalidateQueries({ queryKey: keys.myPropertiesAll });
      toast.success("Changes saved");
    },
  });

  const back = (
    <Link href="/tenant/properties" className="link inline-flex min-h-11 items-center gap-1.5 font-bold">
      <ArrowLeft aria-hidden className="size-4" />
      My listings
    </Link>
  );

  if (query.isPending) return <ListLoading rows={3} height="h-48" />;
  if (query.isError) {
    if (
      isApiError(query.error) &&
      (query.error.status === 404 || query.error.status === 422 || query.error.status === 403)
    ) {
      return (
        <StateBlock icon={SearchX} title="We couldn't find that listing" action={back}>
          <p>It may have been deleted, or it belongs to another account.</p>
        </StateBlock>
      );
    }
    return <QueryError error={query.error} retry={() => void query.refetch()} retrying={query.isFetching} />;
  }
  if (!property || !initial) return null;

  return (
    <>
      {back}
      <PageTitle
        title={property.title}
        action={
          <Link
            href={`/properties/${property.id}`}
            className="link inline-flex min-h-11 items-center gap-1.5 font-bold"
          >
            View public page
            <ExternalLink aria-hidden className="size-4" />
          </Link>
        }
      />

      {property.status === "REJECTED" ? (
        <div role="note" className="grid gap-1 rounded-md border border-danger/40 bg-danger-soft p-4">
          <p className="flex items-center gap-2 font-bold text-danger">
            <EyeOff aria-hidden className="size-5" />
            Hidden from search by a moderator
          </p>
          {property.rejectionReason ? <p className="text-ink-2">Reason: {property.rejectionReason}</p> : null}
          <p className="text-ink-2">
            You can still edit it. Contact support once it&apos;s fixed to have it restored.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-line bg-surface-2 p-4">
        <AvailabilitySwitch id={property.id} isAvailable={property.isAvailable} />
        <div className="flex items-center gap-3">
          <PropertyStatusPlate status={property.status} />
          <DeleteListing id={property.id} title={property.title} redirectTo="/tenant/properties" />
        </div>
      </div>

      <div id="photos" className="scroll-mt-24">
        <PhotoManager propertyId={property.id} title={property.title} uploads={property.uploads} />
      </div>

      <section aria-labelledby="details-title" className="grid gap-5">
        <h2 id="details-title" className="board-type text-step-3">
          Details
        </h2>
        <PropertyForm
          key={property.updatedAt}
          draftKey={`edit:${property.id}`}
          initial={initial}
          submitLabel="Save changes"
          pendingLabel="Saving"
          pending={mutation.isPending}
          error={mutation.error}
          onSubmit={(values) => {
            const body = toPatchBody(values, initial);
            if (Object.keys(body).length === 0) {
              toast("Nothing to save", { description: "You haven't changed anything yet." });
              return;
            }
            mutation.mutate(body);
          }}
        />
      </section>
    </>
  );
}
