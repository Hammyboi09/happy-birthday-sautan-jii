import React, { useState, useEffect } from 'react';
import { Heart, CheckCircle, Lock } from 'lucide-react';
import LoveWelcome from './LoveWelcome';
import LoveMazeGame from './LoveMazeGame';
import LoveMemoryMatchGame from './LoveMemoryMatchGame';
import RomanceQuizGame from './RomanceQuizGame';
import LoveBalloonGame from './LoveBalloonGame';

interface LovePathProps {
  onComplete: () => void;
}

interface GameProgress {
  loveMaze: boolean;
  memoryMatch: boolean;
  romance: boolean;
  balloonPop: boolean;
}

const LovePath: React.FC<LovePathProps> = ({ onComplete }) => {
  const [currentView, setCurrentView] = useState<'welcome' | 'loveMaze' | 'memoryMatch' | 'romance' | 'balloonPop' | 'celebration'>('welcome');
  const [gameProgress, setGameProgress] = useState<GameProgress>({
    loveMaze: false,
    memoryMatch: false,
    romance: false,
    balloonPop: false
  });
  const [showConfetti, setShowConfetti] = useState(false);

  const games = [
    {
      id: 'loveMaze' as const,
      title: 'Love Maze',
      description: 'Navigate through love challenges',
      icon: <Heart className="w-8 h-8" />,
      color: 'from-pink-400 to-red-500'
    },
    {
      id: 'memoryMatch' as const,
      title: 'Memory Match',
      description: 'Test your loving memory',
      icon: <Heart className="w-8 h-8" />,
      color: 'from-rose-400 to-pink-500'
    },
    {
      id: 'romance' as const,
      title: 'Romance Quest',
      description: 'Love bonds challenge',
      icon: <Heart className="w-8 h-8" />,
      color: 'from-red-400 to-rose-500'
    },
    {
      id: 'balloonPop' as const,
      title: 'Love Balloon Pop',
      description: 'Romantic celebration finale',
      icon: <Heart className="w-8 h-8" />,
      color: 'from-pink-400 to-purple-500'
    }
  ];

  const handleGameComplete = (gameId: keyof GameProgress) => {
    setGameProgress(prev => ({
      ...prev,
      [gameId]: true
    }));
    
    const updatedProgress = { ...gameProgress, [gameId]: true };
    
    // Move to next game or celebration
    if (gameId === 'loveMaze') {
      setCurrentView('memoryMatch');
    } else if (gameId === 'memoryMatch') {
      setCurrentView('romance');
    } else if (gameId === 'romance') {
      setCurrentView('balloonPop');
    } else if (gameId === 'balloonPop') {
      setTimeout(() => {
        setCurrentView('celebration');
        generateConfetti();
      }, 1000);
    }
  };

  const generateConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  const completedGamesCount = Object.values(gameProgress).filter(Boolean).length;
  const allGamesCompleted = completedGamesCount === 4;

  // Render current view
  if (currentView === 'welcome') {
    return <LoveWelcome onStartJourney={() => setCurrentView('loveMaze')} />;
  }

  if (currentView === 'loveMaze') {
    return (
      <LoveMazeGame
        onComplete={() => handleGameComplete('loveMaze')}
        onBack={() => setCurrentView('welcome')}
      />
    );
  }

  if (currentView === 'memoryMatch') {
    return (
      <LoveMemoryMatchGame
        onComplete={() => handleGameComplete('memoryMatch')}
        onBack={() => setCurrentView('loveMaze')}
      />
    );
  }

  if (currentView === 'romance') {
    return (
      <RomanceQuizGame
        onComplete={() => handleGameComplete('romance')}
        onBack={() => setCurrentView('memoryMatch')}
      />
    );
  }

  if (currentView === 'balloonPop') {
    return (
      <LoveBalloonGame
        onComplete={() => handleGameComplete('balloonPop')}
        onBack={() => setCurrentView('romance')}
      />
    );
  }

  if (currentView === 'celebration') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
        {/* Confetti */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-confetti-infinite"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#FF6B9D', '#F472B6', '#EC4899', '#DB2777', '#BE185D', '#9D174D'][Math.floor(Math.random() * 6)],
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="text-center animate-fadeIn max-w-4xl">
            <div className="mb-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-rose-500 to-red-500 rounded-full blur-3xl opacity-40 animate-pulse"></div>
              <Heart className="w-32 h-32 mx-auto text-pink-500 animate-bounce relative z-10" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-slate-800 mb-8 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 animate-gradient-x">
                Love Achieved!
              </span>
            </h1>
            
            <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-10 mb-8 shadow-xl border border-white/20">
              <p className="text-2xl text-slate-700 mb-6 font-light leading-relaxed">
                Congratulations, Beautiful Soul!
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                You have successfully completed all four romantic challenges and proven the depth of your loving heart. 
                Your compassion, memory, romance knowledge, and celebration spirit have shone brightly throughout this journey.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {games.map((game) => (
                  <div key={game.id} className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-4 border border-pink-200">
                    <CheckCircle className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-slate-800 text-sm">{game.title}</h3>
                    <p className="text-xs text-pink-600">Completed ✓</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-6 border border-pink-200 mb-8">
                <p className="text-xl font-semibold text-slate-800 mb-2">
                  💖 Love Achievement Unlocked! 💖
                </p>
                <p className="text-slate-700">
                  You are now officially crowned as the Love Champion of this special day!
                </p>
              </div>
              
              <button
                onClick={() => {
                  generateConfetti();
                  setTimeout(onComplete, 1000);
                }}
                className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white px-12 py-4 rounded-2xl text-xl font-bold hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              >
                Return to Birthday Celebration
              </button>
            </div>
            
            <div className="flex justify-center space-x-4 text-4xl">
              <span className="animate-bounce">💖</span>
              <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🎉</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
              <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>🎂</span>
              <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🎈</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default LovePath;