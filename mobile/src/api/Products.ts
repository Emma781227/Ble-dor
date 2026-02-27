import { getApiBaseUrl } from "../config/api";
import { Product } from "../types/Product";

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/products`);
  if (!res.ok) throw new Error("Impossible de charger les produits");
  return res.json();
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`${getApiBaseUrl()}/api/products/${id}`);
  if (!res.ok) throw new Error("Produit introuvable");
  return res.json();
}
