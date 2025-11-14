import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, ArrowLeft, Eye, Loader2 } from "lucide-react";
import { EditorPanel } from "./PageBuilder/EditorPanel";
import { PreviewPanel } from "./PageBuilder/PreviewPanel";
import { PageContent } from "@/lib/page-analyzer";

interface PageBuilderProps {
  pageId?: string;
  onSave?: (pageId: string) => void;
  initialData?: {
    title: string;
    description?: string;
    template: string;
    content?: PageContent;
  };
}

export function PageBuilder({ pageId, onSave, initialData }: PageBuilderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();

  const [template, setTemplate] = useState(initialData?.template || 'minimal');
  const [content, setContent] = useState<PageContent>(
    initialData?.content || {
      headline: '',
      subheadline: '',
      button_text: '',
      primary_color: '#3b82f6'
    }
  );
  const [title, setTitle] = useState(initialData?.title || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!pageId);
  const [hasResources, setHasResources] = useState(true);
  const [resourceCount, setResourceCount] = useState(1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load existing page data
  useEffect(() => {
    if (pageId) {
      loadPage();
    }
  }, [pageId]);

  const loadPage = async () => {
    if (!pageId) return;

    try {
      setIsLoading(true);

      // Fetch page data
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .select('title, description, template, content')
        .eq('id', pageId)
        .single();

      if (pageError) throw pageError;

      if (page) {
        setTitle(page.title);
        setTemplate(page.template || 'minimal');

        // Load content from JSONB field or construct from title/description
        if (page.content && typeof page.content === 'object') {
          setContent(page.content as PageContent);
        } else {
          // Fallback: use title and description if content field doesn't exist
          setContent({
            headline: page.title || '',
            subheadline: page.description || '',
            button_text: 'Download Now',
            primary_color: '#3b82f6'
          });
        }

        // Check for resources
        const { count } = await supabase
          .from('page_resources')
          .select('*', { count: 'exact', head: true })
          .eq('page_id', pageId);

        setHasResources((count || 0) > 0);
        setResourceCount(count || 1);
      }
    } catch (error) {
      console.error('Error loading page:', error);
      toast({
        title: "Error loading page",
        description: "Could not load page data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    if (hasUnsavedChanges && pageId) {
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(true);
      }, 30000); // 30 seconds

      return () => {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
      };
    }
  }, [hasUnsavedChanges, content, template, pageId]);

  // Mark as having unsaved changes when content or template changes
  useEffect(() => {
    if (!isLoading) {
      setHasUnsavedChanges(true);
    }
  }, [content, template]);

  // Keyboard shortcut: ⌘S or Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, template, pageId]);

  const handleSave = async (isAutoSave = false) => {
    if (!pageId) {
      toast({
        title: "Cannot save",
        description: "Please create a page first before using the builder.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);

      // Update page with new content and template
      const { error } = await supabase
        .from('pages')
        .update({
          template,
          content,
          title: content.headline || title, // Use headline as title if available
          description: content.subheadline || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', pageId);

      if (error) throw error;

      setLastSaved(new Date());
      setHasUnsavedChanges(false);

      if (!isAutoSave) {
        toast({
          title: "Saved successfully",
          description: "Your page has been updated.",
        });
      }

      if (onSave) {
        onSave(pageId);
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: "Error saving",
        description: "Could not save your changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = useCallback((newContent: PageContent) => {
    setContent(newContent);
  }, []);

  const handleTemplateChange = useCallback((newTemplate: string) => {
    setTemplate(newTemplate);
  }, []);

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Do you want to leave?');
      if (!confirm) return;
    }
    navigate('/dashboard/pages');
  };

  const handlePreview = () => {
    if (pageId) {
      // Open preview in new tab
      const { data } = supabase.auth.getSession();
      // For now, just navigate to the pages list
      navigate('/dashboard/pages');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <div className="border-b bg-white px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <h2 className="font-semibold text-sm">Page Builder</h2>
            {lastSaved && (
              <p className="text-xs text-slate-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="text-xs text-orange-600 font-medium">Unsaved changes</span>
          )}
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button size="sm" onClick={() => handleSave()} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Split Screen: Editor (40%) | Preview (60%) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel - Left Side (40%) */}
        <div className="w-[40%] border-r flex flex-col">
          <EditorPanel
            content={content}
            template={template}
            onContentChange={handleContentChange}
            onTemplateChange={handleTemplateChange}
            hasResources={hasResources}
          />
        </div>

        {/* Preview Panel - Right Side (60%) */}
        <div className="w-[60%] flex flex-col">
          <PreviewPanel
            content={content}
            template={template}
            hasResources={hasResources}
            resourceCount={resourceCount}
          />
        </div>
      </div>
    </div>
  );
}
