import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products -> liste des produits
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /api/products :", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la récupération des produits" },
      { status: 500 }
    );
  }
}

// POST /api/products -> création d'un produit
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, price, category, description, imageUrl, isAvailable } = body;

    if (!name || typeof price !== "number" || !category) {
      return NextResponse.json(
        { message: "name, price (number) et category sont obligatoires" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        category,
        description,
        imageUrl,
        isAvailable: isAvailable ?? true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/products :", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la création du produit" },
      { status: 500 }
    );
  }
}
