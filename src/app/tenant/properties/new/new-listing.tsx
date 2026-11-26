"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageTitle } from "@/components/layout/area-shell";
import { createProperty, keys } from "@/lib/api/resources";
import { toCreateBody } from "@/lib/validation/property";
import { PropertyForm } from "../property-form";

export function NewListing() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createProperty,
    onSuccess: ({ data }) => {
      queryClient.setQueryData(keys.property(data.id), { data, meta: null });
      void queryClient.invalidateQueries({ queryKey: keys.myPropertiesAll });
      toast.success("Your place is live", {
        description: "Now add photos: listings with photos get more requests.",
      });
      router.push(`/tenant/properties/${data.id}?added=1#photos`);
    },
  });

  return (
    <>
      <PageTitle title="List a place">
        <p>Your listing goes live as soon as you save it. You&apos;ll add photos on the next step.</p>
      </PageTitle>
      <PropertyForm
        draftKey="new"
        submitLabel="Save and add photos"
        pendingLabel="Saving"
        pending={mutation.isPending}
        error={mutation.error}
        onSubmit={(values) => mutation.mutate(toCreateBody(values))}
      />
    </>
  );
}
