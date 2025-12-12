import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authSession";
import { prisma } from "@/lib/prisma";
import ManagerLayout from "@/components/layout/ManagerLayout";
import OwnerManagersClientPage from "./OwnerManagersClientPage";

export type ManagerUser = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
};

export default async function OwnerManagersPage() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/owner/managers");
  }

  const user = session.user as any;
  const role = user.role as string;

  if (role !== "OWNER") {
    redirect("/");
  }

  const managersFromDb = await prisma.user.findMany({
    where: { role: "MANAGER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
    },
  });

  const initialManagers: ManagerUser[] = managersFromDb.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <ManagerLayout currentUser={user} currentRole={role}>
      <OwnerManagersClientPage initialManagers={initialManagers} />
    </ManagerLayout>
  );
}
