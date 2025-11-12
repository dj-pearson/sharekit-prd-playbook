import { PageBuilder } from "@/components/PageBuilder";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const PageBuilderPage = () => {
  const handleSave = (canvasData: string) => {
    console.log("Canvas data:", canvasData);
    // Here you could save to Supabase or use for page creation
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Visual Page Builder</h1>
          <p className="text-muted-foreground mt-1">
            Design beautiful landing pages with drag-and-drop simplicity
          </p>
        </div>

        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-600" />
              Pro Feature
            </CardTitle>
            <CardDescription>
              Create stunning, conversion-optimized pages without any coding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Drag-and-drop shapes, text, and images</li>
              <li>• Unlimited undo/redo</li>
              <li>• Export designs as PNG</li>
              <li>• Save and reuse templates</li>
            </ul>
          </CardContent>
        </Card>

        <PageBuilder onSave={handleSave} />
      </div>
    </DashboardLayout>
  );
};

export default PageBuilderPage;
