import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/authSession";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = session.user as any;

  if (user.role !== "CLIENT") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { name, phone, marketingOptIn } = await req.json();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      phone: phone || null,
      marketingOptIn: Boolean(marketingOptIn),
    },
  });

  return NextResponse.json({ success: true });
}
