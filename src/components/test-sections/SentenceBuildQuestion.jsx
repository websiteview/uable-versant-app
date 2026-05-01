import React, { useState, useEffect, useRef, memo } from 'react';
import { Mic, Play, Pause, RotateCcw, Square, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { speakText, stopAudio, pauseAudio, resumeAudio } from '@/lib/audio';

const SentenceBuildQuestion = memo(({ question, onAnswer, currentAnswer }) => {
  const [status, setStatus] = useState('idle'); 
  const [hasPlayed, setHasPlayed] = useState(false);
  const [micError, setMicError] = useState('');
  const isMounted = useRef(true);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const recordingStartTime = useRef(0);

  useEffect(() => {
    isMounted.current = true;
    return () => { 
      isMounted.current = false;
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
        playSequence();
      }, 800);
    }
    return () => clearTimeout(timer);
  }, [question.id]);

  const playSequence = async () => {
    if (status === 'paused') {
      resumeAudio();
      setStatus('playing');
      return;
    }

    setStatus('playing');
    stopAudio(); 
    
    let idNum = 1;
    const matches = question.id.match(/\d+/);
    if (matches) idNum = parseInt(matches[0], 10);
    const persona = idNum % 2 === 0 ? 'miles' : 'maya'; 

    for (const part of question.parts) {
        if (!isMounted.current) break;
        if (status === 'recording') break;
        
        await speakText(part, 0.9, persona);
        if (!isMounted.current) break;
        await new Promise(r => setTimeout(r, 500)); 
    }
    
    if (isMounted.current && status !== 'recording') {
      setStatus('waiting');
      setHasPlayed(true);
    }
  };

  const handlePause = () => {
    pauseAudio();
    setStatus('paused');
  };

  const handleReplay = () => {
    stopAudio();
    playSequence();
  };

  const startRecording = async () => {
    try {
      setMicError('');
      // Task 1: Safari/iOS fallback constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });
      
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const duration = (Date.now() - recordingStartTime.current) / 1000;
        
        // Task 2: Store minimal answer object
        onAnswer({ 
          recorded: true, 
          duration: duration > 0 ? duration : 1,
          transcript: '' 
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
      // Task 2: Ensure recorder.stop() resolves with timeout fallback
      let stopHandled = false;
      
      const fallbackTimer = setTimeout(() => {
        if (!stopHandled) {
           const duration = (Date.now() - recordingStartTime.current) / 1000;
           onAnswer({ recorded: true, duration: duration, transcript: '' });
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
    
    if (status === 'recording') {
      stopRecording();
    } else {
      stopAudio();
      startRecording();
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

      <div className="text-center">
         <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">Rearrange the words you hear</h3>
         <div className="h-6">
           {status === 'playing' && <p className="text-indigo-600 animate-pulse text-xs md:text-sm font-medium">Listening to word groups...</p>}
           {status === 'paused' && <p className="text-amber-600 text-xs md:text-sm font-medium">Audio Paused</p>}
         </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm border border-gray-200">
         {status === 'playing' ? (
          <Button onClick={handlePause} variant="outline" size="icon" className="rounded-full w-10 h-10 md:w-12 md:h-12 border-2 border-indigo-100 text-indigo-600">
            <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current" />
          </Button>
        ) : (
          <Button onClick={playSequence} disabled={status === 'recording'} variant="outline" size="icon" className="rounded-full w-10 h-10 md:w-12 md:h-12 border-2 border-indigo-100 text-indigo-600">
            <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-0.5" />
          </Button>
        )}
        <Button onClick={handleReplay} disabled={status === 'playing' || status === 'recording'} variant="ghost" size="icon" className="rounded-full w-8 h-8 md:w-10 md:h-10 text-gray-500 hover:text-indigo-600">
          <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
      </div>

      <div className="bg-indigo-50 p-6 md:p-8 rounded-full mt-2 md:mt-4">
          <Button
            onClick={toggleRecording}
            size="lg"
            variant={status === 'recording' ? "destructive" : "default"}
            className={`rounded-full w-20 h-20 md:w-24 md:h-24 transition-transform active:scale-95 ${status === 'recording' ? 'animate-pulse' : ''}`}
            disabled={status === 'playing'}
          >
            {status === 'recording' ? <Square className="w-8 h-8 md:w-10 md:h-10 fill-current" /> : <Mic className="w-8 h-8 md:w-10 md:h-10" />}
          </Button>
      </div>
      
       <p className="text-gray-500 font-medium text-sm md:text-base">
        {status === 'idle' || status === 'playing' ? "Listen to the word groups..." : 
         status === 'recording' ? "Speak the complete sentence..." : 
         status === 'completed' ? "Response recorded" : "Press mic to speak"}
      </p>
    </div>
  );
});

export default SentenceBuildQuestion;