
import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  type?: "full" | "icon";
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = "md", 
  type = "full",
  className = "",
}) => {
  const sizeClasses = {
    sm: type === "full" ? "h-8" : "h-6",
    md: type === "full" ? "h-12" : "h-8",
    lg: type === "full" ? "h-16" : "h-12",
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo icon */}
      <div className={`${sizeClasses[size]} aspect-square bg-gradient-to-br from-primary-300 to-primary flex items-center justify-center rounded-lg`}>
        <span className="text-white font-bold" style={{ 
          fontSize: size === "sm" ? "1.2rem" : size === "md" ? "1.8rem" : "2.4rem" 
        }}>
          T
        </span>
      </div>
      
      {/* Logo text (only for full logo) */}
      {type === "full" && (
        <span className="ml-2 font-bold text-primary" style={{ 
          fontSize: size === "sm" ? "1.2rem" : size === "md" ? "1.8rem" : "2.4rem" 
        }}>
          Tixel
        </span>
      )}
    </div>
  );
};

export default Logo;
