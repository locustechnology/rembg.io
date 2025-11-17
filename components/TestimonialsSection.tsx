"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  name: string;
  review: string;
  title: string;
  role: string;
  avatar: string;
  colSpan: string;
}

export default function TestimonialsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const testimonials: Testimonial[] = [
    {
      name: "Darpan Pathak",
      title: "Efficient background removal",
      review: "RemBG changed everything for us. It automated the background editing, making every photo consistent. This has considerably streamlined our process, giving us the freedom to innovate.",
      role: "Founder at GoodBuy Gear",
      avatar: "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg",
      colSpan: "col-span-1 lg:col-span-2",
    },
    {
      name: "Pritam Ghosh",
      title: "Outstanding AI precision",
      review: "The time RemBG saves me is HUGE. What took forever in Photoshop now takes seconds. It's phenomenal! The AI precision is incredible for our jewelry product photos.",
      role: "Founder at East Designs",
      avatar: "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg",
      colSpan: "col-span-1 lg:col-span-3",
    },
    {
      name: "Tejas Dhawade",
      title: "Professional-grade results",
      review: "I'm really skeptical when it comes to AI photo editing, but RemBG's AI always looks great and realistic. It's become essential for our product marketing and photography workflow.",
      role: "Professional Photographer",
      avatar: "https://images.pexels.com/photos/2076596/pexels-photo-2076596.jpeg",
      colSpan: "col-span-1 lg:col-span-3",
    },
    {
      name: "Sarah Mitchell",
      title: "Reliable and fast",
      review: "RemBG consistently delivers high-quality results without any disruptions. The speed and reliability have made it an indispensable tool for our e-commerce operations.",
      role: "E-commerce Manager at StyleHub",
      avatar: "https://images.pexels.com/photos/1081685/pexels-photo-1081685.jpeg",
      colSpan: "col-span-1 lg:col-span-2",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="w-full bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50 py-16 md:py-24"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        {/* Section Title */}
        <div
          className={`flex items-center justify-center flex-col gap-y-2 py-5 mb-10 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold max-w-md mx-auto text-center text-gray-900">
            Here's what our{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">customers</span> have to say
          </h2>
          <p className="text-lg font-medium text-gray-600">
            Discover how our service can benefit you
          </p>
        </div>

        {/* Mobile: Manual Slider */}
        <div className="lg:hidden flex flex-col items-center gap-6 mb-8">
          {/* Single Card Display */}
          <div className="relative w-full max-w-[300px] overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-[300px] h-[300px] border-2 p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg border-purple-200/50 flex flex-col justify-between"
                >
                  {/* Review Content */}
                  <div className="flex flex-col gap-y-3">
                    <p className="font-bold text-lg text-gray-900">
                      {testimonial.title}
                    </p>
                    <p className="font-medium text-gray-700 leading-relaxed text-sm line-clamp-4">
                      {testimonial.review}
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div className="flex flex-col">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-10 w-10 rounded-full border-2 border-purple-200"
                    />
                    <p className="pt-2 text-sm font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-xs font-medium text-gray-600">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevious}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Desktop: Staggered Grid */}
        <div className="hidden lg:grid grid-cols-5 gap-5 w-full">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`border-2 p-7 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg border-purple-200/50 flex flex-col gap-y-10 justify-between transition-all duration-700 hover:-translate-y-2 hover:shadow-xl hover:border-purple-400/50 ${
                testimonial.colSpan
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Review Content */}
              <div className="flex flex-col gap-y-3.5">
                <p className="font-bold text-xl text-gray-900">
                  {testimonial.title}
                </p>
                <p className="font-medium text-gray-700 leading-relaxed">
                  {testimonial.review}
                </p>
              </div>

              {/* Customer Info */}
              <div className="flex flex-col">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="h-10 w-10 rounded-full border-2 border-purple-200"
                />
                <p className="pt-2 text-sm font-semibold text-gray-900">
                  {testimonial.name}
                </p>
                <p className="text-sm font-medium text-gray-600">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
