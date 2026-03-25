import { prisma } from "@/lib/prisma";
import PublicLayout from "@/components/layout/PublicLayout";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

// Skip static generation - fetch product fresh on each request
export const dynamic = "force-dynamic";

// ⚠️ Ici params est une Promise, c'est le nouveau comportement
type PageProps = {
  params: Promise<{ id: string }>;
};

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
};

function resolveBackendApiBaseUrl(): string | null {
  if (process.env.BACKEND_API_URL) {
    return process.env.BACKEND_API_URL;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:8080";
  }

  return null;
}

async function getProductFromGoApi(baseUrl: string, id: string): Promise<Product | null> {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const res = await fetch(`${normalizedBaseUrl}/v1/products/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`go-api responded with ${res.status}`);
  }

  const payload = (await res.json()) as { item?: Product };
  return payload.item ?? null;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params; // on "unwrap" la Promise ici

  if (!id) {
    notFound();
  }

  let product: Product | null = null;

  const goApiBaseUrl = resolveBackendApiBaseUrl();
  if (goApiBaseUrl) {
    try {
      product = await getProductFromGoApi(goApiBaseUrl, id);
    } catch (error) {
      // Keep storefront available even if backend-go is down.
      console.warn("Fallback to Prisma for product detail page:", error);
    }
  }

  if (!product) {
    product = (await prisma.product.findUnique({
      where: { id },
    })) as Product | null;
  }

  // Si le produit n'existe pas ou n'est plus dispo → 404
  if (!product || product.isAvailable === false) {
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
