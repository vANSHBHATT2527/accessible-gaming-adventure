
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import GameButton from '@/components/ui/GameButton';
import { speak } from '@/utils/speechSynthesis';
import { addCommandListener } from '@/utils/speechRecognition';
import { triggerHaptics } from '@/utils/haptics';

const Games = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Handle navigation commands
    const handleGameCommand = (command: string) => {
      if (command.includes('chess')) {
        navigateToChess();
      } else if (command.includes('memory')) {
        navigateToMemory();
      } else if (command.includes('back') || command.includes('home')) {
        navigateHome();
      }
    };
    
    // Add listener for game navigation commands
    const removeListener = addCommandListener('navigation', handleGameCommand);
    
    return () => {
      removeListener();
    };
  }, []);
  
  const navigateToChess = () => {
    triggerHaptics();
    navigate('/games/chess');
  };
  
  const navigateToMemory = () => {
    triggerHaptics();
    navigate('/games/memory');
  };
  
  const navigateHome = () => {
    triggerHaptics();
    navigate('/');
  };
  
  return (
    <Layout>
      <div className="flex flex-col items-center min-h-[70vh] animate-fade-in">
        <div className="glass-panel p-8 rounded-xl text-center max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6">Choose a Game</h1>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col glass-panel p-6 rounded-xl hover:bg-secondary/90 transition-colors">
              <div className="text-4xl mb-3">♟</div>
              <h2 className="text-xl font-semibold mb-2">Chess</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Voice-controlled chess game with accessible board
              </p>
              <GameButton 
                onClick={navigateToChess}
                speakText="Play Chess"
                className="mt-auto"
              >
                Play Chess
              </GameButton>
            </div>
            
            <div className="flex flex-col glass-panel p-6 rounded-xl hover:bg-secondary/90 transition-colors">
              <div className="text-4xl mb-3">🃏</div>
              <h2 className="text-xl font-semibold mb-2">Memory</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Matching card game with voice commands
              </p>
              <GameButton 
                onClick={navigateToMemory}
                speakText="Play Memory"
                className="mt-auto"
              >
                Play Memory
              </GameButton>
            </div>
          </div>
          
          <button
            onClick={navigateHome}
            className="mt-8 inline-flex items-center text-primary hover:underline focus-ring rounded-md px-2 py-1"
            aria-label="Back to home"
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
        </div>
        
        <div className="glass-panel p-6 rounded-xl max-w-md w-full mt-6">
          <h2 className="text-xl font-bold mb-4">Voice Commands</h2>
          <ul className="space-y-2 text-left">
            <li className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
              Say "<strong>Chess</strong>" to play chess
            </li>
            <li className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
              Say "<strong>Memory</strong>" to play memory card game
            </li>
            <li className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
              Say "<strong>Home</strong>" or "<strong>Back</strong>" to return to home
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Games;
