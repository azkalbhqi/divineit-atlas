import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import InvoiceClient from "./InvoiceClient";

export default async function InvoicesPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return <InvoiceClient />;
}
