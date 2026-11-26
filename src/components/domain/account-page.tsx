import { PageTitle } from "@/components/layout/area-shell";
import { AccountForm } from "./account-form";

/** The same account page in every area. */
export function AccountPage() {
  return (
    <>
      <PageTitle title="Account" />
      <AccountForm />
    </>
  );
}
