import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie, X } from "lucide-react";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem("cookie-consent");
    if (!hasConsented) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="container mx-auto max-w-4xl">
        <Card className="border-2 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                <Cookie className="w-6 h-6 text-cyan-600" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-2">Cookie Preferences</h3>
                <p className="text-sm text-slate-600 mb-4">
                  We use essential cookies to authenticate you and keep your account secure.
                  We also use privacy-friendly analytics (no personal data collected) to improve
                  our service. You can learn more in our{" "}
                  <Link to="/privacy" className="text-cyan-600 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleAccept}
                    className="bg-gradient-ocean hover:opacity-90"
                  >
                    Accept All
                  </Button>
                  <Button
                    onClick={handleAccept}
                    variant="outline"
                  >
                    Essential Only
                  </Button>
                  <Button
                    onClick={handleDecline}
                    variant="ghost"
                    size="sm"
                  >
                    Decline All
                  </Button>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDecline}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
