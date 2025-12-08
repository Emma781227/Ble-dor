"use client";

import PublicProductCard, {
  PublicProduct,
} from "@/components/products/PublicProductCard";

type ProductsListClientProps = {
  grouped: Record<string, PublicProduct[]>;
};

export default function ProductsListClient({ grouped }: ProductsListClientProps) {
  const entries = Object.entries(grouped); // [ [categorie, produits[]], ... ]

  if (entries.length === 0) {
    return (
      <p className="text-center text-sm text-slate-500">
        Aucun produit n&apos;est disponible pour le moment.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {entries.map(([category, products]) => (
        <section key={category} className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-800 capitalize">
            {category}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <PublicProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
