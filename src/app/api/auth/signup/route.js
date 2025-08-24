import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();

    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // set defaults based on role
    let status;
    let isApproved;

    if (role === "BUYER") {
      status = "APPROVED";
      isApproved = true;
    } else if (role === "SELLER") {
      status = "PENDING";
      isApproved = false;
    } else if (role === "ADMIN") {
      // admin auto-approved
      status = "APPROVED";
      isApproved = true;
    } else {
      return NextResponse.json(
        { error: "Invalid role provided" },
        { status: 400 }
      );
    }

    // create new user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, status, isApproved },
    });

    return NextResponse.json(
      { message: "User registered successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}
