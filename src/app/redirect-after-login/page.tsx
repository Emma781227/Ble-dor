import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authSession";

export default async function RedirectAfterLoginPage() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    // pas connecté → on renvoie vers le login
    redirect("/login");
  }

  const role = (session.user as any).role as string | undefined;

  if (role === "OWNER" || role === "MANAGER") {
    redirect("/manager/dashboard");
  }

  if (role === "CLIENT") {
    redirect("/client/dashboard");
  }

  // fallback au cas où
  redirect("/");
}
