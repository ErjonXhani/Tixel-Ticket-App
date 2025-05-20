
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem("tixel_onboarded");
    
    // Auto-navigate after splash animation (increased to 4 seconds)
    const timer = setTimeout(() => {
      if (user) {
        navigate("/home");
      } else if (hasSeenOnboarding) {
        navigate("/login");
      } else {
        navigate("/onboarding");
      }
    }, 4000);  // 4 seconds

    return () => clearTimeout(timer);
  }, [navigate, user]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center" style={{ backgroundColor: "#ff4b00" }}>
      <div className="animate-scale-in flex flex-col items-center">
        <img 
          src="/lovable-uploads/60600f6e-52f3-4db4-8dbb-2d9799b6ce8d.png" 
          alt="Tixel Logo" 
          className="max-w-[80%] w-[280px]"
        />
        
        <div className="mt-8 relative">
          <div className="w-16 h-16 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
