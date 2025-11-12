export default function LogoMarquee() {
  const logos = [
    { name: "Adobe", opacity: "opacity-40" },
    { name: "Shopify", opacity: "opacity-50" },
    { name: "Canva", opacity: "opacity-40" },
    { name: "Etsy", opacity: "opacity-45" },
    { name: "Amazon", opacity: "opacity-40" },
    { name: "eBay", opacity: "opacity-50" },
  ];

  return (
    <div className="w-full bg-gray-50 border-y border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-center text-lg text-gray-600 mb-8 font-medium">
          RemBG works with retail brands, enterprises and digital brands
        </h2>

        {/* Logo Grid */}
        <div className="flex items-center justify-center gap-8 md:gap-12 lg:gap-16 flex-wrap">
          {logos.map((logo, index) => (
            <div
              key={index}
              className={`${logo.opacity} hover:opacity-70 transition-opacity duration-300`}
            >
              <div className="text-2xl font-bold text-gray-400 tracking-tight">
                {logo.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
