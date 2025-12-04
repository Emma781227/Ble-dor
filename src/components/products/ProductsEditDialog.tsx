"use client";

import { useState } from "react";
import type { Product } from "@/app/products/ProductsManagementPage";

type ProductEditDialogProps = {
  product: Product;
  onClose: () => void;
  onProductUpdated: () => void | Promise<void>;
};

export default function ProductEditDialog({
  product,
  onClose,
  onProductUpdated,
}: ProductEditDialogProps) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState<string>(product.price.toString());
  const [category, setCategory] = useState(product.category);
  const [description, setDescription] = useState(product.description || "");
  const [isAvailable, setIsAvailable] = useState(product.isAvailable);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedPrice = parseFloat(price.replace(",", "."));
    if (isNaN(parsedPrice)) {
      setError("Le prix doit être un nombre valide.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: parsedPrice,
          category,
          description: description || null,
          isAvailable,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.message || "Erreur lors de la mise à jour du produit"
        );
      }

      await onProductUpdated(); // 🔁 le parent va rafraîchir la liste
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Modifier le produit
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Fermer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600">
              Nom du produit
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">
              Prix (€)
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">
              Catégorie
            </label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="pain">Pain</option>
              <option value="viennoiserie">Viennoiserie</option>
              <option value="boisson">Boisson</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">
              Description
            </label>
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isAvailable"
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            <label
              htmlFor="isAvailable"
              className="text-xs font-medium text-slate-700"
            >
              Produit disponible
            </label>
          </div>

          {error && (
            <p className="text-xs text-red-500">
              {error}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
