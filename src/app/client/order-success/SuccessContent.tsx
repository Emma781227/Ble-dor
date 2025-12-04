"use client";

import Link from "next/link";

export default function SuccessContent({ ticket }: { ticket: string | null }) {
  return (
    <div className="flex flex-col items-center text-center py-10">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-semibold text-slate-900">
        Commande enregistrée 🎉
      </h1>

      <p className="mt-2 text-sm text-slate-600 max-w-md">
        Merci pour votre commande ! Nous la préparons dès maintenant.
      </p>

      {ticket && (
        <div className="mt-5 rounded-xl bg-white shadow-sm ring-1 ring-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500">Numéro de ticket :</p>
          <p className="text-lg font-semibold text-slate-900 mt-1">
            {ticket}
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link
          href="/client/orders"
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Mes commandes
        </Link>

        <Link
          href="/products"
          className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Continuer mes achats
        </Link>

        <Link
          href="/"
          className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Accueil
        </Link>
      </div>
    </div>
  );
}
