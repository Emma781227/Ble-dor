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
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-lg">👥</div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Gestion des managers</h1>
            <p className="mt-1 text-sm text-slate-600">Crée, modifie ou supprime les comptes gérants de Blé Dor.</p>
          </div>
        </div>
      </header>

      {/* Messages système */}
      {loading && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
          <span>⏳</span> Traitement en cours...
        </div>
      )}
      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <span>❌</span> {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
          <span>✅</span> {successMessage}
        </div>
      )}

      {/* Formulaire create/edit */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span>{mode === "create" ? "➕" : "✏️"}</span>
              {mode === "create" ? "Ajouter un nouveau manager" : "Modifier un manager"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">Les managers auront accès à l'espace gérant (dashboard, commandes, produits).</p>
          </div>
          {mode === "edit" && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              ✕ Annuler
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">👤 Nom</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-200 focus:outline-none"
              placeholder="Nom et prénom du manager"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">📧 Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-200 focus:outline-none"
              placeholder="manager@bledor.fr"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">📱 Téléphone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-200 focus:outline-none"
              placeholder="06 12 34 56 78"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
              🔐 Mot de passe
              {mode === "edit" && <span className="text-[10px] text-slate-400">(optionnel)</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-200 focus:outline-none"
              placeholder={mode === "create" ? "Mot de passe du manager" : "Nouveau mot de passe (optionnel)"}
            />
            <p className="mt-1 text-[10px] text-slate-400">Minimum 6 caractères recommandé.</p>
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-amber-500 hover:bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
            >
              {mode === "create" ? "✔️ Créer le manager" : "💾 Enregistrer"}
            </button>
          </div>
        </form>
      </section>

      {/* Liste des managers */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">📋 Liste des managers ({managers.length})</h2>
        <p className="mt-1 text-xs text-slate-500">Ces comptes ont accès à l'interface de gestion Blé Dor (dashboard gérant, commandes, produits).</p>

        {managers.length === 0 ? (
          <div className="mt-6 rounded-lg bg-slate-50 border border-dashed border-slate-300 px-4 py-6 text-center">
            <p className="text-sm text-slate-500">📭 Aucun manager pour le moment. Crée ton premier gérant avec le formulaire ci-dessus.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">👤 Nom</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">📧 Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">📱 Téléphone</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">📅 Créé le</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">⚙️ Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {managers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 border-l-4 border-l-slate-300 transition">
                    <td className="px-4 py-3 font-medium text-slate-900">{m.name || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{m.email}</td>
                    <td className="px-4 py-3 text-slate-700">{m.phone || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 text-[10px]">{new Date(m.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditClick(m)}
                          className="rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition"
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(m.id)}
                          className="rounded-md bg-red-500 hover:bg-red-600 px-3 py-1.5 text-[11px] font-medium text-white transition"
                        >
                          🗑️ Supprimer
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
