"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Extract token from URL query params
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      setError("Invalid or missing reset token. Please request a new password reset link.");
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Invalid reset token. Please request a new password reset link.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please enter your new password");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    await authClient.resetPassword({
      newPassword,
      token, // Include the token from URL
    }, {
      onSuccess: () => {
        setSuccess(true);
        setIsLoading(false);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      },
      onError: (ctx) => {
        console.error("Reset password error:", ctx.error);

        const errorMessage = ctx.error.message || "";
        if (errorMessage.toLowerCase().includes("expired") || errorMessage.toLowerCase().includes("invalid") || errorMessage.toLowerCase().includes("token")) {
          setError("This reset link has expired or is invalid. Please request a new password reset.");
        } else {
          setError(errorMessage || "Failed to reset password. Please try again.");
        }
        setIsLoading(false);
      },
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-3 sm:p-4">
        <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8">
          {/* Success Icon */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Link href="/" className="inline-block">
                <Image
                  src="/rembg_photo_2025-11-17_13-29-10_2025-11-17_07-59-47_isnet.png"
                  alt="RemBG Logo"
                  width={64}
                  height={64}
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                />
              </Link>
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Password Reset Successful!
            </h2>
          </div>

          {/* Success Message */}
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm sm:text-base text-gray-700 text-center">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Redirecting to login page in 3 seconds...
            </p>
            <Link href="/login">
              <Button className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold">
                Go to Login
              </Button>
            </Link>
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Reset Your Password
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Enter your new password below
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
            {error.includes("expired") && (
              <div className="mt-3 text-center">
                <Link href="/forgot-password" className="text-xs sm:text-sm text-primary font-semibold hover:underline">
                  Request a new reset link
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
                required
                disabled={isLoading || !token}
                className="h-11 sm:h-12 text-sm sm:text-base pr-10"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                disabled={isLoading || !token}
                className="h-11 sm:h-12 text-sm sm:text-base pr-10"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !token}
            className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link href="/login" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900">
            Back to Login
          </Link>
        </div>

        <div className="mt-6 p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs sm:text-sm text-purple-700 text-center">
            🔒 Make sure your password is strong and unique
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
