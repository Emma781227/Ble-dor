"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

type OwnerLayoutProps = {
  children: ReactNode;
  currentUserName: string;
};

export default function OwnerLayout({
  children,
  currentUserName,
}: OwnerLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/owner/dashboard" },
    { label: "Managers", href: "/owner/managers" },
    { label: "Commandes", href: "/owner/orders" },
    { label: "Produits", href: "/owner/products" },
    { label: "Paiements", href: "/owner/payments" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* SIDEBAR */}
      <aside className="w-60 bg-slate-900 text-slate-100 flex flex-col">
        <div className="px-4 py-4 border-b border-slate-800">
          <p className="text-sm font-semibold">Blé Dor</p>
          <p className="text-[11px] text-slate-400">Espace Propriétaire</p>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER SIDEBAR */}
        <div className="border-t border-slate-800 px-4 py-3">
          <p className="text-xs text-slate-400">Connecté en tant que</p>
          <p className="text-sm font-medium text-white truncate">
            {currentUserName}
          </p>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
