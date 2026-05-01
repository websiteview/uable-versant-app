import React, { useState, useEffect, memo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff } from 'lucide-react';

const PassageReconstructionQuestion = memo(({ question, onAnswer, currentAnswer }) => {
  const [phase, setPhase] = useState('reading'); // reading, writing
  const [timeLeft, setTimeLeft] = useState(question.readTime || 30);
  
  useEffect(() => {
    if (phase === 'reading') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setPhase('writing');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  const progress = (timeLeft / (question.readTime || 30)) * 100;

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto">
      {phase === 'reading' ? (
        <div className="flex-grow flex flex-col justify-center space-y-4 md:space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between text-indigo-900 font-bold text-sm md:text-base">
            <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 md:w-5 md:h-5" />
                READING PHASE
            </div>
            <span>{timeLeft}s remaining</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg border border-gray-100 leading-loose text-lg md:text-xl font-serif text-gray-800 select-none">
            {question.passage}
          </div>
          
          <p className="text-center text-gray-500 text-sm md:text-base">
            Read the passage carefully. It will disappear soon.
          </p>
        </div>
      ) : (
        <div className="flex-grow flex flex-col justify-center space-y-4 md:space-y-6 animate-in slide-in-from-right duration-500">
           <div className="flex items-center gap-2 text-gray-500 font-medium mb-2 text-sm md:text-base">
                <EyeOff className="w-4 h-4 md:w-5 md:h-5" />
                PASSAGE HIDDEN
            </div>
          
          <div className="space-y-2">
             <label className="block text-base md:text-lg font-semibold text-gray-900">
               Reconstruct the passage in your own words:
             </label>
             <Textarea
               className="w-full min-h-[200px] p-4 md:p-6 rounded-xl border-gray-300 focus-visible:ring-indigo-500 text-base md:text-lg resize-none shadow-sm touch-manipulation"
               placeholder="Start typing here..."
               value={currentAnswer?.text || ''}
               onChange={(e) => onAnswer({ text: e.target.value })}
               autoFocus
             />
          </div>
          <p className="text-sm text-gray-400">
            Try to include as many key details as you remember.
          </p>
        </div>
      )}
    </div>
  );
});

export default PassageReconstructionQuestion;