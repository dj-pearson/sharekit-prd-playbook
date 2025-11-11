import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Rocket, CheckCircle, Copy, Twitter, Linkedin, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import confetti from "canvas-confetti";

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [completedPageUrl, setCompletedPageUrl] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const steps = [
    {
      title: "Welcome to ShareKit! 🎉",
      description: "Get set up in under 3 minutes",
      icon: Sparkles,
    },
    {
      title: "What will you share?",
      description: "Choose your first resource type",
      icon: Sparkles,
    },
    {
      title: "You're live! 🚀",
      description: "Your page is ready to share",
      icon: Rocket,
    },
  ];

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
        })
        .eq('id', user.id);

      // Trigger confetti celebration
      triggerConfetti();

      toast({
        title: "🎉 Welcome aboard!",
        description: "You're all set! Let's start sharing.",
      });

      // Move to success step
      setCurrentStep(2);
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error);
      setIsOpen(false);
      onComplete();
    }
  };

  const handleSkip = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
        })
        .eq('id', user.id);

      setIsOpen(false);
      onComplete();
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
      setIsOpen(false);
      onComplete();
    }
  };

  const handleStartCreating = () => {
    navigate('/dashboard/pages/create');
    setIsOpen(false);
    onComplete();
  };

  const handleGoToDashboard = () => {
    setIsOpen(false);
    onComplete();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard 🚀",
    });
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 text-center py-8">
            <div className="mx-auto animate-pulse">
              <Logo size="xl" showText={false} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Welcome to ShareKit!</h2>
              <p className="text-slate-600 max-w-md mx-auto">
                While ConvertKit users spend 2 hours in setup tutorials,
                you'll be getting signups in <strong>under 3 minutes</strong>.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-8 text-center">
              <div className="p-4 bg-cyan-50 rounded-lg">
                <div className="text-2xl font-bold text-cyan-600 mb-1">3 min</div>
                <p className="text-xs text-slate-600">Setup time</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600 mb-1">Real-time</div>
                <p className="text-xs text-slate-600">Live notifications</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">Beautiful</div>
                <p className="text-xs text-slate-600">By default</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200 mt-6">
              <p className="text-sm text-cyan-900">
                <strong>✨ The ShareKit Difference:</strong> Generous positioning, not salesy.
                Real-time dopamine with live signups. Beautiful without design skills.
              </p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 py-6">
            <p className="text-slate-600 text-center">
              ShareKit works best with <strong>guides, checklists, templates, and resources</strong>
              that provide immediate value. What will you share first?
            </p>

            <div className="grid gap-3">
              <Button
                onClick={handleStartCreating}
                className="w-full h-auto py-4 justify-start text-left bg-gradient-ocean hover:opacity-90"
                size="lg"
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    📄
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">Create your first page</div>
                    <div className="text-sm opacity-90">Choose a beautiful template and go live in minutes</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => {
                  navigate('/dashboard/upload');
                  setIsOpen(false);
                  onComplete();
                }}
                variant="outline"
                className="w-full h-auto py-4 justify-start text-left"
                size="lg"
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    📤
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">Upload a resource first</div>
                    <div className="text-sm text-slate-600">Start by uploading your PDF or file</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={handleComplete}
                variant="ghost"
                className="w-full"
              >
                I'll do this later → Go to Dashboard
              </Button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-sm text-amber-900">
                <strong>💡 Pro tip:</strong> You're faster than 80% of users! Keep going! 🚀
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">You're All Set! 🎉</h3>
                <p className="text-slate-600">
                  Your ShareKit account is ready. Create your first page and start
                  seeing live signups in real-time!
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-lg border border-cyan-200">
              <h3 className="font-semibold mb-3 text-slate-900">🚀 What makes ShareKit special:</h3>
              <ul className="text-sm text-slate-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600">✓</span>
                  <span><strong>Live notifications:</strong> Watch signups happen in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600">✓</span>
                  <span><strong>Generous by default:</strong> No pushy sales language</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600">✓</span>
                  <span><strong>Beautiful instantly:</strong> Professional templates, no design needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600">✓</span>
                  <span><strong>Viral attribution:</strong> Built-in word-of-mouth growth</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleStartCreating}
                className="flex-1 bg-gradient-ocean hover:opacity-90"
                size="lg"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Create Your First Page
              </Button>
              <Button
                onClick={handleGoToDashboard}
                variant="outline"
                size="lg"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Skip Button - only show on first two steps */}
          {currentStep < 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="absolute right-0 top-0 text-slate-500 hover:text-slate-700 z-10"
            >
              Skip for now
            </Button>
          )}

          {/* Progress Bar - only show on first two steps */}
          {currentStep < 2 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-sm font-medium text-cyan-600">
                  {Math.round(progress)}% • Almost there! ⚡
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Step Header */}
          {currentStep < 2 && (
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                <Icon className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{currentStepData.title}</h2>
                <p className="text-sm text-slate-600">{currentStepData.description}</p>
              </div>
            </div>
          )}

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation - only for first step */}
          {currentStep === 0 && (
            <div className="mt-6">
              <Button
                onClick={() => setCurrentStep(1)}
                className="w-full bg-gradient-ocean hover:opacity-90"
                size="lg"
              >
                Let's Get Started! →
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
