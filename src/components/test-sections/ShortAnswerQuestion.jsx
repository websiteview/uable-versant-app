import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ShortAnswerQuestion = ({ question, onAnswer, currentAnswer }) => {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-center">
        <h3 className="text-xl font-medium text-blue-900">{question.question}</h3>
      </div>

      <div className="space-y-4">
        <Label htmlFor="short-answer" className="text-base">Your Answer</Label>
        <Input
          id="short-answer"
          placeholder="Type your answer here..."
          value={currentAnswer?.text || ''}
          onChange={(e) => onAnswer({ text: e.target.value })}
          className="text-lg p-6"
          autoComplete="off"
        />
        <p className="text-sm text-gray-500">Keep your answer short and precise.</p>
      </div>
    </div>
  );
};

export default ShortAnswerQuestion;