import cloudinary from "@/lib/cloudinaryConfig";
import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { auth } from "@/auth";

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    throw new ApiError("No file uploaded", 400);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<NextResponse>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "logiquest-avatars", // Optional: organize uploads in a folder
      },
      (error, result) => {
        if (error) {
          reject(new ApiError("Image upload failed", 500));
        } else {
          resolve(NextResponse.json({ url: result?.secure_url }));
        }
      }
    ).end(buffer);
  });
});
