import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/authSession";
import { redirect } from "next/navigation";
import OwnerLayout from "@/components/layout/OwnerLayout";
import Link from "next/link";

type PeriodStats = {
  totalSales: number;
  totalOrders: number;
  avgTicket: number;
  canceledCount: number;
};

type ProductsSummary = {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
};

type TopProduct = {
  id: string;
  name: string;
  quantitySold: number;
  revenue: number;
  category: string | null;
};

type ManagerInfo = {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
};

type ManagersSummary = {
  totalManagers: number;
  latestManagers: ManagerInfo[];
};

// 🔹 Période d'aujourd'hui
function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// 🔹 Période de la semaine courante (lundi -> dimanche)
function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0 = dimanche, 1 = lundi, ...
  const diffToMonday = (day + 6) % 7;

  const start = new Date(now);
  start.setDate(now.getDate() - diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// 🔹 Stats sur une période (jour / semaine)
async function getPeriodStats(range: { start: Date; end: Date }): Promise<PeriodStats> {
  const { start, end } = range;

  const [validOrders, canceledOrders] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: {
          in: ["READY", "DELIVERED"],
        },
      },
      select: { total: true },
    }),
    prisma.order.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: "CANCELED",
      },
    }),
  ]);

  const totalOrders = validOrders.length;
  const totalSales = validOrders.reduce((sum, o) => sum + o.total, 0);
  const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

  return {
    totalSales,
    totalOrders,
    avgTicket,
    canceledCount: canceledOrders,
  };
}

// 🔹 Résumé produits global
async function getProductsSummary(): Promise<ProductsSummary> {
  const [totalProducts, activeProducts, inactiveProducts] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isAvailable: true } }),
    prisma.product.count({ where: { isAvailable: false } }),
  ]);

  return {
    totalProducts,
    activeProducts,
    inactiveProducts,
  };
}

// 🔹 Top produits sur les 7 derniers jours
async function getTopProductsLast7Days(): Promise<TopProduct[]> {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: {
          in: ["READY", "DELIVERED"],
        },
      },
    },
    include: {
      product: true,
    },
  });

  const map = new Map<string, TopProduct>();

  for (const item of orderItems) {
    if (!item.product) continue;

    const existing = map.get(item.productId);
    const qty = item.quantity;
    const revenue = item.quantity * item.unitPrice;

    if (!existing) {
      map.set(item.productId, {
        id: item.productId,
        name: item.product.name,
        category: item.product.category ?? null,
        quantitySold: qty,
        revenue,
      });
    } else {
      existing.quantitySold += qty;
      existing.revenue += revenue;
    }
  }

  const list = Array.from(map.values());
  list.sort((a, b) => b.revenue - a.revenue);

  return list.slice(0, 5);
}

// 🔹 Résumé des managers
async function getManagersSummary(): Promise<ManagersSummary> {
  const [totalManagers, latestManagers] = await Promise.all([
    prisma.user.count({
      where: { role: "MANAGER" },
    }),
    prisma.user.findMany({
      where: { role: "MANAGER" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    totalManagers,
    latestManagers,
  };
}

export default async function OwnerDashboardPage() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/owner/dashboard");
  }

  const user = session.user as any;
  const role = user.role as string;

  if (role !== "OWNER") {
    redirect("/");
  }

  const todayRange = getTodayRange();
  const weekRange = getCurrentWeekRange();

  const [todayStats, weekStats, productsSummary, topProducts, managersSummary] =
    await Promise.all([
      getPeriodStats(todayRange),
      getPeriodStats(weekRange),
      getProductsSummary(),
      getTopProductsLast7Days(),
      getManagersSummary(),
    ]);

  return (
    <OwnerLayout currentUser={user} currentRole={role}>
      {/* HEADER */}
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Tableau de bord – Propriétaire
          </h1>
          <p className="text-sm text-slate-500">
            Vue d&apos;ensemble des performances de Blé Dor.
          </p>
        </div>
        <p className="text-[11px] text-slate-400">
          Semaine en cours : du{" "}
          {weekRange.start.toLocaleDateString("fr-FR")} au{" "}
          {weekRange.end.toLocaleDateString("fr-FR")}
        </p>
      </header>

      {/* STATS JOUR */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Performances du jour
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Chiffre d'affaires (jour)"
            value={`${todayStats.totalSales.toFixed(2)} €`}
            subtitle="Commandes livrées/prêtes"
          />
          <StatCard
            title="Nombre de commandes"
            value={todayStats.totalOrders}
            subtitle="Sur la journée en cours"
          />
          <StatCard
            title="Ticket moyen"
            value={
              todayStats.totalOrders > 0
                ? `${todayStats.avgTicket.toFixed(2)} €`
                : "–"
            }
            subtitle="CA / commande"
          />
          <StatCard
            title="Commandes annulées"
            value={todayStats.canceledCount}
            subtitle="Sur la journée"
          />
        </div>
      </section>

      {/* STATS SEMAINE + PRODUITS + MANAGERS */}
      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        {/* Semaine */}
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Vue d&apos;ensemble de la semaine
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Chiffres basés sur les commandes marquées comme prêtes ou livrées.
          </p>

          <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">CA semaine (estimé)</p>
              <p className="mt-1 text-base font-semibold">
                {weekStats.totalSales.toFixed(2)} €
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Commandes semaine</p>
              <p className="mt-1 text-base font-semibold">
                {weekStats.totalOrders}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Ticket moyen (semaine)</p>
              <p className="mt-1 text-base font-semibold">
                {weekStats.totalOrders > 0
                  ? `${weekStats.avgTicket.toFixed(2)} €`
                  : "–"}
              </p>
            </div>
          </div>
        </div>

        {/* Produits */}
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">
            Catalogue produits
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            État global des références Blé Dor.
          </p>

          <dl className="mt-4 space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <dt className="text-xs text-slate-500">Produits au catalogue</dt>
              <dd className="text-base font-semibold">
                {productsSummary.totalProducts}
              </dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2">
              <dt className="text-xs text-emerald-700">Produits disponibles</dt>
              <dd className="text-base font-semibold text-emerald-900">
                {productsSummary.activeProducts}
              </dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2">
              <dt className="text-xs text-amber-700">
                Produits en rupture / désactivés
              </dt>
              <dd className="text-base font-semibold text-amber-900">
                {productsSummary.inactiveProducts}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* MANAGERS */}
      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-900">
            Équipe & managers
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Vue rapide sur les comptes gérants.
          </p>

          <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm">
            <p className="text-xs text-slate-500">Nombre de managers</p>
            <p className="mt-1 text-base font-semibold">
              {managersSummary.totalManagers}
            </p>
          </div>

          <p className="mt-3 text-[11px] text-slate-500">
            Pour gérer les comptes, créer un nouveau gérant ou supprimer un
            accès :
          </p>

          <Link
            href="/owner/managers"
            className="mt-3 inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800"
          >
            Gérer les managers
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900">
            Derniers managers ajoutés
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Historique des comptes gérants créés récemment.
          </p>

          {managersSummary.latestManagers.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Aucun manager n&apos;a encore été créé.
            </p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {managersSummary.latestManagers.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {m.name || "Manager sans nom"}
                    </p>
                    <p className="text-[11px] text-slate-500">{m.email}</p>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Créé le{" "}
                    {m.createdAt.toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* TOP PRODUITS */}
      <section className="mb-8 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">
          Top produits – 7 derniers jours
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Produits classés par chiffre d&apos;affaires généré.
        </p>

        {topProducts.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            Pas encore de ventes enregistrées sur les 7 derniers jours.
          </p>
        ) : (
          <div className="mt-4 space-y-2 text-sm">
            {topProducts.map((p, index) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {p.category || "Catégorie non définie"} ·{" "}
                      {p.quantitySold} vendu(s)
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {p.revenue.toFixed(2)} €
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </OwnerLayout>
  );
}

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
};

function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <article className="flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <h3 className="text-xs font-medium text-slate-500">{title}</h3>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>
      )}
    </article>
  );
}
