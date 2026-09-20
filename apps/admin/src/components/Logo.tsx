import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({ size = "md", showText = true }: LogoProps) {
  const iconSizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-lg",
    lg: "w-12 h-12 text-2xl",
  };

  const titleSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const subtitleSizes = {
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-xs",
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Red Modern Shield / Hexagon Brand Icon */}
      <div
        className={`${iconSizes[size]} bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center font-black text-white shadow-md shadow-red-600/30 border border-red-500/20 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-white/10 opacity-50 rounded-xl" />
        <span className="relative z-10 tracking-tighter">I</span>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`${titleSizes[size]} font-black tracking-tight text-slate-900`}>
              INISHA <span className="text-red-600">CITY</span>
            </span>
          </div>
          <span className={`${subtitleSizes[size]} font-extrabold uppercase tracking-widest text-red-600`}>
            Admin Portal
          </span>
        </div>
      )}
    </div>
  );
}
