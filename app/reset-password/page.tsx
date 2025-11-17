"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    try {
      setIsLoading(true);
      setError("");

      await authClient.resetPassword({
        newPassword,
      });

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      console.error("Reset password error:", err);

      if (err.message?.includes("expired") || err.message?.includes("invalid")) {
        setError("This reset link has expired or is invalid. Please request a new password reset.");
      } else {
        setError(err.message || "Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-3 sm:p-4">
        <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8">
          {/* Success Icon */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
            </div>
            <Link href="/" className="inline-block">
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">RemBG</h1>
            </Link>
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
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 8 characters)"
              required
              disabled={isLoading || !token}
              className="h-11 sm:h-12 text-sm sm:text-base"
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              disabled={isLoading || !token}
              className="h-11 sm:h-12 text-sm sm:text-base"
              minLength={8}
            />
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
