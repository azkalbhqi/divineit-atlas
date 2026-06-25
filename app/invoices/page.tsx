import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function InvoicesPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="w-full h-[calc(100vh-64px)] md:h-screen overflow-hidden bg-zinc-950">
      <iframe
        src="/invoices/index.html"
        className="w-full h-full border-none block bg-transparent"
        title="Invoice Generator"
      />
    </div>
  );
}
