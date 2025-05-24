
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

// Types
interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  loading: boolean; // Added for compatibility with App.tsx
  checkAuth: () => Promise<void>; // Added for compatibility with App.tsx
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to cleanup Supabase auth state
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

// Helper to transform Supabase User to AuthUser
const transformUser = (user: User | null): AuthUser | null => {
  if (!user) return null;
  
  // Check if email contains 'admin' to determine role
  const isAdmin = user.email?.includes('admin') || false;
  
  return {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split('@')[0] || null,
    email: user.email,
    role: isAdmin ? "admin" : "user",
  };
};

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check auth method to be called on app initialization
  const checkAuth = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(transformUser(currentSession?.user ?? null));
      
      // If we're on login/signup/splash screens and already logged in, redirect to home
      if (currentSession && ["/login", "/signup", "/splash", "/onboarding"].includes(location.pathname)) {
        navigate("/home");
      } else if (!currentSession && !["/login", "/signup", "/splash", "/onboarding", "/payment"].includes(location.pathname)) {
        // If not authenticated and not on an auth page, redirect to login
        navigate("/login");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
        setUser(transformUser(newSession?.user ?? null));
        
        // Handle sign out event
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          navigate('/login');
        }
      }
    );

    // THEN check for existing session
    checkAuth();

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Clean up existing auth state
      cleanupAuthState();
      
      // For demo purposes, handle manually for admin login
      if (email === "admin@tixel.com" && password === "admin123") {
        // Create a mock session for admin user
        const mockUser = {
          id: "admin-user-id",
          name: "Admin",
          email: "admin@tixel.com",
          role: "admin" as const,
        };
        setUser(mockUser);
        toast.success(`Welcome back, Admin!`);
        navigate("/admin");
        return true;
      }
      
      // Regular Supabase authentication for non-admin users
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success(`Welcome back, ${data.user.email?.split('@')[0]}!`);
      
      // Navigate based on role
      if (data.user.email?.includes('admin')) {
        navigate("/admin");
      } else {
        navigate("/home");
      }
      
      return true;
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(error.message || "Login failed. Please check your credentials.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function - Fixed to use proper auto-incrementing user_id
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Clean up existing auth state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      console.log("Starting signup process for:", email);
      
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log("Supabase signup successful, user created:", data.user?.id);
      
      // If we have a user, add them to the users table with proper auto-incrementing ID
      if (data.user) {
        console.log("Inserting user into Users table...");
        
        // Let the database handle user_id auto-increment, just provide the auth_uid
        const { data: insertData, error: insertError } = await supabase.from('Users').insert({
          auth_uid: data.user.id, // Store the Supabase auth UUID
          username: name.toLowerCase().replace(/\s+/g, '_'),
          email: email,
          password_hash: 'managed_by_supabase',
          full_name: name,
          role: 'user'
        }).select('user_id').single();
        
        if (insertError) {
          console.error("Failed to insert user into Users table:", insertError);
          toast.error("Account created but profile setup failed. Please contact support.");
        } else {
          console.log("User successfully inserted with user_id:", insertData?.user_id);
        }
      }
      
      toast.success("Account created successfully!");
      
      // If email confirmation is required
      if (data.user && !data.session) {
        toast.info("Please check your email to confirm your account.");
        return true;
      }
      
      // If auto-confirmed
      navigate("/home");
      return true;
    } catch (error: any) {
      console.error("Signup failed:", error);
      toast.error(error.message || "Signup failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      setUser(null);
      setSession(null);
      
      toast.info("You have been logged out.");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    session,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isLoading,
    loading: isLoading, // Added for compatibility with App.tsx
    checkAuth, // Added for compatibility with App.tsx
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
