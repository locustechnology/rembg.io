"use client";

import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  review: string;
  rating: number;
}

export default function TestimonialsSection() {
  const testimonials: Testimonial[] = [
    {
      name: "Darpan Pathak",
      review: "I've tried many background removal tools, but this one stands out. The AI is incredibly accurate, and the results are professional-grade. It's become an essential tool for my e-commerce business.",
      rating: 5,
    },
    {
      name: "Pritam Ghosh",
      review: "The speed and quality are unmatched! I can process hundreds of images in minutes without compromising on quality. The credit system is fair and transparent.",
      rating: 5,
    },
    {
      name: "Tejas Dhawade",
      review: "As a photographer, I need precision. This tool delivers exactly that. The edge detection is phenomenal, and it handles complex backgrounds with ease. Highly recommended!",
      rating: 5,
    },
    {
      name: "Farooq Adam",
      review: "Simple, fast, and effective. The user interface is intuitive, and the results are instant. Perfect for anyone who needs quick background removal without the hassle.",
      rating: 5,
    },
  ];

  return (
    <section className="w-full bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            What people say about us
          </h2>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Stats */}
          <div className="flex flex-col items-center lg:items-start space-y-8">
            {/* User Count Badge */}
            <div className="relative">
              <div className="flex items-center justify-center w-full">
                {/* Avatar Stack */}
                <div className="flex -space-x-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-4 border-white flex items-center justify-center text-white font-bold shadow-lg">
                    A
                  </div>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-white flex items-center justify-center text-white font-bold shadow-lg">
                    B
                  </div>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-4 border-white flex items-center justify-center text-white font-bold shadow-lg">
                    C
                  </div>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 border-4 border-white flex items-center justify-center text-white font-bold shadow-lg">
                    D
                  </div>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 border-4 border-white flex items-center justify-center text-white font-bold shadow-lg">
                    E
                  </div>
                </div>
              </div>

              {/* 200k+ Badge */}
              <div className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full px-8 py-4 shadow-2xl">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-1">200k+</div>
                  <div className="text-sm text-white/90 font-medium">Happy Users</div>
                </div>
              </div>
            </div>

            {/* Description Text */}
            <div className="max-w-md text-center lg:text-left mt-8">
              <p className="text-gray-600 text-lg leading-relaxed">
                Join thousands of satisfied users who trust our AI-powered background removal service for their creative and business needs.
              </p>
              <div className="mt-6 flex items-center justify-center lg:justify-start gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-gray-700 font-semibold">5.0 Rating</span>
              </div>
            </div>
          </div>

          {/* Right Side - Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:-translate-y-1"
              >
                {/* Star Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {testimonial.review}
                </p>

                {/* User Name */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
