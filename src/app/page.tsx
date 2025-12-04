import PublicLayout from "@/components/layout/PublicLayout";
import Link from "next/link";

export default function HomePage() {
  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-white to-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:py-20">
          {/* Texte */}
          <div className="flex-1">
            <p className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200">
              Frais du jour · Ouvert dès 7h
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Le bon pain,
              <span className="block text-amber-600">
                au bon moment.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm text-slate-600 sm:text-base">
              Blé Dor vous accompagne toute la journée avec des pains
              artisanaux, des viennoiseries croustillantes et une sélection de
              boissons chaudes et froides.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Voir nos produits
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Me connecter
              </Link>
            </div>

            <p className="mt-4 text-[11px] text-slate-500">
              Gestion pro côté équipe, simplicité côté clients.
            </p>
          </div>

          {/* Bloc visuel */}
          <div className="flex-1">
            <div className="relative mx-auto h-64 max-w-sm rounded-3xl bg-gradient-to-br from-amber-500 via-amber-400 to-amber-600 p-[1px] shadow-lg sm:h-72 lg:h-80">
              <div className="flex h-full flex-col justify-between rounded-[22px] bg-slate-950/95 p-4">
                <div className="flex items-center justify-between text-xs text-slate-200">
                  <span className="font-semibold">Blé Dor</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                    Caisse connectée
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-100">
                  <p className="font-medium text-slate-200">
                    Aperçu du jour
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <MiniStat label="Commandes" value="32" />
                    <MiniStat label="Ticket moyen" value="8,40 €" />
                    <MiniStat label="Top produit" value="Baguette" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400">
                    Exemple d&apos;interface de caisse et de suivi temps réel. 
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Cette zone illustre l&apos;application interne que voient les
                    gérants et le personnel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATÉGORIES */}
      <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-semibold text-slate-900">
          Nos catégories du jour
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Une sélection simple pour trouver rapidement ce qui vous fait envie.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Pain", cat: "pain", desc: "Tradition, campagne, céréales..." },
            { name: "Viennoiseries", cat: "viennoiserie", desc: "Croissants, chocolatines, brioches..." },
            { name: "Boissons", cat: "boisson", desc: "Cafés, thés, jus & softs." },
            { name: "Snacking", cat: "snack", desc: "Sandwichs, quiches, salades." },
          ].map((c) => (
            <Link
              key={c.cat}
              href={`/products?category=${c.cat}`}
              className="group rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-slate-400"
            >
              <p className="text-sm font-semibold text-slate-900">
                {c.name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {c.desc}
              </p>
              <p className="mt-3 text-[11px] font-medium text-amber-600 group-hover:text-amber-700">
                Voir les {c.name.toLowerCase()} →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* POURQUOI NOUS */}
      <section className="mt-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="text-center text-2xl font-semibold text-slate-900">
            Pourquoi choisir Blé Dor ?
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <WhyCard
              title="🥖 Pain artisanal"
              text="Une cuisson sur place chaque matin, avec des recettes maîtrisées et régulières."
            />
            <WhyCard
              title="⭐ Qualité constante"
              text="Des fiches produits, des prix maîtrisés et une gestion centralisée depuis le back-office."
            />
            <WhyCard
              title="⚡ Service rapide"
              text="Une caisse optimisée pour encaisser plus vite, réduire les erreurs et fluidifier la file."
            />
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="mx-auto mt-12 max-w-7xl px-4 pb-16 sm:px-6"
      >
        <h2 className="text-center text-2xl font-semibold text-slate-900">
          Nous contacter
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 max-w-md mx-auto">
          Une question, une commande spéciale ou un projet pro ? Laissez-nous un message.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr,3fr]">
          {/* Infos */}
          <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <ContactInfo
              label="Adresse"
              value="123 Rue du Pain, 75000 Paris"
              icon="📍"
            />
            <ContactInfo
              label="Téléphone"
              value="01 23 45 67 89"
              icon="📞"
            />
            <ContactInfo
              label="Email"
              value="contact@bledor.fr"
              icon="📧"
            />
            <ContactInfo
              label="Horaires"
              value="Lun - Sam : 7h00 - 19h30"
              icon="⏰"
            />
          </div>

          {/* Form (factice pour l'instant) */}
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-900">
              Formulaire de contact
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              (Interface visuelle, la soumission pourra être branchée plus tard.)
            </p>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                placeholder="Votre nom"
              />
              <input
                type="email"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                placeholder="Votre email"
              />
              <textarea
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                rows={4}
                placeholder="Votre message..."
              />
              <button
                type="button"
                className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Envoyer (bientôt)
              </button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-900/60 p-2">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="text-xs font-semibold text-slate-50">{value}</p>
    </div>
  );
}

function WhyCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-2xl bg-slate-50 p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-xs text-slate-600">{text}</p>
    </article>
  );
}

function ContactInfo({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-[2px] text-lg">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-slate-700">{label}</p>
        <p className="text-xs text-slate-500">{value}</p>
      </div>
    </div>
  );
}
