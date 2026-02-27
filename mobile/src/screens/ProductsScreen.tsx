import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { fetchProducts } from "../api/Products";
import { Product } from "../types/Product";

type Props = NativeStackScreenProps<RootStackParamList, "Products">;

export default function ProductsScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const data = await fetchProducts();
        setProducts(data.filter(p => p.isAvailable));
      } catch (e: any) {
        setError(e?.message ?? "Erreur");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8, opacity: 0.7 }}>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text style={{ color: "#b91c1c", fontWeight: "600" }}>{error}</Text>
        <Text style={{ marginTop: 6, opacity: 0.7 }}>
          Vérifie l’URL API (émulateur vs téléphone) et que le backend tourne.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate("ProductDetail", { id: item.id })}
            style={{
              backgroundColor: "white",
              padding: 14,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#e2e8f0",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#0f172a" }}>
              {item.name}
            </Text>
            <Text style={{ marginTop: 4, opacity: 0.7 }}>{item.category}</Text>
            <Text style={{ marginTop: 8, fontWeight: "700" }}>
              {item.price.toFixed(0)} FCFA
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
