import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Board,
  Piece,
  Position,
  PieceType,
  PieceColor,
  Move,
  CastlingRights,
  createInitialBoard,
  getAllLegalMoves,
  makeMove,
  isInCheck,
  isCheckmate,
  isStalemate,
  updateCastlingRights,
} from '@/lib/chess-logic';
import { getBestMove } from '@/lib/chess-ai';

interface ChessBoard3DProps {
  gameMode: 'pvp' | 'ai';
  onGameStateChange?: (state: GameState) => void;
}

export interface GameState {
  turn: PieceColor;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  winner?: PieceColor;
  moveHistory: Move[];
}

// Piece mesh creation functions
function createKing(color: number): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ 
    color, 
    metalness: 0.3, 
    roughness: 0.4 
  });
  
  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.15, 32), material);
  base.position.y = 0.075;
  group.add(base);
  
  // Body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.6, 32), material);
  body.position.y = 0.45;
  group.add(body);
  
  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.2, 32), material);
  neck.position.y = 0.85;
  group.add(neck);
  
  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), material);
  head.position.y = 1.1;
  group.add(head);
  
  // Cross
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), material);
  crossV.position.y = 1.4;
  group.add(crossV);
  
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.08), material);
  crossH.position.y = 1.45;
  group.add(crossH);
  
  return group;
}

function createQueen(color: number): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ 
    color, 
    metalness: 0.3, 
    roughness: 0.4 
  });
  
  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.15, 32), material);
  base.position.y = 0.075;
  group.add(base);
  
  // Body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 0.7, 32), material);
  body.position.y = 0.5;
  group.add(body);
  
  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.2, 32), material);
  neck.position.y = 0.95;
  group.add(neck);
  
  // Crown base
  const crownBase = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), material);
  crownBase.position.y = 1.15;
  group.add(crownBase);
  
  // Crown points
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const point = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.15, 8), material);
    point.position.set(Math.cos(angle) * 0.15, 1.35, Math.sin(angle) * 0.15);
    group.add(point);
  }
  
  // Top ball
  const topBall = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), material);
  topBall.position.y = 1.45;
  group.add(topBall);
  
  return group;
}

function createRook(color: number): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ 
    color, 
    metalness: 0.3, 
    roughness: 0.4 
  });
  
  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 0.15, 32), material);
  base.position.y = 0.075;
  group.add(base);
  
  // Body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.6, 32), material);
  body.position.y = 0.45;
  group.add(body);
  
  // Top platform
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.1, 32), material);
  platform.position.y = 0.8;
  group.add(platform);
  
  // Battlements
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const battlement = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.15), material);
    battlement.position.set(Math.cos(angle) * 0.2, 0.95, Math.sin(angle) * 0.2);
    group.add(battlement);
  }
  
  return group;
}

function createBishop(color: number): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ 
    color, 
    metalness: 0.3, 
    roughness: 0.4 
  });
  
  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.12, 32), material);
  base.position.y = 0.06;
  group.add(base);
  
  // Body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.28, 0.6, 32), material);
  body.position.y = 0.42;
  group.add(body);
  
  // Head (mitre shape)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), material);
  head.position.y = 0.85;
  head.scale.y = 1.8;
  group.add(head);
  
  // Top ball
  const topBall = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), material);
  topBall.position.y = 1.2;
  group.add(topBall);
  
  return group;
}

function createKnight(color: number): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ 
    color, 
    metalness: 0.3, 
    roughness: 0.4 
  });
  
  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.12, 32), material);
  base.position.y = 0.06;
  group.add(base);
  
  // Body/neck
  const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.28, 0.5, 32);
  const body = new THREE.Mesh(bodyGeometry, material);
  body.position.y = 0.37;
  group.add(body);
  
  // Horse head (simplified)
  const headGeometry = new THREE.BoxGeometry(0.2, 0.4, 0.35);
  const head = new THREE.Mesh(headGeometry, material);
  head.position.set(0.05, 0.85, 0.1);
  head.rotation.x = -0.3;
  group.add(head);
  
  // Snout
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.25), material);
  snout.position.set(0.05, 0.7, 0.3);
  snout.rotation.x = -0.2;
  group.add(snout);
  
  // Ears
  const ear1 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.15, 8), material);
  ear1.position.set(-0.05, 1.1, 0);
  ear1.rotation.z = 0.2;
  group.add(ear1);
  
  const ear2 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.15, 8), material);
  ear2.position.set(0.15, 1.1, 0);
  ear2.rotation.z = -0.2;
  group.add(ear2);
  
  // Mane
  const mane = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.15), material);
  mane.position.set(0.05, 0.95, -0.1);
  group.add(mane);
  
  return group;
}

function createPawn(color: number): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ 
    color, 
    metalness: 0.3, 
    roughness: 0.4 
  });
  
  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.1, 32), material);
  base.position.y = 0.05;
  group.add(base);
  
  // Body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 0.4, 32), material);
  body.position.y = 0.3;
  group.add(body);
  
  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 32), material);
  neck.position.y = 0.55;
  group.add(neck);
  
  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 32, 32), material);
  head.position.y = 0.72;
  group.add(head);
  
  return group;
}

function createPieceMesh(type: PieceType, color: PieceColor): THREE.Group {
  const meshColor = color === 'white' ? 0xf5f5dc : 0x2d2d2d;
  
  switch (type) {
    case 'king': return createKing(meshColor);
    case 'queen': return createQueen(meshColor);
    case 'rook': return createRook(meshColor);
    case 'bishop': return createBishop(meshColor);
    case 'knight': return createKnight(meshColor);
    case 'pawn': return createPawn(meshColor);
  }
}

export default function ChessBoard3D({ gameMode, onGameStateChange }: ChessBoard3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const pieceMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const highlightMeshesRef = useRef<THREE.Mesh[]>([]);
  const animatingRef = useRef(false);
  
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [turn, setTurn] = useState<PieceColor>('white');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [castlingRights, setCastlingRights] = useState<CastlingRights>({
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true },
  });
  const [enPassantTarget, setEnPassantTarget] = useState<Position | null>(null);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 12, 10);
    cameraRef.current = camera;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 8;
    controls.maxDistance = 25;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);
    
    const fillLight = new THREE.DirectionalLight(0x6366f1, 0.3);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);
    
    // Create chessboard
    const boardGroup = new THREE.Group();
    const squareSize = 1;
    const boardSize = 8 * squareSize;
    
    // Board base
    const baseGeometry = new THREE.BoxGeometry(boardSize + 0.4, 0.3, boardSize + 0.4);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4a3728, 
      metalness: 0.1, 
      roughness: 0.8 
    });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.y = -0.15;
    baseMesh.receiveShadow = true;
    boardGroup.add(baseMesh);
    
    // Board squares
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0;
        const geometry = new THREE.BoxGeometry(squareSize, 0.1, squareSize);
        const material = new THREE.MeshStandardMaterial({
          color: isLight ? 0xe8d4b8 : 0x7b5c3d,
          metalness: 0.1,
          roughness: 0.7,
        });
        const square = new THREE.Mesh(geometry, material);
        square.position.set(
          col * squareSize - boardSize / 2 + squareSize / 2,
          0,
          row * squareSize - boardSize / 2 + squareSize / 2
        );
        square.receiveShadow = true;
        square.userData = { row, col, isSquare: true };
        boardGroup.add(square);
      }
    }
    
    scene.add(boardGroup);
    
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
    
    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Update pieces on board
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const scene = sceneRef.current;
    const squareSize = 1;
    const boardSize = 8 * squareSize;
    
    // Remove old pieces
    pieceMeshesRef.current.forEach((mesh) => {
      scene.remove(mesh);
    });
    pieceMeshesRef.current.clear();
    
    // Add new pieces
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const mesh = createPieceMesh(piece.type, piece.color);
          mesh.position.set(
            col * squareSize - boardSize / 2 + squareSize / 2,
            0.05,
            row * squareSize - boardSize / 2 + squareSize / 2
          );
          mesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          mesh.userData = { row, col, piece };
          scene.add(mesh);
          pieceMeshesRef.current.set(`${row}-${col}`, mesh);
        }
      }
    }
  }, [board]);

  // Update highlights
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const scene = sceneRef.current;
    const squareSize = 1;
    const boardSize = 8 * squareSize;
    
    // Remove old highlights
    highlightMeshesRef.current.forEach((mesh) => {
      scene.remove(mesh);
    });
    highlightMeshesRef.current = [];
    
    // Highlight selected square
    if (selectedPos) {
      const geometry = new THREE.BoxGeometry(squareSize * 0.95, 0.02, squareSize * 0.95);
      const material = new THREE.MeshBasicMaterial({ 
        color: 0x4ade80, 
        transparent: true, 
        opacity: 0.6 
      });
      const highlight = new THREE.Mesh(geometry, material);
      highlight.position.set(
        selectedPos.col * squareSize - boardSize / 2 + squareSize / 2,
        0.06,
        selectedPos.row * squareSize - boardSize / 2 + squareSize / 2
      );
      scene.add(highlight);
      highlightMeshesRef.current.push(highlight);
    }
    
    // Highlight legal moves
    legalMoves.forEach((move) => {
      if (move.from.row === selectedPos?.row && move.from.col === selectedPos?.col) {
        const isCapture = board[move.to.row][move.to.col] !== null || move.isEnPassant;
        const geometry = isCapture 
          ? new THREE.RingGeometry(0.35, 0.45, 32)
          : new THREE.CircleGeometry(0.15, 32);
        const material = new THREE.MeshBasicMaterial({ 
          color: isCapture ? 0xef4444 : 0x6366f1, 
          transparent: true, 
          opacity: 0.7,
          side: THREE.DoubleSide
        });
        const highlight = new THREE.Mesh(geometry, material);
        highlight.rotation.x = -Math.PI / 2;
        highlight.position.set(
          move.to.col * squareSize - boardSize / 2 + squareSize / 2,
          0.06,
          move.to.row * squareSize - boardSize / 2 + squareSize / 2
        );
        scene.add(highlight);
        highlightMeshesRef.current.push(highlight);
      }
    });
    
    // Highlight check
    if (isInCheck(board, turn)) {
      const kingPos = board.reduce<Position | null>((found, row, rowIdx) => {
        if (found) return found;
        const colIdx = row.findIndex(p => p?.type === 'king' && p?.color === turn);
        return colIdx >= 0 ? { row: rowIdx, col: colIdx } : null;
      }, null);
      
      if (kingPos) {
        const geometry = new THREE.BoxGeometry(squareSize * 0.95, 0.02, squareSize * 0.95);
        const material = new THREE.MeshBasicMaterial({ 
          color: 0xef4444, 
          transparent: true, 
          opacity: 0.6 
        });
        const highlight = new THREE.Mesh(geometry, material);
        highlight.position.set(
          kingPos.col * squareSize - boardSize / 2 + squareSize / 2,
          0.06,
          kingPos.row * squareSize - boardSize / 2 + squareSize / 2
        );
        scene.add(highlight);
        highlightMeshesRef.current.push(highlight);
      }
    }
  }, [selectedPos, legalMoves, board, turn]);

  // Handle click
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current || gameOver || animatingRef.current) return;
    if (gameMode === 'ai' && turn === 'black') return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    
    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    
    // Find clicked position
    let clickedPos: Position | null = null;
    for (const intersect of intersects) {
      let obj = intersect.object;
      while (obj.parent && !obj.userData.row && obj.userData.row !== 0) {
        obj = obj.parent as THREE.Object3D;
      }
      if (obj.userData.row !== undefined || obj.userData.isSquare) {
        clickedPos = { row: obj.userData.row, col: obj.userData.col };
        break;
      }
    }
    
    if (!clickedPos) return;
    
    // If no piece selected, select the clicked piece
    if (!selectedPos) {
      const piece = board[clickedPos.row][clickedPos.col];
      if (piece && piece.color === turn) {
        setSelectedPos(clickedPos);
        const moves = getAllLegalMoves(board, turn, castlingRights, enPassantTarget);
        setLegalMoves(moves);
      }
      return;
    }
    
    // Check if clicking on same piece - deselect
    if (selectedPos.row === clickedPos.row && selectedPos.col === clickedPos.col) {
      setSelectedPos(null);
      setLegalMoves([]);
      return;
    }
    
    // Check if clicking on own piece - switch selection
    const clickedPiece = board[clickedPos.row][clickedPos.col];
    if (clickedPiece && clickedPiece.color === turn) {
      setSelectedPos(clickedPos);
      return;
    }
    
    // Try to make a move
    const move = legalMoves.find(
      m => m.from.row === selectedPos.row && 
           m.from.col === selectedPos.col && 
           m.to.row === clickedPos!.row && 
           m.to.col === clickedPos!.col
    );
    
    if (move) {
      executeMove(move);
    }
  }, [board, turn, selectedPos, legalMoves, castlingRights, enPassantTarget, gameOver, gameMode]);

  // Execute a move with animation
  const executeMove = useCallback((move: Move) => {
    animatingRef.current = true;
    
    const squareSize = 1;
    const boardSize = 8 * squareSize;
    const pieceMesh = pieceMeshesRef.current.get(`${move.from.row}-${move.from.col}`);
    
    if (pieceMesh) {
      const targetX = move.to.col * squareSize - boardSize / 2 + squareSize / 2;
      const targetZ = move.to.row * squareSize - boardSize / 2 + squareSize / 2;
      
      const startX = pieceMesh.position.x;
      const startZ = pieceMesh.position.z;
      const startY = pieceMesh.position.y;
      
      let progress = 0;
      const duration = 300;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        
        pieceMesh.position.x = startX + (targetX - startX) * eased;
        pieceMesh.position.z = startZ + (targetZ - startZ) * eased;
        pieceMesh.position.y = startY + Math.sin(progress * Math.PI) * 0.5; // Arc motion
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          pieceMesh.position.y = startY;
          finishMove(move);
        }
      };
      
      animate();
    } else {
      finishMove(move);
    }
  }, []);

  const finishMove = useCallback((move: Move) => {
    const newBoard = makeMove(board, move);
    const newCastlingRights = updateCastlingRights(castlingRights, move, board);
    const nextTurn = turn === 'white' ? 'black' : 'white';
    
    // Check for en passant target
    let newEnPassantTarget: Position | null = null;
    if (move.piece.type === 'pawn' && Math.abs(move.to.row - move.from.row) === 2) {
      newEnPassantTarget = {
        row: (move.from.row + move.to.row) / 2,
        col: move.from.col
      };
    }
    
    setBoard(newBoard);
    setCastlingRights(newCastlingRights);
    setEnPassantTarget(newEnPassantTarget);
    setTurn(nextTurn);
    setSelectedPos(null);
    setLegalMoves([]);
    setMoveHistory(prev => [...prev, move]);
    
    // Check game end conditions
    const inCheck = isInCheck(newBoard, nextTurn);
    const checkmate = isCheckmate(newBoard, nextTurn, newCastlingRights);
    const stalemate = isStalemate(newBoard, nextTurn, newCastlingRights);
    
    if (checkmate || stalemate) {
      setGameOver(true);
    }
    
    onGameStateChange?.({
      turn: nextTurn,
      isCheck: inCheck,
      isCheckmate: checkmate,
      isStalemate: stalemate,
      winner: checkmate ? turn : undefined,
      moveHistory: [...moveHistory, move],
    });
    
    animatingRef.current = false;
  }, [board, castlingRights, turn, moveHistory, onGameStateChange]);

  // AI move
  useEffect(() => {
    if (gameMode !== 'ai' || turn !== 'black' || gameOver || animatingRef.current) return;
    
    setIsAIThinking(true);
    
    // Use setTimeout to prevent UI blocking
    const timeout = setTimeout(() => {
      const aiMove = getBestMove(board, 'black', castlingRights, enPassantTarget, 3);
      if (aiMove) {
        executeMove(aiMove);
      }
      setIsAIThinking(false);
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [turn, gameMode, gameOver, board, castlingRights, enPassantTarget]);

  // Camera preset functions
  const setCameraWhite = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 12, 10);
      controlsRef.current.target.set(0, 0, 0);
    }
  };

  const setCameraBlack = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 12, -10);
      controlsRef.current.target.set(0, 0, 0);
    }
  };

  const setCameraTop = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 15, 0.1);
      controlsRef.current.target.set(0, 0, 0);
    }
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setTurn('white');
    setSelectedPos(null);
    setLegalMoves([]);
    setCastlingRights({
      white: { kingSide: true, queenSide: true },
      black: { kingSide: true, queenSide: true },
    });
    setEnPassantTarget(null);
    setMoveHistory([]);
    setGameOver(false);
    setCameraWhite();
    onGameStateChange?.({
      turn: 'white',
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      moveHistory: [],
    });
  };

  const undoMove = () => {
    if (moveHistory.length === 0) return;
    
    // For AI mode, undo both AI and player moves
    const movesToUndo = gameMode === 'ai' && moveHistory.length >= 2 ? 2 : 1;
    
    // Rebuild board from scratch
    let newBoard = createInitialBoard();
    let newCastlingRights: CastlingRights = {
      white: { kingSide: true, queenSide: true },
      black: { kingSide: true, queenSide: true },
    };
    
    const newHistory = moveHistory.slice(0, -movesToUndo);
    
    for (const move of newHistory) {
      newBoard = makeMove(newBoard, move);
      newCastlingRights = updateCastlingRights(newCastlingRights, move, newBoard);
    }
    
    const newTurn = newHistory.length % 2 === 0 ? 'white' : 'black';
    
    setBoard(newBoard);
    setCastlingRights(newCastlingRights);
    setTurn(newTurn);
    setMoveHistory(newHistory);
    setSelectedPos(null);
    setLegalMoves([]);
    setGameOver(false);
    setEnPassantTarget(null);
  };

  return (
    <div className="relative w-full h-full">
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-pointer"
        onClick={handleClick}
      />
      
      {/* Controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={setCameraWhite}
          className="px-3 py-2 bg-card/90 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-card transition-colors border border-border"
        >
          White View
        </button>
        <button
          onClick={setCameraBlack}
          className="px-3 py-2 bg-card/90 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-card transition-colors border border-border"
        >
          Black View
        </button>
        <button
          onClick={setCameraTop}
          className="px-3 py-2 bg-card/90 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-card transition-colors border border-border"
        >
          Top View
        </button>
      </div>
      
      {/* Game controls */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          New Game
        </button>
        <button
          onClick={undoMove}
          disabled={moveHistory.length === 0}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Undo
        </button>
      </div>
      
      {/* AI thinking indicator */}
      {isAIThinking && (
        <div className="absolute top-4 left-4 px-4 py-2 bg-card/90 backdrop-blur-sm rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">AI thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
}
