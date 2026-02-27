import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordOwner = await bcrypt.hash("admin123", 10);
  const passwordManager = await bcrypt.hash("manager123", 10);
  const passwordClient = await bcrypt.hash("client123", 10);

  const owner = await prisma.user.upsert({
    where: { email: "owner@bledor.local" },
    update: {},
    create: {
      name: "Propriétaire",
      email: "owner@gmail.local",
      passwordHash: passwordOwner,
      role: "OWNER",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@bledor.local" },
    update: {},
    create: {
      name: "Gérant",
      email: "manager@bledor.local",
      passwordHash: passwordManager,
      role: "MANAGER",
    },
  });

  const client = await prisma.user.upsert({
    where: { email: "client@bledor.local" },
    update: {},
    create: {
      name: "Client",
      email: "client@bledor.local",
      passwordHash: passwordClient,
      role: "CLIENT",
    },
  });

  console.log("Users created/updated:");
  console.log({ owner, manager, client });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
