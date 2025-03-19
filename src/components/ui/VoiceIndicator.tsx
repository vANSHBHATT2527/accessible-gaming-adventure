
import React, { useEffect, useState } from 'react';
import { Mic } from 'lucide-react';
import { isListening } from '@/utils/speechRecognition';

const VoiceIndicator: React.FC = () => {
  const [listening, setListening] = useState(false);
  
  useEffect(() => {
    const checkListeningStatus = () => {
      setListening(isListening());
    };
    
    // Check initially
    checkListeningStatus();
    
    // Set up an interval to check the listening status
    const interval = setInterval(checkListeningStatus, 100);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  return (
    <div className="flex items-center space-x-2" aria-live="polite">
      <Mic className={`h-5 w-5 ${listening ? 'text-primary animate-pulse-subtle' : 'text-muted-foreground'}`} />
      {listening && (
        <div className="voice-indicator flex space-x-1">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse delay-100"></span>
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse delay-200"></span>
        </div>
      )}
      <span className="sr-only">{listening ? 'Voice recognition active' : 'Voice recognition inactive'}</span>
    </div>
  );
};

export default VoiceIndicator;
