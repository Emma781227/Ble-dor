import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/authSession";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non authentifié." },
        { status: 401 }
      );
    }

    const user = session.user as any;

    if (user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Réservé aux clients." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { items, customerName, customerNote } = body as {
      items: { productId: string; quantity: number }[];
      customerName: string;
      customerNote?: string;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Aucun article dans la commande." },
        { status: 400 }
      );
    }

    if (!customerName || !customerName.trim()) {
      return NextResponse.json(
        { error: "Nom client requis." },
        { status: 400 }
      );
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length === 0) {
      return NextResponse.json(
        { error: "Produits introuvables." },
        { status: 400 }
      );
    }

    const orderItemsData = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error("Produit introuvable dans la base.");
      }

      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    });

    const total = orderItemsData.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const ticketNumber = `T-${Date.now()}`;

    const order = await prisma.order.create({
      data: {
        status: "PENDING",
        paymentMethod: "CASH", // ou un statut spécifique si tu en ajoutes un
        total,
        ticketNumber,
        customerName,
        customerNote: customerNote || null,
        items: {
          create: orderItemsData,
        },
        // on peut stocker l'user si tu as userId dans Order
        // customerId: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        ticketNumber: order.ticketNumber,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Erreur création commande depuis panier:", err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création de la commande." },
      { status: 500 }
    );
  }
}
