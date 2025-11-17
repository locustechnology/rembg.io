/**
 * Image preprocessing utilities for faster uploads and processing
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * Compress and resize image for faster upload
 * @param file - Original image file
 * @param options - Compression options
 * @returns Compressed image file
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.9,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = maxWidth;
            height = Math.round(width / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(height * aspectRatio);
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Create new file from blob
            const compressedFile = new File([blob], file.name, {
              type: format,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          format,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Check if image needs compression based on file size
 * @param file - Image file
 * @param maxSize - Maximum file size in bytes (default: 5MB)
 * @returns true if compression is recommended
 */
export function shouldCompressImage(file: File, maxSize: number = 5 * 1024 * 1024): boolean {
  return file.size > maxSize;
}

/**
 * Get optimized compression settings based on file size
 * @param fileSize - File size in bytes
 * @returns Compression options
 */
export function getOptimalCompressionSettings(fileSize: number): ImageCompressionOptions {
  // File size thresholds
  const LARGE = 10 * 1024 * 1024; // 10MB
  const MEDIUM = 5 * 1024 * 1024; // 5MB

  if (fileSize > LARGE) {
    // Aggressive compression for large files
    return {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.8,
      format: 'image/jpeg',
    };
  } else if (fileSize > MEDIUM) {
    // Moderate compression for medium files
    return {
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 0.85,
      format: 'image/jpeg',
    };
  } else {
    // Light compression for smaller files
    return {
      maxWidth: 2560,
      maxHeight: 2560,
      quality: 0.9,
      format: 'image/jpeg',
    };
  }
}
