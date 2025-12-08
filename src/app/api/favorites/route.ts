import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/authSession";

export async function GET() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = session.user as any;

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
  const { productId } = (await req.json()) as { productId?: string };

  if (!productId) {
    return NextResponse.json(
      { error: "productId requis" },
      { status: 400 }
    );
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
