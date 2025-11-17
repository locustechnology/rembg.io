"use client";

import {
  Sparkles,
  Zap,
  Shield,
  Smartphone,
  FileImage,
  Wand2,
  ImagePlus,
  Eye,
  CheckCircle2,
  TrendingUp,
  Target
} from "lucide-react";

export default function FeaturesDetailSection() {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Free tool",
      description: "Get studio-level results without paying. Just upload your image and let AI remove the background with precision.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Bulk removal",
      description: "Remove backgrounds from a large batch of images in one go using RemBG's API without delays or errors.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Logo and signature",
      description: "Turn logos and handwritten signatures into transparent assets in seconds. This feature brings clarity to your visuals.",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile-ready",
      description: "RemBG's mobile AI background remover works just like the desktop version and is designed for convenience.",
    },
    {
      icon: <FileImage className="w-6 h-6" />,
      title: "Supported formats",
      description: "PNG, JPG/JPEG, WEBP, HEIC. Use the tool across devices, desktop, mobile, or tablet, without needing special software.",
    },
    {
      icon: <Wand2 className="w-6 h-6" />,
      title: "Smart editing",
      description: "Please describe what you want, and the AI will generate it. You don't need Photoshop skills to get stunning results.",
    },
    {
      icon: <ImagePlus className="w-6 h-6" />,
      title: "AI-generated backgrounds",
      description: "Create stunning custom backgrounds by simply describing them with RemBG's AI image background remover.",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Visual transformation",
      description: "Whether you're sharing on LinkedIn or building a portfolio, RemBG gives your images a polished, professional look with minimal effort.",
    },
  ];

  const importance = [
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "Clean visuals",
      description: "Whether it's a person, product, or logo, a clutter-free background keeps the focus on the subject. And immediately enhances image clarity.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Boosts engagement",
      description: "Since a crisp profile picture or product photo conveys professionalism. At the same time, it gains viewers' trust, and clean visuals enhance credibility.",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Elevates marketing",
      description: "Use your cleaned-up photos in all marketing materials for a unified, polished look that attracts attention.",
    },
  ];

  const whyChoose = [
    "Wide format: The tool supports a wide range of formats for seamless editing.",
    "AI-powered: Remove even the finest background details with pinpoint accuracy, fully automated by AI.",
    "One-click: Process lots of images at once using the batch mode or API. Save hours while maintaining quality.",
    "Custom background: Add your design, solid color, or AI-generated background to personalize each image.",
    "A preview: Instantly compare the original image with the AI-processed version to ensure it meets your creative goals.",
    "Visual storytelling: With AI-generated backdrops, you can control tone, mood, and message more easily than ever.",
  ];

  const useCases = [
    {
      title: "E-commerce",
      description: "Utilize AI to remove cluttered backgrounds, displaying your products on white, transparent, or custom backdrops that align with your brand.",
      bgImage: "https://images.pexels.com/photos/27035625/pexels-photo-27035625.jpeg",
    },
    {
      title: "Marketing",
      description: "Background removal helps direct focus to your key message. It is ensuring better click-throughs and engagement.",
      bgImage: "https://images.pexels.com/photos/9739236/pexels-photo-9739236.jpeg",
    },
    {
      title: "Website",
      description: "Maintain visual consistency on your blog or website by using images with clean, branded backgrounds.",
      bgImage: "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg",
    },
    {
      title: "Photographer-ready",
      description: "Remove backgrounds from shoots in bulk and deliver polished photos faster, perfect for weddings, events, and product catalogs.",
      bgImage: "https://images.pexels.com/photos/34756574/pexels-photo-34756574.jpeg",
    },
    {
      title: "Social media",
      description: "Use AI to enhance your selfies, headshots, and profile pics by removing distracting backgrounds and adding custom, clean replacements to reflect your identity.",
      bgImage: "https://images.pexels.com/photos/2818118/pexels-photo-2818118.jpeg",
    },
  ];

  return (
    <section className="w-full bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Introduction */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            A glimpse of the AI image background remover
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            RemBG's AI image background remover helps you remove image backgrounds effortlessly, all for free.
            Whether you're editing product images, social media posts, or personal photos, this free tool delivers clean results instantly.
          </p>
        </div>

        {/* Key Features */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Key features of the AI image background remover
            </h3>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              Our background remover isn't just fast, it's smart; from bulk editing to logo cleanup,
              RemBG's AI offers everything you need to make your images look sharp, clean, and professional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Importance */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Importance of an AI image background remover
            </h3>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              There are more reasons to remove the background from your photos than just aesthetics.
              It all comes down to professionalism, focus, and this tiny step, which can significantly affect how people view your images.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {importance.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-purple-600 mb-4 shadow-md">
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose RemBG */}
        <div className="mb-20 bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
          <div className="text-center mb-10">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why choose RemBG's AI image background remover?
            </h3>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              RemBG's AI-powered tool makes background removal fast, simple, and scalable, whether you're an individual or a business.
              The tool meets all your image editing needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {whyChoose.map((reason, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-purple-50 transition-all duration-200"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mt-1">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Real-world Use Cases */}
        <div>
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Real-world use cases of the AI image background removers
            </h3>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              RemBG's tool is versatile enough to support every image editing scenario.
              That too across industries, platforms, and skill levels.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="relative grid h-[28rem] w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] flex-col items-end justify-center overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2"
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 h-full w-full overflow-hidden bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url('${useCase.bgImage}')` }}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-t from-black/90 via-black/60 to-black/30"></div>
                </div>

                {/* Content */}
                <div className="relative text-center p-8 md:p-10">
                  <h4 className="text-3xl font-bold text-white mb-4 transition-all duration-300 group-hover:scale-105">
                    {useCase.title}
                  </h4>
                  <p className="text-lg text-gray-200 leading-relaxed">
                    {useCase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
