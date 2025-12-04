import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/authSession";
import { redirect } from "next/navigation";
import ManagerLayout from "@/components/layout/ManagerLayout";
import ManagerProductsAvailabilityPage from "./ManagerProductsAvailabilityPage";

async function getAllProducts() {
  return prisma.product.findMany({
    orderBy: {
      category: "asc",
    },
  });
}

export default async function ManagerProductsPageRoute() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/manager/products");
  }

  const role = (session.user as any).role as string;
  const allowedRoles = ["OWNER", "MANAGER"];

  if (!allowedRoles.includes(role)) {
    redirect("/");
  }

  const products = await getAllProducts();

  return (
    <ManagerLayout currentRole={role}>
      <ManagerProductsAvailabilityPage
        initialProducts={products}
        currentRole={role}
      />
    </ManagerLayout>
  );
}
