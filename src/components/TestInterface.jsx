import React, { useState, useEffect, useRef, Suspense, lazy, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, Clock, AlertTriangle, Eye, Save, Loader2 } from 'lucide-react';
import { calculateScore } from '@/lib/test-data';
import { saveTestResult } from '@/lib/storage';
import { stopAudio } from '@/lib/audio';

const RepeatSentenceQuestion = lazy(() => import('@/components/test-sections/RepeatSentenceQuestion'));
const SentenceBuildQuestion = lazy(() => import('@/components/test-sections/SentenceBuildQuestion'));
const ConversationQuestion = lazy(() => import('@/components/test-sections/ConversationQuestion'));
const SentenceCompletionQuestion = lazy(() => import('@/components/test-sections/SentenceCompletionQuestion'));
const DictationQuestion = lazy(() => import('@/components/test-sections/DictationQuestion'));
const PassageReconstructionQuestion = lazy(() => import('@/components/test-sections/PassageReconstructionQuestion'));

const QuestionLoader = () => (
  <div className="flex flex-col items-center justify-center h-64 space-y-4">
    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    <p className="text-sm text-gray-400">Loading question...</p>
  </div>
);

const TestInterface = React.memo(({ 
  studentData, 
  testLink, 
  question, 
  totalQuestions,
  currentIndex,
  onAnswer, 
  onNext,
  onForceSubmit,
  answers,
  isPreview 
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (question) {
      setTimeLeft(question.timeLimit);
    }
  }, [question]);

  useEffect(() => {
    if (!question) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setTimeout(() => handleNextClick(true), 0);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [question]); 

  const handleNextClick = useCallback((autoAdvanced = false) => {
    clearInterval(timerRef.current);
    stopAudio();
    
    if (currentIndex === totalQuestions - 1) {
       handleFinalSubmit();
    } else {
       onNext();
    }
  }, [currentIndex, totalQuestions, onNext]);

  const handleFinalSubmit = useCallback(async () => {
    setIsSubmitting(true);
    stopAudio();
    clearInterval(timerRef.current);
    
    try {
      const submitProcess = new Promise(async (resolve) => {
        try {
          const cleanedAnswers = {};
          for (const [key, value] of Object.entries(answers)) {
            const { blob, audioUrl, ...safeData } = value;
            cleanedAnswers[key] = {
              ...safeData,
              duration: safeData.duration || 0,
              transcript: safeData.transcript || ''
            };
          }

          const score = calculateScore(cleanedAnswers, testLink.questions);
          
          if (!isPreview) {
            saveTestResult({
              ...studentData,
              score,
              version: testLink.version,
              answers: cleanedAnswers,
              linkId: testLink.id,
              teacherId: testLink.teacherId,
              completed: true,
            });
          }
          resolve();
        } catch (err) {
          console.error("Error during scoring/saving:", err);
          resolve(); 
        }
      });

      await Promise.race([
        submitProcess,
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
      
    } catch (error) {
      console.error("Critical submission flow error:", error);
    } finally {
      onForceSubmit(); 
    }
  }, [answers, testLink, studentData, isPreview, onForceSubmit]);

  const handleQuestionAnswer = useCallback((data) => {
    try {
      onAnswer(question.id, data);
    } catch (e) {
      console.error("Error saving answer:", e);
    }
  }, [question.id, onAnswer]);

  if (!question) return <div>Loading...</div>;

  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const isTimeLow = timeLeft <= 10;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const showSubmitButton = isLastQuestion;

  const activeAnswer = answers[question.id] || {};

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6 sticky top-2 md:top-4 z-30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{question.section}</h2>
            {isPreview && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                <Eye className="w-3 h-3 mr-1" /> Teacher Preview
              </span>
            )}
          </div>
          
          <div className={`flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-mono text-lg md:text-xl font-bold transition-colors ${
            isTimeLow ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-50 text-gray-700'
          }`}>
            <Clock className={`w-4 h-4 md:w-5 md:h-5 mr-2 ${isTimeLow ? 'text-red-500' : 'text-gray-400'}`} />
            {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs md:text-sm text-gray-500">
            <span>Progress</span>
            <span>Question {currentIndex + 1} of {totalQuestions}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-8 min-h-[400px] md:min-h-[500px] flex flex-col"
        >
          <div className="bg-indigo-50 rounded-lg p-3 md:p-4 mb-6 md:mb-8 border-l-4 border-indigo-500">
            <h3 className="font-medium text-indigo-900 text-sm md:text-base flex items-center">
              <span className="mr-2">ℹ️</span> {question.instruction}
            </h3>
          </div>

          <div className="flex-grow">
            <Suspense fallback={<QuestionLoader />}>
              {question.type === 'repeat-sentence' && <RepeatSentenceQuestion question={question} onAnswer={handleQuestionAnswer} currentAnswer={activeAnswer} />}
              {question.type === 'sentence-build' && <SentenceBuildQuestion question={question} onAnswer={handleQuestionAnswer} currentAnswer={activeAnswer} />}
              {question.type === 'conversation' && <ConversationQuestion question={question} onAnswer={handleQuestionAnswer} currentAnswer={activeAnswer} />}
              {question.type === 'sentence-completion' && <SentenceCompletionQuestion question={question} onAnswer={handleQuestionAnswer} currentAnswer={activeAnswer} />}
              {question.type === 'dictation' && <DictationQuestion question={question} onAnswer={handleQuestionAnswer} currentAnswer={activeAnswer} />}
              {question.type === 'passage-reconstruction' && <PassageReconstructionQuestion question={question} onAnswer={handleQuestionAnswer} currentAnswer={activeAnswer} />}
            </Suspense>
          </div>

          <div className="mt-6 md:mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm">
              {isTimeLow && (
                <span className="flex items-center text-red-500 font-medium">
                  <AlertTriangle className="w-4 h-4 mr-1" /> Time is running out!
                </span>
              )}
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
               {showSubmitButton ? (
                  <Button 
                    onClick={handleFinalSubmit}
                    className="w-full md:w-auto px-8 bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Test'}
                    <Save className="ml-2 w-4 h-4" />
                  </Button>
               ) : (
                  <Button 
                    onClick={() => handleNextClick(false)}
                    className="w-full md:w-auto px-8"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    Next Question
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
               )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

export default TestInterface;