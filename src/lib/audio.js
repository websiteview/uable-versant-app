// Utility to handle Text-to-Speech with distinct Male/Female personas
// Optimized for Mobile (iOS/Android) support

let voicesLoaded = false;
let availableVoices = [];

// Keep reference to active utterance to prevent garbage collection on some browsers
let currentUtterance = null;

const initVoices = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve([]);
      return;
    }

    const checkVoices = () => {
      availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        voicesLoaded = true;
        resolve(availableVoices);
      }
    };

    checkVoices();

    // Chrome/Android loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = checkVoices;
    }
    
    // Fallback for some mobile browsers that don't fire onvoiceschanged immediately
    setTimeout(checkVoices, 500);
    setTimeout(checkVoices, 1000);
    setTimeout(checkVoices, 3000);
  });
};

// Helper to get specific gender-sounding voices if available
const getVoiceByPersona = (persona = 'neutral') => {
  if (!voicesLoaded || availableVoices.length === 0) return null;

  const lowerPersona = persona.toLowerCase();
  
  // "Miles" equivalent (Male)
  if (lowerPersona === 'male' || lowerPersona === 'miles') {
    return (
      // iOS / Mac specific high quality voices
      availableVoices.find(v => v.name === 'Daniel') || 
      availableVoices.find(v => v.name === 'Fred') ||
      availableVoices.find(v => v.name === 'Rishi') ||
      availableVoices.find(v => v.name === 'Arthur') ||
      availableVoices.find(v => v.name === 'Evan') ||
      availableVoices.find(v => v.name === 'Nathan') ||
      // Android / Chrome (Looking for "Male" or specific Google names)
      availableVoices.find(v => v.name.includes('Google US English') && !v.name.includes('Female')) ||
      availableVoices.find(v => v.name.includes('David') && v.lang.includes('en-US')) || 
      // Generic fallback looking for "Male"
      availableVoices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('male')) ||
      // Fallback to any US voice if strict male not found, aiming to avoid known females
      availableVoices.find(v => v.lang === 'en-US' && !v.name.toLowerCase().includes('female') && !v.name.toLowerCase().includes('samantha') && !v.name.toLowerCase().includes('victoria'))
    );
  }

  // "Maya" equivalent (Female)
  if (lowerPersona === 'female' || lowerPersona === 'maya') {
    return (
      // iOS / Mac specific high quality voices
      availableVoices.find(v => v.name === 'Samantha') || 
      availableVoices.find(v => v.name === 'Karen') ||
      availableVoices.find(v => v.name === 'Tessa') ||
      availableVoices.find(v => v.name === 'Moira') ||
      availableVoices.find(v => v.name === 'Nicky') ||
      availableVoices.find(v => v.name === 'Zoe') ||
      // Android / Chrome
      availableVoices.find(v => v.name.includes('Google US English') && v.name.includes('Female')) ||
      availableVoices.find(v => v.name.includes('Zira') && v.lang.includes('en-US')) || 
      // Generic fallback
      availableVoices.find(v => v.name.toLowerCase().includes('female')) ||
      availableVoices.find(v => v.lang === 'en-US' && (v.name.includes('Victoria') || v.name.includes('Samantha')))
    );
  }

  // Fallback / Neutral
  return (
    availableVoices.find(v => v.name === 'Google US English') ||
    availableVoices.find(v => v.lang === 'en-US') ||
    availableVoices[0]
  );
};

export const speakText = async (text, rate = 0.9, persona = 'neutral') => {
  if (!window.speechSynthesis) {
    console.error("Speech synthesis not supported");
    return;
  }

  if (!voicesLoaded) {
    await initVoices();
  }

  return new Promise((resolve) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.lang = 'en-US';

    // Try to force voice selection again to be sure
    const preferredVoice = getVoiceByPersona(persona);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Critical: Keep reference to prevent GC
    currentUtterance = utterance;

    utterance.onend = () => {
      currentUtterance = null;
      resolve();
    };
    
    utterance.onerror = (e) => {
      console.warn("Speech error:", e);
      currentUtterance = null;
      resolve(); 
    };

    // Mobile Safari quirk: sometimes needs a slight delay or resume
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
  });
};

export const pauseAudio = () => {
  if (window.speechSynthesis) window.speechSynthesis.pause();
};

export const resumeAudio = () => {
  if (window.speechSynthesis) window.speechSynthesis.resume();
};

export const stopAudio = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
};

// Initialize immediately to preload voices
if (typeof window !== 'undefined' && window.speechSynthesis) {
  initVoices();
}