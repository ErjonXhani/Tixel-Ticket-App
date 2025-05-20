
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import MobileLayout from "./components/layouts/MobileLayout";

import SplashScreen from "./pages/SplashScreen";
import LoginScreen from "./pages/LoginScreen";
import SignupScreen from "./pages/SignupScreen";
import HomeScreen from "./pages/HomeScreen";
import EventsScreen from "./pages/EventsScreen";
import EventDetailsScreen from "./pages/EventDetailsScreen";
import PaymentScreen from "./pages/PaymentScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import AdminScreen from "./pages/AdminScreen";
import ProfileScreen from "./pages/ProfileScreen";

function App() {
  const { user, loading, checkAuth } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    const performAuthCheck = async () => {
      await checkAuth();
      setHasCheckedAuth(true);
    };

    performAuthCheck();
  }, [checkAuth]);

  // Show a loading indicator while checking authentication
  if (loading || !hasCheckedAuth) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ff4b00] rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/splash" />} />
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/login" element={user ? <Navigate to="/home" /> : <LoginScreen />} />
        <Route path="/signup" element={user ? <Navigate to="/home" /> : <SignupScreen />} />
        <Route path="/payment" element={<PaymentScreen />} />
        
        {/* Protected Routes with Navigation Bar */}
        <Route element={<MobileLayout />}>
          <Route path="/home" element={user ? <HomeScreen /> : <Navigate to="/login" />} />
          <Route path="/events" element={user ? <EventsScreen /> : <Navigate to="/login" />} />
          <Route path="/events/:id" element={user ? <EventDetailsScreen /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <ProfileScreen /> : <Navigate to="/login" />} />
          <Route path="/resell" element={user ? <div className="p-6"><h1 className="text-xl font-bold mb-4">Resell Tickets</h1><p>Resell tickets feature coming soon.</p></div> : <Navigate to="/login" />} />
        </Route>
        
        {/* Admin route */}
        <Route path="/admin" element={user?.role === "admin" ? <AdminScreen /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
