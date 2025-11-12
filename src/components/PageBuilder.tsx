import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Rect, Circle, IText, Image as FabricImage } from "fabric";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Square, 
  Circle as CircleIcon, 
  Type, 
  Image as ImageIcon, 
  Download, 
  Trash2, 
  Copy,
  Palette,
  Undo,
  Redo
} from "lucide-react";
import { toast } from "sonner";

interface PageBuilderProps {
  onSave?: (canvasData: string) => void;
}

export function PageBuilder({ onSave }: PageBuilderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#0891b2");
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });

    setFabricCanvas(canvas);
    saveState(canvas);

    canvas.on('object:modified', () => saveState(canvas));
    canvas.on('object:added', () => saveState(canvas));

    return () => {
      canvas.dispose();
    };
  }, []);

  const saveState = (canvas: FabricCanvas) => {
    const json = JSON.stringify(canvas.toJSON());
    setHistory(prev => {
      const newHistory = prev.slice(0, historyStep + 1);
      return [...newHistory, json];
    });
    setHistoryStep(prev => prev + 1);
  };

  const undo = () => {
    if (!fabricCanvas || historyStep <= 0) return;
    
    const newStep = historyStep - 1;
    setHistoryStep(newStep);
    fabricCanvas.loadFromJSON(history[newStep], () => {
      fabricCanvas.renderAll();
    });
  };

  const redo = () => {
    if (!fabricCanvas || historyStep >= history.length - 1) return;
    
    const newStep = historyStep + 1;
    setHistoryStep(newStep);
    fabricCanvas.loadFromJSON(history[newStep], () => {
      fabricCanvas.renderAll();
    });
  };

  const addRectangle = () => {
    if (!fabricCanvas) return;

    const rect = new Rect({
      left: 100,
      top: 100,
      fill: activeColor,
      width: 200,
      height: 150,
      stroke: '#000000',
      strokeWidth: 2,
    });
    fabricCanvas.add(rect);
    fabricCanvas.setActiveObject(rect);
    toast.success("Rectangle added");
  };

  const addCircle = () => {
    if (!fabricCanvas) return;

    const circle = new Circle({
      left: 150,
      top: 150,
      fill: activeColor,
      radius: 80,
      stroke: '#000000',
      strokeWidth: 2,
    });
    fabricCanvas.add(circle);
    fabricCanvas.setActiveObject(circle);
    toast.success("Circle added");
  };

  const addText = () => {
    if (!fabricCanvas) return;

    const text = new IText('Double click to edit', {
      left: 100,
      top: 100,
      fill: activeColor,
      fontSize: 24,
      fontFamily: 'Arial',
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    toast.success("Text added");
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !fabricCanvas) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string;
        FabricImage.fromURL(imgUrl).then((img) => {
          img.scale(0.5);
          img.set({ left: 100, top: 100 });
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          toast.success("Image added");
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const deleteSelected = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) {
      toast.error("No object selected");
      return;
    }
    fabricCanvas.remove(...activeObjects);
    fabricCanvas.discardActiveObject();
    toast.success("Deleted selected objects");
  };

  const duplicateSelected = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (!activeObject) {
      toast.error("No object selected");
      return;
    }
    
    activeObject.clone().then((cloned: any) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
      });
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      toast.success("Object duplicated");
    });
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    toast.success("Canvas cleared");
  };

  const exportCanvas = () => {
    if (!fabricCanvas) return;
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });
    
    const link = document.createElement('a');
    link.download = 'page-design.png';
    link.href = dataURL;
    link.click();
    toast.success("Design exported");
  };

  const handleSave = () => {
    if (!fabricCanvas) return;
    const json = JSON.stringify(fabricCanvas.toJSON());
    onSave?.(json);
    toast.success("Design saved");
  };

  const colors = [
    "#0891b2", "#3b82f6", "#8b5cf6", "#ec4899", 
    "#ef4444", "#f97316", "#eab308", "#22c55e"
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Visual Page Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={undo} disabled={historyStep <= 0}>
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={redo} disabled={historyStep >= history.length - 1}>
                <Redo className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            <Button variant="outline" size="sm" onClick={addRectangle}>
              <Square className="w-4 h-4 mr-2" />
              Rectangle
            </Button>
            <Button variant="outline" size="sm" onClick={addCircle}>
              <CircleIcon className="w-4 h-4 mr-2" />
              Circle
            </Button>
            <Button variant="outline" size="sm" onClick={addText}>
              <Type className="w-4 h-4 mr-2" />
              Text
            </Button>
            <Button variant="outline" size="sm" onClick={addImage}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Image
            </Button>

            <Separator orientation="vertical" className="h-8" />

            <Button variant="outline" size="sm" onClick={duplicateSelected}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button variant="outline" size="sm" onClick={deleteSelected}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>

            <Separator orientation="vertical" className="h-8" />

            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-md transition-transform hover:scale-110 ${
                    activeColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setActiveColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="border-2 border-dashed border-slate-200 rounded-lg overflow-hidden shadow-inner">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={clearCanvas}>
              Clear Canvas
            </Button>
            <Button variant="outline" onClick={exportCanvas}>
              <Download className="w-4 h-4 mr-2" />
              Export PNG
            </Button>
            <Button onClick={handleSave}>
              Save Design
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
