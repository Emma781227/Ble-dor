import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper pour générer un numéro de ticket lisible
function generateTicketNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  // BLE-YYYYMMDD-HHMM-rand4
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `BLE-${y}${m}${d}-${h}${min}-${rand}`;
}

// GET /api/orders → commandes du jour + items + produit
export async function GET() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  try {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /api/orders :", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la récupération des commandes" },
      { status: 500 }
    );
  }
}

// POST /api/orders → créer une commande (caisse)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      paymentMethod = "CASH",
      customerName,
      customerNote,
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "La commande doit contenir au moins un produit." },
        { status: 400 }
      );
    }

    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let total = 0;

    const orderItemsData = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Produit introuvable: ${item.productId}`);
      }
      const qty = Number(item.quantity) || 1;
      total += product.price * qty;

      return {
        productId: product.id,
        quantity: qty,
        unitPrice: product.price,
      };
    });

    const ticketNumber = generateTicketNumber();

    const order = await prisma.order.create({
      data: {
        status: "PENDING",
        paymentMethod,
        total,
        ticketNumber,
        customerName: customerName || null,
        customerNote: customerNote || null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/orders :", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la création de la commande" },
      { status: 500 }
    );
  }
}
