import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/authSession";
import { redirect } from "next/navigation";
import OwnerLayout from "@/components/layout/OwnerLayout";

async function getAllProducts() {
  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      isAvailable: true,
      createdAt: true,
    },
  });

  return products;
}

export default async function OwnerProductsPage() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/owner/products");
  }

  const user = session.user as any;
  if (user.role !== "OWNER") {
    redirect("/");
  }

  const products = await getAllProducts();

  return (
    <OwnerLayout currentUserName={user.name || user.email}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Produits – Vue propriétaire
        </h1>
        <p className="text-sm text-slate-500">
          Supervision du catalogue. Les gérants gèrent les stocks et
          disponibilités au quotidien.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-slate-500">
          Aucun produit n&apos;est encore enregistré.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <table className="min-w-full border-collapse text-[11px] sm:text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Produit</th>
                <th className="px-3 py-2 text-left font-medium">Catégorie</th>
                <th className="px-3 py-2 text-right font-medium">Prix</th>
                <th className="px-3 py-2 text-left font-medium">
                  Disponibilité
                </th>
                <th className="px-3 py-2 text-left font-medium">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-slate-100 hover:bg-slate-50/60"
                >
                  <td className="px-3 py-2 text-slate-900">{p.name}</td>
                  <td className="px-3 py-2 text-slate-700 capitalize">
                    {p.category}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-slate-900">
                    {p.price.toFixed(2)} €
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        p.isAvailable
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {p.isAvailable ? "Disponible" : "Rupture"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {p.createdAt.toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </OwnerLayout>
  );
}
