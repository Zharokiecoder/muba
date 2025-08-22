import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();

    // check if email exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // auto-approve buyers, sellers need approval
    const isApproved = role === "BUYER" ? true : false;

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, isApproved },
    });

    return NextResponse.json({
      message: "Signup successful",
      user: { id: user.id, email: user.email, role: user.role, isApproved: user.isApproved }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
