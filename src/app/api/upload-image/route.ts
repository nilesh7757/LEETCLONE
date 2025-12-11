import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinaryConfig';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to a temporary location or directly to Cloudinary
    // For direct Cloudinary upload, we can convert the buffer to a data URI or stream it.
    // Here, we'll use a data URI for simplicity.
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;
    console.log('Attempting Cloudinary upload with dataUri:', dataUri.substring(0, 100) + '...'); // Log first 100 chars

    const uploadResponse = await cloudinary.uploader.upload(dataUri, {
      folder: 'tiptap_editor_images',
    });
    console.log('Cloudinary upload successful, response:', uploadResponse);

    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.error('Cloudinary upload error details:', error);
    return NextResponse.json(
      { error: 'Failed to upload image to Cloudinary.', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
