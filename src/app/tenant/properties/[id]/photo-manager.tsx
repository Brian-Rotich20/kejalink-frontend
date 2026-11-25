"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Camera,
  GripVertical,
  ImagePlus,
  RotateCcw,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { MotionConfig, Reorder, useDragControls } from "motion/react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { isApiError, messageFor } from "@/lib/api/errors";
import { deleteUpload, keys, updateUpload } from "@/lib/api/resources";
import type { PropertyImage } from "@/lib/api/schemas/property";
import { uploadPhoto } from "@/lib/api/upload";
import { cn } from "@/lib/cn";
import { cropTo } from "@/lib/cloudinary";
import { formatBytes, isAcceptedType, MAX_PHOTOS, PhotoError, preparePhoto } from "@/lib/images/compress";

type QueueStatus = "preparing" | "queued" | "uploading" | "error" | "cancelled";
type QueueItem = {
  key: string;
  name: string;
  previewUrl: string;
  status: QueueStatus;
  progress: number;
  error?: string;
  file: File;
  bytes?: { from: number; to: number };
};

const sortByOrder = (images: PropertyImage[]) => [...images].sort((a, b) => a.displayOrder - b.displayOrder);

/* ------------------------------ upload queue ------------------------------ */

function useUploadQueue(propertyId: string, onUploaded: () => void) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const chain = useRef<Promise<void>>(Promise.resolve());
  const controllers = useRef(new Map<string, AbortController>());

  const patch = (key: string, change: Partial<QueueItem>) =>
    setItems((list) => list.map((item) => (item.key === key ? { ...item, ...change } : item)));

  const remove = (key: string) =>
    setItems((list) => {
      const gone = list.find((item) => item.key === key);
      if (gone) URL.revokeObjectURL(gone.previewUrl);
      return list.filter((item) => item.key !== key);
    });

  async function process(item: QueueItem) {
    const controller = new AbortController();
    controllers.current.set(item.key, controller);
    try {
      patch(item.key, { status: "preparing", progress: 0, error: undefined });
      const prepared = await preparePhoto(item.file);
      if (controller.signal.aborted) return;
      patch(item.key, {
        status: "uploading",
        bytes: { from: prepared.originalBytes, to: prepared.blob.size },
      });
      const ext = prepared.type === "image/webp" ? "webp" : "jpg";
      await uploadPhoto(propertyId, prepared.blob, `photo.${ext}`, {
        signal: controller.signal,
        onProgress: (fraction) => patch(item.key, { progress: fraction }),
      });
      remove(item.key);
      onUploaded();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        remove(item.key);
        return;
      }
      const message =
        error instanceof PhotoError
          ? error.message
          : isApiError(error)
            ? messageFor(error)
            : "The upload failed.";
      patch(item.key, { status: "error", error: message });
    } finally {
      controllers.current.delete(item.key);
    }
  }

  /** Uploads run one at a time, in the order chosen (one file per request, as the API expects). */
  const enqueue = (list: QueueItem[]) => {
    for (const item of list) {
      chain.current = chain.current.then(() => process(item));
    }
  };

  const add = (files: File[]) => {
    const created = files.map<QueueItem>((file) => ({
      key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      status: "queued",
      progress: 0,
      file,
    }));
    setItems((list) => [...list, ...created]);
    enqueue(created);
  };

  const retry = (key: string) => {
    const item = items.find((i) => i.key === key);
    if (!item) return;
    patch(key, { status: "queued", error: undefined, progress: 0 });
    enqueue([{ ...item, status: "queued" }]);
  };

  const cancel = (key: string) => {
    const controller = controllers.current.get(key);
    if (controller) controller.abort();
    else remove(key);
  };

  // Free object URLs when leaving the page.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => () => itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl)), []);

  return { items, add, retry, cancel, remove };
}

/* ------------------------------- one photo ------------------------------- */

function PhotoRow({
  image,
  index,
  count,
  title,
  busy,
  onMove,
  onPrimary,
  onDelete,
  onDragEnd,
}: {
  image: PropertyImage;
  index: number;
  count: number;
  title: string;
  busy: boolean;
  onMove: (from: number, to: number) => void;
  onPrimary: () => void;
  onDelete: () => void;
  onDragEnd: () => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={image.id}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className="flex items-center gap-3 rounded-md border border-line bg-surface-2 p-2 pr-3"
    >
      <button
        type="button"
        aria-label={`Drag to reorder photo ${index + 1}`}
        onPointerDown={(event) => controls.start(event)}
        className="grid h-16 w-8 shrink-0 cursor-grab touch-none place-items-center rounded-sm text-ink-3 hover:bg-surface-sunk hover:text-ink active:cursor-grabbing"
      >
        <GripVertical aria-hidden className="size-5" />
      </button>
      <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-sm bg-surface-sunk">
        <Image
          src={cropTo(image.url, "4:3")}
          alt={`${title}, photo ${index + 1}`}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
      <div className="grid min-w-0 flex-1 gap-1">
        <p className="font-bold">Photo {index + 1}</p>
        {image.isPrimary ? (
          <p className="board-type-wide inline-flex w-fit items-center gap-1 rounded-xs bg-band px-1.5 py-0.5 text-[0.75rem] text-on-band">
            <Star aria-hidden className="size-3" fill="currentColor" />
            Cover photo
          </p>
        ) : (
          <button
            type="button"
            onClick={onPrimary}
            disabled={busy}
            className="link w-fit text-step--1 font-bold"
          >
            Make cover photo
          </button>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          disabled={busy || index === 0}
          onClick={() => onMove(index, index - 1)}
          aria-label={`Move photo ${index + 1} up`}
        >
          <ArrowUp aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={busy || index === count - 1}
          onClick={() => onMove(index, index + 1)}
          aria-label={`Move photo ${index + 1} down`}
        >
          <ArrowDown aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={busy}
          onClick={onDelete}
          aria-label={`Delete photo ${index + 1}`}
          className="text-danger hover:bg-danger-soft"
        >
          <Trash2 aria-hidden />
        </Button>
      </div>
    </Reorder.Item>
  );
}

/* ------------------------------- manager ------------------------------- */

export function PhotoManager({
  propertyId,
  title,
  uploads,
}: {
  propertyId: string;
  title: string;
  uploads: PropertyImage[];
}) {
  const inputId = useId();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: keys.property(propertyId) });
  const queue = useUploadQueue(propertyId, () => {
    void refresh();
    void queryClient.invalidateQueries({ queryKey: keys.myPropertiesAll });
  });

  const server = sortByOrder(uploads);
  const [order, setOrder] = useState<string[]>(server.map((u) => u.id));
  const [synced, setSynced] = useState(server.map((u) => u.id).join());
  // Server data changed (upload, delete): adopt its order.
  if (server.map((u) => u.id).join() !== synced) {
    setSynced(server.map((u) => u.id).join());
    setOrder(server.map((u) => u.id));
  }
  const byId = new Map(server.map((u) => [u.id, u]));
  const ordered = order.map((id) => byId.get(id)).filter((u): u is PropertyImage => Boolean(u));

  const [toDelete, setToDelete] = useState<PropertyImage | null>(null);
  const [announce, setAnnounce] = useState("");

  const saveOrder = useMutation({
    mutationFn: async (ids: string[]) => {
      // Only rows whose position changed are patched, one at a time.
      for (const [index, id] of ids.entries()) {
        if (byId.get(id)?.displayOrder !== index) await updateUpload(propertyId, id, { displayOrder: index });
      }
    },
    onSuccess: () => setAnnounce("Photo order saved."),
    onError: (error) => toast.error(messageFor(error)),
    onSettled: () => void refresh(),
  });
  const setPrimary = useMutation({
    mutationFn: (uploadId: string) => updateUpload(propertyId, uploadId, { isPrimary: true }),
    onSuccess: () => {
      setAnnounce("Cover photo updated.");
      void queryClient.invalidateQueries({ queryKey: keys.myPropertiesAll });
    },
    onError: (error) => toast.error(messageFor(error)),
    onSettled: () => void refresh(),
  });
  const remove = useMutation({
    mutationFn: (uploadId: string) => deleteUpload(propertyId, uploadId),
    onSuccess: () => {
      setToDelete(null);
      setAnnounce("Photo deleted.");
      void queryClient.invalidateQueries({ queryKey: keys.myPropertiesAll });
    },
    onSettled: () => void refresh(),
  });

  const move = (from: number, to: number) => {
    const next = [...order];
    const [id] = next.splice(from, 1);
    if (!id) return;
    next.splice(to, 0, id);
    setOrder(next);
    setAnnounce(`Photo moved to position ${to + 1}.`);
    saveOrder.mutate(next);
  };

  const active = queue.items.filter((i) => i.status !== "error" && i.status !== "cancelled").length;
  const room = Math.max(0, MAX_PHOTOS - server.length - active);
  const busy = saveOrder.isPending || setPrimary.isPending || remove.isPending;

  const onFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const files = Array.from(list);
    const wrongType = files.filter((f) => !isAcceptedType(f.type));
    const usable = files.filter((f) => isAcceptedType(f.type));
    if (wrongType.length > 0)
      toast.error(`${wrongType.length} file(s) skipped: use JPEG, PNG or WebP photos.`);
    if (usable.length > room) {
      toast.error(`A listing can have ${MAX_PHOTOS} photos. Adding the first ${room}.`);
    }
    queue.add(usable.slice(0, room));
  };

  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby="photos-title" className="grid gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="grid gap-1">
            <h2 id="photos-title" className="board-type text-step-3">
              Photos
            </h2>
            <p className="text-ink-2">
              {server.length} of {MAX_PHOTOS}. The cover photo is what people see first. Photos are shrunk on
              your phone before upload, to save data.
            </p>
          </div>
        </div>

        <p role="status" aria-live="polite" className="sr-only">
          {announce}
        </p>

        <label
          htmlFor={inputId}
          className={cn(
            "grid cursor-pointer justify-items-center gap-2 rounded-md border-2 border-dashed border-line-strong bg-surface-2 p-6 text-center transition-colors hover:border-ink",
            "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
            room === 0 && "pointer-events-none opacity-60",
          )}
        >
          <span className="flex gap-2 text-ink-2">
            <Camera aria-hidden className="size-6" />
            <ImagePlus aria-hidden className="size-6" />
          </span>
          <span className="font-bold">{room === 0 ? "Photo limit reached" : "Take or choose photos"}</span>
          <span className="text-step--1 text-ink-2">
            {room === 0 ? "Delete a photo to add another." : `JPEG, PNG or WebP · up to ${room} more`}
          </span>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={room === 0}
            className="sr-only"
            onChange={(event) => {
              onFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>

        {queue.items.length > 0 ? (
          <ul aria-label="Uploading" className="grid gap-2">
            {queue.items.map((item) => (
              <li
                key={item.key}
                className={cn(
                  "flex items-center gap-3 rounded-md border p-2 pr-3",
                  item.status === "error" ? "border-danger/40 bg-danger-soft" : "border-line bg-surface-2",
                )}
              >
                <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-sm bg-surface-sunk">
                  {/* Optimistic thumbnail from the local file (object URL, never uploaded as-is). */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.previewUrl} alt="" className="absolute inset-0 size-full object-cover" />
                </div>
                <div className="grid min-w-0 flex-1 gap-1.5">
                  <p className="truncate text-step--1 font-bold">{item.name}</p>
                  {item.status === "error" ? (
                    <p className="text-step--1 font-bold text-danger">{item.error}</p>
                  ) : (
                    <>
                      <div
                        role="progressbar"
                        aria-label={`Uploading ${item.name}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(item.progress * 100)}
                        className="h-2 overflow-hidden rounded-pill bg-surface-sunk"
                      >
                        <div
                          className="h-full origin-left bg-ink transition-transform duration-(--dur-2)"
                          style={{ transform: `scaleX(${item.status === "uploading" ? item.progress : 0})` }}
                        />
                      </div>
                      <p className="text-step--1 text-ink-2">
                        {item.status === "preparing"
                          ? "Shrinking photo…"
                          : item.status === "queued"
                            ? "Waiting…"
                            : `Uploading ${Math.round(item.progress * 100)}%`}
                        {item.bytes
                          ? ` · ${formatBytes(item.bytes.from)} → ${formatBytes(item.bytes.to)}`
                          : ""}
                      </p>
                    </>
                  )}
                </div>
                {item.status === "error" ? (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => queue.retry(item.key)}
                      aria-label={`Retry ${item.name}`}
                    >
                      <RotateCcw aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => queue.remove(item.key)}
                      aria-label={`Dismiss ${item.name}`}
                    >
                      <X aria-hidden />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => queue.cancel(item.key)}
                    aria-label={`Cancel ${item.name}`}
                  >
                    <X aria-hidden />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : null}

        {ordered.length > 0 ? (
          <Reorder.Group
            axis="y"
            values={order}
            onReorder={setOrder}
            className="grid gap-2"
            aria-label="Your photos"
          >
            {ordered.map((image, index) => (
              <PhotoRow
                key={image.id}
                image={image}
                index={index}
                count={ordered.length}
                title={title}
                busy={busy}
                onMove={move}
                onPrimary={() => setPrimary.mutate(image.id)}
                onDelete={() => setToDelete(image)}
                onDragEnd={() => saveOrder.mutate(order)}
              />
            ))}
          </Reorder.Group>
        ) : queue.items.length === 0 ? (
          <p className="rounded-md bg-warning-soft p-4 text-ink-2">
            No photos yet. Listings with photos get far more requests: add the room, the kitchen and the
            outside.
          </p>
        ) : null}

        <ConfirmDialog
          open={toDelete !== null}
          onOpenChange={(open) => (open ? undefined : setToDelete(null))}
          title="Delete this photo?"
          confirmLabel="Delete photo"
          cancelLabel="Keep it"
          pending={remove.isPending}
          error={remove.error ? messageFor(remove.error) : null}
          onConfirm={() => (toDelete ? remove.mutate(toDelete.id) : undefined)}
        >
          <p>
            {toDelete?.isPrimary
              ? "This is the cover photo. The next photo in the list becomes the cover."
              : "It's removed from the listing straight away."}
          </p>
        </ConfirmDialog>
      </section>
    </MotionConfig>
  );
}
