import { Platform } from "react-native";

export function getApiBaseUrl() {
  // iOS simulator => localhost OK
  if (Platform.OS === "ios") return "http://localhost:3000";

  // Android emulator => 10.0.2.2 pointe vers le PC
  // Sur téléphone Android, il faut l'IP LAN du PC
  // Donc on prévoit une variable d'environnement pour override
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  return "http://10.0.2.2:3000";
}
