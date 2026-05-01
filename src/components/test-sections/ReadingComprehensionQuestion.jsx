import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const ReadingComprehensionQuestion = ({ question, onAnswer, currentAnswer }) => {
  return (
    <div className="grid md:grid-cols-2 gap-8 h-full">
      {/* Reading Passage */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 overflow-y-auto max-h-[400px]">
        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Passage</h4>
        <p className="text-lg leading-relaxed text-gray-800 font-serif">
          {question.passage}
        </p>
      </div>

      {/* Question & Options */}
      <div className="flex flex-col justify-center space-y-6">
        <h3 className="text-xl font-semibold text-indigo-900">{question.question}</h3>
        
        <RadioGroup 
          value={currentAnswer?.selected || ''} 
          onValueChange={(val) => onAnswer({ selected: val })}
          className="space-y-3"
        >
          {question.options.map((option, idx) => (
            <div key={idx} className={`flex items-center space-x-3 border p-4 rounded-lg transition-colors ${currentAnswer?.selected === option ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <RadioGroupItem value={option} id={`rc-option-${idx}`} />
              <Label htmlFor={`rc-option-${idx}`} className="flex-grow cursor-pointer">{option}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};

export default ReadingComprehensionQuestion;