
import React, { useState, useEffect } from 'react';
import { speak } from '@/utils/speechSynthesis';
import { addCommandListener } from '@/utils/speechRecognition';
import { triggerHaptics } from '@/utils/haptics';
import GameButton from '@/components/ui/GameButton';

// Define card types
type CardType = {
  id: number;
  value: string;
  description: string; // Add description property
  flipped: boolean;
  matched: boolean;
};

// Define card values with accessible descriptions
const cardValues = [
  { value: '🌟', description: 'star' },
  { value: '🌙', description: 'moon' },
  { value: '🌈', description: 'rainbow' },
  { value: '🌺', description: 'flower' },
  { value: '🍎', description: 'apple' },
  { value: '🐢', description: 'turtle' },
];

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  
  // Initialize the game
  useEffect(() => {
    if (!gameStarted) {
      initializeGame();
    }
  }, [gameStarted]);
  
  // Process voice commands for memory game
  useEffect(() => {
    const handleMemoryCommand = (command: string) => {
      // Handle "flip card X" command
      if (command.includes('flip') || command.includes('card')) {
        const words = command.toLowerCase().split(' ');
        
        // Try to extract a number from the command
        let cardNumber = -1;
        
        // Check for number words
        const numberWords = ['one', 'two', 'three', 'four', 'five', 'six', 
                             'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
        
        for (const word of words) {
          const index = numberWords.indexOf(word);
          if (index !== -1) {
            cardNumber = index + 1;
            break;
          }
          
          // Check for numeric digits
          const numericValue = parseInt(word);
          if (!isNaN(numericValue) && numericValue > 0 && numericValue <= cards.length) {
            cardNumber = numericValue;
            break;
          }
        }
        
        if (cardNumber > 0 && cardNumber <= cards.length) {
          // Flip the card (subtract 1 because array is 0-indexed)
          handleCardFlip(cardNumber - 1);
        } else {
          speak('Please specify a valid card number.');
        }
      }
      
      // Handle reset command
      if (command.includes('reset') || command.includes('new game')) {
        resetGame();
      }
    };
    
    // Add listener for memory game commands
    const removeListener = addCommandListener('memory', handleMemoryCommand);
    
    return () => {
      removeListener();
    };
  }, [cards]);
  
  // Initialize a new game
  const initializeGame = () => {
    // Create pairs of cards
    const cardPairs = [...cardValues, ...cardValues].map((card, index) => ({
      id: index,
      value: card.value,
      description: card.description,
      flipped: false,
      matched: false,
    }));
    
    // Shuffle the cards
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }
    
    setCards(cardPairs);
    setFlippedIndices([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameStarted(true);
    
    speak('Memory game started. Flip cards by saying "flip card 1" or by touching them.');
  };
  
  // Handle flipping a card
  const handleCardFlip = (index: number) => {
    // Ignore if the card is already flipped or matched
    if (cards[index].flipped || cards[index].matched) {
      speak('Card already flipped or matched.');
      return;
    }
    
    // Don't allow more than 2 cards to be flipped at once
    if (flippedIndices.length >= 2) {
      return;
    }
    
    triggerHaptics();
    
    // Announce the card
    speak(`Card ${index + 1}: ${cards[index].description}`);
    
    // Create a new array of cards with this one flipped
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], flipped: true };
    setCards(newCards);
    
    // Add this card to flipped indices
    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);
    
    // If we've flipped 2 cards, check for a match
    if (newFlippedIndices.length === 2) {
      setMoves(moves + 1);
      
      const [firstIndex, secondIndex] = newFlippedIndices;
      
      // Check if the cards match
      if (cards[firstIndex].value === cards[secondIndex].value) {
        // Cards match! Mark them as matched
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIndex] = { ...matchedCards[firstIndex], matched: true };
          matchedCards[secondIndex] = { ...matchedCards[secondIndex], matched: true };
          setCards(matchedCards);
          setFlippedIndices([]);
          setMatchedPairs(matchedPairs + 1);
          
          speak('Match found!');
          triggerHaptics(100);
          
          // Check if the game is completed
          if (matchedPairs + 1 === cardValues.length) {
            setTimeout(() => {
              speak(`Congratulations! You completed the game in ${moves + 1} moves.`);
            }, 1000);
          }
        }, 1000);
      } else {
        // Cards don't match, flip them back
        setTimeout(() => {
          const unmatchedCards = [...cards];
          unmatchedCards[firstIndex] = { ...unmatchedCards[firstIndex], flipped: false };
          unmatchedCards[secondIndex] = { ...unmatchedCards[secondIndex], flipped: false };
          setCards(unmatchedCards);
          setFlippedIndices([]);
          
          speak('No match.');
        }, 1500);
      }
    }
  };
  
  // Reset the game
  const resetGame = () => {
    setGameStarted(false);
    speak('Game reset.');
    triggerHaptics(100);
  };
  
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="glass-panel p-6 rounded-xl w-full max-w-md lg:max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Memory Game</h1>
        
        <div className="mb-4 text-left">
          <p className="text-primary mb-2">
            Pairs Found: <span className="font-semibold">{matchedPairs} of {cardValues.length}</span>
          </p>
          <p className="text-sm text-muted-foreground">Moves: {moves}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {cards.map((card, index) => (
            <button
              key={card.id}
              className={`
                aspect-square flex items-center justify-center text-2xl rounded-lg transition-all duration-300 focus-ring
                ${card.flipped || card.matched ? 'bg-accent rotate-y-180' : 'bg-secondary'}
                ${card.matched ? 'opacity-70' : 'opacity-100'}
              `}
              onClick={() => handleCardFlip(index)}
              disabled={card.flipped || card.matched}
              aria-label={`Card ${index + 1}${card.flipped || card.matched ? ': ' + card.description : ''}`}
            >
              {card.flipped || card.matched ? (
                <span className="text-3xl">{card.value}</span>
              ) : (
                <span className="text-xl font-bold">{index + 1}</span>
              )}
            </button>
          ))}
        </div>
        
        <div className="mt-6 flex justify-between">
          <GameButton onClick={resetGame} speakText="Reset game" variant="secondary">
            Reset Game
          </GameButton>
          
          <GameButton
            onClick={() => speak('Say "flip card 1" or "flip card two" to turn over a card.')}
            speakText="Voice command help"
          >
            Voice Help
          </GameButton>
        </div>
      </div>
      
      <div className="glass-panel p-6 rounded-xl w-full max-w-md lg:max-w-lg">
        <h2 className="text-xl font-bold mb-4">Voice Commands</h2>
        <ul className="list-disc list-inside text-left space-y-2">
          <li>Say "<strong>flip card 3</strong>" to turn over card number 3</li>
          <li>You can also say "<strong>card five</strong>" to flip card 5</li>
          <li>Say "<strong>reset</strong>" or "<strong>new game</strong>" to start over</li>
        </ul>
      </div>
    </div>
  );
};

export default MemoryGame;
