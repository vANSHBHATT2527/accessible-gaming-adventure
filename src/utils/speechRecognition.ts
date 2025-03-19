
// Speech recognition functionality
let recognition: any | null = null; // Using any temporarily since the global type isn't recognized
let listening = false;

const commands: Record<string, string[]> = {
  navigation: [
    'start', 'home', 'games', 'settings', 'exit', 'back', 'chess', 'memory'
  ],
  chess: [
    'move', 'pawn', 'knight', 'bishop', 'rook', 'queen', 'king', 
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
    '1', '2', '3', '4', '5', '6', '7', '8', 'to'
  ],
  memory: [
    'flip', 'card', 'one', 'two', 'three', 'four', 'five', 'six',
    'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'reset'
  ],
  settings: [
    'volume', 'up', 'down', 'vibration', 'on', 'off', 'voice', 'speed',
    'slow', 'normal', 'fast', 'save'
  ],
};

type CommandType = 'navigation' | 'chess' | 'memory' | 'settings';
type CommandCallback = (command: string) => void;

const commandListeners: Record<CommandType, CommandCallback[]> = {
  navigation: [],
  chess: [],
  memory: [],
  settings: [],
};

// Dispatch custom event with recognized speech
const dispatchSpeechEvent = (text: string) => {
  const event = new CustomEvent('speechRecognized', { 
    detail: { text }
  });
  window.dispatchEvent(event);
};

// Initialize speech recognition
export const initSpeechRecognition = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.error('Speech recognition not supported in this browser');
    return false;
  }
  
  try {
    // @ts-ignore - Using webkit version if standard is not available
    const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognitionApi();
    
    if (recognition) {
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        listening = true;
        console.log('Speech recognition started');
      };
      
      recognition.onend = () => {
        listening = false;
        console.log('Speech recognition ended');
        // Restart recognition after it ends, but make sure it's not already running
        if (recognition) {
          try {
            recognition.start();
            console.log('Restarting speech recognition');
          } catch (e) {
            console.error('Error restarting speech recognition:', e);
            // Wait a bit and try again
            setTimeout(() => {
              try {
                recognition.start();
              } catch (e) {
                console.error('Failed to restart speech recognition after delay:', e);
              }
            }, 1000);
          }
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        
        if (event.error === 'network') {
          // Network errors often happen in sandboxed environments, so don't stop listening
          console.log('Network error occurred, continuing...');
        } else if (event.error === 'no-speech') {
          console.log('No speech detected, continuing...');
        } else if (event.error === 'aborted') {
          console.log('Speech recognition aborted, restarting...');
          // Don't set listening to false, just restart
          setTimeout(() => {
            try {
              if (recognition) {
                recognition.start();
              }
            } catch (e) {
              console.error('Failed to restart after abort:', e);
            }
          }, 1000);
        } else {
          console.log(`Speech recognition error: ${event.error}, attempting to restart...`);
          listening = false;
          // Try restarting after a delay
          setTimeout(() => startListening(), 2000);
        }
      };
      
      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript.trim().toLowerCase();
          
          // Emit event with recognized speech
          dispatchSpeechEvent(transcript);
          
          // Only process final results
          if (result.isFinal) {
            console.log('Voice command recognized:', transcript);
            // Process the command
            processCommand(transcript);
          }
        }
      };
      
      return true;
    }
  } catch (error) {
    console.error('Error initializing speech recognition:', error);
  }
  
  return false;
};

// Start listening for voice commands
export const startListening = () => {
  if (recognition && !listening) {
    try {
      recognition.start();
      console.log('Starting speech recognition');
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }
  return false;
};

// Stop listening for voice commands
export const stopListening = () => {
  if (recognition && listening) {
    try {
      recognition.stop();
      listening = false;
      return true;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }
  return false;
};

// Check if speech recognition is currently listening
export const isListening = () => {
  return listening;
};

// Process a voice command
const processCommand = (transcript: string) => {
  // Check each command type for matches
  Object.entries(commands).forEach(([type, commandList]) => {
    const commandType = type as CommandType;
    
    // Check if any command in this type is in the transcript
    const matchedCommand = commandList.find(command => 
      transcript.includes(command.toLowerCase())
    );
    
    if (matchedCommand) {
      // Notify all listeners for this command type
      commandListeners[commandType].forEach(callback => {
        callback(transcript);
      });
    }
  });
};

// Register a command listener
export const addCommandListener = (type: CommandType, callback: CommandCallback) => {
  commandListeners[type].push(callback);
  
  // Return a function to remove this listener
  return () => {
    const index = commandListeners[type].indexOf(callback);
    if (index !== -1) {
      commandListeners[type].splice(index, 1);
    }
  };
};
