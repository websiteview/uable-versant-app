import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getTestQuestions } from '@/lib/test-data';
import TestInterface from '@/components/TestInterface';
import TestComplete from '@/components/TestComplete';
import StudentRegistration from '@/components/StudentRegistration';
import CheckMateLogo from '@/components/CheckMateLogo';
import { Loader2, AlertTriangle, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateTestLink } from '@/lib/storage';

const StudentTest = () => {
  const { linkId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isTeacherPreview = queryParams.get('teacherPreview') === 'true';

  // Flow: 'splash' -> 'registration' -> 'instructions' -> 'active' -> 'complete'
  const [testFlow, setTestFlow] = useState('splash'); 
  
  const [testState, setTestState] = useState({
    loading: true,
    error: null,
    data: null,
    studentData: null,
    currentQuestionIndex: 0,
    answers: {},
    startTime: null
  });

  const isPreview = linkId === 'preview-mode' || isTeacherPreview;

  useEffect(() => {
    const initializeTest = async () => {
      try {
        let version = 1;
        let teacherName = "UAble Teacher";
        let teacherId = "teacher-guest";
        let linkData = null;

        if (!isPreview) {
          linkData = validateTestLink(linkId);
          if (!linkData) {
            setTestState(prev => ({ ...prev, loading: false, error: "This test link is invalid or has expired. Please ask your teacher for a new one." }));
            return;
          }
          version = linkData.version;
          teacherName = linkData.teacherName;
          teacherId = linkData.teacherId;
        } else {
           // For preview, just use a random version
           version = Math.floor(Math.random() * 6) + 1;
        }

        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        const questions = getTestQuestions(version);
        setTestState(prev => ({
          ...prev,
          loading: false,
          data: {
            id: linkId,
            version,
            title: `UAble Versant English Test (Version ${version})`,
            questions,
            teacherName,
            teacherId 
          }
        }));
        
        // Auto-advance from splash
        setTimeout(() => {
          if (isPreview) {
             handleRegistrationComplete({ fullName: "Teacher Preview", email: "preview@uable.com" });
          } else {
             setTestFlow('registration');
          }
        }, 500);

      } catch (error) {
        console.error("Failed to load test:", error);
        setTestState(prev => ({ ...prev, loading: false, error: "An unexpected error occurred while loading the test." }));
      }
    };

    initializeTest();
  }, [linkId, isPreview]);

  const handleRegistrationComplete = (studentData) => {
    setTestState(prev => ({ ...prev, studentData }));
    setTestFlow('instructions');
  };

  const startTest = () => {
    setTestState(prev => ({
      ...prev,
      startTime: new Date()
    }));
    setTestFlow('active');
  };

  const handleAnswer = (questionId, answer) => {
    setTestState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }));
  };

  const handleNext = () => {
    if (testState.currentQuestionIndex < testState.data.questions.length - 1) {
      setTestState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    setTestFlow('complete');
  };

  // --- RENDER STATES ---

  if (testState.loading || testFlow === 'splash') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80')] opacity-5 bg-cover bg-center" />
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="z-10"
          >
            <CheckMateLogo size="large" />
            {(testState.loading || testFlow === 'splash') && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 1 }}
                className="mt-8 flex justify-center"
              >
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (testState.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center space-y-4 max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Test Unavailable</h2>
          <p className="text-gray-600">
            {testState.error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isPreview && (
        <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 text-center fixed top-0 w-full z-50">
          <p className="text-xs font-medium text-amber-800 flex items-center justify-center gap-2">
             <Eye className="w-4 h-4" />
             <span>Teacher Preview Mode - No results will be saved.</span>
          </p>
        </div>
      )}
      
      <AnimatePresence mode="wait">
        {testFlow === 'registration' && (
          <motion.div 
            key="reg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pt-12"
          >
            <StudentRegistration 
              testLink={testState.data} 
              onComplete={handleRegistrationComplete} 
            />
          </motion.div>
        )}

        {testFlow === 'instructions' && (
           <motion.div 
             key="instr"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="max-w-4xl mx-auto pt-20 px-4"
           >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
                 <div className="bg-indigo-600 p-6 flex justify-center">
                    <div className="bg-white p-3 rounded-xl shadow-lg">
                       <CheckMateLogo size="small" animated={false} />
                    </div>
                 </div>
                 <div className="p-12 text-center space-y-8">
                    <div className="space-y-4">
                       <h1 className="text-3xl font-bold text-gray-900">Ready for your Assessment?</h1>
                       <p className="text-xl font-medium text-indigo-600">Welcome, {testState.studentData?.fullName}!</p>
                       <p className="text-gray-600 max-w-2xl mx-auto">
                          This test assesses your English proficiency across Listening, Speaking, Reading, and Writing with UAble. 
                          Please ensure you are in a quiet room and have a working microphone.
                       </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-2xl mx-auto bg-gray-50 p-6 rounded-xl border border-gray-200">
                       <div className="space-y-1 text-center md:text-left">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</span>
                          <p className="font-bold text-gray-900 text-lg">~45 Mins</p>
                       </div>
                       <div className="space-y-1 text-center md:text-left">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sections</span>
                          <p className="font-bold text-gray-900 text-lg">{new Set(testState.data.questions.map(q => q.section)).size} Parts</p>
                       </div>
                       <div className="space-y-1 text-center md:text-left">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Items</span>
                          <p className="font-bold text-gray-900 text-lg">{testState.data.questions.length} Questions</p>
                       </div>
                    </div>

                    <button 
                      onClick={startTest}
                      className="inline-flex items-center justify-center px-12 py-4 border border-transparent text-xl font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                      Start Assessment
                    </button>
                 </div>
              </div>
           </motion.div>
        )}

        {testFlow === 'active' && (
          <motion.div 
            key="test"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-8"
          >
            <TestInterface 
              studentData={testState.studentData}
              testLink={testState.data}
              question={testState.data.questions[testState.currentQuestionIndex]}
              totalQuestions={testState.data.questions.length}
              currentIndex={testState.currentQuestionIndex}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onForceSubmit={finishTest} 
              answers={testState.answers}
              isPreview={isPreview}
            />
          </motion.div>
        )}

        {testFlow === 'complete' && (
          <motion.div key="complete">
             <TestComplete 
                answers={testState.answers} 
                questions={testState.data.questions}
                studentData={testState.studentData}
                isPreview={isPreview}
                submissionTime={new Date()}
             />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentTest;