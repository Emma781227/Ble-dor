"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { items } = useCart();
  const { data } = useSession();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const user = data?.user as any | undefined;
  const isLogged = !!user;

  // Vers quel dashboard envoyer "Mon espace" ?
  const dashboardHref =
    user?.role === "MANAGER"
      ? "/manager/dashboard"
      : user?.role === "OWNER"
      ? "/owner/dashboard"
      : "/client/dashboard";

  const navItems = [
    { label: "Accueil", href: "/" },
    { label: "Produits", href: "/products" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* NAVBAR */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white shadow-sm">
              BD
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-900">
                Blé Dor
              </span>
              <span className="text-[10px] uppercase tracking-wide text-slate-400">
                Boulangerie · Pâtisserie
              </span>
            </div>
          </Link>

          {/* Nav center */}
          <div className="hidden items-center gap-4 text-xs font-medium text-slate-600 sm:flex">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-1 transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Panier */}
            <Link
              href={isLogged ? "/client/cart" : "/signup"} // ou "/register" si tu préfères
              className="flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <span>Panier</span>
              {cartCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
              <Link
              href={isLogged ? "../login" : "/signup" } // ou "/register" si tu préfères
              className="flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <span>login</span>
              
            </Link>

            {/* Connexion / Mon espace */}
            {isLogged ? (
              <Link
                href={dashboardHref}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Mon espace
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Se connecter
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* CONTENU */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 text-[11px] text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Blé Dor — Tous droits réservés.</p>
          <p className="text-[10px]">
            Conçu pour la gestion des points de vente Blé Dor.
          </p>
        </div>
      </footer>
    </div>
  );
}
