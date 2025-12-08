import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/authSession";
import { redirect } from "next/navigation";
import Link from "next/link";
import ManagerLayout from "@/components/layout/ManagerLayout";

type OrdersStats = {
  totalOrders: number;
  pendingCount: number;
  preparationCount: number;
  readyCount: number;
  deliveredCount: number;
  totalAmount: number;
};

type ProductsStats = {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
};

async function getTodayOrdersStats(): Promise<OrdersStats> {
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
    select: {
      status: true,
      total: true,
    },
  });

  const totalOrders = orders.length;
  let pendingCount = 0;
  let preparationCount = 0;
  let readyCount = 0;
  let deliveredCount = 0;
  let totalAmount = 0;

  for (const order of orders) {
    totalAmount += order.total;

    switch (order.status) {
      case "PENDING":
        pendingCount++;
        break;
      case "PREPARATION":
        preparationCount++;
        break;
      case "READY":
        readyCount++;
        break;
      case "DELIVERED":
        deliveredCount++;
        break;
      default:
        break;
    }
  }

  return {
    totalOrders,
    pendingCount,
    preparationCount,
    readyCount,
    deliveredCount,
    totalAmount,
  };
}

async function getProductsStats(): Promise<ProductsStats> {
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

export default async function ManagerDashboardPage() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/manager/dashboard");
  }

  const role = (session.user as any).role as string;
  const allowedRoles = ["OWNER", "MANAGER"];

  if (!allowedRoles.includes(role)) {
    redirect("/");
  }

  const currentUser = session.user as any;
  const [stats, productsStats] = await Promise.all([
    getTodayOrdersStats(),
    getProductsStats(),
  ]);

  return (
    <ManagerLayout currentUser={currentUser} currentRole={role}>
      {/* Header de page */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Tableau de bord – Gérant
          </h1>
          <p className="text-sm text-slate-500">
            Vue d&apos;ensemble des commandes et du catalogue pour aujourd&apos;hui.
          </p>
        </div>

        <Link
          href="/manager/products"
          className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Gérer les produits
        </Link>
      </div>

      {/* Stat cards : commandes */}
      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Commandes du jour"
          value={stats.totalOrders}
          subtitle="Toutes commandes confondues"
        />
        <StatCard
          title="En préparation"
          value={stats.preparationCount}
          subtitle="Actuellement en cours"
        />
        <StatCard
          title="Prêtes"
          value={stats.readyCount}
          subtitle="En attente de retrait"
        />
        <StatCard
          title="Livrées"
          value={stats.deliveredCount}
          subtitle="Terminées aujourd'hui"
        />
      </section>

      {/* Résumé + cartes de navigation */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Résumé commandes + produits */}
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Résumé opérationnel du jour
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Indicateurs basés sur les commandes et le catalogue en temps réel.
          </p>

          <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Commandes en attente</p>
              <p className="mt-1 text-base font-semibold">
                {stats.pendingCount}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Total encaissé (jour)</p>
              <p className="mt-1 text-base font-semibold">
                {stats.totalAmount.toFixed(2)} €
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Produits au catalogue</p>
              <p className="mt-1 text-base font-semibold">
                {productsStats.totalProducts}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {productsStats.activeProducts} actifs ·{" "}
                {productsStats.inactiveProducts} en rupture
              </p>
            </div>
          </div>
        </div>

        {/* Navigation / actions manager */}
        <div className="space-y-3">
          <NavCard
            title="Commandes du jour"
            description="Consulter et gérer les commandes (statut, préparation, retrait)."
            href="/manager/orders"
            actionLabel="Voir les commandes"
          />
          <NavCard
            title="Disponibilité produits"
            description="Activer ou désactiver les produits selon les stocks."
            href="/manager/products"
            actionLabel="Gérer les disponibilités"
          />
          <NavCard
            title="Catalogue produits"
            description="Ajouter un nouveau produit, ajuster les prix ou supprimer une référence."
            href="/manager/products"
            actionLabel="Ouvrir le catalogue"
          />
        </div>
      </section>
    </ManagerLayout>
  );
}

type StatCardProps = {
  title: string;
  value: number;
  subtitle?: string;
};

function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <article className="flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <h2 className="text-xs font-medium text-slate-500">{title}</h2>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>
      )}
    </article>
  );
}

type NavCardProps = {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
};

function NavCard({ title, description, href, actionLabel }: NavCardProps) {
  return (
    <article className="flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
      <div className="mt-3">
        <Link
          href={href}
          className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800"
        >
          {actionLabel}
        </Link>
      </div>
    </article>
  );
}
