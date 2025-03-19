
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, PlayCircle, Settings } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import GameButton from '@/components/ui/GameButton';
import { speak } from '@/utils/speechSynthesis';
import { initSpeechRecognition, startListening, addCommandListener } from '@/utils/speechRecognition';
import { triggerHaptics, loadVibrationSettings } from '@/utils/haptics';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Initialize speech recognition and synthesis
    const recognitionSupported = initSpeechRecognition();
    
    if (recognitionSupported) {
      startListening();
    } else {
      console.error('Speech recognition not supported');
    }
    
    // Load haptic settings
    loadVibrationSettings();
    
    // Handle navigation commands
    const handleNavigationCommand = (command: string) => {
      if (command.includes('start') || command.includes('play')) {
        // Navigate to games menu
        if (command.includes('chess')) {
          navigateToChess();
        } else if (command.includes('memory')) {
          navigateToMemory();
        } else {
          navigateToGames();
        }
      } else if (command.includes('settings')) {
        navigateToSettings();
      }
    };
    
    // Add listener for navigation commands
    const removeListener = addCommandListener('navigation', handleNavigationCommand);
    
    // Welcome message
    setTimeout(() => {
      speak('Welcome to Accessible Gaming. Say start or play to begin.');
    }, 500);
    
    return () => {
      removeListener();
    };
  }, []);
  
  const navigateToGames = () => {
    triggerHaptics();
    navigate('/games');
  };
  
  const navigateToChess = () => {
    triggerHaptics();
    navigate('/games/chess');
  };
  
  const navigateToMemory = () => {
    triggerHaptics();
    navigate('/games/memory');
  };
  
  const navigateToSettings = () => {
    triggerHaptics();
    navigate('/settings');
  };
  
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-10 animate-fade-in">
        <div className="glass-panel p-8 rounded-xl text-center max-w-md w-full">
          <div className="flex justify-center mb-6">
            <Volume2 className="h-16 w-16 text-primary animate-pulse-subtle" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Accessible Gaming</h1>
          <p className="text-lg mb-8 text-muted-foreground">
            Voice-controlled accessible games for everyone
          </p>
          
          <div className="flex flex-col space-y-4">
            <GameButton 
              onClick={navigateToGames}
              speakText="Start playing"
              className="w-full"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Start Games
            </GameButton>
            
            <GameButton
              onClick={navigateToSettings}
              variant="secondary"
              speakText="Settings"
              className="w-full"
            >
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </GameButton>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-xl max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Voice Commands</h2>
          <ul className="space-y-2 text-left">
            <li className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
              Say "<strong>Start</strong>" or "<strong>Play</strong>" to begin
            </li>
            <li className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
              Say "<strong>Chess</strong>" to play Chess
            </li>
            <li className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
              Say "<strong>Memory</strong>" to play Memory
            </li>
            <li className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
              Say "<strong>Settings</strong>" to adjust preferences
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
