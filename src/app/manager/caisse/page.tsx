import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/authSession";
import { redirect } from "next/navigation";
import ManagerLayout from "@/components/layout/ManagerLayout";
import ManagerCashRegisterPage from "./ManagerCashRegisterPage";

async function getAvailableProducts() {
  return prisma.product.findMany({
    where: {
      isAvailable: true,
    },
    orderBy: {
      category: "asc",
    },
  });
}

export default async function ManagerCaissePageRoute() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/manager/caisse");
  }

  const role = (session.user as any).role as string;
  const allowedRoles = ["OWNER", "MANAGER"];

  if (!allowedRoles.includes(role)) {
    redirect("/");
  }

  const products = await getAvailableProducts();

  return (
    <ManagerLayout currentRole={role}>
      <ManagerCashRegisterPage initialProducts={products} />
    </ManagerLayout>
  );
}
