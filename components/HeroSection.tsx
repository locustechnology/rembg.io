"use client";

import { RefObject } from "react";
import { Plus, Crown, Bolt, UploadIcon, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ImgComparisonSlider } from '@img-comparison-slider/react';
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Progress } from "./ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

type DownloadFileType = "image/png" | "image/webp";
type ModelPrecision = "isnet" | "isnet_fp16" | "isnet_quint8";

interface HeroSectionProps {
  fileInputRef: RefObject<HTMLInputElement>;
  onUploadClick: () => void;
  inputFile: File | null;
  setInputFile: (file: File | null) => void;
  resetUpload: () => void;
  modelPrecision: ModelPrecision;
  setModelPrecision: (value: ModelPrecision) => void;
  imageDownloadType: DownloadFileType;
  setImageDownloadType: (value: DownloadFileType) => void;
  quality: number;
  setQuality: (value: number) => void;
  processing: boolean;
  progress: number;
  currentStatus: string;
  errorMsg: string;
  outputFileURL: string;
  removeBackgroundLocal: () => Promise<void>;
  creditCost: number;
  fileSizeMB: string;
}

export default function HeroSection({
  fileInputRef,
  onUploadClick,
  inputFile,
  setInputFile,
  resetUpload,
  modelPrecision,
  setModelPrecision,
  imageDownloadType,
  setImageDownloadType,
  quality,
  setQuality,
  processing,
  progress,
  currentStatus,
  errorMsg,
  outputFileURL,
  removeBackgroundLocal,
  creditCost,
  fileSizeMB,
}: HeroSectionProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      if (file.type.startsWith("image/")) {
        setInputFile(file);
      }
    }
  };

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
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
      {/* Heading */}
      <header className="text-center mb-8 sm:mb-10 lg:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] leading-tight font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
          Free AI image
          <br />
          background remover
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
          A 100% automatic, free AI background remover tool to instantly remove backgrounds from images. Free to use,
          <br className="hidden sm:block" />
          with no sign-up required!
        </p>
      </header>

      {/* Split Layout - Image Preview & Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Left Side - Demo or Result */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100">
          {!outputFileURL ? (
            // Demo Image
            <ImgComparisonSlider className="w-full h-full focus:outline-none">
              <div slot="first" className="w-full h-full">
                <img
                  src="/pexels-kaleef-lawal-1481864847-27897903.jpg"
                  alt="Original"
                  className="w-full h-full object-cover"
                />
              </div>
              <div slot="second" className="w-full h-full relative">
                {/* Checkerboard pattern for transparency */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
                      linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
                      linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }}
                />
                <img
                  src="/bg_removed_pexels-kaleef-lawal-1481864847-27897903.png"
                  alt="Background Removed"
                  className="w-full h-full object-contain relative z-10"
                />
              </div>
            </ImgComparisonSlider>
          ) : (
            // Your Result
            <div className="p-4 sm:p-6 bg-white h-full flex flex-col">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Your Result</h3>
              <div className="flex-1 flex items-center">
                <ImgComparisonSlider className="rounded-xl sm:rounded-2xl overflow-hidden shadow-xl focus:outline-none w-full">
                  <img
                    slot="first"
                    src={inputFile ? URL.createObjectURL(inputFile) : ""}
                    alt="Before"
                    className="w-full h-full object-contain"
                  />
                  <img
                    slot="second"
                    src={outputFileURL}
                    alt="After"
                    className="w-full h-full object-contain"
                  />
                </ImgComparisonSlider>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Upload Area / All Upload Controls */}
        <div className="flex flex-col border-2 border-dashed border-gray-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 bg-white min-h-[350px] sm:min-h-[400px]">
          {/* Hidden File Input */}
          <Input
            id="dropzone-file"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />

          {!inputFile ? (
            <>
              {/* Upload Section - Top/Center */}
              <div className="flex flex-col items-center justify-center flex-1">
                <Button
                  onClick={onUploadClick}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-7 text-sm sm:text-base font-semibold h-auto rounded-full mb-2 sm:mb-3 shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Upload image
                </Button>
                <p className="text-xs sm:text-sm text-gray-600">or paste URL</p>
              </div>

              {/* Batch Mode - Bottom Center of Upload Area */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-700 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                  <span className="font-semibold">Batch mode</span>
                </div>
                <span className="text-gray-600 text-center">
                  Remove image backgrounds instantly in 3 easy steps
                </span>
              </div>
            </>
          ) : (
            <>
              {/* File Info */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-xl sm:rounded-2xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <UploadIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                        {inputFile.name.length <= 30
                          ? inputFile.name
                          : `${inputFile.name.substring(0, 25)}...${inputFile.name.substring(inputFile.name.length - 7)}`}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Ready to process</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={resetUpload}
                    className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 flex-shrink-0"
                    disabled={processing}
                    size="sm"
                  >
                    Change
                  </Button>
                </div>
              </div>

              {/* Credit Cost Information */}
              {creditCost > 0 && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">
                      This {fileSizeMB}MB image requires {creditCost} credit{creditCost > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}

              {/* Advanced Options */}
              <div className="flex-1 space-y-4 sm:space-y-6 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bolt className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                      Advanced Options
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Customize quality and output format
                    </p>
                  </div>
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900">
                    Model Quality
                  </h4>
                  <Select
                    value={modelPrecision}
                    onValueChange={(value) =>
                      setModelPrecision(value as ModelPrecision)
                    }
                  >
                    <SelectTrigger className="w-full h-9 sm:h-10 rounded-lg sm:rounded-xl border-gray-200 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="isnet">High Quality</SelectItem>
                      <SelectItem value="isnet_fp16">Balanced</SelectItem>
                      <SelectItem value="isnet_quint8">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Output Format */}
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900">
                    WebP Format
                  </h4>
                  <Switch
                    checked={imageDownloadType === "image/webp"}
                    onCheckedChange={() => {
                      setImageDownloadType(
                        imageDownloadType === "image/webp"
                          ? "image/png"
                          : "image/webp"
                      );
                    }}
                  />
                </div>

                {/* Quality Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900">
                      Quality
                    </h4>
                    <span className="text-xs sm:text-sm font-semibold text-purple-600">
                      {quality}%
                    </span>
                  </div>
                  <Slider
                    min={1}
                    max={100}
                    value={[quality]}
                    step={1}
                    onValueChange={(value) => setQuality(value[0])}
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
                  {errorMsg}
                </div>
              )}

              {/* Processing Progress */}
              {processing && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-purple-50 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">
                      {currentStatus}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-purple-600">
                      {progress}%
                    </p>
                  </div>
                  <Progress value={progress} className="h-1.5 sm:h-2" />
                </div>
              )}

              {/* Action Button - Remove or Download */}
              {!outputFileURL ? (
                <Button
                  onClick={removeBackgroundLocal}
                  disabled={processing}
                  className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {processing ? currentStatus : "Remove Background"}
                </Button>
              ) : (
                <a
                  href={outputFileURL}
                  download={fileName()}
                  className="w-full h-10 sm:h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold flex justify-center items-center rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                >
                  <Download size={16} className="sm:w-[18px] sm:h-[18px] mr-2" />
                  Download Image
                </a>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sample Images - Below Upload Area */}
      <div className="lg:ml-[calc(50%+12px)]">
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 text-center px-4">
          No image to test? Give one of our samples a go
        </p>
        <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 flex-wrap px-4">
          {/* Sample thumbnails */}
          <button className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden hover:scale-105 transition-transform shadow-md hover:shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
              alt="Sample 1"
              className="w-full h-full object-cover"
            />
          </button>
          <button className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden hover:scale-105 transition-transform shadow-md hover:shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=200&fit=crop"
              alt="Sample 2"
              className="w-full h-full object-cover"
            />
          </button>
          <button className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden hover:scale-105 transition-transform shadow-md hover:shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop"
              alt="Sample 3"
              className="w-full h-full object-cover"
            />
          </button>
          <button className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden hover:scale-105 transition-transform shadow-md hover:shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
              alt="Sample 4"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </div>
  );
}