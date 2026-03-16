"use client";

import Link from "next/link";
import { ReactNode } from "react";
import SiteHeader from "@/components/layout/SiteHeader";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SiteHeader />

      {/* CONTENU */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-3 mb-8">
            {/* About */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
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
                <Link href="/#contact" className="text-slate-600 hover:text-slate-900 transition block">
                  Nous contacter
                </Link>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Contact</h3>
              <div className="space-y-1 text-xs text-slate-600">
                <p>123 Rue du Pain, 75000</p>
                <p>01 23 45 67 89</p>
                <p>contact@bledor.fr</p>
                <p>Lun-Sam: 7h - 19h30</p>
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
