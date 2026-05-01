import React from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ReadAloudQuestion = ({ question, onAnswer, currentAnswer }) => {
  const [isRecording, setIsRecording] = React.useState(false);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate recording start
    } else {
      setIsRecording(false);
      // Simulate recording end
      onAnswer({ recorded: true, duration: 5 }); 
    }
  };

  return (
    <div className="space-y-8 flex flex-col items-center justify-center h-full">
      <div className="text-2xl md:text-3xl font-serif text-center leading-relaxed text-gray-800 max-w-2xl">
        "{question.text}"
      </div>

      <div className="mt-8">
        <Button
          onClick={toggleRecording}
          size="lg"
          variant={isRecording ? "destructive" : (currentAnswer?.recorded ? "outline" : "default")}
          className={`rounded-full w-20 h-20 flex flex-col items-center justify-center gap-2 transition-all ${isRecording ? 'animate-pulse' : ''}`}
        >
          <Mic className={`w-8 h-8 ${currentAnswer?.recorded && !isRecording ? 'text-green-600' : ''}`} />
        </Button>
        <p className="text-center mt-3 text-sm text-gray-500 font-medium">
          {isRecording ? "Recording..." : (currentAnswer?.recorded ? "Recorded" : "Click to Record")}
        </p>
      </div>
    </div>
  );
};

export default ReadAloudQuestion;