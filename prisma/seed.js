import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- Create Admin User ---
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
      status: "APPROVED",
      isApproved: true,
    },
  });

  // --- Create Seller User ---
  const sellerPassword = await bcrypt.hash("seller123", 10);
  const seller = await prisma.user.upsert({
    where: { email: "seller@test.com" },
    update: {},
    create: {
      email: "seller@test.com",
      password: sellerPassword,
      name: "Seller User",
      role: "SELLER",
      status: "APPROVED",
      isApproved: true,
    },
  });

  // --- Create Shop for Seller ---
  const shop = await prisma.shop.upsert({
    where: { id: "shop-1" },
    update: {},
    create: {
      id: "shop-1",
      name: "Demo Shop",
      ownerId: seller.id,
    },
  });

  // --- Create Sample Products ---
  await prisma.product.createMany({
    data: [
      {
        name: "Laptop Pro",
        description: "High-performance laptop for work & gaming",
        price: 1200,
        stock: 10,
        category: "Electronics",
        sellerId: seller.id,
        image: "https://via.placeholder.com/300",
      },
      {
        name: "Wireless Headphones",
        description: "Noise-cancelling headphones with 20h battery",
        price: 150,
        stock: 25,
        category: "Accessories",
        sellerId: seller.id,
        image: "https://via.placeholder.com/300",
      },
    ],
  });

  console.log("✅ Seeding finished!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
