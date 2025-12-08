import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/authSession";
import ManagerLayout from "@/components/layout/ManagerLayout";
import ProductsManagementPage, {
  Product,
} from "@/app/products/ProductsManagementPage";

export default async function ManagerProductsPage() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/manager/products");
  }

  const role = (session.user as any).role as string;
  const allowedRoles = ["OWNER", "MANAGER"];

  if (!allowedRoles.includes(role)) {
    redirect("/");
  }

  const currentUser = session.user as any;

  // 🔹 On charge les produits côté serveur
  const productsFromDb = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  // 🔹 On les cast dans le type Product attendu par le composant client
  const initialProducts: Product[] = productsFromDb.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    description: p.description,
    imageUrl: p.imageUrl,
    isAvailable: p.isAvailable,
  }));

  return (
    <ManagerLayout currentUser={currentUser} currentRole={role}>
      <ProductsManagementPage initialProducts={initialProducts} />
    </ManagerLayout>
  );
}
