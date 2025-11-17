"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white">
      <div className="px-4 pt-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
        <div className="grid gap-10 row-gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="sm:col-span-2">
            <Link href="/" aria-label="Go home" title="RemBG" className="inline-flex items-center gap-3">
              {/* Logo Image */}
              <Image
                src="/rembg_photo_2025-11-17_13-29-10_2025-11-17_07-59-47_isnet.png"
                alt="RemBG Logo"
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              {/* Text with two rows */}
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                  RemBG
                </span>
                <span className="text-xs sm:text-sm text-gray-500 leading-tight">
                  by GoStudio.ai
                </span>
              </div>
            </Link>
            <div className="mt-6 lg:max-w-sm">
              <p className="text-sm text-gray-800">
                Use RemBG to remove image backgrounds effortlessly. Our AI-powered tool enables seamless background removal with precision and speed.
                Transform your images instantly for e-commerce, marketing, social media, and more.
              </p>
              <p className="mt-4 text-sm text-gray-800">
                {/* Be a part of thousands of users using our platform to achieve professional results without design skills. */}
              </p>
            </div>
          </div>

          {/* Products Column */}
          <div className="space-y-2 text-sm">
            <p className="text-base font-bold tracking-wide text-gray-900">Products</p>
            <div className="flex flex-col space-y-2">
              <Link href="/" className="transition-colors duration-300 text-gray-700 hover:text-purple-600">
                AI Background Remover
              </Link>
              <Link href="/contact" className="transition-colors duration-300 text-gray-700 hover:text-purple-600">
                AI Image Upscaler
              </Link>
              <Link href="/contact" className="transition-colors duration-300 text-gray-700 hover:text-purple-600">
                Batch Processing
              </Link>
              <Link href="/contact" className="transition-colors duration-300 text-gray-700 hover:text-purple-600">
                API Access
              </Link>
            </div>
          </div>

          {/* Company & Resources Column */}
          <div className="space-y-2 text-sm">
            <p className="text-base font-bold tracking-wide text-gray-900">Company</p>
            <div className="flex flex-col space-y-2">
              <Link href="/pricing" className="transition-colors duration-300 text-gray-700 hover:text-purple-600">
                Pricing
              </Link>
              {/* <Link href="#" className="transition-colors duration-300 text-gray-700 hover:text-purple-600">
                Blog
              </Link> */}
              {/* <Link href="#" className="transition-colors duration-300 text-gray-700 hover:text-purple-600">
                About Us
              </Link> */}
              <Link href="/contact" className="transition-colors duration-300 text-gray-700 hover:text-purple-600">
                Contact Support
              </Link>
              {/* <Link href="#" className="transition-colors duration-300 text-gray-700 hover:text-purple-600">
                Partner With Us
              </Link> */}
            </div>
          </div>
        </div>

        {/* Social Media */}
        {/* <div className="mb-8">
          <span className="text-base font-bold tracking-wide text-gray-900">Social</span>
          <div className="flex items-center mt-1 space-x-3">
            <a href="https://twitter.com" className="text-gray-500 transition-colors duration-300 hover:text-purple-600">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://instagram.com" className="text-gray-500 transition-colors duration-300 hover:text-purple-600">
              <svg viewBox="0 0 30 30" fill="currentColor" className="h-6">
                <circle cx="15" cy="15" r="4"></circle>
                <path d="M19.999,3h-10C6.14,3,3,6.141,3,10.001v10C3,23.86,6.141,27,10.001,27h10C23.86,27,27,23.859,27,19.999v-10   C27,6.14,23.859,3,19.999,3z M15,21c-3.309,0-6-2.691-6-6s2.691-6,6-6s6,2.691,6,6S18.309,21,15,21z M22,9c-0.552,0-1-0.448-1-1   c0-0.552,0.448-1,1-1s1,0.448,1,1C23,8.552,22.552,9,22,9z"></path>
              </svg>
            </a>
            <a href="https://linkedin.com" className="text-gray-500 transition-colors duration-300 hover:text-purple-600">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://youtube.com" className="text-gray-500 transition-colors duration-300 hover:text-purple-600">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="https://discord.com" className="text-gray-500 transition-colors duration-300 hover:text-purple-600">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
          </div>
        </div> */}

        {/* Bottom Section */}
        <div className="flex flex-col-reverse justify-between pt-5 pb-10 border-t lg:flex-row">
          <p className="text-sm text-gray-600">
            © Copyright {currentYear} GoStudio. All rights reserved.
          </p>
          <ul className="flex flex-col mb-3 space-y-2 lg:mb-0 sm:space-y-0 sm:space-x-5 sm:flex-row">
            <li>
              {/* <Link href="#" className="text-sm text-gray-600 transition-colors duration-300 hover:text-purple-600">F.A.Q</Link> */}
            </li>
            <li>
              <Link href="https://www.gostudio.ai/privacy" className="text-sm text-gray-600 transition-colors duration-300 hover:text-purple-600">Privacy Policy</Link>
            </li>
            <li>
              <Link href="https://www.gostudio.ai/terms" className="text-sm text-gray-600 transition-colors duration-300 hover:text-purple-600">Terms &amp; Conditions</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
