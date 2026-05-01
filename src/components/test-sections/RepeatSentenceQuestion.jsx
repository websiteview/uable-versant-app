import React, { useState, useEffect, useRef, memo } from 'react';
import { Mic, Play, Pause, RotateCcw, Square, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { speakText, stopAudio, pauseAudio, resumeAudio } from '@/lib/audio';
import { computeProfessionalScore } from '@/lib/professional-scoring-engine';

const RepeatSentenceQuestion = memo(({ question, onAnswer, currentAnswer }) => {
  const [status, setStatus] = useState('idle'); 
  const [hasPlayed, setHasPlayed] = useState(false);
  const [micError, setMicError] = useState('');
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const recordingStartTime = useRef(0);

  useEffect(() => {
    return () => {
      stopAudio();
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        mediaRecorder.current.stop();
      }
    };
  }, [question.id]);

  useEffect(() => {
    let timer;
    if (!hasPlayed && status === 'idle') {
      timer = setTimeout(() => {
        handlePlay();
      }, 800);
    }
    return () => clearTimeout(timer);
  }, [question.id]);

  const handlePlay = async () => {
    if (status === 'paused') {
      resumeAudio();
      setStatus('playing');
    } else {
      setStatus('playing');
      
      let idNum = 1;
      const matches = question.id.match(/\d+/);
      if (matches) idNum = parseInt(matches[0], 10);
      const persona = idNum % 2 === 0 ? 'miles' : 'maya';
      
      await speakText(question.sentence, 1.0, persona);
      setStatus('waiting');
      setHasPlayed(true);
    }
  };

  const handlePause = () => {
    pauseAudio();
    setStatus('paused');
  };

  const handleReplay = async () => {
    stopAudio();
    handlePlay();
  };

  const startRecording = async () => {
    try {
      setMicError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });
      
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const duration = (Date.now() - recordingStartTime.current) / 1000;
        const fallbackTranscript = ""; // Assuming text extraction would normally happen here
        const engineResult = computeProfessionalScore(fallbackTranscript, question.sentence, duration);

        onAnswer({ 
          recorded: true, 
          duration: duration > 0 ? duration : 1, 
          transcript: fallbackTranscript,
          engineResult
        });
        
        stream.getTracks().forEach(track => track.stop());
      };

      recordingStartTime.current = Date.now();
      mediaRecorder.current.start();
      setStatus('recording');

    } catch (err) {
      console.error("Mic access denied or error:", err);
      setMicError('Microphone access denied. Please enable it in browser settings.');
      setStatus('completed');
      onAnswer({ recorded: false, duration: 0, transcript: '' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      let stopHandled = false;
      
      const fallbackTimer = setTimeout(() => {
        if (!stopHandled) {
           const duration = (Date.now() - recordingStartTime.current) / 1000;
           const fallbackTranscript = "";
           const engineResult = computeProfessionalScore(fallbackTranscript, question.sentence, duration);
           onAnswer({ recorded: true, duration: duration, transcript: fallbackTranscript, engineResult });
           setStatus('completed');
        }
      }, 1000);

      const originalOnStop = mediaRecorder.current.onstop;
      mediaRecorder.current.onstop = (e) => {
        stopHandled = true;
        clearTimeout(fallbackTimer);
        if(originalOnStop) originalOnStop(e);
        setStatus('completed');
      };

      mediaRecorder.current.stop();
    } else {
      setStatus('completed');
      onAnswer({ recorded: true, duration: 5, transcript: '' });
    }
  };

  const toggleRecording = () => {
    if (status === 'playing') return;
    
    if (status === 'waiting' || status === 'completed' || status === 'idle' || status === 'paused') {
      stopAudio();
      startRecording();
    } else if (status === 'recording') {
      stopRecording();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 md:space-y-8">
      {micError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center text-sm w-full max-w-md">
          <AlertCircle className="w-4 h-4 mr-2" />
          {micError}
        </div>
      )}

      <div className="text-center space-y-2">
         <h3 className="text-lg md:text-xl font-semibold text-gray-800">Listen to the sentence</h3>
         <div className="h-6">
           {status === 'playing' && <p className="text-indigo-600 animate-pulse font-medium text-xs md:text-sm">Playing Audio...</p>}
           {status === 'paused' && <p className="text-amber-600 font-medium text-xs md:text-sm">Audio Paused</p>}
         </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm border border-gray-200">
        {status === 'playing' ? (
          <Button onClick={handlePause} variant="outline" size="icon" className="rounded-full w-10 h-10 md:w-12 md:h-12 border-2 border-indigo-100 text-indigo-600">
            <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current" />
          </Button>
        ) : (
          <Button onClick={handlePlay} disabled={status === 'recording'} variant="outline" size="icon" className="rounded-full w-10 h-10 md:w-12 md:h-12 border-2 border-indigo-100 text-indigo-600">
            <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-0.5" />
          </Button>
        )}
        
        <Button onClick={handleReplay} disabled={status === 'playing' || status === 'recording'} variant="ghost" size="icon" className="rounded-full w-8 h-8 md:w-10 md:h-10 text-gray-500 hover:text-indigo-600">
          <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
      </div>

      <div className="bg-gray-50 p-6 md:p-8 rounded-full transition-all duration-300 mt-2 md:mt-4">
        <Button
          onClick={toggleRecording}
          size="lg"
          variant={status === 'recording' ? "destructive" : "default"}
          className={`rounded-full w-20 h-20 md:w-24 md:h-24 shadow-xl transition-all transform active:scale-95 ${status === 'recording' ? 'animate-pulse ring-4 ring-red-200' : ''}`}
          disabled={status === 'playing'}
        >
          {status === 'recording' ? <Square className="w-8 h-8 md:w-10 md:h-10 fill-current" /> : <Mic className="w-8 h-8 md:w-10 md:h-10" />}
        </Button>
      </div>

      <p className="text-gray-500 font-medium text-base md:text-lg">
        {status === 'idle' && "Preparing audio..."}
        {status === 'playing' && "Listen carefully..."}
        {status === 'waiting' && "Click microphone to repeat"}
        {status === 'recording' && "Recording... Click to stop"}
        {status === 'completed' && "Response saved"}
      </p>
    </div>
  );
});

export default RepeatSentenceQuestion;