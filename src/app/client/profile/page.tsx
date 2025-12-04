import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authSession";
import ClientLayout from "@/components/layout/ClientLayout";
import ClientProfileContent from "./ClientProfileContent";
import { prisma } from "@/lib/prisma";

export default async function ClientProfilePage() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  const userSession = session.user as any;

  if (userSession.role !== "CLIENT") {
    redirect("/");
  }

  // On va chercher les infos complètes dans la base
  const dbUser = await prisma.user.findUnique({
    where: { id: userSession.id },
    select: {
      name: true,
      email: true,
      phone: true,
      marketingOptIn: true,
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  return (
    <ClientLayout currentUser={{ ...userSession, ...dbUser }}>
      <ClientProfileContent
        initialName={dbUser.name ?? ""}
        initialEmail={dbUser.email}
        initialPhone={dbUser.phone ?? ""}
        initialMarketingOptIn={dbUser.marketingOptIn ?? false}
      />
    </ClientLayout>
  );
}
