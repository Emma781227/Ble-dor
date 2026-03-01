"use client";

import { useState } from "react";

type ClientProfileContentProps = {
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  initialMarketingOptIn: boolean;
};

export default function ClientProfileContent({
  initialName,
  initialEmail,
  initialPhone,
  initialMarketingOptIn,
}: ClientProfileContentProps) {
  // Infos profil
  const [name, setName] = useState(initialName);
  const [email] = useState(initialEmail); // on l'affiche en lecture seule pour l'instant
  const [phone, setPhone] = useState(initialPhone);
  const [marketingOptIn, setMarketingOptIn] = useState(
    initialMarketingOptIn
  );
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(
    null
  );
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      setProfileMessage(null);

      const res = await fetch("/api/client/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          marketingOptIn,
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la mise à jour du profil.");
      }

      setProfileMessage("Profil mis à jour avec succès.");
    } catch (err: any) {
      setProfileMessage(err.message || "Une erreur est survenue.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setPasswordError(null);
      setPasswordMessage(null);

      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError("Merci de remplir tous les champs.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError("La confirmation ne correspond pas au nouveau mot de passe.");
        return;
      }

      if (newPassword.length < 6) {
        setPasswordError("Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }

      setIsChangingPassword(true);

      const res = await fetch("/api/client/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Erreur lors du changement de mot de passe.");
      }

      setPasswordMessage("Mot de passe mis à jour avec succès.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Une erreur est survenue.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl font-medium text-slate-700">
            {initialName ? initialName.split(" ").map(n=>n[0]).slice(0,2).join("") : "U"}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Mon profil</h1>
            <p className="text-sm text-slate-600">Gérez vos informations personnelles et la sécurité de votre compte.</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
          >
            {isSavingProfile ? "Enregistrement..." : "Sauvegarder"}
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Informations personnelles</h2>
          <p className="mt-1 text-xs text-slate-500">Ces informations sont utilisées pour retrouver vos commandes.</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <label className="text-xs font-medium text-slate-600">Nom complet</label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-label="Nom complet"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                value={email}
                readOnly
                aria-readonly
              />
              <p className="mt-1 text-[11px] text-slate-400">L'email est votre identifiant (non modifiable).</p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Téléphone (optionnel)</label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-200"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex : 06 12 34 56 78"
                aria-label="Téléphone"
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                id="marketingOptIn"
                type="checkbox"
                className="mt-[3px] h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-400"
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
              />
              <label htmlFor="marketingOptIn" className="text-xs text-slate-600">Je souhaite recevoir des offres et actualités par email.</label>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            {profileMessage ? (
              <p className="text-sm text-emerald-600" role="status" aria-live="polite">{profileMessage}</p>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 sm:hidden">
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
              >
                {isSavingProfile ? "Enregistrement..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        </section>

        {/* Carte mot de passe */}
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Sécurité & mot de passe</h2>
          <p className="mt-1 text-xs text-slate-500">Changez régulièrement votre mot de passe pour sécuriser votre compte.</p>

          <div className="mt-4 grid gap-4 text-sm">
            <div>
              <label className="text-xs font-medium text-slate-600">Mot de passe actuel</label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-200"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                aria-label="Mot de passe actuel"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Nouveau mot de passe</label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-200"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-label="Nouveau mot de passe"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-200"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-label="Confirmer le nouveau mot de passe"
              />
            </div>
          </div>

          {passwordError && <p className="mt-3 text-sm text-red-500">{passwordError}</p>}
          {passwordMessage && !passwordError && <p className="mt-3 text-sm text-emerald-600">{passwordMessage}</p>}

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">Le mot de passe doit contenir au moins 6 caractères.</p>
            <button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {isChangingPassword ? "Mise à jour..." : "Changer le mot de passe"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
