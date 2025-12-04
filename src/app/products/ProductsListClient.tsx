"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string | null;
  imageUrl: string | null;
};

type GroupedProducts = Record<string, Product[]>;

const CATEGORY_LABELS: Record<string, string> = {
  pain: "Pain",
  viennoiserie: "Viennoiseries",
  boisson: "Boissons",
  snack: "Snacking",
};

export default function ProductsListClient({
  grouped,
}: {
  grouped: GroupedProducts;
}) {
  const { addItem } = useCart();

  const categories = Object.keys(grouped).sort();

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
    // eslint-disable-next-line no-alert
    alert(`"${product.name}" ajouté au panier.`);
  };

  return (
    <div className="space-y-8">
      {categories.map((categoryKey) => {
        const label =
          CATEGORY_LABELS[categoryKey] || categoryKey || "Autres";
        const items = grouped[categoryKey];

        return (
          <section key={categoryKey}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {label}
              </h2>
              <p className="text-[11px] text-slate-400">
                {items.length} produit{items.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((product) => (
                <article
                  key={product.id}
                  className="group flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-slate-400"
                >
                  <Link href={`/products/${product.id}`}>
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="mb-3 h-32 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="mb-3 flex h-32 w-full items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-slate-100 text-[11px] text-slate-400">
                        Visuel à venir
                      </div>
                    )}

                    <h3 className="text-sm font-semibold text-slate-900">
                      {product.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {product.description || "Description à venir."}
                    </p>
                  </Link>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">
                      {product.price.toFixed(2)} €
                    </span>
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-200">
                      {label}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="mt-4 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Ajouter au panier
                  </button>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
