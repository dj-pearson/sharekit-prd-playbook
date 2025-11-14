import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { PageContent, calculateScore, getGrade } from "@/lib/page-analyzer";
import { useDebounce } from "@/hooks/useDebounce";

interface PreviewPanelProps {
  content: PageContent;
  template: string;
  hasResources?: boolean;
  resourceCount?: number;
}

const templateClasses = {
  minimal: "bg-background",
  modern: "bg-gradient-subtle",
  professional: "bg-gradient-to-br from-background to-accent/5",
};

export function PreviewPanel({ content, template, hasResources = true, resourceCount = 1 }: PreviewPanelProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Debounce content updates to prevent excessive re-renders (200ms delay)
  const debouncedContent = useDebounce(content, 200);

  // Calculate conversion score
  const score = calculateScore(debouncedContent, hasResources);
  const { grade, color, label } = getGrade(score);

  const containerClass = viewMode === 'mobile' ? 'max-w-[375px] mx-auto' : 'w-full';
  const templateClass = templateClasses[template as keyof typeof templateClasses] || templateClasses.minimal;

  return (
    <div className="h-full flex flex-col">
      {/* Preview Controls */}
      <div className="border-b bg-slate-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-sm text-slate-700">Live Preview</h3>

          {/* Conversion Score Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${color} border-current`}>
              Score: {score}/100 ({grade})
            </Badge>
            <span className="text-xs text-slate-500">{label}</span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 border">
          <Button
            size="sm"
            variant={viewMode === 'desktop' ? 'default' : 'ghost'}
            className="h-8 px-3"
            onClick={() => setViewMode('desktop')}
          >
            <Monitor className="w-4 h-4 mr-2" />
            Desktop
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'mobile' ? 'default' : 'ghost'}
            className="h-8 px-3"
            onClick={() => setViewMode('mobile')}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile
          </Button>
        </div>
      </div>

      {/* Preview Content - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
        <div className={containerClass}>
          <div className={`min-h-[600px] ${templateClass} rounded-lg border shadow-lg`}>
            {/* Hero Section */}
            <div className="py-16 px-8">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {debouncedContent.headline || 'Your Headline Here'}
                </h1>
                {debouncedContent.subheadline && (
                  <p className="text-lg text-muted-foreground mb-8">
                    {debouncedContent.subheadline}
                  </p>
                )}

                {/* CTA Button Preview */}
                <Button
                  size="lg"
                  className="text-lg px-8 py-6"
                  style={{
                    backgroundColor: debouncedContent.primary_color || '#3b82f6',
                    color: '#ffffff'
                  }}
                >
                  {debouncedContent.button_text || 'Download Now'}
                </Button>
              </div>
            </div>

            {/* Resources Preview Section */}
            {hasResources && (
              <div className="px-8 pb-16">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-2xl font-semibold mb-6">What You'll Get:</h2>
                  <div className="space-y-4">
                    {Array.from({ length: resourceCount }).map((_, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-ocean/10 flex items-center justify-center shrink-0">
                              <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">Resource {index + 1}</h3>
                              <p className="text-sm text-muted-foreground">
                                Preview of downloadable resource
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Email Capture Form Preview */}
            <div className="px-8 pb-16">
              <div className="max-w-md mx-auto">
                <Card className="shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4 text-center">
                      Get Instant Access
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Email</label>
                        <div className="h-10 bg-slate-100 border rounded-md" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Full Name</label>
                        <div className="h-10 bg-slate-100 border rounded-md" />
                      </div>
                      <Button
                        className="w-full"
                        style={{
                          backgroundColor: debouncedContent.primary_color || '#3b82f6',
                          color: '#ffffff'
                        }}
                      >
                        {debouncedContent.button_text || 'Download Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
