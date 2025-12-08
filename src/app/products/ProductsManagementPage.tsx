"use client";

import { useState, useMemo } from "react";
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

  // 🔎 Barre de recherche + filtre dispo
  const [search, setSearch] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

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
        return;
      }

      const data: Product[] = await res.json();
      setProducts(Array.isArray(data) ? data : []);
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

      // Mise à jour locale
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Erreur réseau lors de la suppression :", error);
      alert("Impossible de supprimer le produit (erreur réseau).");
    }
  };

  // 🧮 Filtrage côté client pour le manager
  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((p) => {
      if (onlyAvailable && !p.isAvailable) return false;
      if (!term) return true;

      return (
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    });
  }, [products, search, onlyAvailable]);

  const noProductsAtAll = products.length === 0;
  const noProductsAfterFilter = !noProductsAtAll && filteredProducts.length === 0;

  return (
    <>
      {/* Header */}
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Produits
          </h1>
          <p className="text-sm text-slate-500">
            Catalogue de la boulangerie Blé Dor (visible côté clients).
          </p>
        </div>

        {/* Barre de recherche + filtre dispo */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit ou une catégorie..."
            className="w-full rounded-full border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 sm:w-64"
          />
          <label className="flex items-center gap-2 text-[11px] text-slate-600">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
            />
            N&apos;afficher que les produits disponibles
          </label>
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
        <p className="mb-2 text-xs text-red-500">{errorMessage}</p>
      )}

      {/* Liste vide totale */}
      {noProductsAtAll && !loading && !errorMessage && (
        <p className="mt-4 text-sm text-slate-500">
          Aucun produit pour le moment. Ajoute ton premier produit.
        </p>
      )}

      {/* Aucun résultat après filtres */}
      {noProductsAfterFilter && !loading && !errorMessage && (
        <p className="mt-4 text-sm text-slate-500">
          Aucun produit ne correspond à ta recherche. Essaie un autre terme ou
          désactive les filtres.
        </p>
      )}

      {/* Grille de produits */}
      {!noProductsAfterFilter && (
        <section className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => setProductBeingEdited(product)}
              onDelete={() => handleDeleteProduct(product.id)}
            />
          ))}
        </section>
      )}

      {/* Modal d'édition (UPDATE) */}
      {productBeingEdited && (
        <ProductEditDialog
          product={productBeingEdited}
          onClose={() => setProductBeingEdited(null)}
          onProductUpdated={async () => {
            await refreshProducts();
            setProductBeingEdited(null);
          }}
        />
      )}
    </>
  );
}
