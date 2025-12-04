"use client";

import { useState } from "react";

type OrderStatus = "PENDING" | "PREPARATION" | "READY" | "DELIVERED" | "CANCELED";

type Product = {
  id: string;
  name: string;
  price: number;
};

type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  product: Product;
};

type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  paymentMethod: string;
  items: OrderItem[];
};

type ManagerOrdersPageProps = {
  initialOrders: Order[];
  currentRole: string;
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  PREPARATION: "En préparation",
  READY: "Prête",
  DELIVERED: "Livrée",
  CANCELED: "Annulée",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  PREPARATION: "bg-amber-100 text-amber-800",
  READY: "bg-emerald-100 text-emerald-800",
  DELIVERED: "bg-sky-100 text-sky-800",
  CANCELED: "bg-rose-100 text-rose-800",
};

export default function ManagerOrdersPage({
  initialOrders,
  currentRole,
}: ManagerOrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">("ALL");
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredOrders =
    filterStatus === "ALL"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  // Rafraîchir la liste des commandes du jour
  const refreshOrders = async () => {
    try {
      setGlobalError(null);
      const res = await fetch("/api/orders");

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.message || "Erreur lors du rafraîchissement des commandes"
        );
      }

      const data = (await res.json()) as Order[];
      setOrders(data);
    } catch (error: any) {
      console.error(error);
      setGlobalError(
        error.message || "Erreur lors du rafraîchissement des commandes."
      );
    }
  };

  // Générer des commandes de test
  const handleGenerateMockOrders = async () => {
    try {
      setIsGenerating(true);
      setGlobalError(null);

      const res = await fetch("/api/orders/mock", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.message || "Erreur lors de la génération des commandes de test"
        );
      }

      await refreshOrders();
    } catch (error: any) {
      console.error(error);
      setGlobalError(error.message || "Une erreur est survenue.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Changer le statut d'une commande
  const handleChangeStatus = async (orderId: string, newStatus: OrderStatus) => {
    setLoadingId(orderId);
    setGlobalError(null);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.message || "Erreur lors du changement de statut"
        );
      }

      const updated = (await res.json()) as Order;

      setOrders((prev) =>
        prev.map((order) => (order.id === updated.id ? updated : order))
      );
    } catch (error: any) {
      console.error(error);
      setGlobalError(error.message || "Une erreur est survenue");
    } finally {
      setLoadingId(null);
    }
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 lg:px-8">
      {/* Header */}
      <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Commandes du jour
          </h1>
          <p className="text-sm text-slate-500">
            Liste des commandes enregistrées aujourd&apos;hui.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <div className="rounded-full bg-white px-4 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
            Rôle : <span className="font-semibold">{currentRole}</span>
          </div>
          <button
            type="button"
            onClick={handleGenerateMockOrders}
            disabled={isGenerating}
            className="rounded-full bg-slate-900 px-4 py-1 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? "Génération..." : "Générer des commandes de test"}
          </button>
        </div>
      </header>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-600">
          Filtrer par statut :
        </span>
        <FilterChip
          label="Toutes"
          active={filterStatus === "ALL"}
          onClick={() => setFilterStatus("ALL")}
        />
        {(["PENDING", "PREPARATION", "READY", "DELIVERED", "CANCELED"] as OrderStatus[]).map(
          (status) => (
            <FilterChip
              key={status}
              label={STATUS_LABELS[status]}
              active={filterStatus === status}
              onClick={() => setFilterStatus(status)}
            />
          )
        )}
      </div>

      {globalError && (
        <p className="mb-3 text-xs text-red-500">
          {globalError}
        </p>
      )}

      {/* Liste vide */}
      {filteredOrders.length === 0 && (
        <p className="text-sm text-slate-500">
          Aucune commande pour ce filtre.
        </p>
      )}

      {/* Tableau de commandes */}
      {filteredOrders.length > 0 && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium text-slate-500">
              <tr>
                <th className="px-3 py-2">Heure</th>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Produits</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Paiement</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-slate-100 text-xs text-slate-700"
                >
                  <td className="px-3 py-2 align-top">
                    {formatTime(order.createdAt)}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span className="font-mono text-[11px]">
                      {order.id.slice(0, 8)}…
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <ul className="space-y-0.5">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          <span className="font-medium">
                            {item.quantity}× {item.product.name}
                          </span>{" "}
                          <span className="text-[11px] text-slate-500">
                            ({item.unitPrice.toFixed(2)} €)
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-3 py-2 align-top font-semibold">
                    {order.total.toFixed(2)} €
                  </td>
                  <td className="px-3 py-2 align-top capitalize">
                    {order.paymentMethod.toLowerCase()}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${STATUS_COLORS[order.status]}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="flex justify-end gap-1">
                      {order.status !== "PENDING" &&
                        order.status !== "CANCELED" && (
                          <StatusButton
                            label="En attente"
                            disabled={loadingId === order.id}
                            onClick={() =>
                              handleChangeStatus(order.id, "PENDING")
                            }
                          />
                        )}
                      {order.status !== "PREPARATION" &&
                        order.status !== "CANCELED" && (
                          <StatusButton
                            label="Préparation"
                            disabled={loadingId === order.id}
                            onClick={() =>
                              handleChangeStatus(order.id, "PREPARATION")
                            }
                          />
                        )}
                      {order.status !== "READY" &&
                        order.status !== "CANCELED" && (
                          <StatusButton
                            label="Prête"
                            disabled={loadingId === order.id}
                            onClick={() =>
                              handleChangeStatus(order.id, "READY")
                            }
                          />
                        )}
                      {order.status !== "DELIVERED" &&
                        order.status !== "CANCELED" && (
                          <StatusButton
                            label="Livrée"
                            disabled={loadingId === order.id}
                            onClick={() =>
                              handleChangeStatus(order.id, "DELIVERED")
                            }
                          />
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type FilterChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function FilterChip({ label, active, onClick }: FilterChipProps) {
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

type StatusButtonProps = {
  label: string;
  disabled?: boolean;
  onClick: () => void;
};

function StatusButton({ label, disabled, onClick }: StatusButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full border border-slate-200 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}
