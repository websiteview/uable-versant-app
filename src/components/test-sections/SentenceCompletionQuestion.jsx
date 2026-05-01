import React, { useEffect, useState, memo } from 'react';
import { Input } from '@/components/ui/input';

const SentenceCompletionQuestion = memo(({ question, onAnswer, currentAnswer }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (currentAnswer?.text) {
      setText(currentAnswer.text);
    } else {
      setText('');
    }
  }, [question.id]); // Dependencies optimized: only reset when question ID changes

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    onAnswer({ text: val });
  };

  return (
    <div className="flex flex-col h-full justify-center items-center space-y-6 md:space-y-8 max-w-2xl mx-auto">
      <div className="w-full text-center space-y-4 md:space-y-6">
        <div className="bg-indigo-50 p-6 md:p-8 rounded-2xl border border-indigo-100 shadow-sm">
           <p className="text-xs md:text-sm text-indigo-500 uppercase tracking-wide font-bold mb-3 md:mb-4">Complete the Sentence</p>
           <h3 className="text-xl md:text-3xl font-medium text-gray-800 leading-relaxed">
              {question.sentence}
           </h3>
        </div>
        
        <p className="text-xs md:text-sm text-gray-400 italic">
          Type the missing word(s) to complete the sentence meaningfully.
        </p>
      </div>

      <div className="w-full max-w-md pt-2 md:pt-4">
        <Input 
          value={text}
          onChange={handleChange}
          placeholder="Type the missing word..."
          className="text-center text-lg md:text-xl h-14 md:h-16 border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm touch-manipulation"
          autoComplete="off"
          autoFocus
        />
      </div>
    </div>
  );
});

export default SentenceCompletionQuestion;