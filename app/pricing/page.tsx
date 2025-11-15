"use client";

import { useState, useEffect } from "react";
import { Check, Sparkles, Zap, Crown, ArrowRight, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

export default function PricingPage() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

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

  const handleSelectPlan = async (planId: string, planPrice: number) => {
    if (!session?.user) {
      window.location.href = "/signup";
      return;
    }

    if (planPrice === 0) {
      window.location.href = "/";
      return;
    }

    setCheckoutLoading(planId);

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      window.location.href = data.checkoutUrl;
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to start checkout process");
      setCheckoutLoading(null);
    }
  };

  // Filter plans by billing period
  const getFilteredPlans = () => {
    return plans.filter(plan => {
      if (billingPeriod === 'yearly') {
        return plan.name.includes('Yearly');
      } else {
        return !plan.name.includes('Yearly');
      }
    });
  };

  const filteredPlans = getFilteredPlans();

  // Calculate savings for yearly plans
  const getSavingsPercentage = (plan: PaymentPlan) => {
    if (!plan.name.includes('Yearly')) return 0;

    const baseName = plan.name.replace(' Yearly', '');
    const monthlyPlan = plans.find(p => p.name === baseName && !p.name.includes('Yearly'));

    if (monthlyPlan) {
      const monthlyTotal = monthlyPlan.price * 12;
      const savings = ((monthlyTotal - plan.price) / monthlyTotal) * 100;
      return Math.round(savings);
    }
    return 20; // Default 20% savings
  };

  const getPlanFeatures = (planName: string, credits: number) => {
    const baseName = planName.replace(' Yearly', '');

    const featuresMap: { [key: string]: string[] } = {
      'Starter': [
        'Free model (ISNet) - unlimited use',
        'Superior model (Bria RMBG 2.0)',
        'High-quality background removal',
        'All output formats (PNG, WebP, JPG)',
        'Email support',
        'Commercial usage allowed',
      ],
      'Premium': [
        'Everything in Starter',
        'Priority processing',
        'Advanced AI models',
        'Bulk image processing',
        'Priority email support',
        'API access (coming soon)',
      ],
    };

    return featuresMap[baseName] || [
      `${credits} credits included`,
      'Free model - unlimited use',
      'Superior model - 2 credits/image',
      'All output formats',
      'Email support',
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              Start with our free model. Upgrade to Superior AI when you need professional results.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 p-1.5 bg-white rounded-full shadow-lg border border-gray-200">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  billingPeriod === 'monthly'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 relative ${
                  billingPeriod === 'yearly'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">

            {/* Free Tier */}
            <div className="relative bg-white rounded-3xl shadow-xl border-2 border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105">
              <div className="p-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-700">Free Forever</span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <p className="text-gray-600 mb-6">Perfect to get started</p>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">$0</span>
                    <span className="text-gray-600">/forever</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    5 free credits + unlimited free model
                  </p>
                </div>

                <Button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 rounded-xl font-semibold text-lg transition-all duration-300"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">Unlimited Free model (ISNet)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">5 credits for Superior model</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">No login required for free model</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">All output formats</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">Community support</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Paid Plans */}
            {filteredPlans.map((plan, index) => {
              const isPopular = plan.name.includes('Starter');
              const savings = getSavingsPercentage(plan);
              const Icon = plan.name.includes('Premium') ? Crown : Zap;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                    isPopular ? 'ring-4 ring-purple-600 ring-opacity-50 lg:scale-105' : 'border-2 border-gray-200'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 text-sm font-bold">
                      🔥 MOST POPULAR
                    </div>
                  )}

                  <div className={`p-8 ${isPopular ? 'pt-14' : ''}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mb-6">
                      <Icon className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-700">
                        {plan.name.replace(' Yearly', '')}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name.replace(' Yearly', '')}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {plan.name.includes('Premium') ? 'For power users' : 'For regular use'}
                    </p>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          ${plan.price}
                        </span>
                        <span className="text-gray-600">
                          /{billingPeriod === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>

                      {billingPeriod === 'yearly' && savings > 0 && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                          <span className="text-sm font-semibold text-green-700">
                            Save {savings}% vs monthly
                          </span>
                        </div>
                      )}

                      <p className="text-sm text-gray-600 mt-3">
                        {plan.credits.toLocaleString()} credits • ${(plan.price / plan.credits).toFixed(3)}/credit
                      </p>
                    </div>

                    <Button
                      onClick={() => handleSelectPlan(plan.id, plan.price)}
                      disabled={checkoutLoading !== null || loading}
                      className={`w-full py-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                        isPopular
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                    >
                      {checkoutLoading === plan.id ? (
                        <>
                          <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {session?.user ? 'Select Plan' : 'Sign Up to Select'}
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </Button>

                    <ul className="mt-8 space-y-4">
                      {getPlanFeatures(plan.name, plan.credits).map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-purple-600" />
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mt-32">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Everything you need to know about RemBG pricing
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  What are credits?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Credits are used for our Superior AI model (Bria RMBG 2.0). The free model requires no credits. Superior model costs 2 credits per image.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Do credits expire?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  No! Your credits never expire. Use them whenever you need professional-quality results.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Can I switch plans?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Yes! You can upgrade or change plans anytime. Unused credits roll over to your new plan.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  What's the free model?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  ISNet runs in your browser, requires no login, and works great for casual use. Perfect for getting started!
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  What's the Superior model?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Bria RMBG 2.0 is a professional AI model trained on licensed data, delivering exceptional quality for commercial use.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Need more credits?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Contact us for custom enterprise plans with higher credit limits and dedicated support.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Section */}
          <div className="max-w-5xl mx-auto mt-24">
            <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-3xl p-12 text-center overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

              <div className="relative z-10">
                <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Trusted by Professionals Worldwide
                </h3>
                <p className="text-purple-100 text-lg mb-10 max-w-2xl mx-auto">
                  Join thousands of designers, photographers, and businesses using RemBG
                </p>

                <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6">
                    <div className="text-4xl font-bold text-white mb-2">10M+</div>
                    <div className="text-purple-100 text-sm">Images Processed</div>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6">
                    <div className="text-4xl font-bold text-white mb-2">50K+</div>
                    <div className="text-purple-100 text-sm">Happy Users</div>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6">
                    <div className="text-4xl font-bold text-white mb-2">4.9★</div>
                    <div className="text-purple-100 text-sm">Average Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
