import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { EyeOff, Calendar, Clock, User, Loader2, Award, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CheckMateLogo from '@/components/CheckMateLogo';

const TestComplete = ({ answers, questions, studentData, isPreview, submissionTime }) => {
  const navigate = useNavigate();
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCalculating(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const completionDate = submissionTime ? new Date(submissionTime) : new Date();

  if (isCalculating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-indigo-50 to-white">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-indigo-900">Calculating Results...</h2>
        <p className="text-gray-500 mt-2 text-center max-w-md">
          Please wait while we process your audio responses and evaluate your proficiency.
        </p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-indigo-50 to-white">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="w-full max-w-3xl"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden border border-indigo-50">
            {isPreview && (
              <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 px-6 py-2 rounded-bl-2xl font-bold text-sm flex items-center z-10">
                <EyeOff className="h-4 w-4 mr-2" /> Preview Mode
              </div>
            )}

            <div className="text-center space-y-6 mb-10">
              <div className="flex justify-center">
                 <CheckMateLogo size="large" />
              </div>
              
              <motion.div
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.2 }}
              >
                 <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-6">
                   You have submitted your <span className="text-indigo-600 inline-block transform hover:scale-105 transition-transform cursor-default">UAble</span> Versant Test
                 </h2>
                 <p className="text-gray-500 mt-2 text-lg">Your test has been successfully received and scored.</p>
              </motion.div>
            </div>

            <div className="bg-indigo-50 rounded-2xl p-8 mb-8 border border-indigo-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full -mr-16 -mt-16 opacity-50" />
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200 rounded-full -ml-12 -mb-12 opacity-30" />
               
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <h3 className="text-indigo-900 font-bold text-lg flex items-center border-b border-indigo-200 pb-2">
                        <User className="w-5 h-5 mr-2" /> Student Profile
                     </h3>
                     <div className="space-y-2">
                        <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Full Name</p>
                        <p className="text-gray-900 font-medium text-lg">{studentData?.fullName || "N/A"}</p>
                        
                        <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mt-2">Email</p>
                        <p className="text-gray-900 font-medium">{studentData?.email || "N/A"}</p>
                        
                        <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mt-2">Section</p>
                        <p className="text-gray-900 font-medium">{studentData?.section || "N/A"}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-indigo-900 font-bold text-lg flex items-center border-b border-indigo-200 pb-2">
                        <Award className="w-5 h-5 mr-2" /> Overall Results
                     </h3>
                     <div className="space-y-2">
                        <div className="bg-white bg-opacity-60 rounded-lg p-4 border border-indigo-100 flex justify-between items-center">
                           <div>
                             <p className="text-xs text-indigo-600 font-bold uppercase">Scaled Score (20-80)</p>
                             <p className="text-3xl font-black text-indigo-900">{studentData?.score?.overallScore || "0"}</p> 
                           </div>
                           <div className="text-right">
                             <p className="text-xs text-indigo-600 font-bold uppercase">CEFR Level</p>
                             <p className="text-2xl font-black text-indigo-900">{studentData?.score?.cefrLevel || "A1"}</p> 
                           </div>
                        </div>

                        {studentData?.score?.diagnosticFeedback && studentData.score.diagnosticFeedback.length > 0 && (
                          <div className="mt-4 text-sm bg-blue-50 text-blue-800 p-3 rounded border border-blue-100">
                             <p className="font-semibold flex items-center"><ListChecks className="w-4 h-4 mr-1" /> Diagnostic Feedback:</p>
                             <ul className="list-disc pl-5 mt-1 space-y-1">
                                {studentData.score.diagnosticFeedback.map((fb, idx) => (
                                  <li key={idx}>{fb}</li>
                                ))}
                             </ul>
                          </div>
                        )}
                     </div>
                  </div>
               </div>

               {studentData?.score?.subScores && (
                 <div className="relative z-10 mt-6 pt-6 border-t border-indigo-100">
                    <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wide mb-3">Skill Subscores (0-100)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                       {Object.entries({
                         'Pronunciation': studentData.score.subScores.pronunciation,
                         'Fluency': studentData.score.subScores.fluency,
                         'Grammar': studentData.score.subScores.grammar,
                         'Listening': studentData.score.subScores.comprehension || studentData.score.subScores.listening,
                         'Vocabulary': studentData.score.subScores.vocabulary
                       }).map(([skill, val]) => (
                         <div key={skill} className="bg-white bg-opacity-50 p-2 rounded text-center">
                           <p className="text-xs text-gray-500 font-medium">{skill}</p>
                           <p className="font-bold text-indigo-900">{val || 0}</p>
                         </div>
                       ))}
                    </div>
                 </div>
               )}
            </div>

            <div className="flex justify-center gap-4">
               <Button 
                 onClick={() => isPreview ? window.close() : navigate('/')} 
                 className="w-full md:w-auto px-12 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all" 
                 size="lg"
               >
                 {isPreview ? "Close Preview" : "Finish & Return"}
               </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TestComplete;