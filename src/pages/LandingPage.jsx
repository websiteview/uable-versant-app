import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, CheckCircle, BarChart3, Globe } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>UAble - Professional English Testing Platform</title>
        <meta name="description" content="Comprehensive Versant English test platform for educational institutions" />
      </Helmet>
      
      <div className="min-h-screen">
        <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-indigo-600" />
                <span className="text-2xl font-bold text-indigo-900">UAble</span>
              </div>
              <div className="flex space-x-4">
                <Button variant="ghost" onClick={() => navigate('/admin/login')}>
                  Admin
                </Button>
                <Button onClick={() => navigate('/teacher/login')}>
                  Teacher Login
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <section className="pt-20 pb-32 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-indigo-900 mb-6">
                Professional English Testing Platform
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Comprehensive Versant English test assessment for students with powerful analytics for teachers and administrators via UAble
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" onClick={() => navigate('/teacher/login')} className="text-lg px-8">
                  Get Started
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/admin/login')} className="text-lg px-8">
                  Admin Access
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-20 grid md:grid-cols-3 gap-8"
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <Users className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Multi-User Management</h3>
                <p className="text-gray-600">
                  Support for administrators, teachers, and unlimited students with role-based access
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <GraduationCap className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Complete Versant Test</h3>
                <p className="text-gray-600">
                  Full implementation of all Versant English test question types with automatic scoring
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <BarChart3 className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Advanced Analytics</h3>
                <p className="text-gray-600">
                  Detailed Excel reports with scores, proficiency levels, and performance metrics
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-white py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-indigo-900 mb-16">
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Teacher Dashboard</h3>
                  <p className="text-gray-600">
                    Generate unique test links, track student progress, and download comprehensive Excel reports
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Student-Friendly</h3>
                  <p className="text-gray-600">
                    No login required - students access tests via teacher-generated links with simple registration
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Bilingual Interface</h3>
                  <p className="text-gray-600">
                    Optional Spanish translation for UI elements while maintaining English test content
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Automatic Scoring</h3>
                  <p className="text-gray-600">
                    Instant results with detailed proficiency levels from A1 to C2 based on CEFR standards
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-indigo-900 text-white py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <CheckCircle className="h-8 w-8" />
              <span className="text-2xl font-bold">UAble</span>
            </div>
            <p className="text-indigo-200">
              Professional English Testing Platform © 2026
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;