"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function ClientCartPageContent({
  initialCustomerName,
}: {
  initialCustomerName: string;
}) {
  const { items, removeItem, decreaseQty, addItem, total, clearCart } =
    useCart();
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerNote, setCustomerNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleIncreaseQty = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    addItem({ ...item, quantity: 1 });
  };

  const handleSubmitOrder = async () => {
    try {
      setErrorMsg(null);

      if (items.length === 0) {
        setErrorMsg("Votre panier est vide.");
        return;
      }

      if (!customerName.trim()) {
        setErrorMsg("Merci de renseigner votre nom.");
        return;
      }

      setIsSubmitting(true);

      const res = await fetch("/api/orders/from-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerNote,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Erreur lors de la création de la commande.");
      }

      clearCart();

      const ticket = data?.ticketNumber || "";
      router.push(
        ticket
          ? `/client/order-success?ticket=${encodeURIComponent(ticket)}`
          : "/client/order-success"
      );
    } catch (err: any) {
      setErrorMsg(err.message || "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">
          Mon panier
        </h1>
        <p className="text-sm text-slate-600">
          Vérifiez votre sélection avant de confirmer votre commande.
        </p>
      </header>

      {/* Contenu */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
        {/* Liste panier */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">
            Articles
          </h2>

          {items.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Votre panier est vide. Rendez-vous sur la page{" "}
              <span className="font-medium">Produits</span> pour ajouter des articles.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {item.price.toFixed(2)} € / unité
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => decreaseQty(item.id)}
                        className="px-1 text-xs text-slate-700 hover:text-slate-900"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-xs">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleIncreaseQty(item.id)}
                        className="px-1 text-xs text-slate-700 hover:text-slate-900"
                      >
                        +
                      </button>
                    </div>
                    <p className="w-16 text-right text-xs font-semibold text-slate-900">
                      {(item.quantity * item.price).toFixed(2)} €
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-[11px] text-red-500 hover:underline"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Infos commande */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">
            Détails de la commande
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            <div>
              <label className="text-xs font-medium text-slate-600">
                Nom pour la commande
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex : Mme Dupont"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Remarque (optionnel)
              </label>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                rows={3}
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Ex : Sans sauce, pas trop cuit, etc."
              />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="text-sm font-semibold text-slate-900">
                Total
              </span>
              <span className="text-lg font-semibold text-slate-900">
                {total.toFixed(2)} €
              </span>
            </div>

            {errorMsg && (
              <p className="mt-2 text-xs text-red-500">{errorMsg}</p>
            )}

            <button
              type="button"
              disabled={items.length === 0 || isSubmitting}
              onClick={handleSubmitOrder}
              className="mt-4 w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmitting ? "Création de la commande..." : "Passer la commande"}
            </button>

            <p className="mt-2 text-[11px] text-slate-400">
              Le paiement s&apos;effectue en boutique lors du retrait.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
