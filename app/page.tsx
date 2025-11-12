"use client";

import { useRef, useState } from "react";
import { removeBackground } from "@imgly/background-removal";
import { useSession } from "@/lib/auth-client";
import { useAuthStore } from "@/lib/store";
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

export default function Home() {
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
  const { credits, deductCredits } = useAuthStore();

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
      // Deduct credits first
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
        setErrorMsg("Failed to deduct credits. Please try again.");
        setProcessing(false);
        return;
      }

      // Process the image
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

      const url = URL.createObjectURL(blob);
      setOutputFileURL(url);
      setCurrentStatus(`Success! ${creditCost} credit${creditCost > 1 ? 's' : ''} used`);
    } catch (error) {
      setErrorMsg("Error removing background. See console for more details.");
      console.error("Error removing background:", error);
    }

    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main role="main" className="pt-4">
        <HeroSection
          fileInputRef={fileInputRef}
          onUploadClick={handleUploadClick}
          inputFile={inputFile}
          setInputFile={setInputFile}
          resetUpload={resetUpload}
          modelPrecision={modelPrecision}
          setModelPrecision={setModelPrecision}
          imageDownloadType={imageDownloadType}
          setImageDownloadType={setImageDownloadType}
          quality={quality}
          setQuality={setQuality}
          processing={processing}
          progress={progress}
          currentStatus={currentStatus}
          errorMsg={errorMsg}
          outputFileURL={outputFileURL}
          removeBackgroundLocal={removeBackgroundLocal}
          creditCost={creditCost}
          fileSizeMB={fileSizeMB}
        />
        <LogoMarquee />
        <HowItWorks />
        <ShowcaseSection />
        <FeaturesDetailSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}