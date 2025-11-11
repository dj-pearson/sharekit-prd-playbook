import iconImage from "@/assets/icon.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-20 h-20",
};

const textSizeClasses = {
  sm: "text-2xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-lg overflow-hidden flex items-center justify-center bg-white`}>
        <img 
          src={iconImage} 
          alt="ShareKit Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-semibold tracking-wide`}>
          ShareKit
        </span>
      )}
    </div>
  );
}
