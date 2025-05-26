
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import ResponsiveLayout from "./components/layouts/ResponsiveLayout";
import AdminLayout from "./components/layouts/AdminLayout";

import SplashScreen from "./pages/SplashScreen";
import LoginScreen from "./pages/LoginScreen";
import SignupScreen from "./pages/SignupScreen";
import HomeScreen from "./pages/HomeScreen";
import EventsScreen from "./pages/EventsScreen";
import EventDetailsScreen from "./pages/EventDetailsScreen";
import PaymentScreen from "./pages/PaymentScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import ProfileScreen from "./pages/ProfileScreen";
import MyTicketsScreen from "./pages/MyTicketsScreen";

// Admin components
import AdminDashboard from "./pages/AdminDashboard";
import AdminEventsPage from "./pages/AdminEventsPage";
import AdminEventForm from "./pages/AdminEventForm";
import AdminVenuesPage from "./pages/AdminVenuesPage";
import AdminSectorsPage from "./pages/AdminSectorsPage";
import AdminPricingPage from "./pages/AdminPricingPage";

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
        
        {/* Protected Routes with Responsive Layout */}
        <Route element={<ResponsiveLayout />}>
          <Route path="/home" element={user ? <HomeScreen /> : <Navigate to="/login" />} />
          <Route path="/events" element={user ? <EventsScreen /> : <Navigate to="/login" />} />
          <Route path="/events/:id" element={user ? <EventDetailsScreen /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <ProfileScreen /> : <Navigate to="/login" />} />
          <Route path="/my-tickets" element={user ? <MyTicketsScreen /> : <Navigate to="/login" />} />
        </Route>
        
        {/* Admin routes with Admin Layout */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/admin/events" element={user?.role === "admin" ? <AdminEventsPage /> : <Navigate to="/login" />} />
          <Route path="/admin/events/create" element={user?.role === "admin" ? <AdminEventForm /> : <Navigate to="/login" />} />
          <Route path="/admin/events/edit/:id" element={user?.role === "admin" ? <AdminEventForm /> : <Navigate to="/login" />} />
          <Route path="/admin/venues" element={user?.role === "admin" ? <AdminVenuesPage /> : <Navigate to="/login" />} />
          <Route path="/admin/sectors" element={user?.role === "admin" ? <AdminSectorsPage /> : <Navigate to="/login" />} />
          <Route path="/admin/pricing" element={user?.role === "admin" ? <AdminPricingPage /> : <Navigate to="/login" />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
