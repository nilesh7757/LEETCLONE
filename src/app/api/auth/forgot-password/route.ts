import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal user existence
      return NextResponse.json({ message: "If an account exists, a reset email has been sent." });
    }

    // Generate Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires }
    });

    try {
        await sendPasswordResetEmail(email, resetToken);
    } catch (error) {
        console.error("Email send error:", error);
    }

    return NextResponse.json({ message: "If an account exists, a reset email has been sent." });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
