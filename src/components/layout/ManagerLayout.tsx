"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

type ManagerLayoutProps = {
  children: ReactNode;
  currentUser?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  currentRole?: string;
};

export default function ManagerLayout({
  children,
  currentUser,
  currentRole,
}: ManagerLayoutProps) {
  const pathname = usePathname();

  const displayName =
    currentUser?.name ||
    currentUser?.email ||
    (currentRole === "OWNER" ? "Propriétaire" : "Manager");

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="flex w-64 flex-col justify-between border-r border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm">
        <div>
          <Link href="/manager/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-sm font-bold text-white shadow-md">
              BD
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-900">
                Blé Dor
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {currentRole === "OWNER" ? "Propriétaire" : "Espace Gérant"}
              </span>
            </div>
          </Link>

          <nav className="mt-8 space-y-1">
            <NavLink
              label="Dashboard"
              icon="📋"
              href="/manager/dashboard"
              pathname={pathname}
            />
            <NavLink
              label="Commandes"
              icon="🛱"
              href="/manager/orders"
              pathname={pathname}
            />
            <NavLink
              label="Produits"
              icon="🎜"
              href="/manager/products"
              pathname={pathname}
            />
          </nav>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">👤</span>
            <div>
              <p className="font-semibold text-slate-900">{displayName}</p>
              <p className="text-slate-500">
                {currentRole === "OWNER" ? "Propriétaire" : "Gérant"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTENU */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

function NavLink({
  label,
  icon,
  href,
  pathname,
}: {
  label: string;
  icon: string;
  href: string;
  pathname: string | null;
}) {
  const active = pathname?.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  );
}
