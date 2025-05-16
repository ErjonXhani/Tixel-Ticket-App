
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

// Types
interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API URL
const API_BASE_URL = "http://localhost/tixel-api";

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we have a stored token on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("tixel_user");
      
      if (storedUser) {
        try {
          // In a real app, we would validate the token with the server
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // If we're on login/signup/splash screens and already logged in, redirect to home
          if (["/login", "/signup", "/splash", "/onboarding"].includes(location.pathname)) {
            navigate("/home");
          }
        } catch (error) {
          console.error("Failed to parse stored user data:", error);
          localStorage.removeItem("tixel_user");
        }
      } else if (!["/login", "/signup", "/splash", "/onboarding"].includes(location.pathname)) {
        // If not authenticated and not on an auth page, redirect to login
        navigate("/splash");
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`${API_BASE_URL}/login.php`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password }),
      // });
      
      // Mock login for now
      // Simulate different roles based on email
      const isAdmin = email.includes("admin");
      
      // Simulate success
      const mockUser: User = {
        id: 1,
        name: email.split("@")[0],
        email,
        role: isAdmin ? "admin" : "user",
      };
      
      setUser(mockUser);
      localStorage.setItem("tixel_user", JSON.stringify(mockUser));
      
      toast.success(`Welcome back, ${mockUser.name}!`);
      
      // Navigate based on role
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/home");
      }
      
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please check your credentials.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`${API_BASE_URL}/signup.php`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ name, email, password }),
      // });
      
      // Mock signup
      const mockUser: User = {
        id: Date.now(),
        name,
        email,
        role: "user",
      };
      
      setUser(mockUser);
      localStorage.setItem("tixel_user", JSON.stringify(mockUser));
      
      toast.success("Account created successfully!");
      navigate("/home");
      
      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      toast.error("Signup failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("tixel_user");
    navigate("/login");
    toast.info("You have been logged out.");
  };

  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
