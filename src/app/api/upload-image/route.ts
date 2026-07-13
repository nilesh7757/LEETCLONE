import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinaryConfig';
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { auth } from "@/auth";

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session || !session.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const formData = await req.formData();
  const file = formData.get('image') as File | null;

  if (!file) {
    throw new ApiError('No file uploaded.', 400);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to a temporary location or directly to Cloudinary
  // For direct Cloudinary upload, we can convert the buffer to a data URI or stream it.
  // Here, we'll use a data URI for simplicity.
  const base64 = buffer.toString('base64');
  const dataUri = `data:${file.type};base64,${base64}`;

  const uploadResponse = await cloudinary.uploader.upload(dataUri, {
    folder: 'tiptap_editor_images',
  });

  return NextResponse.json({ url: uploadResponse.secure_url });
});
