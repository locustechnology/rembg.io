"use client";

export default function LogoMarquee() {
  const logos = [
    { name: "Adobe", opacity: "opacity-40" },
    { name: "Shopify", opacity: "opacity-50" },
    { name: "Canva", opacity: "opacity-40" },
    { name: "Etsy", opacity: "opacity-45" },
    { name: "Amazon", opacity: "opacity-40" },
    { name: "eBay", opacity: "opacity-50" },
  ];

  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <div className="w-full bg-gray-50 border-y border-gray-200 py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-center text-lg text-gray-600 mb-8 font-medium">
          RemBG works with retail brands, enterprises and digital brands
        </h2>

        {/* Infinite Marquee Container with Portal Effect */}
        <div className="relative">
          {/* Left Portal Gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none"></div>

          {/* Right Portal Gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none"></div>

          {/* Scrolling Logos */}
          <div className="flex overflow-hidden group">
            <div className="flex animate-marquee group-hover:[animation-play-state:paused] gap-12 lg:gap-16">
              {duplicatedLogos.map((logo, index) => (
                <div
                  key={index}
                  className={`${logo.opacity} hover:opacity-70 transition-opacity duration-300 flex-shrink-0`}
                >
                  <div className="text-2xl font-bold text-gray-400 tracking-tight whitespace-nowrap">
                    {logo.name}
                  </div>
                </div>
              ))}
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex animate-marquee group-hover:[animation-play-state:paused] gap-12 lg:gap-16" aria-hidden="true">
              {duplicatedLogos.map((logo, index) => (
                <div
                  key={`dup-${index}`}
                  className={`${logo.opacity} hover:opacity-70 transition-opacity duration-300 flex-shrink-0`}
                >
                  <div className="text-2xl font-bold text-gray-400 tracking-tight whitespace-nowrap">
                    {logo.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
