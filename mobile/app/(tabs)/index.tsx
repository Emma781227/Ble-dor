import React, { useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const categories = useMemo(
    () => [
      {
        name: "Pain",
        cat: "pain",
        desc: "Tradition, campagne, céréales...",
      },
      {
        name: "Viennoiseries",
        cat: "viennoiserie",
        desc: "Croissants, chocolatines, brioches...",
      },
      {
        name: "Boissons",
        cat: "boisson",
        desc: "Cafés, thés, jus & softs.",
      },
      {
        name: "Snacking",
        cat: "snack",
        desc: "Sandwichs, quiches, salades.",
      },
    ],
    []
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* HERO */}
      <View style={styles.heroWrap}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Frais du jour · Ouvert dès 7h</Text>
        </View>

        <Text style={styles.h1}>
          Le bon pain,{"\n"}
          <Text style={styles.h1Accent}>au bon moment.</Text>
        </Text>

        <Text style={styles.lead}>
          Blé Dor vous accompagne toute la journée avec des pains artisanaux,
          des viennoiseries croustillantes et une sélection de boissons chaudes
          et froides.
        </Text>

        <View style={styles.ctaRow}>
          <Pressable
            onPress={() => navigation.navigate("Products")}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Text style={styles.primaryBtnText}>Voir nos produits</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              // on garde le même comportement que desktop : "Me connecter"
              // si tu as un écran Login mobile plus tard, on le branchera ici
              // pour l’instant tu peux rediriger vers Products ou laisser inactif
              // navigation.navigate("Login") (plus tard)
              navigation.navigate("Products");
            }}
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Text style={styles.secondaryBtnText}>Me connecter</Text>
          </Pressable>
        </View>

        <Text style={styles.smallNote}>
          Gestion pro côté équipe, simplicité côté clients.
        </Text>

        {/* Carte "aperçu" façon desktop */}
        <View style={styles.previewCardOuter}>
          <View style={styles.previewCardInner}>
            <View style={styles.previewTopRow}>
              <Text style={styles.previewBrand}>Blé Dor</Text>
              <View style={styles.previewPill}>
                <Text style={styles.previewPillText}>Caisse connectée</Text>
              </View>
            </View>

            <View style={styles.previewStatsBlock}>
              <Text style={styles.previewSectionTitle}>Aperçu du jour</Text>
              <View style={styles.previewGrid}>
                <MiniStat label="Commandes" value="32" />
                <MiniStat label="Ticket moyen" value="8 400 FCFA" />
                <MiniStat label="Top produit" value="Baguette" />
              </View>
            </View>

            <View style={styles.previewFooter}>
              <Text style={styles.previewFootText}>
                Exemple d’interface de caisse et de suivi temps réel.
              </Text>
              <Text style={styles.previewFootSub}>
                Cette zone illustre l’application interne (gérants & équipe).
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* CATEGORIES */}
      <View style={styles.section}>
        <Text style={styles.h2}>Nos catégories du jour</Text>
        <Text style={styles.sub}>
          Une sélection simple pour trouver rapidement ce qui vous fait envie.
        </Text>

        <View style={styles.cardsGrid}>
          {categories.map((c) => (
            <Pressable
              key={c.cat}
              onPress={() => {
                // plus tard on fera un filtre côté mobile
                navigation.navigate("Products");
              }}
              style={({ pressed }) => [
                styles.categoryCard,
                pressed && styles.cardPressed,
              ]}
            >
              <Text style={styles.cardTitle}>{c.name}</Text>
              <Text style={styles.cardDesc}>{c.desc}</Text>
              <Text style={styles.cardLink}>Voir les {c.name.toLowerCase()} →</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* WHY */}
      <View style={[styles.section, styles.sectionWhite]}>
        <Text style={styles.h2}>Pourquoi choisir Blé Dor ?</Text>

        <View style={{ marginTop: 12, gap: 10 }}>
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
        </View>
      </View>

      {/* CONTACT */}
      <View style={styles.section}>
        <Text style={styles.h2}>Nous contacter</Text>
        <Text style={styles.sub}>
          Une question, une commande spéciale ou un projet pro ? Contactez-nous.
        </Text>

        <View style={styles.contactCard}>
          <ContactRow label="Adresse" value="123 Rue du Pain, Douala" icon="📍" />
          <ContactRow label="Téléphone" value="+237 6 XX XX XX XX" icon="📞" />
          <ContactRow label="Email" value="contact@bledor.cm" icon="📧" />
          <ContactRow label="Horaires" value="Lun - Sam : 7h00 - 19h30" icon="⏰" />
        </View>

        <View style={{ height: 18 }} />
        <Text style={styles.footerTiny}>
          © {new Date().getFullYear()} Blé Dor — Tous droits réservés.
        </Text>
      </View>
    </ScrollView>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue}>{value}</Text>
    </View>
  );
}

function WhyCard({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.whyCard}>
      <Text style={styles.whyTitle}>{title}</Text>
      <Text style={styles.whyText}>{text}</Text>
    </View>
  );
}

function ContactRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <View style={styles.contactRow}>
      <Text style={styles.contactIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" }, // slate-50
  container: { paddingBottom: 28 },

  heroWrap: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    backgroundColor: "#fff7ed", // amber-50
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#fcd34d", // amber-300
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: "600", color: "#b45309" }, // amber-700

  h1: {
    marginTop: 12,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
    color: "#0f172a",
  },
  h1Accent: { color: "#d97706" }, // amber-600
  lead: { marginTop: 10, fontSize: 14, lineHeight: 20, color: "#475569" },

  ctaRow: { marginTop: 14, flexDirection: "row", gap: 10, flexWrap: "wrap" },

  primaryBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  primaryBtnText: { color: "white", fontWeight: "700", fontSize: 14 },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  secondaryBtnText: { color: "#334155", fontWeight: "700", fontSize: 14 },

  btnPressed: { opacity: 0.92 },

  smallNote: { marginTop: 10, fontSize: 11, color: "#64748b" },

  previewCardOuter: {
    marginTop: 16,
    borderRadius: 28,
    padding: 1,
    backgroundColor: "#f59e0b",
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "ios" ? 0.08 : 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  previewCardInner: {
    borderRadius: 26,
    backgroundColor: "rgba(2, 6, 23, 0.95)", // slate-950-ish
    padding: 14,
  },
  previewTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  previewBrand: { color: "#e2e8f0", fontSize: 12, fontWeight: "700" },
  previewPill: {
    backgroundColor: "rgba(16,185,129,0.18)", // emerald
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  previewPillText: { color: "#6ee7b7", fontSize: 11, fontWeight: "700" },

  previewStatsBlock: { marginTop: 12 },
  previewSectionTitle: { color: "#cbd5e1", fontSize: 12, fontWeight: "700" },
  previewGrid: { marginTop: 10, flexDirection: "row", gap: 10, flexWrap: "wrap" },

  miniStat: {
    width: "31%",
    minWidth: 100,
    backgroundColor: "rgba(15,23,42,0.65)",
    borderRadius: 14,
    padding: 10,
  },
  miniLabel: { fontSize: 10, color: "#94a3b8" },
  miniValue: { marginTop: 4, fontSize: 12, fontWeight: "800", color: "#f8fafc" },

  previewFooter: { marginTop: 12, gap: 4 },
  previewFootText: { color: "#94a3b8", fontSize: 11 },
  previewFootSub: { color: "#64748b", fontSize: 10 },

  section: { paddingHorizontal: 16, paddingTop: 18 },
  sectionWhite: { backgroundColor: "#ffffff", marginTop: 14, paddingBottom: 14 },

  h2: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  sub: { marginTop: 6, fontSize: 13, color: "#64748b", lineHeight: 18 },

  cardsGrid: { marginTop: 12, gap: 10 },

  categoryCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    padding: 14,
  },
  cardPressed: { transform: [{ scale: 0.99 }], opacity: 0.98 },
  cardTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  cardDesc: { marginTop: 6, fontSize: 12, color: "#64748b" },
  cardLink: { marginTop: 10, fontSize: 12, fontWeight: "700", color: "#d97706" },

  whyCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    padding: 14,
  },
  whyTitle: { fontSize: 14, fontWeight: "800", color: "#0f172a" },
  whyText: { marginTop: 8, fontSize: 12, color: "#475569", lineHeight: 17 },

  contactCard: {
    marginTop: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  contactRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  contactIcon: { fontSize: 18, marginTop: 1 },
  contactLabel: { fontSize: 12, fontWeight: "800", color: "#334155" },
  contactValue: { marginTop: 2, fontSize: 12, color: "#64748b" },

  footerTiny: { fontSize: 11, color: "#94a3b8", textAlign: "center" },
});
