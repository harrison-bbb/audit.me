import React, { useState } from "react";
import { Mail, Loader2, CheckCircle, Target, Brain, BarChart3, Zap, Lightbulb } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import logo from "@/assets/BBB_Logo_Minimal_White_New.png";

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
    <div className="fixed inset-0 bg-background overflow-y-auto z-50">
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* LOGO */}
          <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <img src={logo} alt="BBB Logo" className="h-24 mx-auto mb-6" />
          </div>

          {/* HERO SECTION - NOW AT TOP */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              BBB Audit Me
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Get a custom audit from an AI trained on Harrison Smith's methodology
            </p>
          </div>

          {/* EMAIL FORM SECTION - NOW BELOW HERO */}
          <div className="max-w-2xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="p-8 bg-card border-border shadow-xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto border border-white/20">
                  <Mail className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Ready to Start Your Audit?
                </h3>
                <p className="text-muted-foreground">
                  Enter your email address to begin
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={isSubmitting}
                    className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all disabled:opacity-50"
                    required
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border-2 border-white/20">
                  <Checkbox
                    id="privacy-policy"
                    checked={agreedToPolicy}
                    onCheckedChange={(checked) => setAgreedToPolicy(checked as boolean)}
                    disabled={isSubmitting}
                    className="mt-0.5 h-5 w-5 border-2 border-white/70 data-[state=checked]:bg-white data-[state=checked]:text-background"
                  />
                  <Label
                    htmlFor="privacy-policy"
                    className="text-sm text-foreground leading-relaxed cursor-pointer"
                  >
                    I agree to the{" "}
                    <a
                      href="https://blackboxbots.com/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-white transition-colors"
                    >
                      Privacy Policy
                    </a>
                    .
                  </Label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !agreedToPolicy}
                  className="w-full bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-sm hover:from-white hover:to-white/90 text-background font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg border border-white/20"
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

                <p className="text-sm text-center text-muted-foreground mt-2">
                  Your interactive AI audit will begin on the next page.
                </p>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Your email is used to personalize your experience and maintain your audit
                  history. We respect your privacy and will never share your information.
                </p>
              </div>
            </Card>
          </div>

          {/* SOCIAL PROOF SECTION */}
          <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-900">
            <Card className="p-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border-white/20">
              <h3 className="text-2xl font-bold text-foreground mb-4 text-center">
                Real Results from BBB Automation
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-2xl mx-auto">
                How we saved a marketing agency $84,000/year on client onboarding
              </p>
              <div className="aspect-video max-w-3xl mx-auto rounded-lg overflow-hidden shadow-lg">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/tVj0h2SKn5s"
                  title="BBB Client Testimonial"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </Card>
          </div>

          {/* VALUE SECTION */}
          <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-900">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12 uppercase tracking-wide">
              What You'll Get from the BBB Audit Me
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="p-6 bg-card border-border hover:shadow-lg hover:shadow-white/5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                        <benefit.icon className="w-6 h-6 text-foreground" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* PROCESS PREVIEW */}
          <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Card className="p-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border-white/20">
              <h3 className="text-2xl font-bold text-foreground mb-4 text-center">
                How It Works
              </h3>
              <p className="text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed">
                The audit asks targeted questions about your business, analyzes your responses
                using BBB's proven frameworks, then delivers customized solutions with ROI estimates.
                It's like having a consultation with a seasoned strategist, available 24/7.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailGate;
