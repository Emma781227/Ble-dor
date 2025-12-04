import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ PUT /api/products/:id → mise à jour complète (edit)
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { name, price, category, description, imageUrl, isAvailable } = body;

    if (!name || typeof price !== "number" || !category) {
      return NextResponse.json(
        { message: "name, price (number) et category sont obligatoires" },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        category,
        description: description ?? null,
        imageUrl: imageUrl ?? null,
        isAvailable: typeof isAvailable === "boolean" ? isAvailable : true,
      },
    });

    return NextResponse.json(product, { status: 200 });
  } catch (error: any) {
    console.error("Error updating product:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Produit introuvable" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erreur serveur lors de la mise à jour du produit" },
      { status: 500 }
    );
  }
}

// ✅ PATCH /api/products/:id → mise à jour de la dispo uniquement
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { isAvailable } = body;

    if (typeof isAvailable !== "boolean") {
      return NextResponse.json(
        { message: "Le champ isAvailable (boolean) est obligatoire." },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: { isAvailable },
    });

    return NextResponse.json(product, { status: 200 });
  } catch (error: any) {
    console.error("Error updating product availability:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Produit introuvable" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erreur serveur lors de la mise à jour de la disponibilité" },
      { status: 500 }
    );
  }
}

// ✅ DELETE /api/products/:id → suppression
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.product.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Produit introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Erreur serveur lors de la suppression du produit" },
      { status: 500 }
    );
  }
}
