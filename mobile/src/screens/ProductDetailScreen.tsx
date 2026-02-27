import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { fetchProductById } from "../api/Products";
import { Product } from "../types/Product";

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetail">;

export default function ProductDetailScreen({ route }: Props) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (e: any) {
        setError(e?.message ?? "Erreur");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text style={{ color: "#b91c1c", fontWeight: "600" }}>
          {error ?? "Produit introuvable"}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 22, fontWeight: "800", color: "#0f172a" }}>
        {product.name}
      </Text>
      <Text style={{ opacity: 0.7 }}>{product.category}</Text>
      <Text style={{ fontSize: 18, fontWeight: "800" }}>
        {product.price.toFixed(0)} FCFA
      </Text>
      {product.description ? (
        <Text style={{ marginTop: 10, opacity: 0.8 }}>{product.description}</Text>
      ) : null}
    </View>
  );
}
