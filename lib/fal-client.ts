import { fal } from "@fal-ai/client";

// Configure fal client with API key from environment
fal.config({
  credentials: process.env.FAL_KEY,
});

export interface BriaRemoveBackgroundInput {
  image_url: string;
}

export interface BriaRemoveBackgroundOutput {
  image: {
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
    width: number;
    height: number;
  };
}

/**
 * Remove background using Bria RMBG 2.0 model via fal.ai
 * This is a professional-grade model trained on licensed data
 *
 * @param imageUrl - Public URL of the image to process
 * @returns Processed image with background removed
 */
export async function removeBackgroundBria(
  imageUrl: string
): Promise<BriaRemoveBackgroundOutput> {
  console.log('[BRIA] Starting background removal with Bria RMBG 2.0');
  console.log('[BRIA] Image URL:', imageUrl);

  const startTime = Date.now();

  try {
    const result = await fal.subscribe<
      BriaRemoveBackgroundInput,
      BriaRemoveBackgroundOutput
    >(process.env.FAL_BRIA_MODEL_ID || "fal-ai/bria/background/remove", {
      input: {
        image_url: imageUrl,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          const messages = update.logs?.map(l => l.message) || [];
          if (messages.length > 0) {
            console.log('[BRIA] Processing:', messages.join(', '));
          }
        }
      },
    });

    const processingTime = Date.now() - startTime;
    console.log(`[BRIA] Background removed successfully in ${processingTime}ms`);
    console.log('[BRIA] Result image:', result.data.image.url);

    return result.data;

  } catch (error: any) {
    console.error('[BRIA] Error removing background:', error);
    throw new Error(`Bria model failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Health check for fal.ai service
 */
export async function checkFalHealth(): Promise<boolean> {
  try {
    // Simple check to see if we can initialize the client
    if (!process.env.FAL_KEY) {
      console.error('[BRIA] FAL_KEY not configured');
      return false;
    }
    console.log('[BRIA] Health check passed');
    return true;
  } catch (error) {
    console.error('[BRIA] Health check failed:', error);
    return false;
  }
}
