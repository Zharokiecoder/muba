import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "ADMIN" && decoded.role !== "SELLER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, description, price, stock, category, image } = await req.json();

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock,
        category,
        image,
        sellerId: decoded.id,
      },
    });

    return NextResponse.json({ message: "Product created", product });
  } catch (err) {
    console.error("Product creation error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (err) {
    console.error("Fetch products error:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
