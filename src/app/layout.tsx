import type { ReactNode } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { SessionAuthProvider } from "@/components/providers/SessionAuthProvider";

export const metadata = {
  title: "Blé Dor",
  description: "Application de gestion et commande en ligne pour la boulangerie Blé Dor",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-slate-50">
        <SessionAuthProvider>
          <CartProvider>{children}</CartProvider>
        </SessionAuthProvider>
      </body>
    </html>
  );
}
