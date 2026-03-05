import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';
import { useIncomingCalls, IncomingCallNotification } from './components/IncomingCall';
import usePushNotifications from './hooks/usePushNotifications';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import PricingPage from './pages/PricingPage';
import WorkoutsPage from './pages/WorkoutsPage';
import WorkoutDetailPage from './pages/WorkoutDetailPage';
import SupplementsPage from './pages/SupplementsPage';
import SuccessPage from './pages/SuccessPage';
import AdminPage from './pages/AdminPage';
import QRCodePage from './pages/QRCodePage';
import MyProgressPage from './pages/MyProgressPage';
import MessagesPage from './pages/MessagesPage';
import RemindersPage from './pages/RemindersPage';
import ReviewsPage from './pages/ReviewsPage';
import ProgressPhotosPage from './pages/ProgressPhotosPage';
import LiveStreamPage from './pages/LiveStreamPage';
import CallPage from './pages/CallPage';
import RunningPage from './pages/RunningPage';
import RewardsPage from './pages/RewardsPage';
import HallOfFamePage from './pages/HallOfFamePage';
import './i18n';
import './App.css';

function AppRouter() {
  const location = useLocation();
  
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/qrcode" element={<QRCodePage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/workouts" element={
        <ProtectedRoute>
          <WorkoutsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/workout/:workoutId" element={
        <ProtectedRoute>
          <WorkoutDetailPage />
        </ProtectedRoute>
      } />
      
      <Route path="/supplements" element={
        <ProtectedRoute>
          <SupplementsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminPage />
        </ProtectedRoute>
      } />
      
      <Route path="/my-progress" element={
        <ProtectedRoute>
          <MyProgressPage />
        </ProtectedRoute>
      } />
      
      <Route path="/messages" element={
        <ProtectedRoute>
          <MessagesPage />
        </ProtectedRoute>
      } />
      
      <Route path="/reminders" element={
        <ProtectedRoute>
          <RemindersPage />
        </ProtectedRoute>
      } />
      
      <Route path="/progress-photos" element={
        <ProtectedRoute>
          <ProgressPhotosPage />
        </ProtectedRoute>
      } />
      
      <Route path="/live" element={
        <ProtectedRoute>
          <LiveStreamPage />
        </ProtectedRoute>
      } />
      
      <Route path="/call" element={
        <ProtectedRoute>
          <CallPage />
        </ProtectedRoute>
      } />
      
      <Route path="/running" element={
        <ProtectedRoute>
          <RunningPage />
        </ProtectedRoute>
      } />
      
      <Route path="/rewards" element={
        <ProtectedRoute>
          <RewardsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/hall-of-fame" element={<HallOfFamePage />} />
    </Routes>
  );
}

// Component to handle incoming calls
function IncomingCallHandler() {
  const { user } = useAuth();
  const { incomingCall, clearIncomingCall } = useIncomingCalls();

  if (!user || !incomingCall) return null;

  return (
    <IncomingCallNotification
      call={incomingCall}
      onAccept={clearIncomingCall}
      onDecline={clearIncomingCall}
    />
  );
}

// Component to handle push notification subscription
function PushNotificationHandler() {
  const { user } = useAuth();
  const { isSupported, isSubscribed, subscribe, permission } = usePushNotifications();

  useEffect(() => {
    // Auto-subscribe to push notifications when user is logged in
    if (user && isSupported && !isSubscribed && permission === 'default') {
      // Wait a bit before asking for permission (better UX)
      const timer = setTimeout(() => {
        subscribe();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [user, isSupported, isSubscribed, permission, subscribe]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <IncomingCallHandler />
        <PushNotificationHandler />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;