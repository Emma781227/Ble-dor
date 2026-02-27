import * as SecureStore from "expo-secure-store";
import type { AuthSession } from "./auth.types";

const KEY = "bledor_session";

export async function saveSession(session: AuthSession) {
  await SecureStore.setItemAsync(KEY, JSON.stringify(session));
}

export async function getSession(): Promise<AuthSession | null> {
  const raw = await SecureStore.getItemAsync(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(KEY);
}
