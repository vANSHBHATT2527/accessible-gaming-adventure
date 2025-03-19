
// Speech recognition functionality
let recognition: SpeechRecognition | null = null;
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

// Initialize speech recognition
export const initSpeechRecognition = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.error('Speech recognition not supported in this browser');
    return false;
  }
  
  try {
    // @ts-ignore - Using webkit version if standard is not available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    if (recognition) {
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        listening = true;
      };
      
      recognition.onend = () => {
        listening = false;
        // Restart recognition after it ends
        if (recognition) {
          recognition.start();
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        listening = false;
      };
      
      recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript.trim().toLowerCase();
        
        console.log('Voice command recognized:', transcript);
        
        // Process the command
        processCommand(transcript);
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
