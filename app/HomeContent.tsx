"use client";

import { useRef, useState, useEffect } from "react";
import { removeBackground } from "@imgly/background-removal";
import { useSession } from "@/lib/auth-client";
import { useAuthStore } from "@/lib/store";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
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

// Credit costs based on file size
const calculateCreditCost = (fileSize: number): number => {
  const TWO_MB = 2 * 1024 * 1024;
  return fileSize >= TWO_MB ? 3 : 1; // 3 credits for high-res, 1 for low-res
};

export default function HomeContent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [outputFileURL, setOutputFileURL] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [currentStatus, setCurrentStatus] = useState<string>("Processing...");
  const [modelPrecision, setModelPrecision] = useState<ModelPrecision>("isnet_fp16");
  const [imageDownloadType, setImageDownloadType] = useState<DownloadFileType>("image/png");
  const [quality, setQuality] = useState<number>(100);

  // Auth and credits
  const { data: session } = useSession();
  const { credits, deductCredits, fetchCredits } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle payment success/cancel
  useEffect(() => {
    const payment = searchParams.get("payment");
    const planId = searchParams.get("planId");

    if (payment === "success" && planId && session?.user) {
      // Payment successful - credits added automatically via webhook
      const handlePaymentSuccess = async () => {
        const toastId = toast.loading("Payment successful! Updating your credits...");

        // CRITICAL: Fetch credits FIRST to get the actual current balance
        // Otherwise initialBalance might be 0 if credits haven't loaded yet!
        console.log('[PAYMENT] Fetching initial credit balance...');
        await fetchCredits();

        // NOW get the real initial balance
        const initialBalance = useAuthStore.getState().credits;
        let pollCount = 0;
        const maxPolls = 20; // Poll for 20 seconds

        console.log('[PAYMENT] Starting credit polling. Initial balance:', initialBalance);

        // Clear any existing interval
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }

        // Aggressively poll for credit updates
        pollIntervalRef.current = setInterval(async () => {
          pollCount++;
          console.log(`[PAYMENT] Poll ${pollCount}/${maxPolls}: Fetching credits...`);

          await fetchCredits();

          // Get the LATEST credits from store
          const currentBalance = useAuthStore.getState().credits;
          console.log(`[PAYMENT] Current balance: ${currentBalance}, Initial: ${initialBalance}`);

          // Stop polling if credits increased or max polls reached
          if (currentBalance > initialBalance || pollCount >= maxPolls) {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }

            if (currentBalance > initialBalance) {
              const creditsAdded = currentBalance - initialBalance;
              toast.success(`Success! ${creditsAdded} credits added. You now have ${currentBalance} credits.`, {
                id: toastId,
                duration: 5000,
              });
              console.log(`[PAYMENT] Credits updated! ${initialBalance} → ${currentBalance}`);
            } else {
              toast.error("Credits not updated yet. Please refresh the page.", {
                id: toastId,
                duration: 5000,
              });
              console.log('[PAYMENT] Polling stopped - credits not updated');
            }
          }
        }, 1000); // Poll every 1 second

        // Clean up URL after 2 seconds
        setTimeout(() => {
          router.replace("/");
        }, 2000);
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
    // Check if user is logged in
    if (!session?.user) {
      setErrorMsg("Please sign in to remove backgrounds");
      return;
    }

    if (!inputFile) {
      setErrorMsg("Please upload an image first");
      return;
    }

    // Check if user has enough credits
    if (credits < creditCost) {
      setErrorMsg(
        `Insufficient credits. This ${fileSizeMB}MB image requires ${creditCost} credit${creditCost > 1 ? 's' : ''}, but you only have ${credits}. Please purchase more credits.`
      );
      return;
    }

    setProcessing(true);
    setErrorMsg("");
    setOutputFileURL("");
    setProgress(0);

    try {
      // Process the image FIRST (before deducting credits)
      const imageData = await new Response(inputFile).blob();
      const blob = await removeBackground(imageData, {
        progress: (key: string, current: number, total: number) => {
          if (key.includes("fetch")) {
            setCurrentStatus("Fetching model...");
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

      // Only deduct credits AFTER successful processing
      const deducted = await deductCredits(
        creditCost,
        `Background removal - ${inputFile.name} (${fileSizeMB}MB)`,
        {
          fileName: inputFile.name,
          fileSize: inputFile.size,
          fileSizeMB: fileSizeMB,
          creditCost,
          timestamp: new Date().toISOString(),
        }
      );

      if (!deducted) {
        setErrorMsg("Processing succeeded but failed to deduct credits. Please contact support.");
        setProcessing(false);
        return;
      }

      const url = URL.createObjectURL(blob);
      setOutputFileURL(url);
      setCurrentStatus(`Success! ${creditCost} credit${creditCost > 1 ? 's' : ''} used`);
    } catch (error) {
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

  return (
    <div>
      <Navbar />
      <HeroSection
        fileInputRef={fileInputRef}
        inputFile={inputFile}
        setInputFile={setInputFile}
        outputFileURL={outputFileURL}
        processing={processing}
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
        creditCost={creditCost}
        fileSizeMB={fileSizeMB}
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
