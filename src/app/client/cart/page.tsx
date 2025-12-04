import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authSession";
import ClientLayout from "@/components/layout/ClientLayout";
import ClientCartPageContent from "./ClientCartPageContent";

export default async function ClientCartPage() {
  const session = await getAuthSession();

  // 🔁 Si pas connecté → on envoie vers la page d'inscription
  if (!session || !session.user) {
    redirect("/signup?from=cart");
  }

  const user = session.user as any;

  if (user.role !== "CLIENT") {
    redirect("/");
  }

  return (
    <ClientLayout currentUser={user}>
      <ClientCartPageContent initialCustomerName={user.name ?? ""} />
    </ClientLayout>
  );
}
