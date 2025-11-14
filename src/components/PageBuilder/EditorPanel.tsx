import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";
import { PageContent, analyzePage, Suggestion } from "@/lib/page-analyzer";

interface EditorPanelProps {
  content: PageContent;
  template: string;
  onContentChange: (content: PageContent) => void;
  onTemplateChange: (template: string) => void;
  hasResources?: boolean;
}

const templates = [
  {
    value: "minimal",
    label: "Minimal",
    description: "Clean and simple",
    preview: "bg-background border-2 border-slate-200"
  },
  {
    value: "modern",
    label: "Modern",
    description: "Bold with gradients",
    preview: "bg-gradient-subtle border-2 border-purple-200"
  },
  {
    value: "professional",
    label: "Professional",
    description: "Corporate elegance",
    preview: "bg-gradient-to-br from-background to-accent/5 border-2 border-blue-200"
  }
];

function SuggestionItem({ suggestion }: { suggestion: Suggestion }) {
  const icons = {
    error: { Icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    warning: { Icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    tip: { Icon: Lightbulb, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
  };

  const style = icons[suggestion.type];
  const Icon = style.Icon;

  return (
    <div className={`flex gap-3 p-3 rounded-lg border ${style.bg} ${style.border}`}>
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${style.color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{suggestion.message}</p>
        {suggestion.suggestion && (
          <p className="text-xs text-slate-600 mt-1">{suggestion.suggestion}</p>
        )}
      </div>
    </div>
  );
}

export function EditorPanel({ content, template, onContentChange, onTemplateChange, hasResources = true }: EditorPanelProps) {
  const suggestions = analyzePage(content, hasResources);

  const handleFieldChange = (field: keyof PageContent, value: string) => {
    onContentChange({ ...content, [field]: value });
  };

  const handleKeyDown = (e: React.KeyboardEvent, templateIndex?: number) => {
    // Template quick-switch: Press 1-3 for templates
    if (templateIndex !== undefined && e.key === String(templateIndex + 1)) {
      e.preventDefault();
      onTemplateChange(templates[templateIndex].value);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-slate-50 px-6 py-4">
        <h3 className="font-semibold text-sm text-slate-700">Page Editor</h3>
        <p className="text-xs text-slate-500 mt-1">
          Changes update live in preview • Press ⌘S to save • 1-3 for templates
        </p>
      </div>

      {/* Editor Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Template Picker */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Template</CardTitle>
            <CardDescription>Choose your page design (Press 1-3)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {templates.map((t, index) => (
                <button
                  key={t.value}
                  onClick={() => onTemplateChange(t.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`relative group p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    template === t.value
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Template Preview */}
                  <div className={`h-20 rounded mb-2 ${t.preview}`} />

                  <div className="text-left">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{t.label}</p>
                      {template === t.value && (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                    <Badge variant="outline" className="text-[10px] mt-2">
                      Press {index + 1}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Page Content Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Page Content</CardTitle>
            <CardDescription>Customize your landing page copy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Headline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="headline">Headline *</Label>
                <span className={`text-xs ${
                  (content.headline?.length || 0) > 60 ? 'text-orange-600 font-medium' : 'text-slate-500'
                }`}>
                  {content.headline?.length || 0}/60
                </span>
              </div>
              <Input
                id="headline"
                placeholder="Get Your Free Marketing Template"
                value={content.headline || ''}
                onChange={(e) => handleFieldChange('headline', e.target.value)}
                className="text-base"
              />
            </div>

            {/* Subheadline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="subheadline">Subheadline</Label>
                <span className={`text-xs ${
                  (content.subheadline?.length || 0) > 120 ? 'text-orange-600 font-medium' : 'text-slate-500'
                }`}>
                  {content.subheadline?.length || 0}/120
                </span>
              </div>
              <Textarea
                id="subheadline"
                placeholder="Boost your marketing with our proven templates used by 10,000+ professionals"
                value={content.subheadline || ''}
                onChange={(e) => handleFieldChange('subheadline', e.target.value)}
                rows={3}
              />
            </div>

            {/* Button Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="button_text">Button Text *</Label>
                <span className={`text-xs ${
                  (content.button_text?.length || 0) > 25 ? 'text-orange-600 font-medium' : 'text-slate-500'
                }`}>
                  {content.button_text?.length || 0}/25
                </span>
              </div>
              <Input
                id="button_text"
                placeholder="Get Free Template"
                value={content.button_text || ''}
                onChange={(e) => handleFieldChange('button_text', e.target.value)}
              />
            </div>

            {/* Primary Color */}
            <div className="space-y-2">
              <Label htmlFor="primary_color">Button Color</Label>
              <div className="flex gap-3">
                <Input
                  id="primary_color"
                  type="color"
                  value={content.primary_color || '#3b82f6'}
                  onChange={(e) => handleFieldChange('primary_color', e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={content.primary_color || '#3b82f6'}
                  onChange={(e) => handleFieldChange('primary_color', e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Smart Suggestions */}
        {suggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Smart Suggestions</CardTitle>
              <CardDescription>
                {suggestions.filter(s => s.type === 'error').length > 0
                  ? 'Fix these issues to improve conversion'
                  : 'Tips to optimize your page'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <SuggestionItem key={index} suggestion={suggestion} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
