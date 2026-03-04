import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/authSession";
import { redirect } from "next/navigation";
import ManagerLayout from "@/components/layout/ManagerLayout";
import ManagerOrdersPage from "./ManagerOrdersPage";

async function getTodayOrders() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return orders;
}

export default async function ManagerOrdersPageRoute() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/manager/orders");
  }

  const role = (session.user as any).role as string;
  const allowedRoles = ["OWNER", "MANAGER"];

  if (!allowedRoles.includes(role)) {
    redirect("/");
  }

  const ordersRaw = await getTodayOrders();

  // convert Date objects to ISO strings for client component
  const orders = ordersRaw.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <ManagerLayout currentRole={role}>
      <ManagerOrdersPage initialOrders={orders} currentRole={role} />
    </ManagerLayout>
  );
}
