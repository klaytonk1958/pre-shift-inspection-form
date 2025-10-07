'use server';

import { getGoogleServices } from "@/app/utils/google";
import { Buffer } from "buffer";
import { Readable } from "stream";

export async function uploadImage(picture: File): Promise<string> {
  const { drive } = await getGoogleServices();

  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) throw new Error('Google Drive folder ID is not configured');

    // ✅ Convert web File -> Node Readable Stream
    const arrayBuffer = await picture.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const stream = Readable.from(buffer);

    const { data } = await drive.files.create({
      requestBody: {
        name: `image-${Date.now()}`,
        parents: [folderId],
      },
      media: {
        mimeType: picture.type,
        body: stream, // ✅ proper stream with .pipe()
      },
      fields: 'id, webViewLink',
            supportsAllDrives: true,
    });

    if (!data.webViewLink) throw new Error('Failed to get file link');

    // Make file public
    await drive.permissions.create({
      fileId: data.id!,
      requestBody: { role: 'reader', type: 'anyone' },
            supportsAllDrives: true,
    });

    return data.webViewLink;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
}
