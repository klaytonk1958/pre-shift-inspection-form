import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/app/utils/upload';

export const runtime = 'nodejs'; // 👈 ensure Node APIs like Buffer and streams are available

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const url = await uploadImage(file); // 👈 pass the web File to server util
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
