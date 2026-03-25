import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/authSession";
import { createBackendJwt } from "@/lib/backendAuth";

function resolveBackendApiBaseUrl(): string | null {
  if (process.env.BACKEND_API_URL) {
    return process.env.BACKEND_API_URL;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:8080";
  }

  return null;
}

export async function GET() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = session.user as any;
  const bearer = createBackendJwt(user);

  const goApiBaseUrl = resolveBackendApiBaseUrl();
  if (goApiBaseUrl) {
    try {
      const res = await fetch(`${goApiBaseUrl.replace(/\/$/, "")}/v1/favorites`, {
        headers: {
          Authorization: `Bearer ${bearer}`,
          "X-User-Id": user.id,
          "X-User-Role": user.role || "CLIENT",
        },
        cache: "no-store",
      });

      if (res.ok) {
        const payload = await res.json();
        return NextResponse.json(payload);
      }
    } catch (error) {
      console.warn("Fallback to Prisma for favorites list:", error);
    }
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    favorites.map((fav) => ({
      id: fav.id,
      product: fav.product,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = session.user as any;
  const bearer = createBackendJwt(user);
  const { productId } = (await req.json()) as { productId?: string };

  if (!productId) {
    return NextResponse.json(
      { error: "productId requis" },
      { status: 400 }
    );
  }

  const goApiBaseUrl = resolveBackendApiBaseUrl();
  if (goApiBaseUrl) {
    try {
      const res = await fetch(`${goApiBaseUrl.replace(/\/$/, "")}/v1/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearer}`,
          "X-User-Id": user.id,
          "X-User-Role": user.role || "CLIENT",
        },
        body: JSON.stringify({ productId }),
        cache: "no-store",
      });

      if (res.ok) {
        return NextResponse.json({ success: true });
      }
    } catch (error) {
      console.warn("Fallback to Prisma for favorites add:", error);
    }
  }

  try {
    await prisma.favorite.create({
      data: {
        userId: user.id,
        productId,
      },
    });
  } catch (err: any) {
    // si déjà en favoris (unique userId+productId), on ne fait rien
  }

  return NextResponse.json({ success: true });
}
