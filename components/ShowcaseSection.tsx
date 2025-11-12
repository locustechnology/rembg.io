"use client";

import { useState } from "react";
import { ImgComparisonSlider } from "@img-comparison-slider/react";

type Category = "People" | "Products" | "Animals" | "Automobile" | "Furniture";

interface CategoryImage {
  before: string;
  after: string;
}

export default function ShowcaseSection() {
  const [activeCategory, setActiveCategory] = useState<Category>("People");

  // Image mappings for each category
  const categoryImages: Record<Category, CategoryImage> = {
    People: {
      before: "/pexels-kelvin809-810775.jpg",
      after: "/bg_removed_pexels-kelvin809-810775.png",
    },
    Products: {
      before: "/pexels-laryssa-suaid-798122-3616980.jpg",
      after: "/bg_removed_pexels-laryssa-suaid-798122-3616980.png",
    },
    Animals: {
      before: "/pexels-pickering-12531330.jpg",
      after: "/bg_removed_pexels-pickering-12531330.png",
    },
    Automobile: {
      before: "/pexels-pixabay-35967.jpg",
      after: "/bg_removed_pexels-pixabay-35967.png",
    },
    Furniture: {
      before: "/pexels-paula-schmidt-353488-963486.jpg",
      after: "/bg_removed_pexels-paula-schmidt-353488-963486.png",
    },
  };

  const categories: Category[] = ["People", "Products", "Animals", "Automobile", "Furniture"];

  return (
    <section className="w-full bg-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
            An all-in-one solution
          </h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            for background removal
          </h3>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-6 sm:mb-8 px-4">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-full shadow-lg max-w-full">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`
                  px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium text-sm sm:text-base transition-all duration-200 whitespace-nowrap
                  ${
                    activeCategory === category
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Before/After Image Comparison */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-0">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            {/* Before Badge */}
            <div className="absolute top-3 sm:top-6 left-3 sm:left-6 z-10">
              <span className="bg-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                Before
              </span>
            </div>

            {/* After Badge */}
            <div className="absolute top-3 sm:top-6 right-3 sm:right-6 z-10">
              <span className="bg-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                After
              </span>
            </div>

            {/* Image Comparison Slider */}
            <ImgComparisonSlider className="w-full focus:outline-none">
              <img
                slot="first"
                src={categoryImages[activeCategory].before}
                alt="Before background removal"
                className="w-full h-auto object-cover"
                style={{ maxHeight: "700px" }}
              />
              <img
                slot="second"
                src={categoryImages[activeCategory].after}
                alt="After background removal"
                className="w-full h-auto object-cover"
                style={{ maxHeight: "700px" }}
              />
            </ImgComparisonSlider>
          </div>

          {/* Instruction Text */}
          <div className="text-center mt-4 sm:mt-6">
            <p className="text-gray-500 text-xs sm:text-sm">
              Drag the slider to see the difference
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
