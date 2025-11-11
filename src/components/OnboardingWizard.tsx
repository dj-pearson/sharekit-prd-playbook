import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Upload, FileText, Palette, Rocket, X, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const steps = [
    {
      title: "Welcome to ShareKit! 👋",
      description: "Let's get you set up in just 2 minutes",
      icon: Sparkles,
      content: (
        <div className="space-y-4 text-center py-8">
          <div className="w-20 h-20 rounded-full bg-gradient-ocean mx-auto flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Welcome to ShareKit!</h2>
          <p className="text-slate-600 max-w-md mx-auto">
            ShareKit makes it easy to share your digital resources with beautiful landing pages
            that capture emails and deliver content automatically.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-8 text-left">
            <div className="p-4 bg-slate-50 rounded-lg">
              <Upload className="w-8 h-8 text-cyan-600 mb-2" />
              <h3 className="font-semibold mb-1">Upload Resources</h3>
              <p className="text-sm text-slate-600">PDFs, guides, templates</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <Palette className="w-8 h-8 text-cyan-600 mb-2" />
              <h3 className="font-semibold mb-1">Beautiful Pages</h3>
              <p className="text-sm text-slate-600">Professional templates</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <Rocket className="w-8 h-8 text-cyan-600 mb-2" />
              <h3 className="font-semibold mb-1">Auto Delivery</h3>
              <p className="text-sm text-slate-600">Email capture & send</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Upload Your First Resource",
      description: "Add a PDF, guide, or checklist to share",
      icon: Upload,
      content: (
        <div className="space-y-4 py-6">
          <p className="text-slate-600">
            First, let's upload a digital resource you want to share with your audience.
            This could be a PDF guide, checklist, template, or any downloadable content.
          </p>
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <p className="text-sm text-cyan-800">
              <strong>Tip:</strong> You can upload PDFs, DOCX, ZIP files, and more.
              Maximum file size is 25MB on the free plan.
            </p>
          </div>
          <Button
            onClick={() => navigate('/dashboard/upload')}
            className="w-full bg-gradient-ocean hover:opacity-90"
            size="lg"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Your First Resource
          </Button>
          <Button
            onClick={() => setCurrentStep(2)}
            variant="ghost"
            className="w-full"
          >
            I'll do this later
          </Button>
        </div>
      ),
    },
    {
      title: "Create Your First Page",
      description: "Build a beautiful landing page",
      icon: FileText,
      content: (
        <div className="space-y-4 py-6">
          <p className="text-slate-600">
            Now let's create a landing page where people can request your resource.
            Choose from 5 professionally designed templates.
          </p>
          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="p-3 border rounded-lg hover:border-cyan-400 cursor-pointer transition-colors">
              <div className="h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded mb-2"></div>
              <p className="text-sm font-medium">Minimal</p>
            </div>
            <div className="p-3 border rounded-lg hover:border-cyan-400 cursor-pointer transition-colors">
              <div className="h-20 bg-gradient-to-br from-cyan-100 to-sky-200 rounded mb-2"></div>
              <p className="text-sm font-medium">Modern</p>
            </div>
            <div className="p-3 border rounded-lg hover:border-cyan-400 cursor-pointer transition-colors">
              <div className="h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded mb-2"></div>
              <p className="text-sm font-medium">Professional</p>
            </div>
            <div className="p-3 border rounded-lg hover:border-cyan-400 cursor-pointer transition-colors">
              <div className="h-20 bg-gradient-to-br from-emerald-100 to-teal-200 rounded mb-2"></div>
              <p className="text-sm font-medium">Serene</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/dashboard/pages/create')}
            className="w-full bg-gradient-ocean hover:opacity-90"
            size="lg"
          >
            <FileText className="w-4 h-4 mr-2" />
            Create Your First Page
          </Button>
          <Button
            onClick={() => setCurrentStep(3)}
            variant="ghost"
            className="w-full"
          >
            I'll do this later
          </Button>
        </div>
      ),
    },
    {
      title: "Customize & Publish",
      description: "Make it yours and go live",
      icon: Palette,
      content: null, // Will be set after handleComplete is defined
    },
  ];

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

      toast({
        title: "Welcome aboard! 🎉",
        description: "You've completed the onboarding. Happy sharing!",
      });

      setIsOpen(false);
      onComplete();
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error);
      // Don't block user if this fails
      setIsOpen(false);
      onComplete();
    }
  };

  // Set the final step content after handleComplete is defined
  steps[3].content = (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-ocean flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">You're All Set! 🎉</h3>
          <p className="text-slate-600">
            Your lead magnet is ready to go. Start sharing and watch the signups roll in.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Tips:</h3>
        <ul className="text-sm text-slate-700 space-y-2 text-left">
          <li>✓ Share your page link on social media</li>
          <li>✓ Add it to your email signature</li>
          <li>✓ Embed it on your website</li>
          <li>✓ Track analytics to see what's working</li>
        </ul>
      </div>
      <Button
        onClick={handleComplete}
        className="w-full bg-gradient-ocean hover:opacity-90"
        size="lg"
      >
        Go to Dashboard
      </Button>
    </div>
  );

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

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Skip Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute right-0 top-0 text-slate-500 hover:text-slate-700"
          >
            <X className="w-4 h-4 mr-1" />
            Skip
          </Button>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm font-medium text-cyan-600">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                <Icon className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{currentStepData.title}</h2>
                <p className="text-sm text-slate-600">{currentStepData.description}</p>
              </div>
            </div>

            {currentStepData.content}
          </div>

          {/* Navigation Buttons */}
          {currentStep !== 1 && currentStep !== 2 && (
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-ocean hover:opacity-90"
              >
                {currentStep === steps.length - 1 ? "Complete" : "Next"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
