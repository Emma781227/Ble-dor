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
      <aside className="flex w-60 flex-col justify-between border-r border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <Link href="/manager/dashboard">
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Blé Dor
              </span>
              <span className="text-[10px] text-slate-500">
                Espace gestion
              </span>
            </div>
          </Link>

          <nav className="mt-6 space-y-1 text-sm">
            <NavLink
              label="Dashboard"
              href="/manager/dashboard"
              pathname={pathname}
            />
            <NavLink
              label="Commandes"
              href="/manager/orders"
              pathname={pathname}
            />
            <NavLink
              label="Produits"
              href="/manager/products"
              pathname={pathname}
            />
          </nav>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-600">
          <p className="font-medium">{displayName}</p>
          {currentRole && (
            <p className="text-[11px] text-slate-400">
              {currentRole === "OWNER" ? "Propriétaire" : "Gérant"}
            </p>
          )}
        </div>
      </aside>

      {/* CONTENU */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

function NavLink({
  label,
  href,
  pathname,
}: {
  label: string;
  href: string;
  pathname: string | null;
}) {
  const active = pathname?.startsWith(href);
  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {label}
    </Link>
  );
}
