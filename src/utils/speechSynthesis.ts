
// Speech synthesis functionality
let speechRate = 1; // Default speech rate

// Initialize speech synthesis
export const initSpeechSynthesis = () => {
  if ('speechSynthesis' in window) {
    return true;
  }
  console.error('Speech synthesis not supported in this browser');
  return false;
};

// Speak text aloud
export const speak = (text: string, immediate = false) => {
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis not supported');
    return false;
  }
  
  // If immediate is true, cancel any ongoing speech
  if (immediate) {
    window.speechSynthesis.cancel();
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = speechRate;
  
  window.speechSynthesis.speak(utterance);
  return true;
};

// Set speech rate
export const setSpeechRate = (rate: number) => {
  if (rate >= 0.5 && rate <= 2) {
    speechRate = rate;
    return true;
  }
  return false;
};

// Get available voices
export const getVoices = (): SpeechSynthesisVoice[] => {
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis not supported');
    return [];
  }
  
  return window.speechSynthesis.getVoices();
};

// Set voice by name or by index
export const setVoice = (voiceNameOrIndex: string | number) => {
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis not supported');
    return false;
  }
  
  const voices = window.speechSynthesis.getVoices();
  
  if (voices.length === 0) {
    console.error('No voices available');
    return false;
  }
  
  if (typeof voiceNameOrIndex === 'number' && voiceNameOrIndex >= 0 && voiceNameOrIndex < voices.length) {
    // Store voice index in localStorage
    localStorage.setItem('selectedVoiceIndex', voiceNameOrIndex.toString());
    return true;
  } else if (typeof voiceNameOrIndex === 'string') {
    const voiceIndex = voices.findIndex(voice => 
      voice.name.toLowerCase().includes(voiceNameOrIndex.toLowerCase())
    );
    
    if (voiceIndex !== -1) {
      localStorage.setItem('selectedVoiceIndex', voiceIndex.toString());
      return true;
    }
  }
  
  return false;
};

// Get the current speech rate
export const getSpeechRate = () => {
  return speechRate;
};
