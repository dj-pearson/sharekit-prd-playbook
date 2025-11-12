import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UsernameSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const UsernameSelector = ({ value, onChange, onValidationChange }: UsernameSelectorProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const checkUsername = async () => {
      const username = value.toLowerCase().trim();
      
      // Reset states
      setError("");
      setIsAvailable(null);
      
      if (!username) {
        onValidationChange?.(false);
        return;
      }

      // Validate format
      if (username.length < 3) {
        setError("Username must be at least 3 characters");
        onValidationChange?.(false);
        return;
      }

      if (username.length > 30) {
        setError("Username must be less than 30 characters");
        onValidationChange?.(false);
        return;
      }

      if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(username)) {
        setError("Username can only contain lowercase letters, numbers, and hyphens (not at start/end)");
        onValidationChange?.(false);
        return;
      }

      // Check availability
      setIsChecking(true);
      try {
        const { data, error: rpcError } = await supabase.rpc('is_username_available', { 
          check_username: username 
        });

        if (rpcError) throw rpcError;

        setIsAvailable(data);
        onValidationChange?.(data === true);

        if (!data) {
          setError("Username is already taken");
        }
      } catch (err) {
        console.error('Error checking username:', err);
        setError("Could not verify username availability");
        onValidationChange?.(false);
      } finally {
        setIsChecking(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [value, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="username">Username</Label>
      <div className="relative">
        <Input
          id="username"
          value={value}
          onChange={handleChange}
          placeholder="your-username"
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isChecking && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {!isChecking && isAvailable === true && <Check className="w-4 h-4 text-green-500" />}
          {!isChecking && isAvailable === false && <X className="w-4 h-4 text-red-500" />}
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {!error && value && isAvailable && (
        <p className="text-xs text-green-600">Username is available!</p>
      )}
      <p className="text-xs text-muted-foreground">
        Your pages will be available at: <span className="font-mono">{value || 'your-username'}/page-name</span>
      </p>
    </div>
  );
};
