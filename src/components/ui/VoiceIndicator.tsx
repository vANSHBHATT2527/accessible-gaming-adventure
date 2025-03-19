import React, { useEffect, useState } from 'react';
import { Mic } from 'lucide-react';
import { isListening } from '@/utils/speechRecognition';

interface RecognizedText {
  text: string;
  timestamp: number;
}

const VoiceIndicator: React.FC = () => {
  const [listening, setListening] = useState(false);
  const [recognizedTexts, setRecognizedTexts] = useState<RecognizedText[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  
  // Subscribe to the window event for recognized speech
  useEffect(() => {
    const handleRecognizedSpeech = (event: CustomEvent) => {
      const text = event.detail?.text || '';
      if (text) {
        setRecognizedTexts(prev => {
          // Keep only the last 3 recognized texts
          const newTexts = [...prev, { text, timestamp: Date.now() }];
          if (newTexts.length > 3) {
            return newTexts.slice(newTexts.length - 3);
          }
          return newTexts;
        });
      }
    };

    // Add event listener for recognized speech
    window.addEventListener('speechRecognized' as any, handleRecognizedSpeech as EventListener);
    
    return () => {
      window.removeEventListener('speechRecognized' as any, handleRecognizedSpeech as EventListener);
    };
  }, []);
  
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

  // Clear old recognized texts after 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRecognizedTexts(prev => 
        prev.filter(text => now - text.timestamp < 5000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative">
      <div 
        className="flex items-center space-x-2 cursor-pointer" 
        aria-live="polite"
        onClick={() => setShowDebug(prev => !prev)}
      >
        <Mic className={`h-5 w-5 ${listening ? 'text-primary animate-pulse-subtle' : 'text-muted-foreground'}`} />
        {listening ? (
          <div className="voice-indicator flex space-x-1">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse delay-100"></span>
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse delay-200"></span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Microphone inactive</span>
        )}
        <span className="sr-only">{listening ? 'Voice recognition active' : 'Voice recognition inactive'}</span>
      </div>

      {showDebug && (
        <div className="absolute top-full right-0 mt-2 p-3 bg-secondary/90 backdrop-blur-sm rounded-md shadow-lg z-50 w-64">
          <p className="text-xs font-semibold mb-2">Speech Recognition Debug:</p>
          <div className="text-xs space-y-1">
            <p className="font-medium">Status: <span className={listening ? 'text-green-400' : 'text-red-400'}>
              {listening ? 'Active' : 'Inactive'}
            </span></p>
            <div>
              <p className="font-medium mb-1">Last recognized text:</p>
              {recognizedTexts.length > 0 ? (
                <ul className="space-y-1">
                  {recognizedTexts.map((item, index) => (
                    <li key={index} className="bg-background/50 p-1 rounded text-[10px] truncate">
                      "{item.text}"
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground italic text-[10px]">No speech detected yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceIndicator;
