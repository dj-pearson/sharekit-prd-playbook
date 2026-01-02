/**
 * Lightweight CSS-based fallback for Hero3D
 * Renders immediately while the heavy Three.js component loads
 * Uses pure CSS animations for performance
 */
export default function Hero3DFallback() {
  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 animate-pulse" />

      {/* Central orb effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 blur-xl animate-pulse" />

          {/* Main orb */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400/40 to-blue-600/40 backdrop-blur-sm animate-[spin_20s_linear_infinite]">
            {/* Inner glow */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-300/50 to-blue-400/50 blur-sm" />
          </div>

          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-[spin_15s_linear_infinite]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-400/60" />
          </div>
          <div className="absolute inset-0 animate-[spin_12s_linear_infinite_reverse]">
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400/60" />
          </div>
          <div className="absolute inset-0 animate-[spin_18s_linear_infinite]">
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-cyan-300/60" />
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-cyan-400/40 animate-ping" />
      <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-blue-400/40 animate-ping [animation-delay:0.5s]" />
      <div className="absolute bottom-1/4 left-1/3 w-1 h-1 rounded-full bg-cyan-300/40 animate-ping [animation-delay:1s]" />
      <div className="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-blue-300/40 animate-ping [animation-delay:1.5s]" />
    </div>
  );
}
