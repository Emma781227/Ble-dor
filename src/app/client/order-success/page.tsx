import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authSession";
import ClientLayout from "@/components/layout/ClientLayout";
import SuccessContent from "./SuccessContent";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams?: { ticket?: string };
}) {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;

  if (user.role !== "CLIENT") {
    redirect("/");
  }

  const ticket = searchParams?.ticket || null;

  return (
    <ClientLayout currentUser={user}>
      <SuccessContent ticket={ticket} />
    </ClientLayout>
  );
}
