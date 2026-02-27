import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/authSession";
import bcrypt from "bcryptjs";

/**
 * Vérifie que l'utilisateur connecté est OWNER.
 * Retourne l'utilisateur (session.user) si OK, sinon null.
 */
async function ensureOwner() {
  const session = await getAuthSession();
  if (!session || !session.user || (session.user as any).role !== "OWNER") {
    return null;
  }
  return session.user as any;
}

/**
 * ✅ Next.js 16: context.params est une Promise
 * Donc on typpe context comme: { params: Promise<{ id: string }> }
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const owner = await ensureOwner();
  if (!owner) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // ✅ On "unwrap" params avec await (obligatoire en Next 16)
  const { id: managerId } = await context.params;

  if (!managerId) {
    return NextResponse.json(
      { error: "ID du manager manquant." },
      { status: 400 }
    );
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

    // On prépare un objet "data" propre pour prisma.user.update
    const updateData: any = {
      name: name === undefined ? undefined : name?.toString().trim() || null,
      phone: phone === undefined ? undefined : phone?.toString().trim() || null,
    };

    if (email !== undefined) {
      const normalizedEmail = email?.toLowerCase().trim();
      if (!normalizedEmail) {
        return NextResponse.json(
          { error: "Email invalide." },
          { status: 400 }
        );
      }
      updateData.email = normalizedEmail;
    }

    // Si un mot de passe est fourni, on le hash
    if (password && password.length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Le mot de passe doit contenir au moins 6 caractères." },
          { status: 400 }
        );
      }
      const hash = await bcrypt.hash(password, 10);
      updateData.passwordHash = hash;
    }

    const updated = await prisma.user.update({
      where: { id: managerId },
      data: updateData,
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
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        createdAt: updated.createdAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur PUT /api/owner/managers/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour du manager." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const owner = await ensureOwner();
  if (!owner) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // ✅ pareil: params est une Promise
  const { id: managerId } = await context.params;

  if (!managerId) {
    return NextResponse.json(
      { error: "ID du manager manquant." },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({
      where: { id: managerId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erreur DELETE /api/owner/managers/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression du manager." },
      { status: 500 }
    );
  }
}