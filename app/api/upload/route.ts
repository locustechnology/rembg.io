import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

/**
 * Upload API endpoint
 * Uploads image to Vercel Blob storage and returns a public URL
 * This URL is then used by the Bria API to process the image
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type",
          details: "Only JPEG, PNG, and WebP images are supported",
          receivedType: file.type
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "File too large",
          details: "Maximum file size is 10MB",
          fileSize: file.size,
          maxSize: MAX_FILE_SIZE
        },
        { status: 400 }
      );
    }

    console.log('[UPLOAD] Uploading file:', file.name, `(${(file.size / 1024).toFixed(2)}KB)`);

    // Upload to Vercel Blob
    // Note: Make sure BLOB_READ_WRITE_TOKEN is set in environment variables
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    console.log('[UPLOAD] File uploaded successfully:', blob.url);

    return NextResponse.json({
      url: blob.url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

  } catch (error: any) {
    console.error('[UPLOAD] Upload failed:', error);

    // Check if it's a Vercel Blob configuration error
    if (error.message?.includes('BLOB_READ_WRITE_TOKEN')) {
      return NextResponse.json(
        {
          error: "Upload service not configured",
          details: "Vercel Blob storage is not properly configured. Please contact support.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Upload failed",
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check upload service health
 */
export async function GET() {
  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;

  return NextResponse.json({
    status: hasToken ? "ready" : "not_configured",
    message: hasToken
      ? "Upload service is ready"
      : "BLOB_READ_WRITE_TOKEN not configured",
  });
}
