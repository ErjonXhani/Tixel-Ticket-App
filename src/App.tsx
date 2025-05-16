
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import SplashScreen from "./pages/SplashScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import LoginScreen from "./pages/LoginScreen";
import SignupScreen from "./pages/SignupScreen";
import HomeScreen from "./pages/HomeScreen";
import EventDetailsScreen from "./pages/EventDetailsScreen";
import EventsScreen from "./pages/EventsScreen";
import AdminScreen from "./pages/AdminScreen";
import AdminEventForm from "./pages/AdminEventForm";
import ProfileScreen from "./pages/ProfileScreen";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";

// Layout components
import MobileLayout from "./components/layouts/MobileLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  // Initialize app
  useEffect(() => {
    // Any app initialization code can go here
    console.log("Tixel app initialized");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Initial screens */}
              <Route path="/splash" element={<SplashScreen />} />
              <Route path="/onboarding" element={<OnboardingScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              
              {/* User app screens with navigation */}
              <Route path="/" element={<MobileLayout />}>
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="home" element={<HomeScreen />} />
                <Route path="events" element={<EventsScreen />} />
                <Route path="events/:id" element={<EventDetailsScreen />} />
                <Route path="profile" element={<ProfileScreen />} />
              </Route>
              
              {/* Admin screens */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminScreen />} />
                <Route path="events/create" element={<AdminEventForm />} />
                <Route path="events/edit/:id" element={<AdminEventForm />} />
              </Route>
              
              {/* Not found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
