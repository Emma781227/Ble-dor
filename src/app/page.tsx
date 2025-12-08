import PublicLayout from "@/components/layout/PublicLayout";
import Link from "next/link";

export default function HomePage() {
  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-white to-slate-50">
        {/* Décors flous */}
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-amber-200/50 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-rose-100/60 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:py-20">
          {/* Texte principal */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Ouvert dès 7h · Commande en ligne disponible</span>
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Le bon pain,
              <span className="block text-amber-600">
                au bon moment.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm text-slate-600 sm:text-base">
              Blé Dor, c’est votre rendez-vous quotidien pour des pains
              artisanaux, des viennoiseries croustillantes et une offre
              snacking prête à emporter. Commandez en ligne, passez en
              boutique, repartez sans attendre.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Commander maintenant
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Accéder à mon espace
              </Link>
            </div>

            <p className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
              <span>✔ Click & Collect en quelques clics</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>✔ Gestion fluide côté équipe et côté clients</span>
            </p>
          </div>

          {/* Bloc visuel : aperçu "caisse connectée" */}
          <div className="flex-1">
            <div className="relative mx-auto h-64 max-w-sm rounded-3xl bg-gradient-to-br from-amber-500 via-amber-400 to-amber-600 p-[1px] shadow-xl sm:h-72 lg:h-80">
              <div className="flex h-full flex-col justify-between rounded-[22px] bg-slate-950/95 p-4">
                <div className="flex items-center justify-between text-xs text-slate-200">
                  <span className="font-semibold tracking-tight">
                    Blé Dor · Interface caisse
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                    Suivi en temps réel
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-100">
                  <p className="text-[11px] font-medium text-slate-300">
                    Vue du service de la matinée
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <MiniStat label="Commandes" value="32" accent="success" />
                    <MiniStat label="Ticket moyen" value="8,40 €" accent="neutral" />
                    <MiniStat label="Top produit" value="Baguette tradition" accent="highlight" />
                  </div>

                  <div className="mt-2 rounded-2xl bg-slate-900/70 p-3 ring-1 ring-slate-800/60">
                    <p className="text-[10px] text-slate-400">
                      Enceinte · 08h30 – 09h30
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-50">
                        Coup de rush matinal
                      </p>
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-200">
                        Flux maîtrisé
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Cet aperçu illustre les données que les gérants et le personnel
                      peuvent consulter pour piloter le point de vente.
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500">
                  Interface visuelle de démonstration – votre environnement final
                  sera adapté à votre établissement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6">
        <h2 className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Commander chez Blé Dor
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 max-w-xl mx-auto">
          En quelques étapes, votre commande est prête à être récupérée en
          boutique. Pratique pour les matinées pressées comme pour les pauses
          gourmandes.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3 text-sm">
          <StepCard
            step="1"
            title="Je choisis"
            text="Je parcours les produits disponibles en temps réel et j’ajoute à mon panier ce qui me fait envie."
          />
          <StepCard
            step="2"
            title="Je confirme"
            text="Je valide ma commande en ligne et je reçois un numéro de ticket à présenter en boutique."
          />
          <StepCard
            step="3"
            title="Je récupère"
            text="Je passe en caisse, je règle et je repars avec mes produits fraîchement préparés."
          />
        </div>
      </section>

      {/* CATÉGORIES */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <h2 className="text-center text-2xl font-semibold text-slate-900">
          Nos univers gourmands
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Une sélection claire pour trouver rapidement votre prochain coup de cœur.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "Pains",
              cat: "pain",
              desc: "Baguette tradition, campagne, céréales et pains spéciaux.",
              emoji: "🥖",
            },
            {
              name: "Viennoiseries",
              cat: "viennoiserie",
              desc: "Croissants, pains au chocolat, brioches & feuilletés.",
              emoji: "🥐",
            },
            {
              name: "Boissons",
              cat: "boisson",
              desc: "Cafés, thés, chocolats chauds, jus et boissons fraîches.",
              emoji: "☕",
            },
            {
              name: "Snacking",
              cat: "snack",
              desc: "Sandwichs, quiches, salades, formules déjeuner.",
              emoji: "🥪",
            },
          ].map((c) => (
            <Link
              key={c.cat}
              href={`/products?category=${c.cat}`}
              className="group rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-slate-400"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{c.emoji}</span>
                <p className="text-sm font-semibold text-slate-900">
                  {c.name}
                </p>
              </div>
              <p className="mt-2 text-xs text-slate-600">{c.desc}</p>
              <p className="mt-3 text-[11px] font-medium text-amber-600 group-hover:text-amber-700">
                Voir les {c.name.toLowerCase()} →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* POURQUOI NOUS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="text-center text-2xl font-semibold text-slate-900">
            Pourquoi choisir Blé Dor ?
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 max-w-xl mx-auto">
            Une expérience pensée à la fois pour vos habitudes de consommation
            et pour la réalité du service en boutique.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <WhyCard
              title="🥖 Pain artisanal, cuisson sur place"
              text="Des recettes maîtrisées, une cuisson quotidienne en boutique et une qualité constante tout au long de la journée."
            />
            <WhyCard
              title="📲 Commande en ligne simplifiée"
              text="Une interface claire pour commander en amont, visualiser les disponibilités et limiter l’attente en caisse."
            />
            <WhyCard
              title="⚡ Service fluide en point de vente"
              text="Un outil interne de suivi pour les équipes : moins d’erreurs, plus de réactivité, un service plus agréable."
            />
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="mx-auto max-w-7xl px-4 pb-16 sm:px-6"
      >
        <h2 className="text-center text-2xl font-semibold text-slate-900">
          Nous contacter
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 max-w-md mx-auto">
          Une question, une commande spéciale (gâteau, événement, grosse
          quantité) ou un projet pro autour de Blé Dor ? Parlons-en.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr,3fr]">
          {/* Infos pratiques */}
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
              value="Lun - Sam : 7h00 - 19h30 · Dim : 7h00 - 13h00"
              icon="⏰"
            />
            <p className="text-[11px] text-slate-500">
              Pour toute demande spécifique, envoyez-nous un message et nous
              reviendrons vers vous dans les meilleurs délais.
            </p>
          </div>

          {/* Formulaire (visuel seulement pour l'instant) */}
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-900">
              Formulaire de contact
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Cette interface est prête : la logique d&apos;envoi pourra être
              branchée sur un futur back-office ou un outil d&apos;emailing.
            </p>
            <div className="mt-4 space-y-3 text-sm">
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
                Envoyer (bientôt disponible)
              </button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "success" | "highlight" | "neutral";
}) {
  const accentClasses =
    accent === "success"
      ? "bg-emerald-500/10 text-emerald-200"
      : accent === "highlight"
      ? "bg-amber-500/10 text-amber-200"
      : "bg-slate-800 text-slate-100";

  return (
    <div className="rounded-xl bg-slate-900/60 p-2">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className={`mt-0.5 inline-flex rounded-full px-2 py-[2px] text-[11px] font-semibold ${accentClasses}`}>
        {value}
      </p>
    </div>
  );
}

function StepCard({
  step,
  title,
  text,
}: {
  step: string;
  title: string;
  text: string;
}) {
  return (
    <article className="relative rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="absolute -top-3 left-4 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[11px] font-semibold text-white shadow-sm">
        {step}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-xs text-slate-600">{text}</p>
    </article>
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
    <div className="flex items-start gap-3 text-xs">
      <div className="mt-[2px] text-lg">{icon}</div>
      <div>
        <p className="font-semibold text-slate-700">{label}</p>
        <p className="mt-0.5 text-slate-500">{value}</p>
      </div>
    </div>
  );
}
