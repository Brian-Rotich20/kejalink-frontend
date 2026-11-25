"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, NativeSelect, Textarea } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DesignInteractive() {
  return (
    <section aria-labelledby="interactive" className="grid gap-8">
      <h2 id="interactive" className="board-type text-step-3">
        Fields, overlays, tabs
      </h2>
      <form className="grid max-w-md gap-5" onSubmit={(e) => e.preventDefault()}>
        <Field label="Area" hint="Estate, neighbourhood or campus">
          {({ id, describedBy }) => (
            <Input id={id} aria-describedby={describedBy} placeholder="Kahawa Wendani" />
          )}
        </Field>
        <Field label="Monthly rent" error="Enter an amount above 0">
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              inputMode="numeric"
              defaultValue="0"
            />
          )}
        </Field>
        <Field label="Type">
          {({ id }) => (
            <NativeSelect id={id} defaultValue="BEDSITTER">
              <option value="BEDSITTER">Bedsitter</option>
              <option value="STUDIO">Studio</option>
            </NativeSelect>
          )}
        </Field>
        <Field label="Message" optional>
          {({ id }) => <Textarea id={id} placeholder="Hi, I'm a student at KU…" />}
        </Field>
      </form>

      <div className="flex flex-wrap gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open dialog</Button>
          </DialogTrigger>
          <DialogContent title="Decline this request?" description="The seeker sees your reason.">
            <p>Focus is trapped here and goes back to the button when this closes.</p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Keep it</Button>
              </DialogClose>
              <Button variant="danger">Decline</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open sheet</Button>
          </DialogTrigger>
          <DialogContent variant="sheet" title="Filters">
            <p>Docks to the bottom on phones, centres on desktop.</p>
          </DialogContent>
        </Dialog>
        <Button onClick={() => toast.success("Request sent", { description: "You'll see the answer here." })}>
          Show toast
        </Button>
      </div>

      <Tabs defaultValue="pending">
        <TabsList aria-label="Request status">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="py-4">
          Pending requests
        </TabsContent>
        <TabsContent value="confirmed" className="py-4">
          Confirmed requests
        </TabsContent>
        <TabsContent value="declined" className="py-4">
          Declined requests
        </TabsContent>
      </Tabs>
    </section>
  );
}
