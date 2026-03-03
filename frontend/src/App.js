import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
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
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;