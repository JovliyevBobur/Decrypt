// Chess piece types and colors
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  isPromotion?: boolean;
  isCastling?: boolean;
  isEnPassant?: boolean;
}

export type Board = (Piece | null)[][];

// Piece values for AI evaluation
export const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

// Position bonus tables for better AI play
const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_TABLE = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_TABLE = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
];

export const POSITION_TABLES: Record<PieceType, number[][]> = {
  pawn: PAWN_TABLE,
  knight: KNIGHT_TABLE,
  bishop: BISHOP_TABLE,
  rook: ROOK_TABLE,
  queen: QUEEN_TABLE,
  king: KING_TABLE,
};

// Create initial board setup
export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Set up pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black' };
    board[6][col] = { type: 'pawn', color: 'white' };
  }
  
  // Set up other pieces
  const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: pieceOrder[col], color: 'black' };
    board[7][col] = { type: pieceOrder[col], color: 'white' };
  }
  
  return board;
}

// Deep clone the board
export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(piece => piece ? { ...piece } : null));
}

// Check if position is within board bounds
export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
}

// Get piece at position
export function getPieceAt(board: Board, pos: Position): Piece | null {
  if (!isValidPosition(pos)) return null;
  return board[pos.row][pos.col];
}

// Find king position
export function findKing(board: Board, color: PieceColor): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

// Get all possible moves for a piece (without check validation)
export function getRawMoves(board: Board, pos: Position, enPassantTarget: Position | null = null): Position[] {
  const piece = getPieceAt(board, pos);
  if (!piece) return [];
  
  const moves: Position[] = [];
  const { row, col } = pos;
  const direction = piece.color === 'white' ? -1 : 1;
  
  switch (piece.type) {
    case 'pawn': {
      // Forward move
      const forwardOne = { row: row + direction, col };
      if (isValidPosition(forwardOne) && !getPieceAt(board, forwardOne)) {
        moves.push(forwardOne);
        
        // Double forward from starting position
        const startRow = piece.color === 'white' ? 6 : 1;
        if (row === startRow) {
          const forwardTwo = { row: row + 2 * direction, col };
          if (!getPieceAt(board, forwardTwo)) {
            moves.push(forwardTwo);
          }
        }
      }
      
      // Captures (including en passant)
      for (const dc of [-1, 1]) {
        const capturePos = { row: row + direction, col: col + dc };
        if (isValidPosition(capturePos)) {
          const targetPiece = getPieceAt(board, capturePos);
          if (targetPiece && targetPiece.color !== piece.color) {
            moves.push(capturePos);
          }
          // En passant
          if (enPassantTarget && capturePos.row === enPassantTarget.row && capturePos.col === enPassantTarget.col) {
            moves.push(capturePos);
          }
        }
      }
      break;
    }
    
    case 'knight': {
      const knightMoves = [
        { row: row - 2, col: col - 1 }, { row: row - 2, col: col + 1 },
        { row: row - 1, col: col - 2 }, { row: row - 1, col: col + 2 },
        { row: row + 1, col: col - 2 }, { row: row + 1, col: col + 2 },
        { row: row + 2, col: col - 1 }, { row: row + 2, col: col + 1 },
      ];
      for (const move of knightMoves) {
        if (isValidPosition(move)) {
          const targetPiece = getPieceAt(board, move);
          if (!targetPiece || targetPiece.color !== piece.color) {
            moves.push(move);
          }
        }
      }
      break;
    }
    
    case 'bishop': {
      for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        for (let i = 1; i < 8; i++) {
          const newPos = { row: row + dr * i, col: col + dc * i };
          if (!isValidPosition(newPos)) break;
          const targetPiece = getPieceAt(board, newPos);
          if (targetPiece) {
            if (targetPiece.color !== piece.color) moves.push(newPos);
            break;
          }
          moves.push(newPos);
        }
      }
      break;
    }
    
    case 'rook': {
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        for (let i = 1; i < 8; i++) {
          const newPos = { row: row + dr * i, col: col + dc * i };
          if (!isValidPosition(newPos)) break;
          const targetPiece = getPieceAt(board, newPos);
          if (targetPiece) {
            if (targetPiece.color !== piece.color) moves.push(newPos);
            break;
          }
          moves.push(newPos);
        }
      }
      break;
    }
    
    case 'queen': {
      for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
        for (let i = 1; i < 8; i++) {
          const newPos = { row: row + dr * i, col: col + dc * i };
          if (!isValidPosition(newPos)) break;
          const targetPiece = getPieceAt(board, newPos);
          if (targetPiece) {
            if (targetPiece.color !== piece.color) moves.push(newPos);
            break;
          }
          moves.push(newPos);
        }
      }
      break;
    }
    
    case 'king': {
      for (const dr of [-1, 0, 1]) {
        for (const dc of [-1, 0, 1]) {
          if (dr === 0 && dc === 0) continue;
          const newPos = { row: row + dr, col: col + dc };
          if (isValidPosition(newPos)) {
            const targetPiece = getPieceAt(board, newPos);
            if (!targetPiece || targetPiece.color !== piece.color) {
              moves.push(newPos);
            }
          }
        }
      }
      break;
    }
  }
  
  return moves;
}

// Check if a square is attacked by a color
export function isSquareAttacked(board: Board, pos: Position, byColor: PieceColor): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === byColor) {
        const moves = getRawMoves(board, { row, col });
        if (moves.some(m => m.row === pos.row && m.col === pos.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Check if a color is in check
export function isInCheck(board: Board, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  const opponentColor = color === 'white' ? 'black' : 'white';
  return isSquareAttacked(board, kingPos, opponentColor);
}

// Make a move and return new board
export function makeMove(board: Board, move: Move): Board {
  const newBoard = cloneBoard(board);
  const piece = newBoard[move.from.row][move.from.col];
  
  // Handle en passant capture
  if (move.isEnPassant && piece?.type === 'pawn') {
    const capturedPawnRow = move.from.row;
    newBoard[capturedPawnRow][move.to.col] = null;
  }
  
  // Handle castling
  if (move.isCastling && piece?.type === 'king') {
    const isKingside = move.to.col > move.from.col;
    const rookFromCol = isKingside ? 7 : 0;
    const rookToCol = isKingside ? 5 : 3;
    newBoard[move.from.row][rookToCol] = newBoard[move.from.row][rookFromCol];
    newBoard[move.from.row][rookFromCol] = null;
  }
  
  // Move the piece
  newBoard[move.to.row][move.to.col] = piece;
  newBoard[move.from.row][move.from.col] = null;
  
  // Handle pawn promotion (auto-promote to queen for simplicity)
  if (piece?.type === 'pawn' && (move.to.row === 0 || move.to.row === 7)) {
    newBoard[move.to.row][move.to.col] = { type: 'queen', color: piece.color };
  }
  
  return newBoard;
}

// Get all legal moves for a color
export function getAllLegalMoves(
  board: Board, 
  color: PieceColor, 
  castlingRights: CastlingRights,
  enPassantTarget: Position | null = null
): Move[] {
  const moves: Move[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const from = { row, col };
        const rawMoves = getRawMoves(board, from, enPassantTarget);
        
        for (const to of rawMoves) {
          const captured = getPieceAt(board, to);
          const isEnPassant = piece.type === 'pawn' && 
            enPassantTarget && 
            to.row === enPassantTarget.row && 
            to.col === enPassantTarget.col;
          
          const move: Move = { 
            from, 
            to, 
            piece, 
            captured: captured || undefined,
            isEnPassant
          };
          
          // Verify move doesn't leave king in check
          const newBoard = makeMove(board, move);
          if (!isInCheck(newBoard, color)) {
            moves.push(move);
          }
        }
      }
    }
  }
  
  // Add castling moves
  if (!isInCheck(board, color)) {
    const row = color === 'white' ? 7 : 0;
    const rights = castlingRights[color];
    
    // Kingside castling
    if (rights.kingSide) {
      const kingPos = { row, col: 4 };
      const passThroughPos = { row, col: 5 };
      const targetPos = { row, col: 6 };
      
      if (!getPieceAt(board, passThroughPos) && 
          !getPieceAt(board, targetPos) &&
          !isSquareAttacked(board, passThroughPos, color === 'white' ? 'black' : 'white') &&
          !isSquareAttacked(board, targetPos, color === 'white' ? 'black' : 'white')) {
        const piece = getPieceAt(board, kingPos);
        if (piece) {
          moves.push({
            from: kingPos,
            to: targetPos,
            piece,
            isCastling: true
          });
        }
      }
    }
    
    // Queenside castling
    if (rights.queenSide) {
      const kingPos = { row, col: 4 };
      const passThroughPos1 = { row, col: 3 };
      const passThroughPos2 = { row, col: 2 };
      const rookPassPos = { row, col: 1 };
      
      if (!getPieceAt(board, passThroughPos1) && 
          !getPieceAt(board, passThroughPos2) &&
          !getPieceAt(board, rookPassPos) &&
          !isSquareAttacked(board, passThroughPos1, color === 'white' ? 'black' : 'white') &&
          !isSquareAttacked(board, passThroughPos2, color === 'white' ? 'black' : 'white')) {
        const piece = getPieceAt(board, kingPos);
        if (piece) {
          moves.push({
            from: kingPos,
            to: passThroughPos2,
            piece,
            isCastling: true
          });
        }
      }
    }
  }
  
  return moves;
}

export interface CastlingRights {
  white: { kingSide: boolean; queenSide: boolean };
  black: { kingSide: boolean; queenSide: boolean };
}

// Check for checkmate
export function isCheckmate(board: Board, color: PieceColor, castlingRights: CastlingRights): boolean {
  if (!isInCheck(board, color)) return false;
  return getAllLegalMoves(board, color, castlingRights).length === 0;
}

// Check for stalemate
export function isStalemate(board: Board, color: PieceColor, castlingRights: CastlingRights): boolean {
  if (isInCheck(board, color)) return false;
  return getAllLegalMoves(board, color, castlingRights).length === 0;
}

// Update castling rights after a move
export function updateCastlingRights(
  rights: CastlingRights, 
  move: Move, 
  board: Board
): CastlingRights {
  const newRights = JSON.parse(JSON.stringify(rights)) as CastlingRights;
  
  // King moved
  if (move.piece.type === 'king') {
    newRights[move.piece.color].kingSide = false;
    newRights[move.piece.color].queenSide = false;
  }
  
  // Rook moved or captured
  if (move.from.row === 0 && move.from.col === 0) newRights.black.queenSide = false;
  if (move.from.row === 0 && move.from.col === 7) newRights.black.kingSide = false;
  if (move.from.row === 7 && move.from.col === 0) newRights.white.queenSide = false;
  if (move.from.row === 7 && move.from.col === 7) newRights.white.kingSide = false;
  
  if (move.to.row === 0 && move.to.col === 0) newRights.black.queenSide = false;
  if (move.to.row === 0 && move.to.col === 7) newRights.black.kingSide = false;
  if (move.to.row === 7 && move.to.col === 0) newRights.white.queenSide = false;
  if (move.to.row === 7 && move.to.col === 7) newRights.white.kingSide = false;
  
  return newRights;
}
