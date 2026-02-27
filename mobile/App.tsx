import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import ProductsScreen from "./src/screens/ProductsScreen";
import ProductDetailScreen from "./src/screens/ProductDetailScreen";

export type RootStackParamList = {
  Home: undefined;
  Products: undefined;
  ProductDetail: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Blé Dor" }} />
        <Stack.Screen name="Products" component={ProductsScreen} options={{ title: "Produits" }} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "Détail" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
