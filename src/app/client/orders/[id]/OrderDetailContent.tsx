"use client";

import Link from "next/link";

export default function OrderDetailContent({ order }: { order: any }) {
  const formatStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Enregistrée";
      case "PAID":
        return "Payée";
      case "CANCELLED":
        return "Annulée";
      default:
        return status;
    }
  };

  const totalItems = order.items.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0
  );

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-6">
      <Link
        href="/client/orders"
        className="text-xs text-slate-500 hover:text-slate-800"
      >
        ⟵ Retour à mes commandes
      </Link>

      {/* HEADER */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5">
        <h1 className="text-xl font-semibold text-slate-900">
          Détail de la commande
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Ticket :{" "}
          <span className="font-medium">
            {order.ticketNumber || order.id.slice(0, 8)}
          </span>
        </p>

        <p className="text-xs text-slate-400 mt-1">
          Passée le{" "}
          {new Date(order.createdAt).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <p className="mt-2 text-sm">
          Statut :{" "}
          <span className="font-semibold">
            {formatStatus(order.status)}
          </span>
        </p>
      </div>

      {/* PRODUITS */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Produits commandés ({totalItems} articles)
        </h2>

        <div className="divide-y divide-slate-200">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-slate-800">
                  {item.product.name}
                </p>
                <p className="text-xs text-slate-500">
                  {item.quantity} × {item.unitPrice.toFixed(2)} €
                </p>
              </div>

              <div className="font-semibold text-slate-900">
                {(item.quantity * item.unitPrice).toFixed(2)} €
              </div>
            </div>
          ))}
        </div>

        <div className="border-t mt-4 pt-4 text-right">
          <p className="text-sm text-slate-600">Total</p>
          <p className="text-xl font-semibold text-slate-900">
            {order.total.toFixed(2)} €
          </p>
        </div>
      </div>

      {/* INFOS SUPPLÉMENTAIRES */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5 text-sm space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Informations complémentaires
        </h3>

        <p>
          Paiement :{" "}
          <span className="font-medium">{order.paymentMethod}</span>
        </p>

        {order.manager && (
          <p>
            Géré par :{" "}
            <span className="font-medium">
              {order.manager.name || order.manager.email}
            </span>
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => window.print()}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Imprimer le ticket
        </button>
      </div>
    </div>
  );
}
