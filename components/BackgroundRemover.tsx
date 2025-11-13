"use client";
import { Download } from "lucide-react";
import { ImgComparisonSlider } from '@img-comparison-slider/react';

type DownloadFileType = "image/png" | "image/webp";

interface BackgroundRemoverProps {
  inputFile: File | null;
  outputFileURL: string;
  imageDownloadType: DownloadFileType;
}

export default function BackgroundRemover({
  inputFile,
  outputFileURL,
  imageDownloadType,
}: BackgroundRemoverProps): JSX.Element | null {

  const fileName = () => {
    let nameWithoutExtention = inputFile?.name;
    if (nameWithoutExtention && nameWithoutExtention?.split(".").length > 1) {
      nameWithoutExtention = nameWithoutExtention.split(".")[0];
    }

    if (imageDownloadType === "image/png") {
      return `bg_removed_${nameWithoutExtention}.png`;
    }
    return `bg_removed_${nameWithoutExtention}.webp`;
  };

  // Only show results section when there's an output
  if (!inputFile || !outputFileURL) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Results Section */}
      <div className="mb-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Result</h3>
        <ImgComparisonSlider className="rounded-2xl overflow-hidden shadow-xl focus:outline-none">
          <img
            slot="first"
            src={URL.createObjectURL(inputFile)}
            alt="Before"
            className="max-h-[500px] w-full object-contain"
          />
          <img
            slot="second"
            src={outputFileURL}
            alt="After"
            className="max-h-[500px] w-full object-contain"
          />
        </ImgComparisonSlider>
      </div>

      {/* Download Button */}
      <div className="flex justify-center">
        <a
          href={outputFileURL}
          download={fileName()}
          className="h-12 px-8 bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <Download size={18} className="mr-2" />
          Download Image
        </a>
      </div>
    </div>
  );
}