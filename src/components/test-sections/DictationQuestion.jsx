import React, { useState, useEffect, memo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { speakText, stopAudio, pauseAudio, resumeAudio } from '@/lib/audio';
import { computeProfessionalScore } from '@/lib/professional-scoring-engine';

const DictationQuestion = memo(({ question, onAnswer, currentAnswer }) => {
  const [status, setStatus] = useState('idle');
  const [playCount, setPlayCount] = useState(0);

  useEffect(() => {
    if (playCount === 0) {
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
    setPlayCount(p => p + 1);

    let idNum = 1;
    const matches = question.id.match(/\d+/);
    if (matches) idNum = parseInt(matches[0], 10);
    const persona = idNum % 2 === 0 ? 'miles' : 'maya';

    await speakText(question.sentence, 0.85, persona); 
    setStatus('completed');
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
    const engineResult = computeProfessionalScore(val, question.sentence, 0);
    onAnswer({ text: val, engineResult });
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-2xl mx-auto text-center">
      <div className="bg-indigo-50 p-6 md:p-8 rounded-2xl flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
           {status === 'playing' ? (
              <Button onClick={handlePause} size="icon" className="h-14 w-14 md:h-16 md:w-16 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 transition-transform active:scale-95">
                <Pause className="w-6 h-6 md:w-8 md:h-8 text-white fill-current" />
              </Button>
           ) : (
              <Button onClick={handlePlay} size="icon" className="h-14 w-14 md:h-16 md:w-16 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 transition-transform active:scale-95">
                <Play className="w-6 h-6 md:w-8 md:h-8 text-white fill-current ml-1" />
              </Button>
           )}
           
           <Button onClick={handleReplay} disabled={status === 'playing'} variant="outline" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50">
              <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
           </Button>
        </div>

        <p className="text-indigo-900 font-medium text-sm md:text-base">
          {status === 'playing' ? "Speaking..." : 
           status === 'paused' ? "Paused" : "Click to listen again"}
        </p>
      </div>

      <div className="space-y-3 text-left">
        <label className="text-gray-700 font-semibold text-base md:text-lg">Type exactly what you hear:</label>
        <Input
          value={currentAnswer?.text || ''}
          onChange={handleChange}
          className="p-4 md:p-6 text-base md:text-lg font-serif touch-manipulation"
          placeholder="Type sentence here..."
          autoComplete="off"
          onPaste={(e) => e.preventDefault()} 
        />
        <p className="text-xs text-gray-400 text-right">Pay attention to spelling and punctuation.</p>
      </div>
    </div>
  );
});

export default DictationQuestion;