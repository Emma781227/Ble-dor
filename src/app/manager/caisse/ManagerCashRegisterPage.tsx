"use client";

import { useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | null;
};

type PaymentMethod = "CASH" | "CARD" | "MOBILE" | "OTHER";

type CartItem = {
  product: Product;
  quantity: number;
};

type ManagerCashRegisterPageProps = {
  initialProducts: Product[];
};

type OrderItemReceipt = {
  id: string;
  quantity: number;
  unitPrice: number;
  product: Product;
};

type OrderReceipt = {
  id: string;
  ticketNumber?: string | null;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  customerName?: string | null;
  customerNote?: string | null;
  manager?: {
    id: string;
    name?: string | null;
  } | null;
  items: OrderItemReceipt[];
};



const CATEGORY_LABELS: Record<string, string> = {
  pain: "Pain",
  viennoiserie: "Viennoiserie",
  boisson: "Boisson",
  snack: "Snack",
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: "Espèces",
  CARD: "Carte",
  MOBILE: "Mobile money",
  OTHER: "Autre",
};

export default function ManagerCashRegisterPage({
  initialProducts,
}: ManagerCashRegisterPageProps) {
  const [products] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string | "ALL">(
    "ALL"
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH");
  const [customerName, setCustomerName] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<OrderReceipt | null>(
    null
  );

  const availableCategories = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.category || "autre"))).sort(),
    [products]
  );

  const filteredProducts =
    selectedCategory === "ALL"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
    [cart]
  );

  const handleAddToCart = (product: Product) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleChangeQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      setLastReceipt(null);

      if (cart.length === 0) {
        setErrorMessage("Le panier est vide.");
        setIsSubmitting(false);
        return;
      }

      const items = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          paymentMethod,
          customerName: customerName.trim() || null,
          customerNote: customerNote.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.message || "Erreur lors de l'enregistrement de la commande."
        );
      }

      const created = (await res.json()) as OrderReceipt;

      setCart([]);
      setCustomerName("");
      setCustomerNote("");
      setLastReceipt(created);
      setSuccessMessage("Commande enregistrée avec succès.");
    } catch (error: any) {
      console.error(error);
      setErrorMessage(
        error.message || "Une erreur est survenue lors de la commande."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Zone produits */}
      <section className="flex-1">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-slate-900">
            Caisse
          </h1>
          <p className="text-sm text-slate-500">
            Sélectionne les produits pour ajouter au ticket, puis encaisse la commande.
          </p>
        </div>

        {/* Filtres catégories */}
        <div className="mb-4 flex flex-wrap gap-2">
          <CategoryChip
            label="Tous"
            active={selectedCategory === "ALL"}
            onClick={() => setSelectedCategory("ALL")}
          />
          {availableCategories.map((cat) => (
            <CategoryChip
              key={cat}
              label={CATEGORY_LABELS[cat] || cat}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>

        {/* Grille de produits */}
        {filteredProducts.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aucun produit disponible pour cette catégorie.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleAddToCart(product)}
                className="flex flex-col rounded-2xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-100 hover:ring-slate-300"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {product.name}
                </p>
                <p className="text-xs text-slate-500">
                  {CATEGORY_LABELS[product.category] || product.category}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {product.price.toFixed(2)} €
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Panier + infos client + reçu */}
      <section className="w-full max-w-md space-y-4">
        {/* Panier */}
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">
            Panier
          </h2>
          <p className="mb-2 text-xs text-slate-500">
            Résumé de la commande en cours.
          </p>

          {errorMessage && (
            <p className="mb-2 text-xs text-red-500">{errorMessage}</p>
          )}

          {successMessage && (
            <p className="mb-2 text-xs text-emerald-600">
              {successMessage}
            </p>
          )}

          <div className="mt-2 max-h-40 space-y-2 overflow-y-auto">
            {cart.length === 0 && (
              <p className="text-xs text-slate-500">
                Aucun article dans le panier.
              </p>
            )}

            {cart.map((item) => (
              <article
                key={item.product.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.product.price.toFixed(2)} € / unité
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleChangeQuantity(item.product.id, -1)
                    }
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleChangeQuantity(item.product.id, 1)
                    }
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.product.id)}
                    className="text-[11px] text-slate-400 hover:text-red-500"
                  >
                    Suppr.
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Total + mode de paiement */}
          <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total</span>
              <span className="text-lg font-semibold text-slate-900">
                {total.toFixed(2)} €
              </span>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-slate-600">
                Mode de paiement
              </p>
              <div className="flex flex-wrap gap-2">
                {(["CASH", "CARD", "MOBILE", "OTHER"] as PaymentMethod[]).map(
                  (method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
                        paymentMethod === method
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {PAYMENT_LABELS[method]}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Infos client + encaissement */}
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">
            Infos client (optionnel)
          </h2>
          <div className="mt-2 space-y-2">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600">
                Nom du client
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                placeholder="Ex : Mme Dupont"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600">
                Remarque / demande spéciale
              </label>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                rows={3}
                placeholder="Ex : sans sucre, à réchauffer, etc."
              />
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting || cart.length === 0}
            onClick={handleSubmit}
            className="mt-3 w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Encaissement..." : "Encaisser la commande"}
          </button>
        </div>

        {/* Reçu */}
       {lastReceipt && (
  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
    <div className="mx-auto max-w-xs rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-800 shadow-sm">
      {/* En-tête entreprise */}
      <div className="mb-2 border-b border-dashed border-slate-400 pb-2 text-center font-mono">
        <div className="text-[11px] font-bold uppercase">
          Blé Dor
        </div>
        <div className="text-[10px]">
          Boulangerie - Pâtisserie
        </div>
        <div className="mt-1 text-[9px] text-slate-500">
          Ticket n° {lastReceipt.ticketNumber ?? lastReceipt.id.slice(0, 8)}
        </div>
        <div className="text-[9px] text-slate-500">
          {formatDateTime(lastReceipt.createdAt)}
        </div>
      </div>

      {/* Infos manager / client */}
      <div className="mb-2 border-b border-dashed border-slate-400 pb-2 font-mono">
        {lastReceipt.manager && (
          <div className="flex justify-between">
            <span>Manager</span>
            <span className="text-[10px]">
              {lastReceipt.manager.name || lastReceipt.manager.id}
            </span>
          </div>
        )}
        {lastReceipt.customerName && (
          <div className="flex justify-between">
            <span>Client</span>
            <span className="text-[10px]">
              {lastReceipt.customerName}
            </span>
          </div>
        )}
        {lastReceipt.customerNote && (
          <div className="mt-1 text-[9px] text-slate-600">
            Note : {lastReceipt.customerNote}
          </div>
        )}
      </div>

      {/* Lignes produits */}
      <div className="mb-2 border-b border-dashed border-slate-400 pb-2 font-mono">
        {lastReceipt.items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between"
          >
            <span>
              {item.quantity}× {item.product.name}
            </span>
            <span>
              {(item.unitPrice * item.quantity).toFixed(2)} €
            </span>
          </div>
        ))}
      </div>

      {/* Total + paiement */}
      <div className="font-mono">
        <div className="flex justify-between">
          <span className="font-semibold">TOTAL</span>
          <span className="font-semibold">
            {lastReceipt.total.toFixed(2)} €
          </span>
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-slate-600">
          <span>Paiement</span>
          <span>{PAYMENT_LABELS[lastReceipt.paymentMethod]}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2 border-t border-dashed border-slate-400 pt-1 text-center text-[9px] text-slate-500">
        Merci pour votre visite
      </div>
    </div>
  </div>
)}

      </section>
    </div>
  );
}

type CategoryChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function CategoryChip({ label, active, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}
