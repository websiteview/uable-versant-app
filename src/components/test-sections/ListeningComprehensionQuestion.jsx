import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const ListeningComprehensionQuestion = ({ question, onAnswer, currentAnswer }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const playStory = () => {
    setIsPlaying(true);
    // Simulate reading the story (approx 5s)
    setTimeout(() => setIsPlaying(false), 5000); 
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-50 p-8 rounded-xl text-center space-y-4">
        <div className="inline-block p-4 bg-white rounded-full shadow-sm">
          <Button onClick={playStory} disabled={isPlaying} variant="ghost" size="icon" className="h-12 w-12">
            <Play className={`w-8 h-8 ${isPlaying ? 'text-indigo-600' : 'text-gray-700'}`} fill={isPlaying ? "currentColor" : "none"} />
          </Button>
        </div>
        <p className="font-medium text-gray-700">
          {isPlaying ? "Listening to story..." : "Click play to listen to the story"}
        </p>
        {/* For demo purposes, we show text if needed, but usually hidden in test */}
        <p className="text-xs text-gray-400 mt-2 italic max-w-md mx-auto">
          (Transcript for testing: {question.story})
        </p>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-900">{question.question}</h3>
        
        <RadioGroup 
          value={currentAnswer?.selected || ''} 
          onValueChange={(val) => onAnswer({ selected: val })}
          className="space-y-3"
        >
          {question.options.map((option, idx) => (
            <div key={idx} className={`flex items-center space-x-3 border p-4 rounded-lg transition-colors ${currentAnswer?.selected === option ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <RadioGroupItem value={option} id={`option-${idx}`} />
              <Label htmlFor={`option-${idx}`} className="flex-grow cursor-pointer">{option}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};

export default ListeningComprehensionQuestion;