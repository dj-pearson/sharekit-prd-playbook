import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "General",
    shortcuts: [
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Esc"], description: "Close dialog / Cancel" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["g", "d"], description: "Go to Dashboard" },
      { keys: ["g", "p"], description: "Go to Pages" },
      { keys: ["g", "r"], description: "Go to Resources" },
      { keys: ["g", "a"], description: "Go to Analytics" },
      { keys: ["g", "s"], description: "Go to Settings" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["n"], description: "Create new page" },
      { keys: ["u"], description: "Upload resource" },
    ],
  },
  {
    title: "Page Builder",
    shortcuts: [
      { keys: ["Ctrl", "S"], description: "Save changes" },
      { keys: ["Cmd", "S"], description: "Save changes (Mac)" },
    ],
  },
  {
    title: "Search",
    shortcuts: [
      { keys: ["/"], description: "Focus search input" },
    ],
  },
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let lastKey = "";
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTime;

      // Show shortcuts dialog on "?"
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen(true);
        return;
      }

      // Close on Escape
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      // Handle "g" + key navigation shortcuts
      if (lastKey === "g" && timeSinceLastKey < 500) {
        switch (e.key) {
          case "d":
            e.preventDefault();
            window.location.href = "/dashboard";
            break;
          case "p":
            e.preventDefault();
            window.location.href = "/dashboard/pages";
            break;
          case "r":
            e.preventDefault();
            window.location.href = "/dashboard/resources";
            break;
          case "a":
            e.preventDefault();
            window.location.href = "/dashboard/analytics";
            break;
          case "s":
            e.preventDefault();
            window.location.href = "/dashboard/settings";
            break;
        }
        lastKey = "";
        return;
      }

      // Quick actions
      if (e.key === "n" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        window.location.href = "/dashboard/pages/create";
        return;
      }

      if (e.key === "u" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        window.location.href = "/dashboard/upload";
        return;
      }

      // Focus search on "/"
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      lastKey = e.key;
      lastKeyTime = now;
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate and perform actions quickly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                {group.title}
              </h4>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted border rounded-md min-w-[24px] text-center">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-muted border rounded">?</kbd> anytime to show this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
