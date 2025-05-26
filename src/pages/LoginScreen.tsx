
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-white flex flex-col ${isMobile ? 'p-6' : 'items-center justify-center'}`}>
      <div className={`${isMobile ? 'flex-1 flex flex-col items-center justify-center' : ''}`}>
        <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img 
                src="/lovable-uploads/4f84f21f-d678-4b27-bf99-b3fed96e6d6b.png" 
                alt="Tixel Logo" 
                className="h-24"
              />
            </div>
            <p className="text-xl font-bold">Sign in to your TIXEL account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot Password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-[#ff4b00] hover:bg-[#ff4b00]/90 text-white"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/signup" className="text-[#ff4b00] hover:underline font-medium">
              Sign up
            </Link>
          </div>
          
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">Google</Button>
              <Button variant="outline" className="w-full">Apple</Button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default LoginScreen;
