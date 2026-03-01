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
    { label: "Dashboard", href: "/owner/dashboard", icon: "\ud83d\udccb" },
    { label: "Managers", href: "/owner/managers", icon: "\ud83d\udc68" },
    { label: "Commandes", href: "/owner/orders", icon: "\ud83d\udef1" },
    { label: "Produits", href: "/owner/products", icon: "\ud83c\udf9c" },
    { label: "Paiements", href: "/owner/payments", icon: "\ud83d\udcb0" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 flex flex-col shadow-lg">
        <div className="px-4 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-sm font-bold text-white shadow-md">
              BD
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Blé Dor</p>
              <p className="text-[10px] text-slate-400 font-medium">Espace Propriétaire</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-amber-600 text-white shadow-md"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER SIDEBAR */}
        <div className="border-t border-slate-800 px-4 py-4">
          <p className="text-xs text-slate-400 font-medium mb-1">👤 Connecté en tant que</p>
          <p className="text-sm font-semibold text-white truncate bg-slate-800/50 rounded px-2 py-1.5">
            {currentUserName}
          </p>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
