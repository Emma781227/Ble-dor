"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import SiteHeader from "@/components/layout/SiteHeader";

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
    { label: "Tableau de bord", href: "/client/dashboard" },
    { label: "Mes commandes", href: "/client/orders" },
    { label: "Mon panier", href: "/client/cart" },
    { label: "Mon profil", href: "/client/profile" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-end px-4 pt-3 text-xs text-slate-700 font-medium">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400" />
          <span className="ml-2">{currentUser.name || currentUser.email}</span>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-1 px-4 pb-3 pt-2 text-xs font-medium overflow-x-auto">
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
                <span className="inline-block h-2 w-2 rounded-full bg-current opacity-70" />
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
