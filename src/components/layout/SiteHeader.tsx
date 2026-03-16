"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";

export default function SiteHeader() {
  const pathname = usePathname();
  const { items } = useCart();
  const { data } = useSession();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const user = data?.user as any | undefined;
  const isLogged = !!user;

  const dashboardHref =
    user?.role === "MANAGER"
      ? "/manager/dashboard"
      : user?.role === "OWNER"
      ? "/owner/dashboard"
      : "/client/dashboard";

  const navItems = [
    { label: "Accueil", href: "/" },
    { label: "Produits", href: "/products" },
    { label: "Contact", href: "/#contact" },
    { label: "Login", href: "/login" },
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-xs font-bold text-white shadow-md">
            BD
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900">Blé Dor</span>
            <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">
              Boulangerie
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 text-xs font-medium text-slate-600 sm:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/#contact"
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

        <div className="flex items-center gap-2">
          <Link
            href={isLogged ? "/client/cart" : "/signup"}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="20" r="1" />
              <circle cx="17" cy="20" r="1" />
              <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H7" />
            </svg>
            <span className="hidden sm:inline">Panier</span>
            {cartCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {isLogged ? (
            <Link
              href={dashboardHref}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-sm"
            >
              <svg className="hidden h-4 w-4 sm:inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20a8 8 0 0 1 16 0" />
              </svg>
              <span className="hidden sm:inline">Mon espace</span>
              <span className="sm:hidden">Espace</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="7.5" cy="15.5" r="3.5" />
                <path d="M11 15.5h10" />
                <path d="M18 12.5v6" />
              </svg>
              <span className="hidden sm:inline">Se connecter</span>
              <span className="sm:hidden">Login</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
