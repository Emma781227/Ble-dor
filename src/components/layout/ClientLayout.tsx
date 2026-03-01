"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

type ClientLayoutProps = {
  children: ReactNode;
  currentUser: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
};

export default function ClientLayout({ children, currentUser }: ClientLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Tableau de bord", href: "/client/dashboard", icon: "\ud83d\udccb" },
    { label: "Mes commandes", href: "/client/orders", icon: "\ud83d\udef1" },
    { label: "Mon panier", href: "/client/cart", icon: "\ud83d\uded2" },
    { label: "Mon profil", href: "/client/profile", icon: "\ud83d\udc64" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-gradient-to-r from-white to-slate-50 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-xs font-bold text-white shadow-md">
              BD
            </div>
            <span className="text-sm font-semibold text-slate-900">Blé Dor</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
            <span>👤</span>
            <span>{currentUser.name || currentUser.email}</span>
          </div>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-1 px-4 pb-3 text-xs font-medium overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{item.icon}</span>
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
