import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getAuthenticatedUser } from '../../../lib/serverAuth';

const ALLOWED_MIME_TYPES: Record<string, { maxBytes: number; ext: string }> = {
  // Images (Up to 15MB)
  'image/jpeg': { maxBytes: 15 * 1024 * 1024, ext: 'jpg' },
  'image/png': { maxBytes: 15 * 1024 * 1024, ext: 'png' },
  'image/webp': { maxBytes: 15 * 1024 * 1024, ext: 'webp' },
  'image/gif': { maxBytes: 15 * 1024 * 1024, ext: 'gif' },
  'image/svg+xml': { maxBytes: 5 * 1024 * 1024, ext: 'svg' },

  // Video (Up to 50MB)
  'video/mp4': { maxBytes: 50 * 1024 * 1024, ext: 'mp4' },
  'video/webm': { maxBytes: 50 * 1024 * 1024, ext: 'webm' },
  'video/quicktime': { maxBytes: 50 * 1024 * 1024, ext: 'mov' },

  // Audio (Up to 25MB)
  'audio/mpeg': { maxBytes: 25 * 1024 * 1024, ext: 'mp3' },
  'audio/mp3': { maxBytes: 25 * 1024 * 1024, ext: 'mp3' },
  'audio/wav': { maxBytes: 25 * 1024 * 1024, ext: 'wav' },
  'audio/ogg': { maxBytes: 25 * 1024 * 1024, ext: 'ogg' },
};

/**
 * Validates file signature / magic bytes against declared MIME type
 */
function validateFileSignature(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 8) return false;

  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }
  if (mimeType === 'image/gif') {
    return buffer.toString('ascii', 0, 4) === 'GIF8';
  }
  if (mimeType === 'image/webp') {
    return buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  }
  if (mimeType === 'video/mp4' || mimeType === 'video/quicktime') {
    // MP4/MOV container contains 'ftyp' in first 32 bytes
    const headerStr = buffer.slice(0, 32).toString('latin1');
    return headerStr.includes('ftyp') || headerStr.includes('moov');
  }

  // Permissive fallback for SVG, webm, audio
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Handle External URL Registration via JSON
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { externalUrl, type, title } = body;

      if (!externalUrl || typeof externalUrl !== 'string') {
        return NextResponse.json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'externalUrl is required.' }
        }, { status: 400 });
      }

      // Validate URL syntax
      try {
        const parsed = new URL(externalUrl);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return NextResponse.json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Invalid URL protocol. Must be http or https.' }
          }, { status: 400 });
        }
      } catch (e) {
        return NextResponse.json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid URL format.' }
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        url: externalUrl,
        isExternal: true,
        type: type || 'video',
        title: title || 'External Portfolio Asset',
        message: 'External media URL registered successfully.'
      });
    }

    // Handle File Upload via Multipart Form Data
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Request must be multipart/form-data or application/json.' }
      }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'No file provided in form data.' }
      }, { status: 400 });
    }

    const mimeType = file.type.toLowerCase();
    const allowedConfig = ALLOWED_MIME_TYPES[mimeType];

    if (!allowedConfig) {
      return NextResponse.json({
        success: false,
        error: { 
          code: 'UNSUPPORTED_MEDIA_TYPE', 
          message: `MIME type "${mimeType}" is not supported. Supported types: JPEG, PNG, WebP, GIF, SVG, MP4, WebM, MOV, MP3, WAV.` 
        }
      }, { status: 415 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > allowedConfig.maxBytes) {
      return NextResponse.json({
        success: false,
        error: { 
          code: 'PAYLOAD_TOO_LARGE', 
          message: `File size (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds limit of ${(allowedConfig.maxBytes / (1024 * 1024)).toFixed(0)}MB for ${mimeType}.` 
        }
      }, { status: 413 });
    }

    // Validate signature
    if (!validateFileSignature(buffer, mimeType)) {
      return NextResponse.json({
        success: false,
        error: { 
          code: 'SIGNATURE_MISMATCH', 
          message: `File content magic bytes do not match declared MIME type ${mimeType}.` 
        }
      }, { status: 400 });
    }

    // Save to public/uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeRand = crypto.randomBytes(8).toString('hex');
    const filename = `gc_${Date.now()}_${safeRand}.${allowedConfig.ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      mimeType,
      sizeBytes: buffer.length,
      message: 'Media asset uploaded and persisted successfully.'
    }, { status: 201 });

  } catch (err: any) {
    console.error('Upload processing error:', err);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'File upload failed.' }
    }, { status: 500 });
  }
}
