"use client";

import { ChevronDown, LogOut, User, CreditCard, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { useAuthStore } from "@/lib/store";

export default function Navbar() {
  const [aiToolsOpen, setAiToolsOpen] = useState(false);
  const [developersOpen, setDevelopersOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: session } = useSession();
  const { credits, fetchCredits, setUser, setSession, reset } = useAuthStore();

  // Fetch credits when user logs in
  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
      setSession(session);
      fetchCredits();
    } else {
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
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <div className="grid grid-cols-2 gap-0.5 w-4 h-4 sm:w-5 sm:h-5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-sm"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/70 rounded-sm"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/70 rounded-sm"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-sm"></div>
              </div>
            </div>
            <span className="text-lg sm:text-xl font-semibold text-gray-900">
              RemBG
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="relative">
              <button
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors py-2"
                onClick={() => setAiToolsOpen(!aiToolsOpen)}
                onBlur={() => setTimeout(() => setAiToolsOpen(false), 200)}
              >
                <span className="font-medium text-sm">AI Tools</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {aiToolsOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Background Remover
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Image Upscaler
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Object Removal
                  </a>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors py-2"
                onClick={() => setDevelopersOpen(!developersOpen)}
                onBlur={() => setTimeout(() => setDevelopersOpen(false), 200)}
              >
                <span className="font-medium text-sm">Developers</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {developersOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    API Documentation
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    SDK & Libraries
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Code Examples
                  </a>
                </div>
              )}
            </div>

            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors">
              Pricing
            </a>
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
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4" />
                      Dashboard
                    </Link>

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
              {/* AI Tools */}
              <div>
                <button
                  onClick={() => setAiToolsOpen(!aiToolsOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">AI Tools</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${aiToolsOpen ? 'rotate-180' : ''}`} />
                </button>
                {aiToolsOpen && (
                  <div className="ml-4 mt-2 space-y-1">
                    <a href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                      Background Remover
                    </a>
                    <a href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                      Image Upscaler
                    </a>
                    <a href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                      Object Removal
                    </a>
                  </div>
                )}
              </div>

              {/* Developers */}
              <div>
                <button
                  onClick={() => setDevelopersOpen(!developersOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">Developers</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${developersOpen ? 'rotate-180' : ''}`} />
                </button>
                {developersOpen && (
                  <div className="ml-4 mt-2 space-y-1">
                    <a href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                      API Documentation
                    </a>
                    <a href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                      SDK & Libraries
                    </a>
                    <a href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                      Code Examples
                    </a>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <a href="#" className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                Pricing
              </a>

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
