import { ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <main id="main" className="flex flex-1 flex-col">
        <div className="wrap grid flex-1 gap-10 py-10 md:py-16 lg:grid-cols-[minmax(0,30rem)_1fr] lg:gap-20">
          <div className="grid content-start gap-8">{children}</div>
          <aside className="on-board hidden content-start gap-5 self-start rounded-md bg-board p-8 text-on-board lg:grid">
            <p className="board-type text-step-4">
              One request.
              <br />
              <span className="text-on-board-2">One clear answer.</span>
            </p>
            <p className="measure text-on-board-2">
              Every viewing request on KejaLink is Pending until the person listing says yes or no. Confirm
              one, and the place shows as taken for everyone else.
            </p>
            <p className="flex items-center gap-2 font-bold">
              <ShieldCheck aria-hidden className="size-5 text-on-board-2" />
              Pay only after you&apos;ve viewed the house.
            </p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
