import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

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
    const { email } = (await req.json()) as { email?: string };

    const goApiBaseUrl = resolveBackendApiBaseUrl();
    if (goApiBaseUrl) {
      try {
        const res = await fetch(`${goApiBaseUrl.replace(/\/$/, "")}/v1/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          cache: "no-store",
        });

        if (res.ok) {
          const payload = await res.json();
          return NextResponse.json(payload, { status: 200 });
        }
      } catch (error) {
        console.warn("Fallback to Prisma for forgot-password:", error);
      }
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email requis." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // On ne révèle pas si l'email existe ou pas (sécurité)
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message:
            "Si un compte existe avec cet email, un lien de réinitialisation a été généré.",
        },
        { status: 200 }
      );
    }

    // Supprimer les anciens tokens de reset de ce user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // +1h

    const resetToken = await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    console.log(
      "Lien de reset (à envoyer par mail):",
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken.token}`
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Si un compte existe avec cet email, un lien de réinitialisation a été généré.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erreur forgot-password:", err);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
