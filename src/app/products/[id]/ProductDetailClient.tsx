"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useState } from "react";

type ProductDetailProps = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string | null;
  imageUrl: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  pain: "Pain",
  viennoiserie: "Viennoiseries",
  boisson: "Boissons",
  snack: "Snacking",
};

export default function ProductDetailClient(props: ProductDetailProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const label =
    CATEGORY_LABELS[props.category] || props.category || "Produit";

  const handleAddToCart = () => {
    if (quantity < 1) return;

    addItem({
      id: props.id,
      name: props.name,
      price: props.price,
      quantity,
    });

    setInfoMsg(`"${props.name}" x${quantity} ajouté au panier.`);
    setTimeout(() => setInfoMsg(null), 2500);
  };

  return (
    <div className="mx-auto max-w-4xl py-8">
      <Link
        href="/products"
        className="text-xs text-slate-500 hover:text-slate-800"
      >
        ⟵ Retour aux produits
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-[1.2fr,1.1fr]">
        {/* Visuel */}
        <div className="rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
          {props.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={props.imageUrl}
              alt={props.name}
              className="h-72 w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-72 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-slate-100 text-xs text-slate-400">
              Visuel à venir
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
            {label}
          </p>

          <h1 className="mt-3 text-2xl font-semibold text-slate-900">
            {props.name}
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            {props.description || "Description à venir pour ce produit."}
          </p>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-2xl font-bold text-slate-900">
              {props.price.toFixed(2)} €
            </p>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-300 px-2 py-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-2 text-sm text-slate-700 hover:text-slate-900"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-2 text-sm text-slate-700 hover:text-slate-900"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Ajouter au panier
            </button>
          </div>

          {infoMsg && (
            <p className="mt-3 text-xs text-emerald-600">{infoMsg}</p>
          )}

          <div className="mt-6 border-t border-slate-200 pt-3 text-[11px] text-slate-500">
            <p>
              Ce produit est disponible en magasin. Le paiement s&apos;effectue
              lors du retrait si vous commandez en ligne.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
