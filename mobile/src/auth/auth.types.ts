export type Role = "OWNER" | "MANAGER" | "CLIENT";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
};

export type AuthSession = {
  user: AuthUser;
  token?: string; // optionnel (si plus tard tu ajoutes JWT côté API)
};
