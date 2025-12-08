"use client";

import Link from "next/link";
import FavoriteToggleButton from "./FavoriteToggleButton";
import { useCart } from "@/context/CartContext";

export type PublicProduct = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  isAvailable: boolean;
};

export default function PublicProductCard({ product }: { product: PublicProduct }) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!product.isAvailable) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl || undefined,
    });
  };

  return (
    <article className="group flex flex-col rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition">
      
      {/* Image */}
      <div className="relative mb-3 h-32 w-full overflow-hidden rounded-xl bg-slate-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            Pas d’image
          </div>
        )}

        {/* Badge disponibilité */}
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[11px] font-medium ${
            product.isAvailable
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {product.isAvailable ? "Disponible" : "Rupture"}
        </span>

        {/* Bouton Favori */}
        <div className="absolute right-2 top-2">
          <FavoriteToggleButton productId={product.id} />
        </div>
      </div>

      {/* Titre + catégorie */}
      <Link href={`/products/${product.id}`}>
        <h2 className="text-sm font-semibold text-slate-900 line-clamp-1">
          {product.name}
        </h2>
        <p className="text-xs text-slate-500 capitalize">{product.category}</p>
      </Link>

      {/* Footer : prix + ajouter panier */}
      <div className="mt-auto flex items-center justify-between pt-2">
        <p className="text-sm font-semibold text-slate-900">
          {product.price.toFixed(2)} €
        </p>

        <button
          type="button"
          disabled={!product.isAvailable}
          onClick={handleAddToCart}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            product.isAvailable
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
          }`}
        >
          Ajouter
        </button>
      </div>
    </article>
  );
}
