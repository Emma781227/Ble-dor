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
      className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
    >
      <h2 className="mb-3 text-sm font-semibold text-slate-900">
        Ajouter un produit
      </h2>

      <div className="grid gap-3 md:grid-cols-2">
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
            placeholder="Baguette tradition"
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
            placeholder="1.20"
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

        <div className="md:col-span-2">
          <label className="text-xs font-medium text-slate-600">
            Description (optionnelle)
          </label>
          <textarea
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décris rapidement le produit..."
          />
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-2 text-xs text-emerald-600">
          {success}
        </p>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
