import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { password: passwordHash, role: "ADMIN" },
      create: { email: adminEmail, password: passwordHash, role: "ADMIN" },
    });
    console.log(`Utente admin pronto: ${adminEmail}`);
  } else {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD non impostate in .env: nessun utente admin creato.");
  }

  const defaultCategories = ["Eventi", "Feste"];
  for (const name of defaultCategories) {
    const slug = name.toLowerCase();
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }
  console.log("Categorie di base pronte:", defaultCategories.join(", "));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
