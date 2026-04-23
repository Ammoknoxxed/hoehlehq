// src/app/api/uploads/[filename]/route.ts
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(req: Request, context: { params: Promise<{ filename: string }> | { filename: string } }) {
  try {
    // Kompatibilität für verschiedene Next.js Versionen
    const params = await context.params; 
    const filename = params.filename;

    // Wir holen die Datei aus dem neuen, sicheren /data/uploads Ordner
    const uploadDir = join(process.cwd(), 'data', 'uploads');
    const filePath = join(uploadDir, filename);

    const fileBuffer = await readFile(filePath);
    
    // Mime-Type erraten
    let mimeType = 'image/jpeg';
    if (filename.endsWith('.png')) mimeType = 'image/png';
    if (filename.endsWith('.gif')) mimeType = 'image/gif';
    if (filename.endsWith('.webp')) mimeType = 'image/webp';
    if (filename.endsWith('.pdf')) mimeType = 'application/pdf';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('Datei nicht gefunden', { status: 404 });
  }
}