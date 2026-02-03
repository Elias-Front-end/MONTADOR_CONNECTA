import React from 'react';
import { Hammer } from 'lucide-react';

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
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-16 h-16",
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
      icon: "text-blue-600",
      bg: "bg-blue-50",
      textPrimary: "text-slate-800",
      textSecondary: "text-blue-600",
    },
    light: {
      icon: "text-blue-500",
      bg: "bg-white/10",
      textPrimary: "text-white",
      textSecondary: "text-blue-400",
    }
  };

  const currentColors = colors[theme];

  return (
    <div className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} items-center justify-center ${layout === 'horizontal' ? 'gap-3' : ''} ${className}`}>
      {/* Icon Container */}
      <div className={`relative flex items-center justify-center rounded-xl ${currentColors.bg} ${sizeClasses[size]}`}>
        <Hammer className={`${currentColors.icon} ${iconSizes[size]}`} strokeWidth={2.5} />
      </div>

      {/* Text */}
      {showText && (
        <div className={`${layout === 'vertical' ? 'mt-2 text-center' : 'flex flex-col text-left'} leading-tight`}>
          <div className={`font-bold ${currentColors.textPrimary} tracking-tight ${textClasses[size]}`}>
            MONTADOR
          </div>
          <div className={`font-bold ${currentColors.textSecondary} tracking-widest uppercase ${layout === 'vertical' ? 'text-sm' : 'text-xs'}`}>
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
