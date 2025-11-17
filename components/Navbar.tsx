"use client";

import { ChevronDown, LogOut, User, CreditCard, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth-client";
import { useAuthStore } from "@/lib/store";

export default function Navbar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: session, isPending, error } = useSession();
  const { credits, fetchCredits, setUser, setSession, reset } = useAuthStore();

  // Debug logging for session state
  useEffect(() => {
    console.log("=== NAVBAR SESSION DEBUG ===");
    console.log("Session data:", session);
    console.log("Is pending:", isPending);
    console.log("Error:", error);
    console.log("Has debug cookie:", document.cookie.includes("debug_has_session"));
    console.log("All cookies:", document.cookie);
    console.log("===========================");
  }, [session, isPending, error]);

  // Fetch credits when user logs in
  useEffect(() => {
    if (session?.user) {
      console.log("✅ User session found:", session.user.email);
      setUser(session.user);
      setSession(session);
      fetchCredits();
    } else {
      console.log("❌ No user session");
      reset();
    }
  }, [session]);

  const handleLogout = async () => {
    await signOut();
    reset();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            {/* Column 1: Logo Image */}
            <Image
              src="/rembg_photo_2025-11-17_13-29-10_2025-11-17_07-59-47_isnet.png"
              alt="RemBG Logo"
              width={48}
              height={48}
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
            {/* Column 2: Text with two rows */}
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                RemBG
              </span>
              <span className="text-xs sm:text-sm text-gray-500 leading-tight">
                by GoStudio.ai
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link href="/contact" className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors">
              Bulk Uploading
            </Link>

            <Link href="/contact" className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors">
              API
            </Link>

            <Link href="/pricing" className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors">
              Pricing
            </Link>
          </div>

          {/* Action Buttons - Desktop & Mobile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {session?.user ? (
              /* Authenticated User Menu */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                  className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Credits Badge - Now visible on mobile */}
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full">
                    <CreditCard className="w-3 h-3 text-purple-600" />
                    <span className="text-xs sm:text-sm font-semibold text-purple-900">{credits}</span>
                  </div>

                  {/* User Avatar */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                    {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
                  </div>

                  {/* ChevronDown - Desktop only */}
                  <ChevronDown className="hidden sm:block w-4 h-4 text-gray-600" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 truncate">{session.user.name || "User"}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                    </div>

                    {/* Credits Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">Available Credits</span>
                        <span className="text-lg font-bold text-purple-600">{credits}</span>
                      </div>
                      <Link href="/pricing">
                        <Button className="w-full text-xs h-8" size="sm">
                          Buy More Credits
                        </Button>
                      </Link>
                    </div>

                    {/* Menu Items */}
                    {/* <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4" />
                      Dashboard
                    </Link> */}

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Guest Buttons */
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="text-sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 sm:px-4">
                    Sign up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-3">
              {/* Bulk Uploading */}
              <Link
                href="/contact"
                className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Bulk Uploading
              </Link>

              {/* API */}
              <Link
                href="/contact"
                className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                API
              </Link>

              {/* Pricing */}
              <Link
                href="/pricing"
                className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>

              {/* Mobile Auth Buttons */}
              {!session?.user && (
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <Link href="/login" className="block">
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" className="block">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
