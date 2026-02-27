import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/authSession";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  const session = await getAuthSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = session.user as any;

  // ✅ En Next.js 16, params est une Promise
  const { productId } = await context.params;

  if (!productId) {
    return NextResponse.json(
      { error: "productId manquant" },
      { status: 400 }
    );
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