import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingScreen from '@/components/LoadingScreen';
import { logPerformance } from '@/lib/performance';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const TeacherLogin = lazy(() => import('@/pages/TeacherLogin'));
const TeacherDashboard = lazy(() => import('@/pages/TeacherDashboard'));
const StudentTest = lazy(() => import('@/pages/StudentTest'));

const AppContent = () => {
  return (
    <Router>
      <Helmet>
        <title>UAble - Versant English Test Platform</title>
        <meta name="description" content="Professional English proficiency testing platform for teachers and students" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/teacher/login" element={<TeacherLogin />} />
            <Route 
              path="/teacher/dashboard" 
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/test/:linkId" element={<StudentTest />} />
            {/* Security: Use replace on catch-all redirects to keep history clean */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster />
      </div>
    </Router>
  );
};

function App() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    logPerformance();

    const bootstrapApp = async () => {
      try {
        const initPromise = new Promise(resolve => setTimeout(resolve, 150));
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Bootstrap timeout')), 2000));
        await Promise.race([initPromise, timeoutPromise]);
      } catch (error) {
        console.warn("Bootstrap resolution forced via timeout:", error);
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrapApp();
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        {isBootstrapping ? (
          <LoadingScreen message="Initializing UAble..." isLoading={true} />
        ) : (
          <AppContent />
        )}
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;