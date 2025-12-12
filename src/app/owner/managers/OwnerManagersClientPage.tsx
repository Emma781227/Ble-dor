"use client";

import { useState } from "react";
import type { ManagerUser } from "./page";

type Props = {
  initialManagers: ManagerUser[];
};

export default function OwnerManagersClientPage({ initialManagers }: Props) {
  const [managers, setManagers] = useState<ManagerUser[]>(initialManagers);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
    });
    setMode("create");
    setEditingId(null);
  };

  const refreshManagers = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch("/api/owner/managers");
      if (!res.ok) {
        setErrorMessage("Impossible de charger la liste des managers.");
        return;
      }

      const data: ManagerUser[] = await res.json();
      setManagers(data);
    } catch (error) {
      console.error("Erreur refresh managers:", error);
      setErrorMessage(
        "Erreur réseau lors du rafraîchissement de la liste des managers."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === "create" && !form.password) {
      setErrorMessage("Un mot de passe est requis pour créer un manager.");
      return;
    }

    try {
      setLoading(true);

      const url =
        mode === "create"
          ? "/api/owner/manager"
          : `/api/owner/manager/${editingId}`;

      const method = mode === "create" ? "POST" : "PUT";

      const body: any = {
        name: form.name || null,
        email: form.email || undefined,
        phone: form.phone || null,
      };

      if (form.password) {
        body.password = form.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error || "Erreur lors de l'enregistrement du manager."
        );
      }

      setSuccessMessage(
        mode === "create"
          ? "Manager créé avec succès."
          : "Manager mis à jour avec succès."
      );
      resetForm();
      await refreshManagers();
    } catch (error: any) {
      console.error("Erreur submit manager:", error);
      setErrorMessage(error.message || "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (manager: ManagerUser) => {
    setMode("edit");
    setEditingId(manager.id);
    setForm({
      name: manager.name || "",
      email: manager.email,
      phone: manager.phone || "",
      password: "",
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Es-tu sûr de vouloir supprimer ce manager ? Il ne pourra plus accéder à l'espace gérant."
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await fetch(`/api/owner/managers/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error || "Erreur lors de la suppression du manager."
        );
      }

      setSuccessMessage("Manager supprimé avec succès.");
      await refreshManagers();
    } catch (error: any) {
      console.error("Erreur delete manager:", error);
      setErrorMessage(error.message || "Erreur lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Gestion des managers
        </h1>
        <p className="text-sm text-slate-500">
          Crée, mets à jour ou supprime les comptes gérants de Blé Dor.
        </p>
      </header>

      {/* Messages système */}
      {loading && (
        <p className="text-xs text-slate-500">
          Traitement en cours...
        </p>
      )}
      {errorMessage && (
        <p className="text-xs text-red-500">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p className="text-xs text-emerald-600">
          {successMessage}
        </p>
      )}

      {/* Formulaire create/edit */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {mode === "create"
                ? "Ajouter un nouveau manager"
                : "Modifier un manager"}
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">
              Les managers auront accès à l&apos;espace gérant (dashboard, commandes, produits).
            </p>
          </div>
          {mode === "edit" && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler l&apos;édition
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label className="text-xs font-medium text-slate-600">
              Nom (optionnel)
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              placeholder="Nom et prénom du manager"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-xs font-medium text-slate-600">
              Email (identifiant de connexion)
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              placeholder="manager@bledor.fr"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-xs font-medium text-slate-600">
              Téléphone (optionnel)
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              placeholder="06 12 34 56 78"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-xs font-medium text-slate-600">
              Mot de passe {mode === "edit" && "(laisser vide pour ne pas changer)"}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              placeholder={
                mode === "create"
                  ? "Mot de passe du compte manager"
                  : "Nouveau mot de passe (optionnel)"
              }
            />
            <p className="mt-1 text-[10px] text-slate-400">
              Minimum 6 caractères recommandé.
            </p>
          </div>

          <div className="sm:col-span-2 mt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {mode === "create"
                ? "Créer le manager"
                : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </section>

      {/* Liste des managers */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">
          Liste des managers
        </h2>
        <p className="mt-1 text-[11px] text-slate-500">
          Ces comptes ont accès à l&apos;interface de gestion Blé Dor (dashboard gérant, commandes, produits).
        </p>

        {managers.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            Aucun manager pour le moment. Crée ton premier gérant avec le formulaire ci-dessus.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-1 text-xs">
              <thead>
                <tr className="text-left text-[11px] text-slate-500">
                  <th className="px-3 py-2">Nom</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Téléphone</th>
                  <th className="px-3 py-2">Créé le</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {managers.map((m) => (
                  <tr
                    key={m.id}
                    className="rounded-xl bg-slate-50 align-middle text-[11px]"
                  >
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {m.name || "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{m.email}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {m.phone || "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-500">
                      {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditClick(m)}
                          className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-100"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(m.id)}
                          className="rounded-full bg-rose-600 px-2 py-1 text-[10px] font-medium text-white hover:bg-rose-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
