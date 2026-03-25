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

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  const session = await getAuthSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = session.user as any;
  const bearer = createBackendJwt(user);

  // En Next.js 16, params est une Promise
  const { productId } = await context.params;

  if (!productId) {
    return NextResponse.json(
      { error: "productId manquant" },
      { status: 400 }
    );
  }

  const goApiBaseUrl = resolveBackendApiBaseUrl();
  if (goApiBaseUrl) {
    try {
      const res = await fetch(
        `${goApiBaseUrl.replace(/\/$/, "")}/v1/favorites/${encodeURIComponent(productId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${bearer}`,
            "X-User-Id": user.id,
            "X-User-Role": user.role || "CLIENT",
          },
          cache: "no-store",
        }
      );

      if (res.ok) {
        return NextResponse.json({ success: true });
      }
    } catch (error) {
      console.warn("Fallback to Prisma for favorites delete:", error);
    }
  }

  try {
    await prisma.favorite.deleteMany({
      where: {
        userId: user.id,
        productId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur delete favorite:", err);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du favori." },
      { status: 500 }
    );
  }
}