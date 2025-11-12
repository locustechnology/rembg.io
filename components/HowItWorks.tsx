"use client";

import { Upload, Sparkles, Download } from "lucide-react";
import { ImgComparisonSlider } from '@img-comparison-slider/react';

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Upload",
      description:
        "Upload any image format, such as PNG, JPG, HEIC, etc. Simply drag and drop your file into the tool, and RemBG will instantly begin background processing using AI.",
      icon: Upload,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      type: "icon" as const,
    },
    {
      number: "2",
      title: "AI magic",
      description:
        "RemBG's AI image background remover detects objects and cleanly separates them from the background. It preserves details like edges, lighting, and shadows with impressive precision and consistency.",
      icon: Sparkles,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      type: "comparison" as const,
    },
    {
      number: "3",
      title: "Download",
      description:
        "Your final image is ready within a few seconds. Download a high-resolution, background-free version or head into RemBG Studio for additional edits and creative control as needed.",
      icon: Download,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      type: "image" as const,
    },
  ];

  return (
    <section className="w-full bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Remove image backgrounds instantly in 3 easy steps
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative bg-gray-50 rounded-3xl p-8 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Step Number */}
              <div className="absolute top-8 left-8">
                <span className="text-5xl font-bold text-gray-200">
                  {step.number}
                </span>
              </div>

              {/* Visual Container */}
              <div className="relative z-10 mb-6 mt-12">
                {step.type === "icon" && (
                  <div
                    className={`w-full aspect-video ${step.bgColor} rounded-2xl flex items-center justify-center`}
                  >
                    <step.icon className={`w-16 h-16 ${step.iconColor}`} />
                  </div>
                )}

                {step.type === "comparison" && (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden bg-white shadow-md">
                    <ImgComparisonSlider className="w-full h-full focus:outline-none">
                      <img
                        slot="first"
                        src="/pexels-mikebirdy-112460.jpg?w=800&h=450&fit=crop"
                        alt="Before background removal"
                        className="w-full h-full object-cover"
                      />
                      <img
                        slot="second"
                        src="/09.11.2025_13.37.10_REC.png?w=800&h=450&fit=crop"
                        alt="After background removal"
                        className="w-full h-full object-cover"
                        style={{ mixBlendMode: 'multiply' }}
                      />
                    </ImgComparisonSlider>
                  </div>
                )}

                {step.type === "image" && (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden bg-white shadow-md flex items-center justify-center">
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
                      src="/09.11.2025_13.37.10_REC.png?w=800&h=450&fit=crop"
                      alt="Final result"
                      className="w-full h-full object-contain relative z-10"
                      style={{ mixBlendMode: 'multiply' }}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
