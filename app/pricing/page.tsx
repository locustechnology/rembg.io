"use client";

import { useState, useEffect } from "react";
import { Check, X, Plus, Minus } from "lucide-react";
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
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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
      if (billingPeriod === 'annually') {
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 to-white">
      <Navbar />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Start with our free model. Upgrade to Superior AI when you need professional results.
            </p>

            {/* Billing Toggle */}
            <div className="flex justify-center items-center gap-3">
              <span className={`text-base font-medium ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annually' : 'monthly')}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  billingPeriod === 'annually' ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    billingPeriod === 'annually' ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-base font-medium ${billingPeriod === 'annually' ? 'text-gray-900' : 'text-gray-500'}`}>
                Annually
              </span>
              {billingPeriod === 'annually' && (
                <span className="ml-2 bg-purple-600 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                  20% off
                </span>
              )}
            </div>
          </div>

          {/* Pricing Cards - 3 Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">

            {/* Free Tier */}
            <div className="relative bg-white rounded-3xl border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="p-8">
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
                  variant="outline"
                  className="w-full py-6 rounded-xl font-medium text-base border-2 border-purple-600 text-purple-600 hover:bg-purple-50 transition-all duration-300"
                >
                  Get Started Free
                </Button>

                <ul className="mt-8 space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">Unlimited Free model (ISNet)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">5 credits for Superior model</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">No login required for free model</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">All output formats</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">Community support</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Paid Plans from API */}
            {filteredPlans.map((plan, index) => {
              const isPopular = plan.name.includes('Starter');
              const savings = getSavingsPercentage(plan);
              const baseName = plan.name.replace(' Yearly', '');

              // Calculate monthly price for yearly plans
              const displayPrice = plan.name.includes('Yearly')
                ? (plan.price / 12).toFixed(2)
                : plan.price;

              return (
                <div
                  key={plan.id}
                  className="relative bg-white rounded-3xl border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Best Value Badge for Starter plan only */}
                  {plan.name.includes('Starter') && plan.name.includes('Yearly') && (
                    <div className="absolute top-0 right-0 w-40 h-40 overflow-hidden">
                      <div className="absolute top-7 -right-10 w-56 bg-purple-600 text-white text-center py-1.5 text-xs font-bold transform rotate-45 shadow-md">
                        BEST VALUE
                      </div>
                    </div>
                  )}

                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {baseName}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {plan.name.includes('Premium') ? 'For power users' : 'For regular use'}
                    </p>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-bold text-gray-900">
                          ${displayPrice}
                        </span>
                        <span className="text-gray-600">/month</span>
                      </div>

                      {plan.name.includes('Yearly') && (
                        <p className="text-sm text-gray-500 mt-1">
                          ${plan.price.toFixed(2)} billed yearly
                        </p>
                      )}

                      {!plan.name.includes('Yearly') && (
                        <p className="text-sm text-gray-500 mt-1">Billed once</p>
                      )}

                      <p className="text-sm text-gray-600 mt-3">
                        {plan.credits.toLocaleString()} credits • ${(plan.price / plan.credits).toFixed(3)}/credit
                      </p>
                    </div>

                    <Button
                      onClick={() => handleSelectPlan(plan.id, plan.price)}
                      disabled={checkoutLoading !== null || loading}
                      variant={isPopular ? 'default' : 'outline'}
                      className={`w-full py-6 rounded-xl font-medium text-base transition-all duration-300 ${
                        isPopular
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      {checkoutLoading === plan.id ? 'Processing...' : session?.user ? 'Subscribe now' : 'Sign Up to Subscribe'}
                    </Button>

                    <ul className="mt-8 space-y-3">
                      {getPlanFeatures(plan.name, plan.credits).map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ Section - Accordion Style */}
          <div className="max-w-4xl mx-auto mt-32 mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
              Background remover: your questions answered
            </h2>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {[
                {
                  question: "What are credits?",
                  answer: "Credits are used for our Superior AI model (Bria RMBG 2.0). The free model requires no credits and you can use it unlimited times. The Superior model costs 2 credits per image and delivers professional-grade results."
                },
                {
                  question: "Do credits expire?",
                  answer: "No! Your credits never expire. Use them whenever you need professional-quality background removal results. They stay in your account until you use them."
                },
                {
                  question: "Can I switch plans anytime?",
                  answer: "Yes! You can upgrade or change plans anytime. Unused credits roll over to your new plan, so you never lose what you've purchased."
                },
                {
                  question: "What's the free model?",
                  answer: "ISNet is our free AI model that runs directly in your browser. It requires no login, works great for casual use, and is perfect for getting started with background removal!"
                },
                {
                  question: "What's the Superior model?",
                  answer: "Bria RMBG 2.0 is our professional AI model trained on licensed data, delivering exceptional quality for commercial use. It provides the highest accuracy and handles complex backgrounds with ease."
                },
                {
                  question: "How can I get more credits?",
                  answer: "You can purchase additional credits anytime by selecting one of our credit packages above. For high-volume needs, contact us for custom enterprise plans with dedicated support."
                }
              ].map((faq, index) => (
                <div key={index} className="border-b border-gray-200 last:border-b-0">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-gray-50 transition-colors duration-200"
                  >
                    <span className="text-lg md:text-xl font-semibold text-gray-900 pr-8">
                      {faq.question}
                    </span>
                    <div className="flex-shrink-0">
                      {openFaqIndex === index ? (
                        <Minus className="w-6 h-6 text-gray-900 transition-transform duration-300" />
                      ) : (
                        <Plus className="w-6 h-6 text-gray-900 transition-transform duration-300" />
                      )}
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 md:px-8 pb-6 md:pb-8">
                      <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
