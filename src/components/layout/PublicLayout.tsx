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
    { label: "Login", href: "/login" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* NAVBAR */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-xs font-bold text-white shadow-md">
              BD
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-900">
                Blé Dor
              </span>
              <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">
                Boulangerie
              </span>
            </div>
          </Link>

          {/* Nav center */}
          <div className="hidden items-center gap-1 text-xs font-medium text-slate-600 sm:flex">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 transition ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "hover:bg-slate-100 text-slate-700"
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
              href={isLogged ? "/client/cart" : "/signup"}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <span>🛒</span>
              <span className="hidden sm:inline">Panier</span>
              {cartCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Connexion / Mon espace */}
            {isLogged ? (
              <Link
                href={dashboardHref}
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-sm"
              >
                <span className="hidden sm:inline">👤</span>
                <span className="hidden sm:inline">Mon espace</span>
                <span className="sm:hidden">Espace</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-sm"
              >
                <span>🔑</span>
                <span className="hidden sm:inline">Se connecter</span>
                <span className="sm:hidden">Login</span>
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* CONTENU */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-3 mb-8">
            {/* About */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🥖</span>
                <h3 className="text-sm font-semibold text-slate-900">Blé Dor</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Votre boulangerie-pâtisserie artisanale pour du pain frais, des viennoiseries gourmandes et du snacking savoureux.
              </p>
            </div>
            
            {/* Quick Links */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Navigation</h3>
              <div className="space-y-1 text-xs">
                <Link href="/" className="text-slate-600 hover:text-slate-900 transition block">
                  Accueil
                </Link>
                <Link href="/products" className="text-slate-600 hover:text-slate-900 transition block">
                  Produits
                </Link>
                <Link href="#contact" className="text-slate-600 hover:text-slate-900 transition block">
                  Nous contacter
                </Link>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Contact</h3>
              <div className="space-y-1 text-xs text-slate-600">
                <p>📍 123 Rue du Pain, 75000</p>
                <p>📞 01 23 45 67 89</p>
                <p>📧 contact@bledor.fr</p>
                <p>⏰ Lun-Sam: 7h - 19h30</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-6 flex flex-col items-center justify-between gap-3 text-[11px] text-slate-500 sm:flex-row">
            <p>© {new Date().getFullYear()} Blé Dor — Tous droits réservés.</p>
            <p className="text-[10px] text-slate-400">
              Plateforme de gestion pour boulangeries artisanales.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
