import React, { useState } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({ size = "md", showText = true }: LogoProps) {
  const [imgError, setImgError] = useState(false);

  const containerSizes = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-14 h-14",
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
      {/* Official Inisha City Service Company Brand Logo */}
      <div
        className={`${containerSizes[size]} rounded-2xl overflow-hidden shadow-md shadow-red-600/20 border border-slate-200 bg-white flex items-center justify-center p-0.5 shrink-0`}
      >
        {!imgError ? (
          <img
            src="/brand-logo.png"
            alt="Inisha City Service Official Logo"
            className="w-full h-full object-contain rounded-xl"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center font-black text-white text-base">
            I
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`${titleSizes[size]} font-black tracking-tight text-slate-900`}>
              INISHA <span className="text-red-600">CITY</span>
            </span>
          </div>
          <span className={`${subtitleSizes[size]} font-extrabold uppercase tracking-widest text-red-600`}>
            Super Admin Portal
          </span>
        </div>
      )}
    </div>
  );
}
