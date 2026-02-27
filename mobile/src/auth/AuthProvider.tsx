import React, { createContext, useEffect, useMemo, useState } from "react";
import type { AuthSession } from "./auth.types";
import { clearSession, getSession, saveSession } from "./auth.storage";

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  signIn: (session: AuthSession, remember: boolean) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await getSession();
      setSession(stored);
      setIsLoading(false);
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      signIn: async (nextSession, remember) => {
        setSession(nextSession);
        if (remember) await saveSession(nextSession);
      },
      signOut: async () => {
        setSession(null);
        await clearSession();
      },
    }),
    [session, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
