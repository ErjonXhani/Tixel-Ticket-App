
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/ui/logo";
import { useAuth } from "@/contexts/AuthContext";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem("tixel_onboarded");
    
    // Auto-navigate after splash animation
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate("/home");
      } else if (hasSeenOnboarding) {
        navigate("/login");
      } else {
        navigate("/onboarding");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-primary">
      <div className="animate-scale-in flex flex-col items-center">
        <Logo size="lg" type="full" className="mb-8" />
        
        <div className="mt-8 relative">
          <div className="w-16 h-16 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
