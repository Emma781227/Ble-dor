import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function resolveBackendApiBaseUrl(): string | null {
  if (process.env.BACKEND_API_URL) {
    return process.env.BACKEND_API_URL;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:8080";
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, email, phone, password } = body as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
    };

    const goApiBaseUrl = resolveBackendApiBaseUrl();
    if (goApiBaseUrl) {
      try {
        const res = await fetch(`${goApiBaseUrl.replace(/\/$/, "")}/v1/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, password }),
          cache: "no-store",
        });

        if (res.ok) {
          const payload = await res.json();
          return NextResponse.json(payload, { status: 201 });
        }
      } catch (error) {
        console.warn("Fallback to Prisma for auth register:", error);
      }
    }

    // Validation basique
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe sont obligatoires." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // sécurité minimale : éviter email vide après trim
    if (!normalizedEmail) {
      return NextResponse.json(
        { error: "L'email est invalide." },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 400 }
      );
    }

    // Mot de passe trop court (au cas où le front ne le bloque pas)
    if (!password || password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Le mot de passe doit contenir au moins 6 caractères.",
        },
        { status: 400 }
      );
    }

    // Hash du mot de passe
    const hashed = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
        phone: phone?.trim() || null,
        passwordHash: hashed,
        role: "CLIENT", // par défaut, on inscrit des clients
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: newUser,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Erreur register API:", err);
    return NextResponse.json(
      { error: "Erreur serveur pendant l'inscription." },
      { status: 500 }
    );
  }
}
