import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/authSession";
import { redirect } from "next/navigation";
import OwnerLayout from "@/components/layout/OwnerLayout";

async function getAllOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      createdAt: true,
      total: true,
      status: true,
      paymentMethod: true,
      ticketNumber: true,
      customerName: true,
    },
  });

  return orders;
}

export default async function OwnerOrdersPage() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/owner/orders");
  }

  const user = session.user as any;
  if (user.role !== "OWNER") {
    redirect("/");
  }

  const orders = await getAllOrders();

  return (
    <OwnerLayout currentUserName={user.name || user.email}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Commandes – Vue propriétaire
        </h1>
        <p className="text-sm text-slate-500">
          Liste des dernières commandes enregistrées dans le système.
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-slate-500">
          Aucune commande pour le moment.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <table className="min-w-full border-collapse text-[11px] sm:text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Ticket</th>
                <th className="px-3 py-2 text-left font-medium">Date</th>
                <th className="px-3 py-2 text-left font-medium">Client</th>
                <th className="px-3 py-2 text-right font-medium">Montant</th>
                <th className="px-3 py-2 text-left font-medium">Paiement</th>
                <th className="px-3 py-2 text-left font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-slate-100 hover:bg-slate-50/60"
                >
                  <td className="px-3 py-2 font-mono text-[10px] text-slate-700">
                    {o.ticketNumber || o.id.slice(0, 8)}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {o.createdAt.toLocaleString("fr-FR")}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {o.customerName || "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-slate-900">
                    {o.total.toFixed(2)} €
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {o.paymentMethod}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {o.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </OwnerLayout>
  );
}
