import { SiteFooter } from "@/components/layout/site-footer";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
