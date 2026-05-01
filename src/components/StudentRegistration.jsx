import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCircle2, Mail, GraduationCap, CheckCircle2 } from 'lucide-react';

const StudentRegistration = ({ testLink, onComplete }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    section: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({
      ...formData,
      teacherName: testLink.teacherName,
      teacherId: testLink.teacherId,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header with visual connection to previous screen */}
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-indigo-600" />
           </div>
           <h1 className="text-2xl font-bold text-gray-900">Student Registration</h1>
           <p className="text-gray-500">Please enter your details to proceed</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2 text-gray-700">
                 <UserCircle2 className="w-4 h-4 text-indigo-500" /> Full Name
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="e.g. John Doe"
                required
                className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
                 <Mail className="w-4 h-4 text-indigo-500" /> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="john@example.com"
                required
                className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section" className="flex items-center gap-2 text-gray-700">
                 <GraduationCap className="w-4 h-4 text-indigo-500" /> Class / Section
              </Label>
              <Input
                id="section"
                value={formData.section}
                onChange={(e) => setFormData({...formData, section: e.target.value})}
                placeholder="e.g. Class 10-A"
                required
                className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full h-12 text-lg font-medium bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200">
                Continue to Instructions
              </Button>
            </div>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
             <p className="text-xs text-gray-400">
                Invited by Teacher <span className="font-semibold text-indigo-600">{testLink.teacherName}</span>
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentRegistration;