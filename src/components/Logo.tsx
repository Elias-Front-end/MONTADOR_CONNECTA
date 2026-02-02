import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  layout?: "vertical" | "horizontal";
  theme?: "dark" | "light"; // dark = dark text (for light bg), light = light text (for dark bg)
}

export function Logo({ 
  className = "", 
  showText = true, 
  size = "md", 
  layout = "vertical",
  theme = "dark"
}: LogoProps) {
  // Size mapping for the container
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
    xl: "h-24",
  };

  const textClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-4xl",
  };

  // Color mappings based on theme
  const colors = {
    dark: {
      icon: "text-primary",
      textPrimary: "text-primary",
      textSecondary: "text-secondary",
    },
    light: {
      icon: "text-white",
      textPrimary: "text-white",
      textSecondary: "text-gray-300",
    }
  };

  const currentColors = colors[theme];

  return (
    <div className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} items-center justify-center ${layout === 'horizontal' ? 'gap-3' : ''} ${className}`}>
      {/* Icon Container */}
      <div className={`relative flex items-center justify-center ${currentColors.icon} ${sizeClasses[size]}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-auto"
          aria-label="Montador Conecta Logo"
        >
          {/* Rounded Square Border */}
          <rect
            x="5"
            y="5"
            width="90"
            height="90"
            rx="15"
            stroke="currentColor"
            strokeWidth="8"
            className={currentColors.icon}
          />
          
          {/* Worker Silhouette (Simplified) */}
          <path
            d="M50 20C45 20 40 24 40 30C40 36 45 40 50 40C55 40 60 36 60 30C60 24 55 20 50 20Z"
            fill="currentColor"
          />
          <path
             d="M30 80V60C30 50 40 45 50 45C60 45 70 50 70 60V80H30Z"
             fill="currentColor"
          />
          
          {/* Cap Visor */}
          <path
            d="M55 22L65 24"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />

           {/* Drill (Stylized) */}
           <path
            d="M65 55L85 55L85 65L75 65L75 75L65 75V55Z"
            fill="currentColor"
            transform="rotate(-10 65 65)"
           />
           {/* Drill Accent - White in dark logo, Dark in light logo (inverse) */}
           <rect 
            x="85" 
            y="58" 
            width="5" 
            height="4" 
            fill={theme === 'dark' ? '#7A7A7A' : '#334155'} 
            transform="rotate(-10 65 65)" 
           />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className={`${layout === 'vertical' ? 'mt-2 text-center' : 'flex flex-col text-left'} leading-tight`}>
          <div className={`font-bold ${currentColors.textPrimary} tracking-wide ${textClasses[size]}`}>
            MONTADOR
          </div>
          <div className={`font-bold ${currentColors.textSecondary} tracking-wide ${layout === 'vertical' ? textClasses[size] : 'text-sm tracking-widest'}`}>
            CONECTA
          </div>
        </div>
      )}
    </div>
  );
}

// Keep SidebarLogo for backward compatibility or replace usage
export function SidebarLogo() {
  return <Logo layout="horizontal" theme="light" size="sm" />;
}
