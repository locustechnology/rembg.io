"use client";

import { useState } from "react";
import { Check, Crown, Zap, Building2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

interface PricingTier {
  name: string;
  icon: any;
  price: number;
  credits: number;
  pricePerCredit: string;
  popular?: boolean;
  features: string[];
  color: string;
  gradient: string;
}

export default function PricingPage() {
  const { data: session } = useSession();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const pricingTiers: PricingTier[] = [
    {
      name: "Free",
      icon: Sparkles,
      price: 0,
      credits: 5,
      pricePerCredit: "$0",
      features: [
        "5 free credits on signup",
        "Basic image processing",
        "Standard quality output",
        "PNG & WebP formats",
        "Community support",
      ],
      color: "gray",
      gradient: "from-gray-600 to-gray-700",
    },
    {
      name: "Starter",
      icon: Zap,
      price: billingCycle === "monthly" ? 9 : 90,
      credits: billingCycle === "monthly" ? 50 : 600,
      pricePerCredit: billingCycle === "monthly" ? "$0.18" : "$0.15",
      popular: true,
      features: [
        `${billingCycle === "monthly" ? "50" : "600"} credits per ${billingCycle === "monthly" ? "month" : "year"}`,
        "High-resolution processing",
        "Priority processing queue",
        "All output formats",
        "Email support",
        "No watermarks",
      ],
      color: "purple",
      gradient: "from-purple-600 to-blue-600",
    },
    {
      name: "Professional",
      icon: Crown,
      price: billingCycle === "monthly" ? 29 : 290,
      credits: billingCycle === "monthly" ? 200 : 2500,
      pricePerCredit: billingCycle === "monthly" ? "$0.145" : "$0.116",
      features: [
        `${billingCycle === "monthly" ? "200" : "2,500"} credits per ${billingCycle === "monthly" ? "month" : "year"}`,
        "Ultra high-resolution support",
        "Fastest processing",
        "Batch processing",
        "API access",
        "Priority support",
        "Advanced customization",
      ],
      color: "indigo",
      gradient: "from-indigo-600 to-purple-600",
    },
    {
      name: "Business",
      icon: Building2,
      price: billingCycle === "monthly" ? 99 : 990,
      credits: billingCycle === "monthly" ? 1000 : 12500,
      pricePerCredit: billingCycle === "monthly" ? "$0.099" : "$0.079",
      features: [
        `${billingCycle === "monthly" ? "1,000" : "12,500"} credits per ${billingCycle === "monthly" ? "month" : "year"}`,
        "Unlimited resolution",
        "Dedicated processing",
        "White-label option",
        "Advanced API features",
        "Custom integrations",
        "24/7 priority support",
        "Team collaboration",
      ],
      color: "blue",
      gradient: "from-blue-600 to-cyan-600",
    },
  ];

  const handleSelectPlan = (tier: PricingTier) => {
    if (!session?.user) {
      window.location.href = "/signup";
      return;
    }

    if (tier.price === 0) {
      window.location.href = "/";
      return;
    }

    // TODO: Integrate with payment gateway
    console.log("Selected plan:", tier.name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Choose the perfect plan for your needs. Start free, upgrade anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span
              className={`text-sm font-semibold ${
                billingCycle === "monthly" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")
              }
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                  billingCycle === "annual" ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-semibold ${
                billingCycle === "annual" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Annual
            </span>
            <span className="ml-2 inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1 text-xs font-semibold text-white">
              Save 20%
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {pricingTiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  tier.popular ? "ring-4 ring-purple-600 ring-opacity-50" : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 left-0">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-1 text-xs font-semibold">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <div className={`p-6 ${tier.popular ? "pt-10" : "pt-6"}`}>
                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                      {tier.popular && (
                        <p className="text-xs text-purple-600 font-semibold">Best Value</p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        ${tier.price}
                      </span>
                      <span className="text-gray-600">
                        /{billingCycle === "monthly" ? "mo" : "yr"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {tier.credits} credits • {tier.pricePerCredit}/credit
                    </p>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectPlan(tier)}
                    className={`w-full mb-6 ${
                      tier.popular
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        : "bg-gray-900 hover:bg-gray-800"
                    } text-white font-semibold`}
                  >
                    {tier.price === 0
                      ? "Get Started Free"
                      : session?.user
                      ? "Select Plan"
                      : "Sign Up to Select"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>

                  {/* Features */}
                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What are credits?
              </h3>
              <p className="text-gray-600">
                Credits are used to process images. Low-resolution images (under 2MB)
                cost 1 credit, while high-resolution images (2MB+) cost 3 credits.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do credits expire?
              </h3>
              <p className="text-gray-600">
                Credits purchased with a subscription refresh monthly or annually. Unused
                credits don't roll over, but you can always upgrade for more.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can cancel your subscription at any time. You'll retain access
                to your remaining credits until the end of your billing period.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express),
                PayPal, and bank transfers for Business plans.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Yes! Every new user gets 5 free credits to try RemBG. No credit card
                required to get started.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Need a custom plan?
              </h3>
              <p className="text-gray-600">
                For enterprise needs or custom solutions, please{" "}
                <a
                  href="mailto:support@rembg.io"
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  contact our sales team
                </a>
                . We'll work with you to create a plan that fits your requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Banner */}
        <div className="max-w-5xl mx-auto mt-20">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-3">
              Join thousands of satisfied users
            </h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              RemBG is trusted by designers, photographers, e-commerce businesses, and
              creative professionals worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div>
                <div className="text-3xl font-bold">10M+</div>
                <div className="text-purple-100">Images Processed</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-purple-100">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold">4.9/5</div>
                <div className="text-purple-100">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
