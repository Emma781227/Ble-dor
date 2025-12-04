"use client";

import { useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | null;
  isAvailable: boolean;
};

type ManagerProductsAvailabilityPageProps = {
  initialProducts: Product[];
  currentRole: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  pain: "Pain",
  viennoiserie: "Viennoiserie",
  boisson: "Boisson",
  snack: "Snack",
};

export default function ManagerProductsAvailabilityPage({
  initialProducts,
  currentRole,
}: ManagerProductsAvailabilityPageProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleToggleAvailability = async (product: Product) => {
    setLoadingId(product.id);
    setGlobalError(null);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !product.isAvailable }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.message || "Erreur lors de la mise à jour de la disponibilité"
        );
      }

      const updated = (await res.json()) as Product;

      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
    } catch (error: any) {
      console.error(error);
      setGlobalError(
        error.message || "Une erreur est survenue lors de la mise à jour."
      );
    } finally {
      setLoadingId(null);
    }
  };

  const groupedByCategory = products.reduce(
    (acc, product) => {
      const key = product.category || "autre";
      if (!acc[key]) acc[key] = [];
      acc[key].push(product);
      return acc;
    },
    {} as Record<string, Product[]>
  );

  const categoryOrder = Object.keys(groupedByCategory).sort();

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 lg:px-8">
      {/* Header */}
      <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Disponibilité des produits
          </h1>
          <p className="text-sm text-slate-500">
            Active ou désactive les produits visibles pour la vente.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <div className="rounded-full bg-white px-4 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
            Rôle : <span className="font-semibold">{currentRole}</span>
          </div>
          <Link
            href="/manager/dashboard"
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            ⟵ Retour au dashboard
          </Link>
        </div>
      </header>

      {globalError && (
        <p className="mb-3 text-xs text-red-500">
          {globalError}
        </p>
      )}

      {products.length === 0 && (
        <p className="text-sm text-slate-500">
          Aucun produit trouvé. Ajoute des produits dans l&apos;écran Produits.
        </p>
      )}

      {/* Liste groupée par catégorie */}
      <div className="space-y-4">
        {categoryOrder.map((category) => (
          <section
            key={category}
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
          >
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              {CATEGORY_LABELS[category] || category}
            </h2>

            <div className="divide-y divide-slate-100">
              {groupedByCategory[category].map((product) => (
                <article
                  key={product.id}
                  className="flex items-center justify-between gap-4 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {product.price.toFixed(2)} € —{" "}
                      {product.description || "Pas de description"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${
                        product.isAvailable
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {product.isAvailable ? "Disponible" : "Indisponible"}
                    </span>

                    <button
                      type="button"
                      disabled={loadingId === product.id}
                      onClick={() => handleToggleAvailability(product)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full border transition ${
                        product.isAvailable
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-slate-300 bg-slate-200"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                          product.isAvailable ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
