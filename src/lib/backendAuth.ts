import crypto from "crypto";

function base64UrlEncode(input: string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signHmacSha256(payload: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function createBackendJwt(user: {
  id: string;
  role?: string | null;
  email?: string | null;
  name?: string | null;
}): string {
  const secret =
    process.env.BACKEND_JWT_SECRET ||
    process.env.JWT_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "dev-backend-jwt-secret";

  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    sub: user.id,
    role: user.role || "CLIENT",
    email: user.email || undefined,
    name: user.name || undefined,
    iat: now,
    exp: now + 60 * 15,
    iss: "ble-dor-next",
    aud: "ble-dor-go-api",
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signHmacSha256(`${encodedHeader}.${encodedPayload}`, secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
