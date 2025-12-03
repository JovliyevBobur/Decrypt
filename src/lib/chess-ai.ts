// Chess AI using Minimax with Alpha-Beta Pruning
import {
  Board,
  PieceColor,
  Move,
  CastlingRights,
  Position,
  PIECE_VALUES,
  POSITION_TABLES,
  getAllLegalMoves,
  makeMove,
  isInCheck,
  isCheckmate,
} from './chess-logic';

// Evaluate board position for a given color
function evaluateBoard(board: Board, color: PieceColor): number {
  let score = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const pieceValue = PIECE_VALUES[piece.type];
        const posTable = POSITION_TABLES[piece.type];
        
        // Get position value (flip table for black)
        const tableRow = piece.color === 'white' ? row : 7 - row;
        const posValue = posTable[tableRow][col];
        
        const totalValue = pieceValue + posValue;
        
        if (piece.color === color) {
          score += totalValue;
        } else {
          score -= totalValue;
        }
      }
    }
  }
  
  return score;
}

// Minimax with alpha-beta pruning
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiColor: PieceColor,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null
): number {
  const currentColor = isMaximizing ? aiColor : (aiColor === 'white' ? 'black' : 'white');
  
  // Terminal conditions
  if (depth === 0) {
    return evaluateBoard(board, aiColor);
  }
  
  const moves = getAllLegalMoves(board, currentColor, castlingRights, enPassantTarget);
  
  if (moves.length === 0) {
    if (isInCheck(board, currentColor)) {
      // Checkmate - very bad for current player
      return isMaximizing ? -100000 + (3 - depth) * 1000 : 100000 - (3 - depth) * 1000;
    }
    // Stalemate
    return 0;
  }
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const evalScore = minimax(
        newBoard, 
        depth - 1, 
        alpha, 
        beta, 
        false, 
        aiColor, 
        castlingRights,
        null // Simplified - not tracking en passant in recursion
      );
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      const evalScore = minimax(
        newBoard, 
        depth - 1, 
        alpha, 
        beta, 
        true, 
        aiColor, 
        castlingRights,
        null
      );
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minEval;
  }
}

// Get best move for AI
export function getBestMove(
  board: Board,
  color: PieceColor,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null = null,
  depth: number = 3
): Move | null {
  const moves = getAllLegalMoves(board, color, castlingRights, enPassantTarget);
  
  if (moves.length === 0) return null;
  
  let bestMove: Move | null = null;
  let bestScore = -Infinity;
  
  // Shuffle moves for variety when scores are equal
  const shuffledMoves = [...moves].sort(() => Math.random() - 0.5);
  
  for (const move of shuffledMoves) {
    const newBoard = makeMove(board, move);
    const score = minimax(
      newBoard,
      depth - 1,
      -Infinity,
      Infinity,
      false,
      color,
      castlingRights,
      enPassantTarget
    );
    
    // Add small random factor to avoid repetitive play
    const adjustedScore = score + Math.random() * 10;
    
    if (adjustedScore > bestScore) {
      bestScore = adjustedScore;
      bestMove = move;
    }
  }
  
  return bestMove;
}
