import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useLiveAnnouncer } from "@/components/accessibility";
import { Eye, Contrast, MousePointer2, Volume2, Type, RotateCcw } from "lucide-react";

export function AccessibilitySettings() {
  const { settings, updateSettings } = useAccessibility();
  const { announcePolite } = useLiveAnnouncer();

  const handleReducedMotionChange = (checked: boolean) => {
    updateSettings({ reducedMotion: checked });
    announcePolite(checked ? 'Reduced motion enabled' : 'Reduced motion disabled');
  };

  const handleHighContrastChange = (checked: boolean) => {
    updateSettings({ highContrast: checked });
    announcePolite(checked ? 'High contrast mode enabled' : 'High contrast mode disabled');
  };

  const handleFontSizeChange = (value: 'normal' | 'large' | 'larger') => {
    updateSettings({ fontSize: value });
    const labels = { normal: 'Normal', large: 'Large', larger: 'Extra large' };
    announcePolite(`Font size changed to ${labels[value]}`);
  };

  const handleAnnouncementsChange = (checked: boolean) => {
    updateSettings({ screenReaderAnnouncements: checked });
    if (checked) {
      announcePolite('Screen reader announcements enabled');
    }
  };

  const handleReset = () => {
    updateSettings({
      reducedMotion: false,
      highContrast: false,
      fontSize: 'normal',
      screenReaderAnnouncements: true,
    });
    announcePolite('Accessibility settings reset to defaults');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" aria-hidden="true" />
          Accessibility Settings
        </CardTitle>
        <CardDescription>
          Customize your experience for better accessibility. These settings are stored locally on your device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="reduced-motion" className="flex items-center gap-2">
              <MousePointer2 className="w-4 h-4" aria-hidden="true" />
              Reduced Motion
            </Label>
            <p className="text-sm text-muted-foreground">
              Minimize animations and transitions throughout the application
            </p>
          </div>
          <Switch
            id="reduced-motion"
            checked={settings.reducedMotion}
            onCheckedChange={handleReducedMotionChange}
            aria-describedby="reduced-motion-description"
          />
        </div>
        <p id="reduced-motion-description" className="sr-only">
          When enabled, animations and transitions will be reduced or disabled
        </p>

        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="high-contrast" className="flex items-center gap-2">
              <Contrast className="w-4 h-4" aria-hidden="true" />
              High Contrast Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Increase color contrast for better visibility
            </p>
          </div>
          <Switch
            id="high-contrast"
            checked={settings.highContrast}
            onCheckedChange={handleHighContrastChange}
            aria-describedby="high-contrast-description"
          />
        </div>
        <p id="high-contrast-description" className="sr-only">
          When enabled, colors will have higher contrast for improved readability
        </p>

        {/* Font Size */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="font-size" className="flex items-center gap-2">
              <Type className="w-4 h-4" aria-hidden="true" />
              Text Size
            </Label>
            <p className="text-sm text-muted-foreground">
              Adjust the base font size for the application
            </p>
          </div>
          <Select
            value={settings.fontSize}
            onValueChange={(value) => handleFontSizeChange(value as 'normal' | 'large' | 'larger')}
          >
            <SelectTrigger id="font-size" className="w-[150px]" aria-describedby="font-size-description">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal (16px)</SelectItem>
              <SelectItem value="large">Large (18px)</SelectItem>
              <SelectItem value="larger">Extra Large (20px)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p id="font-size-description" className="sr-only">
          Choose a larger text size if you find the default text difficult to read
        </p>

        {/* Screen Reader Announcements */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sr-announcements" className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" aria-hidden="true" />
              Screen Reader Announcements
            </Label>
            <p className="text-sm text-muted-foreground">
              Enable live announcements for dynamic content changes
            </p>
          </div>
          <Switch
            id="sr-announcements"
            checked={settings.screenReaderAnnouncements}
            onCheckedChange={handleAnnouncementsChange}
            aria-describedby="sr-announcements-description"
          />
        </div>
        <p id="sr-announcements-description" className="sr-only">
          When enabled, screen readers will announce updates like form submissions and navigation changes
        </p>

        {/* Reset Button */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Reset to Defaults
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            This will reset all accessibility settings to their default values
          </p>
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Press <kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd> anywhere in the app to view all available keyboard shortcuts.
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Tab</kbd> - Navigate forward through interactive elements
            </li>
            <li>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift + Tab</kbd> - Navigate backward through interactive elements
            </li>
            <li>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> / <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd> - Activate buttons and links
            </li>
            <li>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Escape</kbd> - Close dialogs and menus
            </li>
          </ul>
        </div>

        {/* Additional Resources */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Need Help?</h4>
          <p className="text-sm text-muted-foreground">
            If you encounter any accessibility barriers or need assistance, please contact us at{' '}
            <a
              href="mailto:accessibility@sharekit.net"
              className="text-primary hover:underline"
            >
              accessibility@sharekit.net
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default AccessibilitySettings;
