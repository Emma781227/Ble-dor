import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/authSession";
import ClientLayout from "@/components/layout/ClientLayout";

type DashboardOrder = {
  id: string;
  ticketNumber: string | null;
  status: string;
  total: number;
  createdAt: Date;
  items: { quantity: number }[];
};

async function getClientDashboardData() {
  // Pour l’instant on récupère simplement les dernières commandes globales.
  // Si plus tard on ajoute un lien Order -> User (clientId), on filtrera ici.
  const orders = (await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      items: true,
    },
  })) as DashboardOrder[];

  const totalOrders = await prisma.order.count();

  const totalAmountAgg = await prisma.order.aggregate({
    _sum: { total: true },
  });

  const totalAmount = totalAmountAgg._sum.total || 0;

  return {
    lastOrders: orders,
    totalOrders,
    totalAmount,
  };
}

function formatStatus(status: string) {
  switch (status) {
    case "PENDING":
      return { label: "Enregistrée", className: "bg-amber-50 text-amber-700 ring-amber-100" };
    case "PAID":
      return { label: "Payée", className: "bg-emerald-50 text-emerald-700 ring-emerald-100" };
    case "CANCELLED":
      return { label: "Annulée", className: "bg-red-50 text-red-600 ring-red-100" };
    default:
      return { label: status, className: "bg-slate-50 text-slate-600 ring-slate-200" };
  }
}

export default async function ClientDashboardPage() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user as any;

  if (user.role !== "CLIENT") {
    redirect("/");
  }

  const { lastOrders, totalOrders, totalAmount } = await getClientDashboardData();

  const lastOrder = lastOrders[0] ?? null;

  return (
    <ClientLayout currentUser={user}>
      <div className="space-y-8">
        {/* HEADER */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Espace client
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Bonjour {user.name || user.email}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Retrouvez ici un résumé de vos commandes et un accès rapide à vos actions.
            </p>
          </div>

          <div className="flex gap-2 text-xs">
            <Link
              href="/client/cart"
              className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
            >
              Voir mon panier
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Voir les produits
            </Link>
          </div>
        </header>

        {/* STATS */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-medium text-slate-500">
              Commandes passées
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {totalOrders}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Total de commandes enregistrées.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-medium text-slate-500">
              Montant total estimé
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {totalAmount.toFixed(2)} €
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Somme de toutes vos commandes (toutes périodes confondues).
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-medium text-slate-500">
              Dernière commande
            </p>
            {lastOrder ? (
              <>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {new Date(lastOrder.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {lastOrder.total.toFixed(2)} € •{" "}
                  {lastOrder.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  article
                  {lastOrder.items.reduce((sum, item) => sum + item.quantity, 0) > 1
                    ? "s"
                    : ""}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Ticket {lastOrder.ticketNumber || lastOrder.id.slice(0, 8)}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Vous n&apos;avez pas encore passé de commande.
              </p>
            )}
          </div>
        </section>

        {/* DERNIÈRES COMMANDES */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Mes dernières commandes
              </h2>
              <p className="text-xs text-slate-500">
                Les 5 dernières commandes enregistrées en boutique.
              </p>
            </div>
            <Link
              href="/client/orders"
              className="text-xs font-medium text-slate-700 hover:text-slate-900"
            >
              Voir toutes les commandes ⟶
            </Link>
          </div>

          {lastOrders.length === 0 ? (
            <p className="text-sm text-slate-500">
              Vous n&apos;avez pas encore de commande.
            </p>
          ) : (
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Ticket
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Statut
                    </th>
                    <th className="px-3 py-2 text-right text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Articles
                    </th>
                    <th className="px-3 py-2 text-right text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {lastOrders.map((order) => {
                    const statusInfo = formatStatus(order.status);
                    const itemsCount = order.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/60">
                        <td className="px-3 py-2 text-xs text-slate-900">
                          {order.ticketNumber || order.id.slice(0, 8)}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "short",
                            }
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${statusInfo.className}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right text-xs text-slate-700">
                          {itemsCount}
                        </td>
                        <td className="px-3 py-2 text-right text-xs font-semibold text-slate-900">
                          {order.total.toFixed(2)} €
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ACTIONS RAPIDES */}
        <section className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/client/cart"
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <p className="text-xs font-medium text-slate-500">
              Panier
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Gérer mon panier
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Vérifiez vos articles avant de finaliser la commande.
            </p>
          </Link>

          <Link
            href="/client/profile"
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <p className="text-xs font-medium text-slate-500">
              Profil
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Mes informations
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Mettez à jour vos coordonnées et préférences.
            </p>
          </Link>

          <Link
            href="/client/orders"
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <p className="text-xs font-medium text-slate-500">
              Historique
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Mes commandes
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Consultez le détail de vos commandes précédentes.
            </p>
          </Link>
        </section>
      </div>
    </ClientLayout>
  );
}
