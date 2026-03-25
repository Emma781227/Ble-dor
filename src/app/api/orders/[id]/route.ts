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

// PATCH /api/orders/:id → changer le statut
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const user = session.user as any;
    const bearer = createBackendJwt(user);

    const { id } = await context.params;
    const body = await req.json();
    const { status } = body;

    const allowedStatuses = [
      "PENDING",
      "PREPARATION",
      "READY",
      "DELIVERED",
      "CANCELED",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Statut invalide." },
        { status: 400 }
      );
    }

    const goApiBaseUrl = resolveBackendApiBaseUrl();
    if (goApiBaseUrl) {
      try {
        const res = await fetch(
          `${goApiBaseUrl.replace(/\/$/, "")}/v1/orders/${encodeURIComponent(id)}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${bearer}`,
              "X-User-Id": user.id,
              "X-User-Role": user.role,
            },
            body: JSON.stringify({ status }),
            cache: "no-store",
          }
        );

        if (res.ok) {
          const payload = await res.json();
          return NextResponse.json(payload, { status: 200 });
        }
      } catch (error) {
        console.warn("Fallback to Prisma for order status update:", error);
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Erreur PATCH /api/orders/[id] :", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Commande introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Erreur serveur lors de la mise à jour de la commande" },
      { status: 500 }
    );
  }
}
