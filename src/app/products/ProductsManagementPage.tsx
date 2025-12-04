"use client";

import { useState } from "react";
import ProductCreateForm from "@/components/products/ProductCreateForm";
import ProductCard from "@/components/products/ProductsCard";
import ProductEditDialog from "@/components/products/ProductsEditDialog";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  isAvailable: boolean;
};

type ProductsManagementPageProps = {
  initialProducts: Product[];
};

export default function ProductsManagementPage({
  initialProducts,
}: ProductsManagementPageProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [productBeingEdited, setProductBeingEdited] = useState<Product | null>(
    null
  );

  // 🔁 Rafraîchit la liste depuis l'API sans throw
  const refreshProducts = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch("/api/products");

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error(
          "Erreur lors de l'appel GET /api/products :",
          res.status,
          text
        );
        setErrorMessage("Erreur lors du rafraîchissement des produits.");
        return; // ⬅️ on ne throw plus, on arrête juste là
      }

      const data: Product[] = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Erreur réseau /api/products :", error);
      setErrorMessage("Erreur réseau lors du rafraîchissement des produits.");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Suppression d'un produit
  const handleDeleteProduct = async (productId: string) => {
    const confirmed = window.confirm(
      "Es-tu sûr de vouloir supprimer ce produit ?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        const text = await res.text().catch(() => "");
        console.error(
          "Erreur lors du DELETE /api/products/:id :",
          res.status,
          text
        );
        alert("Erreur lors de la suppression du produit.");
        return;
      }

      // Mise à jour locale sans recharger toute la liste
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Erreur réseau lors de la suppression :", error);
      alert("Impossible de supprimer le produit (erreur réseau).");
    }
  };

  return (
    <>
      {/* Header */}
      <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Produits
          </h1>
          <p className="text-sm text-slate-500">
            Catalogue de la boulangerie Blé Dor
          </p>
        </div>
      </header>

      {/* Formulaire de création (CREATE) */}
      <ProductCreateForm onProductCreated={refreshProducts} />

      {loading && (
        <p className="mb-2 text-xs text-slate-500">
          Mise à jour de la liste des produits...
        </p>
      )}

      {errorMessage && (
        <p className="mb-2 text-xs text-red-500">
          {errorMessage}
        </p>
      )}

      {/* Liste vide */}
      {products.length === 0 && !loading && !errorMessage && (
        <p className="text-sm text-slate-500">
          Aucun produit pour le moment. Ajoute ton premier produit.
        </p>
      )}

      {/* Grille de produits */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={() => setProductBeingEdited(product)}
            onDelete={() => handleDeleteProduct(product.id)}
          />
        ))}
      </section>

      {/* Modal d'édition (UPDATE) */}
      {productBeingEdited && (
        <ProductEditDialog
          product={productBeingEdited}
          onClose={() => setProductBeingEdited(null)}
          onProductUpdated={async () => {
            await refreshProducts(); // 🔁 rechargement après update
            setProductBeingEdited(null); // fermeture du modal
          }}
        />
      )}
    </>
  );
}
