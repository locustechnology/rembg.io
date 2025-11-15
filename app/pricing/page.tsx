"use client";

import { useState, useEffect } from "react";
import { Check, Crown, Zap, Building2, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  description: string | null;
  dodoProductId: string | null;
  active: boolean;
}

interface PricingTier {
  id: string;
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
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // Fetch payment plans from API
  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch("/api/payments/plans");
        const data = await response.json();
        setPlans(data.plans || []);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Failed to load pricing plans");
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  // Map database plans to UI tiers
  const getPricingTiers = (): PricingTier[] => {
    const iconMap: { [key: string]: any } = {
      Starter: Zap,
      Pro: Crown,
      Premium: Building2,
    };

    const gradientMap: { [key: string]: string } = {
      Starter: "from-purple-600 to-blue-600",
      Pro: "from-indigo-600 to-purple-600",
      Premium: "from-blue-600 to-cyan-600",
    };

    const featuresMap: { [key: string]: string[] } = {
      Starter: [
        "25 credits",
        "High-resolution processing",
        "All output formats",
        "Email support",
        "No watermarks",
      ],
      Pro: [
        "50 credits",
        "Ultra high-resolution support",
        "Priority processing",
        "Batch processing",
        "Priority support",
      ],
      Premium: [
        "125 credits",
        "Unlimited resolution",
        "Fastest processing",
        "Advanced features",
        "24/7 priority support",
      ],
    };

    // Add Free tier first
    const freeTier: PricingTier = {
      id: "free",
      name: "Free",
      icon: Sparkles,
      price: 0,
      credits: 5,
      pricePerCredit: "$0",
      features: [
        "5 free credits on signup",
        "Unlimited Free model (ISNet)",
        "No login required for Free model",
        "2 credits/image for Superior model",
        "PNG & WebP formats",
        "Community support",
      ],
      color: "gray",
      gradient: "from-gray-600 to-gray-700",
    };

    const paidTiers = plans.map((plan, index) => ({
      id: plan.id,
      name: plan.name,
      icon: iconMap[plan.name] || Zap,
      price: Number(plan.price),
      credits: plan.credits,
      pricePerCredit: `$${(Number(plan.price) / plan.credits).toFixed(2)}`,
      popular: plan.name === "Pro", // Mark Pro as popular
      features: featuresMap[plan.name] || [`${plan.credits} credits`, plan.description || ""].filter(Boolean),
      color: "purple",
      gradient: gradientMap[plan.name] || "from-purple-600 to-blue-600",
    }));

    return [freeTier, ...paidTiers];
  };

  const handleSelectPlan = async (tier: PricingTier) => {
    if (!session?.user) {
      window.location.href = "/signup";
      return;
    }

    if (tier.price === 0) {
      window.location.href = "/";
      return;
    }

    setCheckoutLoading(tier.id);

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: tier.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Dodo checkout
      window.location.href = data.checkoutUrl;
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to start checkout process");
      setCheckoutLoading(null);
    }
  };

  const pricingTiers = getPricingTiers();

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
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Choose the perfect plan for your needs. Start free, upgrade anytime.
          </p>
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
                      <span className="text-gray-600">one-time</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {tier.credits} credits • {tier.pricePerCredit}/credit
                    </p>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectPlan(tier)}
                    disabled={checkoutLoading !== null || loading}
                    className={`w-full mb-6 ${
                      tier.popular
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        : "bg-gray-900 hover:bg-gray-800"
                    } text-white font-semibold`}
                  >
                    {checkoutLoading === tier.id ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {tier.price === 0
                          ? "Get Started Free"
                          : session?.user
                          ? "Select Plan"
                          : "Sign Up to Select"}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
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
                Credits are used to process images with our Superior model (Bria RMBG 2.0).
                The Free model requires no credits or login. The Superior model costs 2 credits
                per image and delivers professional-grade results ideal for commercial use.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What's the difference between Free and Superior models?
              </h3>
              <p className="text-gray-600">
                The Free model (ISNet) runs in your browser and produces good quality results
                without requiring login or credits. The Superior model (Bria RMBG 2.0) is a
                professional-grade AI model trained on licensed data, offering higher quality
                results ideal for commercial use at 2 credits per image.
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
