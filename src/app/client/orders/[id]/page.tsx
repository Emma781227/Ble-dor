import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/authSession";
import ClientLayout from "@/components/layout/ClientLayout";
import OrderDetailContent from "./OrderDetailContent";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getAuthSession();

  if (!session || !session.user) redirect("/login");

  const user = session.user as any;
  if (user.role !== "CLIENT") redirect("/");

  const orderId = params.id;

  // Récupération de la commande
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      manager: true,
    },
  });

  if (!order) {
    return redirect("/client/orders");
  }

  return (
    <ClientLayout currentUser={user}>
      <OrderDetailContent order={order} />
    </ClientLayout>
  );
}
