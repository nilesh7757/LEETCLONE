import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { profileUpdateSchema } from "@/lib/validations";

export const PUT = apiHandler(async (req: Request) => {
  const session = await auth();

  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const body = await req.json();
  const validation = profileUpdateSchema.safeParse(body);
  if (!validation.success) {
    throw new ApiError(validation.error.issues[0].message, 400);
  }

  const { name, bio, website, description, image, skills } = validation.data;

  const updatedUser = await prisma.user.update({
    where: { email: session.user.email as string },
    data: {
      name,
      bio,
      website,
      description,
      image,
      skills: Array.isArray(skills) ? skills : undefined,
    },
  });

  return NextResponse.json(updatedUser);
});
