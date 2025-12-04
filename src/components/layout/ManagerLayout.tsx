"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

type ManagerLayoutProps = {
  children: ReactNode;
  currentUser: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
};

export default function ManagerLayout({ children, currentUser }: ManagerLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/manager/dashboard" },
    { label: "Commandes", href: "/manager/orders" },
    { label: "Produits", href: "/manager/products" },
    { label: "Caisse", href: "/manager/cash" }, // si tu as cette page
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-semibold text-slate-900">
            Blé Dor · Manager
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>{currentUser.name || currentUser.email}</span>
          </div>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-2 px-4 pb-2 text-xs font-medium text-slate-600">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1 ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
