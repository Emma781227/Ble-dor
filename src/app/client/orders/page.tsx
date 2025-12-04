import ClientLayout from "@/components/layout/ClientLayout";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/authSession";
import { prisma } from "@/lib/prisma";

export default async function ClientOrdersPage() {
  const session = await getAuthSession();
  if (!session || !session.user) redirect("/login");

  const user = session.user as any;
  if (user.role !== "CLIENT") redirect("/");

  const orders = await prisma.order.findMany({
    where: {
      customerName: user.name,
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: true } },
    },
  });

  return (
    <ClientLayout currentUser={user}>
      <h1 className="text-xl font-semibold text-slate-900">
        Mes commandes
      </h1>
      <p className="text-sm text-slate-600">
        Historique de toutes vos commandes passées.
      </p>

      <div className="mt-6 space-y-4">
        {orders.length === 0 ? (
          <p className="text-sm text-slate-500">
            Vous n&apos;avez encore passé aucune commande.
          </p>
        ) : (
          orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
            >
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-900">
                  Ticket {order.ticketNumber}
                </span>
                <span className="text-slate-500">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="mt-2 text-xs text-slate-600">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity}× {item.product.name}
                    </span>
                    <span>
                      {(item.quantity * item.unitPrice).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-between text-sm font-semibold text-slate-900">
                <span>Total</span>
                <span>{order.total.toFixed(2)} €</span>
              </div>
            </article>
          ))
        )}
      </div>
    </ClientLayout>
  );
}
