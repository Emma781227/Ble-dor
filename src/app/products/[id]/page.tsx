import { prisma } from "@/lib/prisma";
import PublicLayout from "@/components/layout/PublicLayout";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

// ⚠️ Ici params est une Promise, c'est le nouveau comportement
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params; // ✅ on "unwrap" la Promise ici

  if (!id) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { id },
  });

  // Si le produit n'existe pas ou n'est plus dispo → 404
  if (!product || (product as any).isAvailable === false) {
    notFound();
  }

  return (
    <PublicLayout>
      <ProductDetailClient
        id={product.id}
        name={product.name}
        price={product.price}
        category={product.category}
        description={product.description}
        imageUrl={product.imageUrl}
      />
    </PublicLayout>
  );
}
