import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/orders/:id → changer le statut
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
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
