"use client";

import { Product } from "@/app/products/ProductsManagementPage";

type ProductCardProps = {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  return (
    <article className="group flex flex-col rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100 hover:shadow-md hover:ring-slate-200 transition">
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

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-xl border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
            >
              Modifier
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl bg-rose-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-rose-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
