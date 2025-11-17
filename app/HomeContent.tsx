"use client";

import { useRef, useState, useEffect } from "react";
import { removeBackground } from "@imgly/background-removal";
import { useSession } from "@/lib/auth-client";
import { useAuthStore } from "@/lib/store";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { compressImage, shouldCompressImage, getOptimalCompressionSettings } from "@/lib/imageUtils";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import LogoMarquee from "@/components/LogoMarquee";
import HowItWorks from "@/components/HowItWorks";
import ShowcaseSection from "@/components/ShowcaseSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FeaturesDetailSection from "@/components/FeaturesDetailSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

type DownloadFileType = "image/png" | "image/webp";
type ModelPrecision = "isnet" | "isnet_fp16" | "isnet_quint8";

// Credit costs for different models
const CREDIT_COST_FREE = 0; // ISNet free model
const CREDIT_COST_BRIA = 2; // Bria RMBG 2.0 Superior model

// Legacy credit cost calculation (not used with new dual-model system)
const calculateCreditCost = (fileSize: number): number => {
  const TWO_MB = 2 * 1024 * 1024;
  return fileSize >= TWO_MB ? 3 : 1; // 3 credits for high-res, 1 for low-res
};

export default function HomeContent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [outputFileURL, setOutputFileURL] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [briaProcessing, setBriaProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [currentStatus, setCurrentStatus] = useState<string>("Processing...");
  const [modelPrecision, setModelPrecision] = useState<ModelPrecision>("isnet_fp16");
  const [imageDownloadType, setImageDownloadType] = useState<DownloadFileType>("image/png");
  const [quality, setQuality] = useState<number>(100);
  const [isModelCached, setIsModelCached] = useState<boolean>(false);

  // Auth and credits
  const { data: session } = useSession();
  const { credits, deductCredits, fetchCredits } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if model is cached on component mount and preload if not cached
  useEffect(() => {
    const cached = sessionStorage.getItem('rembg_model_cached');
    if (cached === 'true') {
      setIsModelCached(true);
    } else {
      // Preload model in background after a short delay (to not block initial page load)
      const preloadTimeout = setTimeout(() => {
        preloadModel();
      }, 2000); // Wait 2 seconds after page load

      return () => clearTimeout(preloadTimeout);
    }
  }, []);

  // Preload model in background
  const preloadModel = async () => {
    try {
      console.log('[PRELOAD] Starting background model preload');

      // Create a tiny 1x1 transparent image for model initialization
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Create blob from canvas
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
        }, 'image/png');
      });

      const dummyFile = new File([blob], 'preload.png', { type: 'image/png' });

      // Trigger model download (but don't process)
      await removeBackground(dummyFile, {
        progress: (key: string, current: number, total: number) => {
          if (key.includes("fetch") && current === total) {
            console.log('[PRELOAD] Model preloaded successfully');
            sessionStorage.setItem('rembg_model_cached', 'true');
            setIsModelCached(true);
          }
        },
        model: modelPrecision,
        output: {
          format: 'image/png',
          quality: 0.8,
        },
      });

      console.log('[PRELOAD] Model preload complete');
    } catch (error) {
      console.log('[PRELOAD] Preload failed (non-critical):', error);
      // Fail silently - user can still use the app
    }
  };

  // No ONNX configuration needed - library handles this via publicPath in removeBackground options

  // Handle payment success/cancel
  useEffect(() => {
    const payment = searchParams.get("payment");
    const planId = searchParams.get("planId");

    if (payment === "success" && planId && session?.user) {
      // Payment successful - verify and add credits with polling
      const handlePaymentSuccess = async () => {
        const toastId = toast.loading("Payment successful! Verifying and adding credits...");
        const startBalance = useAuthStore.getState().credits; // Capture current balance from store
        let pollCount = 0;
        const MAX_POLLS = 15; // Poll for 30 seconds (15 x 2 seconds)
        let verificationAttempted = false;

        console.log('[PAYMENT] Starting payment verification process. Current balance:', startBalance);

        // STEP 1: Try to verify and add credits immediately
        try {
          const response = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId }),
          });

          verificationAttempted = true;

          if (response.ok) {
            const data = await response.json();
            console.log(`[PAYMENT] Immediate verification successful: ${data.creditsAdded} credits added`);

            // Fetch updated balance
            await fetchCredits();

            toast.success(`Success! ${data.creditsAdded} credits added. You now have ${data.newBalance} credits.`, {
              id: toastId,
              duration: 5000,
            });

            // Clean up URL and exit
            setTimeout(() => {
              router.replace("/");
            }, 2000);
            return; // Exit early if immediate verification worked
          } else if (response.status === 404) {
            console.log('[PAYMENT] No pending purchase found - may have been processed by webhook already');
          } else {
            const error = await response.json();
            console.error('[PAYMENT] Verification failed:', error);
          }
        } catch (error) {
          console.error('[PAYMENT] Immediate verification error:', error);
        }

        // STEP 2: If immediate verification didn't work, start polling for webhook processing
        console.log('[PAYMENT] Starting polling for webhook-processed credits...');
        toast.loading("Waiting for payment processing... This may take a few seconds.", {
          id: toastId,
        });

        // Poll every 2 seconds to check if credits have been added
        pollIntervalRef.current = setInterval(async () => {
          pollCount++;
          console.log(`[PAYMENT] Poll #${pollCount}: Checking for credit updates...`);

          // Fetch current balance
          await fetchCredits();
          const currentCredits = useAuthStore.getState().credits;

          // Check if credits have increased
          if (currentCredits > startBalance) {
            const creditsAdded = currentCredits - startBalance;
            console.log(`[PAYMENT] Credits detected! Added ${creditsAdded} credits (${startBalance} → ${currentCredits})`);

            toast.success(`Payment processed! ${creditsAdded} credits added. You now have ${currentCredits} credits.`, {
              id: toastId,
              duration: 5000,
            });

            // Stop polling
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }

            // Clean up URL
            setTimeout(() => {
              router.replace("/");
            }, 2000);
            return;
          }

          // If we've polled for 30 seconds without success, give up
          if (pollCount >= MAX_POLLS) {
            console.warn('[PAYMENT] Polling timeout - credits not detected after 30 seconds');

            toast.warning("Payment verification is taking longer than expected. Your credits may appear shortly. Please refresh the page in a moment.", {
              id: toastId,
              duration: 7000,
            });

            // Stop polling
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }

            // Clean up URL
            setTimeout(() => {
              router.replace("/");
            }, 3000);
          }
        }, 2000); // Poll every 2 seconds

      };

      handlePaymentSuccess();
    } else if (payment === "cancelled") {
      toast.info("Payment cancelled. You can try again anytime!");
      router.replace("/");
    }

    // Cleanup function
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [searchParams, session, router, fetchCredits]);

  // Calculate credit cost for current file
  const creditCost = inputFile ? calculateCreditCost(inputFile.size) : 0;
  const fileSizeMB = inputFile ? (inputFile.size / (1024 * 1024)).toFixed(2) : "0";

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const resetUpload = () => {
    setInputFile(null);
    setOutputFileURL("");
    setErrorMsg("");
    setProgress(0);
  };

  const removeBackgroundLocal = async (): Promise<void> => {
    // Free model - no authentication or credits required
    if (!inputFile) {
      setErrorMsg("Please upload an image first");
      return;
    }

    setProcessing(true);
    setErrorMsg("");
    setOutputFileURL("");
    setProgress(0);

    try {
      // Process the image FIRST (before deducting credits)
      console.log('[DEBUG] Starting background removal process');
      console.log('[DEBUG] Input file:', {
        name: inputFile.name,
        size: inputFile.size,
        type: inputFile.type
      });

      console.log('[DEBUG] Calling removeBackground with File object directly');
      console.log('[DEBUG] File details:', {
        name: inputFile.name,
        type: inputFile.type,
        size: inputFile.size
      });

      const blob = await removeBackground(inputFile, {
        // Use default IMG.LY CDN for models (https://staticimgly.com)
        progress: (key: string, current: number, total: number) => {
          console.log('[DEBUG] Progress:', key, current, total);
          if (key.includes("fetch")) {
            // Only show "Fetching model..." if model is not cached
            if (!isModelCached) {
              setCurrentStatus("Loading AI model (one-time download)...");
            } else {
              setCurrentStatus("Initializing...");
            }
            // Mark model as cached after first fetch
            if (!isModelCached && current === total) {
              sessionStorage.setItem('rembg_model_cached', 'true');
              setIsModelCached(true);
            }
          }
          if (key.includes("compute")) {
            setProgress(Math.round((current / total) * 100));
            setCurrentStatus("Processing...");
          }
        },
        model: modelPrecision,
        output: {
          format: imageDownloadType,
          quality: quality / 100,
        },
      });

      console.log('[DEBUG] Background removed successfully');

      // Free model - no credit deduction needed
      const url = URL.createObjectURL(blob);
      setOutputFileURL(url);
      setCurrentStatus('Success! Free model used - no credits charged');
    } catch (error) {
      // Log the full error for debugging
      console.error('[DEBUG] Background removal error:', error);
      console.error('[DEBUG] Error type:', typeof error);
      console.error('[DEBUG] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

      // Provide detailed error messages
      let errorMessage = "Error removing background: ";

      if (error instanceof Error) {
        const errMsg = error.message.toLowerCase();

        if (errMsg.includes("fetch") || errMsg.includes("network")) {
          errorMessage += "Failed to load AI model. Please check your internet connection and try again.";
        } else if (errMsg.includes("memory") || errMsg.includes("allocation")) {
          errorMessage += "Image too large for processing. Try a smaller image or use lower quality settings.";
        } else if (errMsg.includes("format") || errMsg.includes("decode")) {
          errorMessage += "Unsupported or corrupted image format. Please try a different image (PNG, JPG, or WebP).";
        } else if (errMsg.includes("cors") || errMsg.includes("cross-origin")) {
          errorMessage += "Security policy error. Please refresh the page and try again.";
        } else if (errMsg.includes("wasm") || errMsg.includes("module")) {
          errorMessage += "Failed to initialize processing engine. Please refresh the page.";
        } else {
          errorMessage += error.message || "Unknown error occurred. Please try again.";
        }
      } else {
        errorMessage += "Unknown error occurred. Please try again with a different image.";
      }

      setErrorMsg(errorMessage);
      console.error("Background removal error:", error);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const removeBackgroundBria = async (): Promise<void> => {
    // Check if user is logged in
    if (!session?.user) {
      setErrorMsg("Please sign in to use the Superior Bria model");
      toast.error("Login required for Superior model");
      return;
    }

    if (!inputFile) {
      setErrorMsg("Please upload an image first");
      return;
    }

    // Check if user has enough credits
    if (credits < CREDIT_COST_BRIA) {
      setErrorMsg(
        `Insufficient credits. Bria Superior model requires ${CREDIT_COST_BRIA} credits, but you only have ${credits}. Please purchase more credits.`
      );
      toast.error(`Need ${CREDIT_COST_BRIA} credits (you have ${credits})`);
      return;
    }

    setBriaProcessing(true);
    setErrorMsg("");
    setOutputFileURL("");
    setProgress(0);

    try {
      console.log('[BRIA] Starting Superior model background removal');

      // 1. Compress image if needed (for faster upload)
      let fileToUpload = inputFile;
      if (shouldCompressImage(inputFile)) {
        setCurrentStatus("Optimizing image...");
        console.log('[BRIA] Compressing image for faster upload');
        const compressionSettings = getOptimalCompressionSettings(inputFile.size);
        fileToUpload = await compressImage(inputFile, compressionSettings);
        console.log('[BRIA] Image compressed:', {
          original: inputFile.size,
          compressed: fileToUpload.size,
          reduction: `${Math.round((1 - fileToUpload.size / inputFile.size) * 100)}%`
        });
      }

      setCurrentStatus("Uploading image...");

      // 2. Upload image to get public URL
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.details || 'Failed to upload image');
      }

      const { url: imageUrl } = await uploadResponse.json();
      console.log('[BRIA] Image uploaded:', imageUrl);

      // 3. Process with Bria Superior model
      setCurrentStatus("Processing with Superior AI model...");
      setProgress(50);

      const briaResponse = await fetch('/api/background-removal/bria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          fileName: inputFile.name,
          fileSize: inputFile.size,
        }),
      });

      if (!briaResponse.ok) {
        const error = await briaResponse.json();

        // Handle insufficient credits error specifically
        if (briaResponse.status === 402) {
          throw new Error(error.message || 'Insufficient credits');
        }

        throw new Error(error.details || 'Bria processing failed');
      }

      const result = await briaResponse.json();
      console.log('[BRIA] Processing successful:', result);

      // 3. Download processed image as blob
      setCurrentStatus("Downloading result...");
      setProgress(90);

      const imageResponse = await fetch(result.imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to download processed image');
      }

      const blob = await imageResponse.blob();
      const blobUrl = URL.createObjectURL(blob);

      setOutputFileURL(blobUrl);
      setCurrentStatus(`Success! ${CREDIT_COST_BRIA} credits used`);
      setProgress(100);

      // Update credits in store
      await fetchCredits();

      console.log('[BRIA] Background removed successfully');
      toast.success(
        `Superior quality! ${CREDIT_COST_BRIA} credits used. New balance: ${result.newBalance} credits`,
        { duration: 5000 }
      );

    } catch (error: any) {
      console.error('[BRIA] Error:', error);

      let errorMessage = `Error with Superior model: ${error.message}`;

      // Provide helpful error messages
      if (error.message.includes('upload')) {
        errorMessage = "Failed to upload image. Please check your internet connection and try again.";
      } else if (error.message.includes('credits')) {
        errorMessage = error.message; // Use the specific credit error message
      } else if (error.message.includes('configured')) {
        errorMessage = "Superior model is temporarily unavailable. Please try the free model or contact support.";
      }

      setErrorMsg(errorMessage);
      toast.error(errorMessage, { duration: 7000 });
    } finally {
      setBriaProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <Navbar />
      <HeroSection
        fileInputRef={fileInputRef}
        inputFile={inputFile}
        setInputFile={setInputFile}
        outputFileURL={outputFileURL}
        processing={processing}
        briaProcessing={briaProcessing}
        errorMsg={errorMsg}
        progress={progress}
        currentStatus={currentStatus}
        modelPrecision={modelPrecision}
        setModelPrecision={setModelPrecision}
        imageDownloadType={imageDownloadType}
        setImageDownloadType={setImageDownloadType}
        quality={quality}
        setQuality={setQuality}
        handleUploadClick={handleUploadClick}
        resetUpload={resetUpload}
        removeBackgroundLocal={removeBackgroundLocal}
        removeBackgroundBria={removeBackgroundBria}
        creditCostFree={CREDIT_COST_FREE}
        creditCostBria={CREDIT_COST_BRIA}
        fileSizeMB={fileSizeMB}
        session={session}
        credits={credits}
      />
      <LogoMarquee />
      <FeaturesDetailSection />
      <ShowcaseSection />
      <HowItWorks />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
