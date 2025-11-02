import React, { useState } from "react";
import { Mail, Loader2, CheckCircle, Target, Brain, BarChart3, Zap, Lightbulb } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

const EmailGate: React.FC = () => {
  const { setEmail } = useAuth();
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailInput.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!validateEmail(emailInput)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!agreedToPolicy) {
      toast.error("Please agree to the privacy policy to continue");
      return;
    }

    setIsSubmitting(true);

    try {
      await setEmail(emailInput.trim());
      toast.success("Welcome! You can now start chatting.");
    } catch (error) {
      console.error("Error submitting email:", error);
      toast.error("Failed to verify email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: Target,
      title: "Deep-dive questioning to understand your company's full context",
      description: "Our AI asks targeted questions to fully understand your unique business situation"
    },
    {
      icon: Brain,
      title: "AI trained on Harrison Smith's proven methodologies and frameworks",
      description: "Leverage years of expertise and battle-tested strategies in every recommendation"
    },
    {
      icon: BarChart3,
      title: "Comprehensive analysis of your business challenges and opportunities",
      description: "Get a complete picture of where your business stands and where it can go"
    },
    {
      icon: Zap,
      title: "Tailored solutions with estimated ROI for each recommendation",
      description: "Know exactly what to expect from each suggested improvement"
    },
    {
      icon: Lightbulb,
      title: "Strategic insights based on BBB's founder-level thinking",
      description: "Access executive-level strategy without the executive-level price tag"
    },
    {
      icon: CheckCircle,
      title: "Actionable next steps prioritized by impact",
      description: "Start with what matters most and build momentum from day one"
    }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white overflow-y-auto z-50">
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* HERO SECTION */}
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              BBB Audit Me
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get a custom audit from an AI trained on Harrison Smith's methodology
            </p>
          </div>

          {/* VALUE SECTION */}
          <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 uppercase tracking-wide">
              What You'll Get from the BBB Audit Me
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="p-6 bg-white border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <benefit.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* PROCESS PREVIEW */}
          <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-900">
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                How It Works
              </h3>
              <p className="text-gray-700 text-center max-w-3xl mx-auto leading-relaxed">
                The audit asks targeted questions about your business, analyzes your responses
                using BBB's proven frameworks, then delivers customized solutions with ROI estimates.
                It's like having a consultation with a seasoned strategist, available 24/7.
              </p>
            </Card>
          </div>

          {/* EMAIL FORM SECTION */}
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Card className="p-8 bg-white border-gray-200 shadow-xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Ready to Start Your Audit?
                </h3>
                <p className="text-gray-600">
                  Enter your email address to begin
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={isSubmitting}
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-blue-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                    required
                  />
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="privacy-policy"
                    checked={agreedToPolicy}
                    onCheckedChange={(checked) => setAgreedToPolicy(checked as boolean)}
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                  <Label
                    htmlFor="privacy-policy"
                    className="text-sm text-gray-600 leading-relaxed cursor-pointer"
                  >
                    I agree to the Black Box Bots Privacy Policy and consent to my email address
                    and audit responses being stored for the purpose of providing my automation
                    audit and follow-up communication.
                  </Label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !agreedToPolicy}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Starting your audit...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Start My Audit
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Your email is used to personalize your experience and maintain your audit
                  history. We respect your privacy and will never share your information.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailGate;
