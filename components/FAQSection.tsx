"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      question: "What is an AI background remover?",
      answer: "An AI background remover is a tool that uses artificial intelligence to automatically detect and remove backgrounds from images. It analyzes the image to distinguish between the subject and the background, then removes the background while preserving the main subject with precision.",
    },
    {
      question: "How does RemBG's AI background remover work?",
      answer: "RemBG uses advanced AI algorithms to analyze your image, identify the main subject, and separate it from the background. The process is fully automated and takes just seconds. Simply upload your image, and our AI handles the rest with professional-grade accuracy.",
    },
    {
      question: "What image formats are supported?",
      answer: "RemBG supports PNG, JPG/JPEG, WEBP, and HEIC formats. You can upload images from any device - desktop, mobile, or tablet - without needing special software.",
    },
    {
      question: "Is RemBG free to use?",
      answer: "Yes! RemBG offers free credits to get started. New users receive 5 free credits upon signup. Each credit allows you to remove the background from one image. Additional credits can be purchased through our affordable pricing plans.",
    },
    {
      question: "Can I remove backgrounds from multiple images at once?",
      answer: "Yes, RemBG supports bulk background removal. You can process multiple images at once using our batch mode or API, saving you hours of manual editing while maintaining consistent quality across all images.",
    },
    {
      question: "What happens to my images after processing?",
      answer: "Your privacy is our priority. All uploaded images are processed securely and are automatically deleted from our servers after processing. We don't store or share your images with third parties.",
    },
    {
      question: "Can I add a new background after removal?",
      answer: "Absolutely! After removing the background, you can add custom backgrounds, solid colors, or even AI-generated backdrops to personalize your images. Our smart editing tools make it easy to create stunning visuals.",
    },
    {
      question: "Do I need design skills to use RemBG?",
      answer: "Not at all! RemBG is designed for everyone, from professionals to beginners. No Photoshop skills required. Simply upload your image, and our AI does all the complex work automatically. You'll get professional results in seconds.",
    },
    {
      question: "What's the difference between high-res and low-res images?",
      answer: "Images under 2MB are considered low-res and cost 1 credit. Images 2MB or larger are high-res and cost 3 credits. High-res images require more processing power but deliver exceptional quality for professional use.",
    },
    {
      question: "Can I use RemBG for commercial purposes?",
      answer: "Yes! Images processed with RemBG can be used for commercial purposes including e-commerce, marketing materials, social media, websites, and more. Our tool is perfect for businesses of all sizes.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-white py-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about RemBG's AI background remover
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none group"
              >
                <span className="text-lg font-semibold text-gray-900 pr-8 group-hover:text-purple-600 transition-colors duration-200">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`flex-shrink-0 w-6 h-6 text-purple-600 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-5 pt-2">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-4">
            Can't find the answer you're looking for? Please reach out to our team.
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
}
