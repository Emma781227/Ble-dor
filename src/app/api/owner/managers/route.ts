import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/authSession";
import bcrypt from "bcryptjs";

// Petit helper pour sécuriser : seul OWNER a accès
async function ensureOwner() {
  const session = await getAuthSession();

  if (!session || !session.user) {
    return null;
  }

  const user = session.user as any;
  if (user.role !== "OWNER") {
    return null;
  }

  return user;
}

// 🔹 GET /api/owner/managers
// -> retourne la liste des managers pour le front
export async function GET() {
  const owner = await ensureOwner();
  if (!owner) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const managers = await prisma.user.findMany({
      where: { role: "MANAGER" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    const payload = managers.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      createdAt: m.createdAt.toISOString(),
    }));

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /api/owner/managers:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des managers." },
      { status: 500 }
    );
  }
}

// 🔹 POST /api/owner/managers
// -> création d'un nouveau manager
export async function POST(req: NextRequest) {
  const owner = await ensureOwner();
  if (!owner) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const {
      name,
      email,
      phone,
      password,
    }: {
      name?: string | null;
      email?: string;
      phone?: string | null;
      password?: string;
    } = body;

    // ✅ Validation basique
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe sont requis." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Vérifier si l'utilisateur existe déjà
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Un utilisateur existe déjà avec cet email." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères." },
        { status: 400 }
      );
    }

    // Hash du mot de passe
    const hash = await bcrypt.hash(password, 10);

    // Création du manager
    const manager = await prisma.user.create({
      data: {
        name: name?.toString().trim() || null,
        email: normalizedEmail,
        phone: phone?.toString().trim() || null,
        passwordHash: hash,
        role: "MANAGER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        id: manager.id,
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        createdAt: manager.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur POST /api/owner/managers:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création du manager." },
      { status: 500 }
    );
  }
}
                                                                                                                            