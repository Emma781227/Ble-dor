import PublicLayout from "@/components/layout/PublicLayout";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductsListClient from "./ProductsListClient";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string | null;
  imageUrl: string | null;
};

async function getAvailableProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return products as Product[];
}

export default async function ProductsPage() {
  const products = await getAvailableProducts();

  const grouped = products.reduce((acc, product) => {
    const key = product.category || "autre";
    if (!acc[key]) acc[key] = [];
    acc[key].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Nos produits
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-xl">
              Retrouvez ici l&apos;ensemble des produits actuellement{" "}
              <span className="font-medium text-emerald-600">
                disponibles en boutique
              </span>
              .
            </p>
          </div>
          <Link
            href="/"
            className="text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            ⟵ Retour à l&apos;accueil
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-sm text-slate-500">
            Aucun produit n&apos;est disponible pour le moment.
          </p>
        ) : (
          <ProductsListClient grouped={grouped} />
        )}
      </section>
    </PublicLayout>
  );
}
