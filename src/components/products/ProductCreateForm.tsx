"use client";

import { useState } from "react";

export type ProductCreateFormProps = {
  onProductCreated?: () => void | Promise<void>;
};

export default function ProductCreateForm({
  onProductCreated,
}: ProductCreateFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState("pain");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const parsedPrice = parseFloat(price.replace(",", "."));
    if (isNaN(parsedPrice)) {
      setError("Le prix doit être un nombre valide.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: parsedPrice,
          category,
          description: description || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Erreur lors de la création du produit");
      }

      setName("");
      setPrice("");
      setCategory("pain");
      setDescription("");
      setSuccess("Produit créé avec succès ✅");

      if (onProductCreated) onProductCreated();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
       className="mb-6 rounded-2xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm ring-1 ring-slate-100"
    >
       <div className="flex items-center gap-2 mb-4">
         <span className="text-2xl">🥖</span>
         <h2 className="text-sm font-semibold text-slate-900">
           Ajouter un produit
         </h2>
       </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
           <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-2">
             <span>📝</span>
            Nom du produit
          </label>
          <input
            type="text"
             className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Baguette tradition"
          />
        </div>

        <div>
           <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-2">
             <span>💰</span>
            Prix (FCFA)
          </label>
          <input
            type="text"
             className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
              placeholder="1200"
          />
        </div>

        <div>
           <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-2">
             <span>📂</span>
            Catégorie
          </label>
          <select
             className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
              <option value="pain">🥖 Pain</option>
              <option value="viennoiserie">🥐 Viennoiserie</option>
              <option value="boisson">☕ Boisson</option>
              <option value="snack">🥪 Snack</option>
          </select>
        </div>

         <div>
           <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-2">
             <span>✍️</span>
            Description (optionnelle)
          </label>
          <textarea
             className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
             rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décris rapidement le produit..."
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="flex items-center gap-2 text-xs font-medium text-red-700">
            <span>❌</span>
          {error}
        </p>
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
          <p className="flex items-center gap-2 text-xs font-medium text-emerald-700">
            <span>✅</span>
          {success}
        </p>
        </div>
      )}

       <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
           className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-amber-600 hover:to-amber-700 disabled:cursor-not-allowed disabled:opacity-60 transition"
        >
           <span>{loading ? "⏳" : "💾"}</span>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
