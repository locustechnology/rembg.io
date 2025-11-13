"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError("");
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || "Failed to login with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "login" }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          // User doesn't exist
          setError(data.error);
          return;
        }
        throw new Error(data.error || "Failed to send OTP");
      }

      setOtpSent(true);
    } catch (err: any) {
      console.error("Send OTP error:", err);
      setError(err.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP");
      }

      // OTP verified and session created successfully
      console.log("Login successful, redirecting to home...");
      console.log("Response data:", data);

      // Longer delay to ensure cookie is properly set
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force a full page reload to pick up the new session
      console.log("Redirecting to home page...");
      window.location.href = "/";
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      setError(err.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  if (otpSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-3 sm:p-4">
        <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">RemBG</h1>
            </Link>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Enter Verification Code
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              We sent a 6-digit code to <strong className="break-all">{email}</strong>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerifyOTP} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="otp" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
                disabled={isLoading}
                className="h-12 sm:h-14 text-center text-xl sm:text-2xl letter-spacing-wider font-bold"
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold"
            >
              {isLoading ? "Verifying..." : "Verify & Login"}
            </Button>
          </form>

          {/* Resend & Change Email */}
          <div className="mt-4 sm:mt-6 text-center space-y-2">
            <button
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setError("");
              }}
              className="text-xs sm:text-sm text-primary font-semibold hover:underline"
            >
              Use a different email
            </button>
            <br />
            <button
              onClick={handleSendOTP}
              disabled={isLoading}
              className="text-xs sm:text-sm text-gray-600 hover:text-gray-900"
            >
              Didn't receive code? Resend
            </button>
          </div>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
            <p className="text-xs sm:text-sm text-purple-700">
              ⏱️ Code expires in 10 minutes
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">RemBG</h1>
          </Link>
          <p className="text-sm sm:text-base text-gray-600">Welcome back! Sign in to continue</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs sm:text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Google Login */}
        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full mb-3 sm:mb-4 h-11 sm:h-12 text-sm sm:text-base font-semibold bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300"
          variant="outline"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative my-4 sm:my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="px-3 sm:px-4 bg-white text-gray-500">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleSendOTP} className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              className="h-11 sm:h-12 text-sm sm:text-base"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold"
          >
            {isLoading ? "Sending code..." : "Send Verification Code"}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </div>

        <div className="mt-3 sm:mt-4 text-center text-[10px] sm:text-xs text-gray-500">
          By continuing, you agree to RemBG's Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}
