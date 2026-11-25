import type { ReactNode } from "react";

/** Long-form pages (rules, privacy, terms): one readable column, board-type headings. */
export function ProsePage({
  title,
  intro,
  children,
  draft,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  draft?: boolean;
}) {
  return (
    <article className="wrap grid gap-8 py-10 md:py-16">
      <header className="grid max-w-3xl gap-4">
        <h1 className="board-type text-step-5">{title}</h1>
        {draft ? (
          <p
            role="note"
            className="rounded-sm border border-warning/40 bg-warning-soft p-4 font-bold text-warning"
          >
            Draft for legal review. This is not yet a final policy, and it may change before KejaLink&apos;s
            public launch.
          </p>
        ) : null}
        {intro ? <div className="measure text-step-1 text-ink-2">{intro}</div> : null}
      </header>
      <div className="measure [&_h2]:board-type grid gap-8 [&_h2]:text-step-3 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_section]:grid [&_section]:gap-3 [&_ul]:grid [&_ul]:gap-2">
        {children}
      </div>
    </article>
  );
}
