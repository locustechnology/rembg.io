"use client";

import { RefObject, useState } from "react";
import { Plus, Crown, Bolt, UploadIcon, Download, Link as LinkIcon } from "lucide-react";
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
  handleUploadClick: () => void;
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
  briaProcessing: boolean;
  progress: number;
  currentStatus: string;
  errorMsg: string;
  outputFileURL: string;
  removeBackgroundLocal: () => Promise<void>;
  removeBackgroundBria: () => Promise<void>;
  creditCostFree: number;
  creditCostBria: number;
  fileSizeMB: string;
  session: any;
  credits: number;
}

export default function HeroSection({
  fileInputRef,
  handleUploadClick,
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
  briaProcessing,
  progress,
  currentStatus,
  errorMsg,
  outputFileURL,
  removeBackgroundLocal,
  removeBackgroundBria,
  creditCostFree,
  creditCostBria,
  fileSizeMB,
  session,
  credits,
}: HeroSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'webp' | 'jpg'>('png');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      if (file.type.startsWith("image/")) {
        setInputFile(file);
      }
    }
  };

  // Drag & Drop Handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Set dropEffect for better visual feedback
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set isDragging to false if we're actually leaving the drop zone
    // (not just entering a child element)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setInputFile(file);
      } else {
        // Show error for non-image files
        alert("Please drop an image file (PNG, JPG, WebP, etc.)");
      }
    }
  };

  // URL to File Converter
  const urlToFile = async (url: string): Promise<File | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch image');

      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL does not point to an image');
      }

      const filename = url.split('/').pop() || 'image.jpg';
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error('Error loading image from URL:', error);
      return null;
    }
  };

  // Handle URL Paste
  const handleUrlPaste = async () => {
    if (!urlInput.trim()) return;

    setIsLoadingUrl(true);
    const file = await urlToFile(urlInput);
    setIsLoadingUrl(false);

    if (file) {
      setInputFile(file);
      setUrlInput("");
    }
  };

  // Handle Demo Image Click
  const handleDemoImageClick = async (imageUrl: string) => {
    const file = await urlToFile(imageUrl);
    if (file) {
      setInputFile(file);
    }
  };

  const fileName = () => {
    let nameWithoutExtention = inputFile?.name;
    if (nameWithoutExtention && nameWithoutExtention?.split(".").length > 1) {
      nameWithoutExtention = nameWithoutExtention.split(".")[0];
    }

    // Create timestamp: YYYY-MM-DD_HH-MM-SS
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/T/, '_')
      .replace(/\..+/, '')
      .replace(/:/g, '-')
      .split('.')[0];

    // Determine model type (for filename)
    const modelType = briaProcessing ? 'bria' : 'isnet';

    // Use selected download format
    const extension = downloadFormat;

    // Format: rembg_[name]_[timestamp]_[model].[ext]
    return `rembg_${nameWithoutExtention}_${timestamp}_${modelType}.${extension}`;
  };

  // Convert and download image in selected format
  const handleDownload = async () => {
    if (!outputFileURL) return;

    try {
      // Fetch the output image
      const response = await fetch(outputFileURL);
      const blob = await response.blob();

      // Create an image element to load the blob
      const img = new Image();
      const imgUrl = URL.createObjectURL(blob);

      img.onload = () => {
        // Create a canvas to convert the image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Draw the image on canvas
        ctx.drawImage(img, 0, 0);

        // Convert to selected format
        const mimeType = downloadFormat === 'jpg' ? 'image/jpeg' : `image/${downloadFormat}`;
        const quality = downloadFormat === 'jpg' ? 0.95 : 0.92; // High quality

        canvas.toBlob((convertedBlob) => {
          if (!convertedBlob) return;

          // Create download link
          const url = URL.createObjectURL(convertedBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName();
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          // Cleanup
          URL.revokeObjectURL(url);
          URL.revokeObjectURL(imgUrl);
        }, mimeType, quality);
      };

      img.src = imgUrl;
    } catch (error) {
      console.error('Download error:', error);
    }
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
        <div
          className={`flex flex-col border-2 border-dashed rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 bg-white min-h-[350px] sm:min-h-[400px] transition-colors ${
            isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
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
              <div className="flex flex-col items-center justify-center flex-1 space-y-4">
                <Button
                  onClick={handleUploadClick}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-7 text-sm sm:text-base font-semibold h-auto rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Upload image
                </Button>

                <p className="text-xs sm:text-sm text-gray-600">or drag & drop</p>

                {/* URL Input */}
                <div className="w-full max-w-md flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="url"
                      placeholder="Paste image URL"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUrlPaste()}
                      className="pl-10 pr-4 py-2 text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleUrlPaste}
                    disabled={!urlInput.trim() || isLoadingUrl}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoadingUrl ? "Loading..." : "Load"}
                  </Button>
                </div>
              </div>

              {/* Batch Mode - Bottom Center of Upload Area */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-700 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                  <span className="font-semibold"></span> */}
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

              {/* Model Selection Info */}
              <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl sm:rounded-2xl">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900">
                        Free Model: 0 credits
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-600">No login required</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900">
                        Superior Model: {creditCostBria} credits
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-600">Professional quality</span>
                  </div>
                  {session?.user && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        Your balance: <span className="font-semibold text-purple-600">{credits} credits</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Options - HIDDEN (Functionality preserved in state) */}
              {/*
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
              */}

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
                  {errorMsg}
                </div>
              )}

              {/* Processing Progress */}
              {(processing || briaProcessing) && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-purple-50 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">
                      {briaProcessing ? '⭐ ' : ''}{currentStatus}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-purple-600">
                      {progress}%
                    </p>
                  </div>
                  <Progress value={progress} className="h-1.5 sm:h-2" />
                </div>
              )}

              {/* Action Buttons - Two Models */}
              {!outputFileURL ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Free Model Button */}
                  <Button
                    onClick={removeBackgroundLocal}
                    disabled={processing || briaProcessing}
                    className="w-full h-12 sm:h-14 text-sm sm:text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1 py-2"
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <span>Free Model</span>
                        <span className="text-xs opacity-90">No login • 0 credits</span>
                      </>
                    )}
                  </Button>

                  {/* Superior Bria Model Button */}
                  <Button
                    onClick={removeBackgroundBria}
                    disabled={processing || briaProcessing || !session?.user || credits < creditCostBria}
                    className="relative w-full h-12 sm:h-14 text-sm sm:text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-1 py-2 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                      SUPERIOR
                    </div>
                    {briaProcessing ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <span>Superior Model</span>
                        <span className="text-xs opacity-90">
                          {session?.user ? `${creditCostBria} credits` : 'Login required'}
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Format Selector */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Download Format:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDownloadFormat('png')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                          downloadFormat === 'png'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        PNG
                      </button>
                      <button
                        onClick={() => setDownloadFormat('webp')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                          downloadFormat === 'webp'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        WebP
                      </button>
                      <button
                        onClick={() => setDownloadFormat('jpg')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                          downloadFormat === 'jpg'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        JPG
                      </button>
                    </div>
                  </div>

                  {/* Download Button */}
                  <Button
                    onClick={handleDownload}
                    className="w-full h-10 sm:h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                  >
                    <Download size={16} className="sm:w-[18px] sm:h-[18px] mr-2" />
                    Download as {downloadFormat.toUpperCase()}
                  </Button>
                </div>
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
          <button
            onClick={() => handleDemoImageClick("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800")}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden hover:scale-105 transition-transform shadow-md hover:shadow-lg"
          >
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
              alt="Sample 1"
              className="w-full h-full object-cover"
            />
          </button>
          <button
            onClick={() => handleDemoImageClick("https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800")}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden hover:scale-105 transition-transform shadow-md hover:shadow-lg"
          >
            <img
              src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=200&fit=crop"
              alt="Sample 2"
              className="w-full h-full object-cover"
            />
          </button>
          <button
            onClick={() => handleDemoImageClick("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800")}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden hover:scale-105 transition-transform shadow-md hover:shadow-lg"
          >
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop"
              alt="Sample 3"
              className="w-full h-full object-cover"
            />
          </button>
          <button
            onClick={() => handleDemoImageClick("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800")}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden hover:scale-105 transition-transform shadow-md hover:shadow-lg"
          >
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