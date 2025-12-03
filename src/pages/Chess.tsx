import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Users, Bot, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChessBoard3D, { GameState } from '@/components/chess/ChessBoard3D';

type GameMode = 'pvp' | 'ai' | null;

export default function Chess() {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [gameState, setGameState] = useState<GameState>({
    turn: 'white',
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    moveHistory: [],
  });

  const getStatusText = () => {
    if (gameState.isCheckmate) {
      return `Checkmate! ${gameState.winner === 'white' ? 'White' : 'Black'} wins!`;
    }
    if (gameState.isStalemate) {
      return 'Stalemate! Game is a draw.';
    }
    if (gameState.isCheck) {
      return `${gameState.turn === 'white' ? 'White' : 'Black'} is in check!`;
    }
    return `${gameState.turn === 'white' ? 'White' : 'Black'}'s turn`;
  };

  if (!gameMode) {
    return (
      <>
        <Helmet>
          <title>3D Chess Game</title>
          <meta name="description" content="Play 3D Chess - Player vs Player or against AI" />
        </Helmet>
        
        <div className="min-h-screen bg-background flex flex-col">
          {/* Header */}
          <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 h-16 flex items-center gap-4">
              <Link 
                to="/" 
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-lg font-semibold">3D Chess</h1>
              </div>
            </div>
          </header>

          {/* Mode Selection */}
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 text-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="text-gradient">3D Chess</span>
                </h2>
                <p className="text-muted-foreground">
                  Choose your game mode to start playing
                </p>
              </div>

              <div className="grid gap-4">
                <button
                  onClick={() => setGameMode('pvp')}
                  className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">Player vs Player</h3>
                      <p className="text-sm text-muted-foreground">
                        Play against a friend locally
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setGameMode('ai')}
                  className="group p-6 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <Bot className="w-8 h-8 text-accent" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">Player vs AI</h3>
                      <p className="text-sm text-muted-foreground">
                        Challenge the computer
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>3D Chess Game - Playing</title>
        <meta name="description" content="Play 3D Chess - Player vs Player or against AI" />
      </Helmet>
      
      <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm shrink-0">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setGameMode(null)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                <span className="font-semibold hidden sm:inline">3D Chess</span>
              </div>
            </div>
            
            {/* Game Status */}
            <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              gameState.isCheckmate 
                ? 'bg-success/20 text-success' 
                : gameState.isCheck 
                  ? 'bg-destructive/20 text-destructive'
                  : gameState.isStalemate
                    ? 'bg-warning/20 text-warning'
                    : 'bg-muted'
            }`}>
              {getStatusText()}
            </div>
            
            {/* Mode indicator */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {gameMode === 'pvp' ? (
                <>
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">PvP</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  <span className="hidden sm:inline">vs AI</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Chess Board */}
        <main className="flex-1 relative">
          <ChessBoard3D 
            gameMode={gameMode} 
            onGameStateChange={setGameState}
          />
        </main>
      </div>
    </>
  );
}
