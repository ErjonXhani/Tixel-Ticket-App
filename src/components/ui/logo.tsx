
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
      {/* Logo image */}
      <div className={`${sizeClasses[size]} aspect-square flex items-center justify-center`}>
        <img 
          src="/lovable-uploads/424dc4da-05e6-4b1b-8102-ea8d3348e10c.png" 
          alt="Tixel Logo" 
          className={`${sizeClasses[size]} object-contain`}
        />
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
