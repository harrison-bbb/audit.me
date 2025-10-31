import React, { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-chat-sidebar border border-gray-800 rounded-lg shadow-2xl max-w-md w-full p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to Audit.me
          </h2>
          <p className="text-gray-400 text-sm">
            Please enter your email address to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-chat-background border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              disabled={isSubmitting}
              autoFocus
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
              className="text-sm text-gray-300 leading-relaxed cursor-pointer"
            >
              I agree to the Black Box Bots Privacy Policy and consent to my email address and audit responses being stored for the purpose of providing my automation audit and follow-up communication.
            </Label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !agreedToPolicy}
            className="w-full bg-secondary hover:bg-secondary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                Continue to Chat
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            Your email is used to personalize your experience and maintain chat
            history. We respect your privacy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailGate;
