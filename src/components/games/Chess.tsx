
import React, { useEffect, useState } from 'react';
import { speak } from '@/utils/speechSynthesis';
import { addCommandListener } from '@/utils/speechRecognition';
import { triggerHaptics } from '@/utils/haptics';
import GameButton from '@/components/ui/GameButton';

// Define chess pieces with unicode symbols
const chessPieces = {
  'white': {
    'pawn': '♙',
    'rook': '♖',
    'knight': '♘',
    'bishop': '♗',
    'queen': '♕',
    'king': '♔'
  },
  'black': {
    'pawn': '♟',
    'rook': '♜',
    'knight': '♞',
    'bishop': '♝',
    'queen': '♛',
    'king': '♚'
  }
};

// Initial board setup
const initialBoard = [
  ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
  ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
  ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']
];

// Define column names for chess notation
const columnNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const Chess: React.FC = () => {
  const [board, setBoard] = useState<string[][]>(initialBoard);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [lastMove, setLastMove] = useState<string>('');
  
  // Process voice commands for chess
  useEffect(() => {
    const handleChessCommand = (command: string) => {
      const words = command.toLowerCase().split(' ');
      
      // Look for move pattern like "move pawn to e4" or "knight to c3"
      const movePattern = /move\s+([a-z]+)\s+(?:from\s+)?([a-h])([1-8])?\s+to\s+([a-h])([1-8])/i;
      const directPattern = /([a-z]+)\s+(?:from\s+)?([a-h])([1-8])?\s+to\s+([a-h])([1-8])/i;
      
      const moveMatch = command.match(movePattern) || command.match(directPattern);
      
      if (moveMatch) {
        const piece = moveMatch[1]; // e.g., "pawn", "knight"
        let fromCol = moveMatch[2]; // e.g., "e"
        let fromRow = moveMatch[3]; // e.g., "2" (might be undefined)
        const toCol = moveMatch[4];   // e.g., "e"
        const toRow = moveMatch[5];   // e.g., "4"
        
        processChessMove(piece, fromCol, fromRow, toCol, toRow);
      }
      
      // Reset command
      if (command.includes('reset') || command.includes('new game')) {
        resetGame();
      }
    };
    
    // Add listener for chess commands
    const removeListener = addCommandListener('chess', handleChessCommand);
    
    // Initial game announcement
    speak('Chess game started. White to move.');
    
    return () => {
      removeListener();
    };
  }, [board, currentPlayer]);
  
  // Process a chess move from voice command
  const processChessMove = (
    piece: string, 
    fromCol: string, 
    fromRow: string | undefined, 
    toCol: string, 
    toRow: string
  ) => {
    // Convert chess notation to array indices
    const toColIdx = columnNames.indexOf(toCol);
    const toRowIdx = 8 - parseInt(toRow);
    
    if (toColIdx === -1 || toRowIdx < 0 || toRowIdx > 7) {
      speak('Invalid move. Please try again.');
      return;
    }
    
    let fromColIdx = -1;
    let fromRowIdx = -1;
    
    // First, identify the piece type
    const pieceCode = piece.toLowerCase().charAt(0);
    const piecePrefix = currentPlayer.charAt(0); // 'w' or 'b'
    
    // Handle the case where specific coordinates are provided
    if (fromCol && fromRow) {
      fromColIdx = columnNames.indexOf(fromCol);
      fromRowIdx = 8 - parseInt(fromRow);
      
      if (fromColIdx === -1 || fromRowIdx < 0 || fromRowIdx > 7) {
        speak('Invalid starting position. Please try again.');
        return;
      }
      
      // Check if the piece at the starting position is valid
      const pieceAtPosition = board[fromRowIdx][fromColIdx];
      if (!pieceAtPosition || pieceAtPosition.charAt(0) !== piecePrefix) {
        speak('No valid piece at the starting position.');
        return;
      }
      
      // Now make the move
      const newBoard = [...board.map(row => [...row])];
      newBoard[toRowIdx][toColIdx] = newBoard[fromRowIdx][fromColIdx];
      newBoard[fromRowIdx][fromColIdx] = '';
      
      // Update the board and switch players
      setBoard(newBoard);
      setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
      
      // Announce the move
      const moveName = `${piece} from ${fromCol}${fromRow} to ${toCol}${toRow}`;
      speak(`${moveName}. ${currentPlayer === 'white' ? 'Black' : 'White'} to move.`);
      setLastMove(moveName);
      
      // Provide haptic feedback
      triggerHaptics(60);
    } else {
      // For simplicity in this prototype, we'll focus on pawns since they're most common
      // In a full implementation, you'd need more complex logic for piece movement rules
      if (piece === 'pawn') {
        const pieceCode = currentPlayer === 'white' ? 'wp' : 'bp';
        
        // Find possible pawns that can move to the target
        const possiblePawns: [number, number][] = [];
        
        // For white pawns, they move up (decreasing row index)
        if (currentPlayer === 'white') {
          // Check if there's a pawn one row below
          if (toRowIdx + 1 <= 7 && board[toRowIdx + 1][toColIdx] === 'wp') {
            possiblePawns.push([toRowIdx + 1, toColIdx]);
          }
          // Check if there's a pawn two rows below (only from starting position)
          if (toRowIdx + 2 <= 7 && toRowIdx === 4 && 
              board[toRowIdx + 2][toColIdx] === 'wp' && 
              board[toRowIdx + 1][toColIdx] === '') {
            possiblePawns.push([toRowIdx + 2, toColIdx]);
          }
        } 
        // For black pawns, they move down (increasing row index)
        else {
          // Check if there's a pawn one row above
          if (toRowIdx - 1 >= 0 && board[toRowIdx - 1][toColIdx] === 'bp') {
            possiblePawns.push([toRowIdx - 1, toColIdx]);
          }
          // Check if there's a pawn two rows above (only from starting position)
          if (toRowIdx - 2 >= 0 && toRowIdx === 3 && 
              board[toRowIdx - 2][toColIdx] === 'bp' && 
              board[toRowIdx - 1][toColIdx] === '') {
            possiblePawns.push([toRowIdx - 2, toColIdx]);
          }
        }
        
        if (possiblePawns.length === 1) {
          // If there's only one possible pawn, move it
          const [fromRow, fromCol] = possiblePawns[0];
          
          const newBoard = [...board.map(row => [...row])];
          newBoard[toRowIdx][toColIdx] = pieceCode;
          newBoard[fromRow][fromCol] = '';
          
          setBoard(newBoard);
          setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
          
          // Announce the move
          const fromNotation = `${columnNames[fromCol]}${8 - fromRow}`;
          const toNotation = `${toCol}${toRow}`;
          const moveName = `Pawn from ${fromNotation} to ${toNotation}`;
          speak(`${moveName}. ${currentPlayer === 'white' ? 'Black' : 'White'} to move.`);
          setLastMove(moveName);
          
          // Provide haptic feedback
          triggerHaptics(60);
        } else if (possiblePawns.length > 1) {
          speak('Multiple pawns can make that move. Please specify which pawn to move.');
        } else {
          speak('No valid pawn can make that move.');
        }
      } else {
        speak(`Please specify which ${piece} to move using its position.`);
      }
    }
  };
  
  // Handle clicking on a cell
  const handleCellClick = (row: number, col: number) => {
    // If no cell is selected yet, select this one if it has a piece of the current player
    if (!selectedCell) {
      const piece = board[row][col];
      if (piece && piece[0] === currentPlayer[0].toLowerCase()) {
        setSelectedCell([row, col]);
        speak(`Selected ${getPieceName(piece)} at ${columnNames[col]}${8 - row}`);
        triggerHaptics();
      } else if (piece) {
        speak(`That's ${getPieceName(piece)} of the opponent`);
      } else {
        speak('Empty square');
      }
    } 
    // If a cell is already selected, try to move the piece
    else {
      const [selectedRow, selectedCol] = selectedCell;
      const selectedPiece = board[selectedRow][selectedCol];
      
      // Simple move validation for prototype
      // In a real game, you'd check if the move is valid according to chess rules
      if (selectedRow !== row || selectedCol !== col) {
        const newBoard = [...board.map(row => [...row])];
        newBoard[row][col] = selectedPiece;
        newBoard[selectedRow][selectedCol] = '';
        
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
        
        // Announce the move
        const fromNotation = `${columnNames[selectedCol]}${8 - selectedRow}`;
        const toNotation = `${columnNames[col]}${8 - row}`;
        const pieceName = getPieceName(selectedPiece);
        const moveName = `${pieceName} from ${fromNotation} to ${toNotation}`;
        
        speak(`${moveName}. ${currentPlayer === 'white' ? 'Black' : 'White'} to move.`);
        setLastMove(moveName);
        
        triggerHaptics(60);
      }
      
      setSelectedCell(null);
    }
  };
  
  // Get the name of a piece from its code
  const getPieceName = (pieceCode: string) => {
    if (!pieceCode || pieceCode.length < 2) return 'empty';
    
    const color = pieceCode[0] === 'w' ? 'white' : 'black';
    
    switch (pieceCode[1]) {
      case 'p': return `${color} pawn`;
      case 'r': return `${color} rook`;
      case 'n': return `${color} knight`;
      case 'b': return `${color} bishop`;
      case 'q': return `${color} queen`;
      case 'k': return `${color} king`;
      default: return 'unknown piece';
    }
  };
  
  // Reset the game
  const resetGame = () => {
    setBoard(initialBoard);
    setSelectedCell(null);
    setCurrentPlayer('white');
    setLastMove('');
    speak('Game reset. White to move.');
    triggerHaptics(100);
  };
  
  // Render a chess piece
  const renderPiece = (piece: string) => {
    if (!piece) return null;
    
    const color = piece[0] === 'w' ? 'white' : 'black';
    let type;
    
    switch (piece[1]) {
      case 'p': type = 'pawn'; break;
      case 'r': type = 'rook'; break;
      case 'n': type = 'knight'; break;
      case 'b': type = 'bishop'; break;
      case 'q': type = 'queen'; break;
      case 'k': type = 'king'; break;
      default: return null;
    }
    
    return (
      <span className="text-2xl lg:text-3xl select-none" role="img" aria-label={`${color} ${type}`}>
        {chessPieces[color][type]}
      </span>
    );
  };
  
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="glass-panel p-6 rounded-xl w-full max-w-md lg:max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Voice Chess</h1>
        
        <div className="mb-4 text-left">
          <p className="text-primary mb-2">Current Turn: <span className="font-semibold">{currentPlayer === 'white' ? 'White' : 'Black'}</span></p>
          {lastMove && <p className="text-sm text-muted-foreground">Last move: {lastMove}</p>}
        </div>
        
        <div className="chess-board aspect-square max-w-md mx-auto">
          {board.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.map((cell, colIndex) => {
                const isLight = (rowIndex + colIndex) % 2 === 0;
                const isSelected = selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex;
                
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      ${isLight ? 'chess-square-light' : 'chess-square-dark'}
                      ${isSelected ? 'ring-2 ring-primary' : ''}
                      w-full aspect-square flex items-center justify-center relative
                    `}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    aria-label={`${columnNames[colIndex]}${8 - rowIndex} ${cell ? getPieceName(cell) : 'empty'}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleCellClick(rowIndex, colIndex);
                      }
                    }}
                  >
                    {renderPiece(cell)}
                    
                    {/* Chess coordinates */}
                    {colIndex === 0 && (
                      <span className="absolute left-1 top-0 text-xs font-semibold opacity-70">
                        {8 - rowIndex}
                      </span>
                    )}
                    {rowIndex === 7 && (
                      <span className="absolute bottom-0 right-1 text-xs font-semibold opacity-70">
                        {columnNames[colIndex]}
                      </span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        
        <div className="mt-6 flex justify-between">
          <GameButton onClick={resetGame} speakText="Reset game" variant="secondary">
            Reset Game
          </GameButton>
          
          <GameButton
            onClick={() => speak('Say "move pawn to e4" or similar to make a move.')}
            speakText="Voice command help"
          >
            Voice Help
          </GameButton>
        </div>
      </div>
      
      <div className="glass-panel p-6 rounded-xl w-full max-w-md lg:max-w-lg">
        <h2 className="text-xl font-bold mb-4">Voice Commands</h2>
        <ul className="list-disc list-inside text-left space-y-2">
          <li>Say "<strong>move pawn to e4</strong>" to move a pawn forward</li>
          <li>Say "<strong>knight to c3</strong>" to move a piece to a square</li>
          <li>For specific pieces, say "<strong>move knight from b1 to c3</strong>"</li>
          <li>Say "<strong>reset</strong>" or "<strong>new game</strong>" to start over</li>
        </ul>
      </div>
    </div>
  );
};

export default Chess;
