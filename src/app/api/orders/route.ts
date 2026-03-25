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

// GET /api/orders → commandes du jour + items + produit
function generateTicketNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `BLE-${y}${m}${d}-${h}${min}-${rand}`;
}

export async function GET() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }

  const user = session.user as any;
  const bearer = createBackendJwt(user);
  const goApiBaseUrl = resolveBackendApiBaseUrl();

  if (goApiBaseUrl) {
    try {
      const res = await fetch(`${goApiBaseUrl.replace(/\/$/, "")}/v1/orders`, {
        headers: {
          Authorization: `Bearer ${bearer}`,
          "X-User-Id": user.id,
          "X-User-Role": user.role,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const payload = await res.json();
        return NextResponse.json(payload, { status: 200 });
      }
    } catch (error) {
      console.warn("Fallback to Prisma for orders list:", error);
    }
  }

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (user.role === "CLIENT") {
    const clientOrders = await prisma.order.findMany({
      where: { clientId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: true } },
      },
    });

    return NextResponse.json(clientOrders, { status: 200 });
  }

  if (user.role === "MANAGER" || user.role === "OWNER") {
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: true } },
      },
    });

    return NextResponse.json(todayOrders, { status: 200 });
  }

  return NextResponse.json([], { status: 200 });
}

// POST /api/orders → créer une commande (V1 simple)
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    const user = session?.user as any;
    const bearer = user?.id ? createBackendJwt(user) : "";

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

    const goApiBaseUrl = resolveBackendApiBaseUrl();
    if (goApiBaseUrl) {
      try {
        const res = await fetch(`${goApiBaseUrl.replace(/\/$/, "")}/v1/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
            "X-User-Id": user?.id || "",
            "X-User-Role": user?.role || "",
          },
          body: JSON.stringify({
            items,
            paymentMethod,
            customerName,
            customerNote,
          }),
          cache: "no-store",
        });

        if (res.ok) {
          const payload = await res.json();
          return NextResponse.json(payload, { status: 201 });
        }
      } catch (error) {
        console.warn("Fallback to Prisma for order creation:", error);
      }
    }

    const managerId: string | undefined = user?.id;

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
        managerId: managerId ?? null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
        manager: true,
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

