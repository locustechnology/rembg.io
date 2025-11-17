"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");

    await authClient.forgetPassword({
      email,
      redirectTo: "/reset-password",
    }, {
      onSuccess: () => {
        setSuccess(true);
        setIsLoading(false);
      },
      onError: (ctx) => {
        console.error("Forgot password error:", ctx.error);
        setError(ctx.error.message || "Failed to send reset email. Please try again.");
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
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
            </div>
            <Link href="/" className="inline-block">
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">RemBG</h1>
            </Link>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Check Your Email
            </h2>
          </div>

          {/* Success Message */}
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm sm:text-base text-gray-700 text-center">
              We've sent a password reset link to <strong className="break-all">{email}</strong>
            </p>
          </div>

          <div className="space-y-4 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>

            <div className="pt-4">
              <Link href="/login">
                <Button className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
                className="text-xs sm:text-sm text-primary font-semibold hover:underline"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          </div>

          <div className="mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-700 text-center">
              💡 Check your spam folder if you don't see the email
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Forgot Password?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs sm:text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center text-xs sm:text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Link>
        </div>

        <div className="mt-6 p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs sm:text-sm text-purple-700 text-center">
            🔒 Your security is important to us. The reset link will expire in 1 hour.
          </p>
        </div>
      </div>
    </div>
  );
}
