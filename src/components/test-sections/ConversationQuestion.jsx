import React, { useState, useEffect, memo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { speakText, stopAudio, pauseAudio, resumeAudio } from '@/lib/audio';
import { computeProfessionalScore } from '@/lib/professional-scoring-engine';

const ConversationQuestion = memo(({ question, onAnswer, currentAnswer }) => {
  const [status, setStatus] = useState('idle');
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (!hasPlayed) {
      handlePlay();
    }
    return () => stopAudio();
  }, [question.id]);

  const handlePlay = async () => {
    if (status === 'paused') {
      resumeAudio();
      setStatus('playing');
      return;
    }

    setStatus('playing');
    
    const textSource = question.audioText || question.text || "No conversation text available.";
    const lines = textSource.split(/(?=[AB]:)/g).map(s => s.trim()).filter(s => s);
    
    for (const line of lines) {
      let textToSpeak = line;
      let persona = 'maya'; 

      if (line.startsWith('A:')) {
        persona = 'miles'; 
        textToSpeak = line.replace('A:', '').trim();
      } else if (line.startsWith('B:')) {
        persona = 'maya'; 
        textToSpeak = line.replace('B:', '').trim();
      } else if (line.startsWith('Question:')) {
        persona = 'neutral'; 
        textToSpeak = line;
        await new Promise(r => setTimeout(r, 500)); 
      }

      await speakText(textToSpeak, 1.0, persona);
      await new Promise(r => setTimeout(r, 300)); 
    }
    
    setStatus('completed');
    setHasPlayed(true);
  };

  const handlePause = () => {
    pauseAudio();
    setStatus('paused');
  };

  const handleReplay = () => {
    stopAudio();
    handlePlay();
  };

  const handleChange = (e) => {
    const val = e.target.value;
    const keywords = question.correctAnswer || question.keywords || "";
    const engineResult = computeProfessionalScore(val, keywords, 0);
    onAnswer({ text: val, engineResult });
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-2xl mx-auto text-center">
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          {status === 'playing' ? (
             <Button onClick={handlePause} variant="outline" className="h-14 w-14 md:h-16 md:w-16 rounded-full border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 transition-colors">
               <Pause className="w-6 h-6 md:w-8 md:h-8 fill-current" />
             </Button>
          ) : (
             <Button onClick={handlePlay} variant="outline" className="h-14 w-14 md:h-16 md:w-16 rounded-full border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 transition-colors">
               <Play className="w-6 h-6 md:w-8 md:h-8 fill-current ml-1" />
             </Button>
          )}
          
          <Button onClick={handleReplay} disabled={status === 'playing'} variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-full text-gray-400 hover:text-indigo-600">
            <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
        </div>

        <p className="text-gray-600 font-medium text-sm md:text-base">
          {status === 'playing' ? "Listening to conversation..." : 
           status === 'paused' ? "Audio Paused" : "Click to replay audio"}
        </p>
      </div>

      <div className="space-y-3 md:space-y-4 text-left animate-in fade-in slide-in-from-bottom-4 duration-500" style={{opacity: hasPlayed ? 1 : 0.5}}>
        <label className="block text-base md:text-lg font-semibold text-gray-900">
          Answer the question:
        </label>
        <Input
          placeholder="Type your answer here..."
          value={currentAnswer?.text || ''}
          onChange={handleChange}
          className="text-base md:text-lg p-4 md:p-6 touch-manipulation"
          autoComplete="off"
        />
      </div>
    </div>
  );
});

export default ConversationQuestion;