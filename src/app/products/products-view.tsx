"use client";

import { useEffect, useState } from "react";
import ProductForm from "@/components/products/ProductCreateForm";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  isAvailable: boolean;
};

type ProductsViewProps = {
  initialProducts: Product[];
};

export default function ProductsView({ initialProducts }: ProductsViewProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);

  const refreshProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error refreshing products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // tu peux décider de recharger à chaque fois que la page se monte
    // refreshProducts();
  }, []);

  return (
    <>
      {/* Header */}
      <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Produits
          </h1>
          <p className="text-sm text-slate-500">
            Catalogue de la boulangerie Blé Dor
          </p>
        </div>
      </header>

      {/* Formulaire d'ajout */}
      <ProductForm onCreated={refreshProducts} />

      {/* État de chargement */}
      {loading && (
        <p className="mb-2 text-xs text-slate-500">
          Mise à jour de la liste des produits...
        </p>
      )}

      {/* Liste vide */}
      {products.length === 0 && (
        <p className="text-sm text-slate-500">
          Aucun produit pour le moment. Ajoute ton premier produit.
        </p>
      )}

      {/* Grille de produits */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <article
            key={product.id}
            className="group flex flex-col rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100 hover:shadow-md hover:ring-slate-200 transition"
          >
            <div className="relative mb-3 h-32 w-full overflow-hidden rounded-xl bg-slate-100">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                  Pas d&apos;image
                </div>
              )}
              <span
                className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[11px] font-medium ${
                  product.isAvailable
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {product.isAvailable ? "Disponible" : "Rupture"}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <h2 className="text-sm font-semibold text-slate-900 line-clamp-1">
                {product.name}
              </h2>
              <p className="text-xs text-slate-500 capitalize">
                {product.category}
              </p>

              <div className="mt-auto flex items-center justify-between pt-2">
                <p className="text-sm font-semibold text-slate-900">
                  {product.price.toFixed(2)} €
                </p>

                <button
                  className="rounded-xl border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                  type="button"
                >
                  Modifier
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
