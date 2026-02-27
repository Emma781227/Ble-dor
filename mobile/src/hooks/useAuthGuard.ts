import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/auth/useAuth";

export function useAuthGuard() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!session) router.replace("/(auth)/login");
  }, [isLoading, session, router]);

  return { session, isLoading };
}
