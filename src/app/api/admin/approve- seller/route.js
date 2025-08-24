// src/app/api/admin/approve-seller/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    // 1. Check auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 3. Ensure user is ADMIN
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // 4. Get seller ID from body
    const { sellerId } = await req.json();

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
    }

    const seller = await prisma.user.findUnique({ where: { id: sellerId } });

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    if (seller.role !== "SELLER") {
      return NextResponse.json({ error: "User is not a seller" }, { status: 400 });
    }

    // 5. Approve seller
    const updatedSeller = await prisma.user.update({
      where: { id: sellerId },
      data: {
        status: "APPROVED",
        isApproved: true,
      },
    });

    return NextResponse.json({
      message: "Seller approved successfully",
      seller: updatedSeller,
    });
  } catch (error) {
    console.error("Error approving seller:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
