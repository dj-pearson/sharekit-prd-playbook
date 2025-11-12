import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
}

interface ConversionFunnelProps {
  views: number;
  signups: number;
  downloads: number;
}

export function ConversionFunnel({ views, signups, downloads }: ConversionFunnelProps) {
  const steps: FunnelStep[] = [
    {
      name: "Page Views",
      count: views,
      percentage: 100,
    },
    {
      name: "Email Signups",
      count: signups,
      percentage: views > 0 ? (signups / views) * 100 : 0,
    },
    {
      name: "Downloads",
      count: downloads,
      percentage: views > 0 ? (downloads / views) * 100 : 0,
    },
  ];

  const getDropOffRate = (currentIndex: number) => {
    if (currentIndex === 0) return null;
    const current = steps[currentIndex].percentage;
    const previous = steps[currentIndex - 1].percentage;
    const dropOff = previous - current;
    return dropOff;
  };

  const getBarWidth = (percentage: number) => {
    return `${Math.max(percentage, 5)}%`;
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 50) return "from-emerald-500 to-emerald-600";
    if (percentage >= 25) return "from-yellow-500 to-orange-500";
    return "from-orange-500 to-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>Visualize your visitor journey from view to download</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {steps.map((step, index) => {
          const dropOff = getDropOffRate(index);
          return (
            <div key={step.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{step.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{step.count} users</span>
                  <span className="font-semibold">{step.percentage.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="relative h-12 bg-slate-100 rounded-lg overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getBarColor(step.percentage)} transition-all duration-1000 ease-out flex items-center justify-end px-4 animate-in slide-in-from-left`}
                  style={{ width: getBarWidth(step.percentage), animationDelay: `${index * 200}ms` }}
                >
                  <span className="text-white text-sm font-semibold drop-shadow-md">
                    {step.count}
                  </span>
                </div>
              </div>

              {dropOff !== null && dropOff > 0 && (
                <div className="flex items-center gap-2 text-xs text-red-600 ml-2">
                  <TrendingDown className="w-3 h-3" />
                  <span>{dropOff.toFixed(1)}% drop-off from previous step</span>
                </div>
              )}

              {dropOff !== null && dropOff <= 0 && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 ml-2">
                  <TrendingUp className="w-3 h-3" />
                  <span>Great retention!</span>
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {views > 0 ? ((signups / views) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-xs text-muted-foreground">View → Signup</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {signups > 0 ? ((downloads / signups) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-xs text-muted-foreground">Signup → Download</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
