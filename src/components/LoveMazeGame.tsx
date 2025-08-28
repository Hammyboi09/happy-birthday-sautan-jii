import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Clock, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';

interface LoveMazeGameProps {
  onComplete: () => void;
  onBack: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface Guard {
  id: number;
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  path: Position[];
  currentPathIndex: number;
}

interface Gate {
  id: number;
  x: number;
  y: number;
  isOpen: boolean;
  question: string;
  options: string[];
  correctAnswer: number;
}

const LoveMazeGame: React.FC<LoveMazeGameProps> = ({ onComplete, onBack }) => {
  const [playerPos, setPlayerPos] = useState<Position>({ x: 1, y: 13 }); // Bottom left
  const [guards, setGuards] = useState<Guard[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [gameActive, setGameActive] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showRules, setShowRules] = useState(true);
  const [rulesTimer, setRulesTimer] = useState(10);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownTimer, setCountdownTimer] = useState(3);
  const [gameReady, setGameReady] = useState(false);
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [winTimer, setWinTimer] = useState(5);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentGate, setCurrentGate] = useState<Gate | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [attempts, setAttempts] = useState(1);
  const [showRetryScreen, setShowRetryScreen] = useState(false);
  const [retryTimer, setRetryTimer] = useState(4);

  // Maze layout (15x15 grid) - 1 = wall, 0 = path
  const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,2], // 2 = finish
    [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,3,0,0,1,0,0,0,1], // 3 = gate
    [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,3,0,0,0,0,0,0,1], // 3 = gate
    [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
    [0,0,1,0,0,0,0,0,0,0,0,0,1,0,1], // 0 at start = player start
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];

  // Initialize guards and gates
  useEffect(() => {
    if (gameReady && !gameActive) {
      initializeGame();
    }
  }, [gameReady]);

  const initializeGame = () => {
    // Initialize guards with patrol paths
    const initialGuards: Guard[] = [
      {
        id: 1,
        x: 3,
        y: 3,
        direction: 'right',
        path: [
          { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 4, y: 3 }
        ],
        currentPathIndex: 0
      },
      {
        id: 2,
        x: 7,
        y: 7,
        direction: 'down',
        path: [
          { x: 7, y: 7 }, { x: 7, y: 8 }, { x: 7, y: 9 }, { x: 7, y: 8 }
        ],
        currentPathIndex: 0
      },
      {
        id: 3,
        x: 11,
        y: 5,
        direction: 'up',
        path: [
          { x: 11, y: 5 }, { x: 11, y: 4 }, { x: 11, y: 3 }, { x: 11, y: 4 }
        ],
        currentPathIndex: 0
      }
    ];

    // Initialize gates with questions
    const initialGates: Gate[] = [
      {
        id: 1,
        x: 7,
        y: 7,
        isOpen: false,
        question: "What is the color most associated with love?",
        options: ["Blue", "Red", "Green", "Yellow"],
        correctAnswer: 1
      },
      {
        id: 2,
        x: 7,
        y: 9,
        isOpen: false,
        question: "Which symbol represents love?",
        options: ["Star", "Heart", "Circle", "Square"],
        correctAnswer: 1
      }
    ];

    setGuards(initialGuards);
    setGates(initialGates);
    setPlayerPos({ x: 1, y: 13 });
    setLives(3);
    setScore(0);
    setTimeLeft(300);
    setGameActive(true);
    setGameCompleted(false);
    setShowQuestion(false);
    setCurrentGate(null);
    setSelectedAnswer(null);
    setShowConfetti(false);
  };

  const resetGame = () => {
    setAttempts(prev => prev + 1);
    setRetryTimer(4);
    setShowRetryScreen(false);
    initializeGame();
  };

  // Rules timer effect
  useEffect(() => {
    if (showRules && rulesTimer > 0) {
      const timer = setTimeout(() => {
        setRulesTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showRules && rulesTimer === 0) {
      setShowRules(false);
      setShowCountdown(true);
    }
  }, [showRules, rulesTimer]);

  // Countdown timer effect
  useEffect(() => {
    if (showCountdown && countdownTimer > 0) {
      const timer = setTimeout(() => {
        setCountdownTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdownTimer === 0) {
      setShowCountdown(false);
      setGameReady(true);
    }
  }, [showCountdown, countdownTimer]);

  // Game timer effect
  useEffect(() => {
    if (gameActive && !gameCompleted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft <= 0 && gameActive) {
      setGameActive(false);
      setShowRetryScreen(true);
    }
  }, [gameActive, gameCompleted, timeLeft]);

  // Win screen timer effect
  useEffect(() => {
    if (showWinScreen && winTimer > 0) {
      const timer = setTimeout(() => {
        setWinTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showWinScreen && winTimer === 0) {
      onComplete();
    }
  }, [showWinScreen, winTimer]);

  // Retry screen timer effect
  useEffect(() => {
    if (showRetryScreen && retryTimer > 0) {
      const timer = setTimeout(() => {
        setRetryTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showRetryScreen && retryTimer === 0) {
      setShowRetryScreen(false);
      resetGame();
    }
  }, [showRetryScreen, retryTimer]);

  // Guard movement effect
  useEffect(() => {
    if (!gameActive || gameCompleted) return;

    const guardInterval = setInterval(() => {
      setGuards(prevGuards => 
        prevGuards.map(guard => {
          const nextIndex = (guard.currentPathIndex + 1) % guard.path.length;
          const nextPos = guard.path[nextIndex];
          
          return {
            ...guard,
            x: nextPos.x,
            y: nextPos.y,
            currentPathIndex: nextIndex
          };
        })
      );
    }, 1000);

    return () => clearInterval(guardInterval);
  }, [gameActive, gameCompleted]);

  // Check collisions
  useEffect(() => {
    if (!gameActive) return;

    // Check guard collisions
    guards.forEach(guard => {
      if (guard.x === playerPos.x && guard.y === playerPos.y) {
        handleGuardCollision();
      }
    });

    // Check gate interactions
    gates.forEach(gate => {
      if (gate.x === playerPos.x && gate.y === playerPos.y && !gate.isOpen) {
        setCurrentGate(gate);
        setShowQuestion(true);
        setGameActive(false);
      }
    });

    // Check win condition
    if (maze[playerPos.y] && maze[playerPos.y][playerPos.x] === 2) {
      handleWin();
    }
  }, [playerPos, guards, gates, gameActive]);

  const handleGuardCollision = () => {
    const newLives = lives - 1;
    setLives(newLives);
    
    if (newLives <= 0) {
      setGameActive(false);
      setShowRetryScreen(true);
    } else {
      // Reset player to start
      setPlayerPos({ x: 1, y: 13 });
    }
  };

  const handleWin = () => {
    setGameCompleted(true);
    setGameActive(false);
    setScore(100);
    setShowConfetti(true);
    
    setTimeout(() => {
      setShowConfetti(false);
      setShowWinScreen(true);
    }, 3000);
  };

  const handleQuestionAnswer = () => {
    if (!currentGate || selectedAnswer === null) return;

    if (selectedAnswer === currentGate.correctAnswer) {
      // Correct answer - open gate
      setGates(prevGates => 
        prevGates.map(gate => 
          gate.id === currentGate.id ? { ...gate, isOpen: true } : gate
        )
      );
      setShowQuestion(false);
      setCurrentGate(null);
      setSelectedAnswer(null);
      setGameActive(true);
    } else {
      // Wrong answer - lose life
      const newLives = lives - 1;
      setLives(newLives);
      setShowQuestion(false);
      setCurrentGate(null);
      setSelectedAnswer(null);
      
      if (newLives <= 0) {
        setShowRetryScreen(true);
      } else {
        setPlayerPos({ x: 1, y: 13 }); // Reset to start
        setGameActive(true);
      }
    }
  };

  const movePlayer = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!gameActive || showQuestion) return;

    setPlayerPos(prevPos => {
      let newX = prevPos.x;
      let newY = prevPos.y;

      switch (direction) {
        case 'up':
          newY = Math.max(0, prevPos.y - 1);
          break;
        case 'down':
          newY = Math.min(14, prevPos.y + 1);
          break;
        case 'left':
          newX = Math.max(0, prevPos.x - 1);
          break;
        case 'right':
          newX = Math.min(14, prevPos.x + 1);
          break;
      }

      // Check if new position is valid (not a wall)
      if (maze[newY] && maze[newY][newX] !== 1) {
        // Check if it's a gate and if it's open
        const gate = gates.find(g => g.x === newX && g.y === newY);
        if (gate && !gate.isOpen) {
          return prevPos; // Can't move through closed gate
        }
        return { x: newX, y: newY };
      }

      return prevPos;
    });
  }, [gameActive, showQuestion, gates]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          movePlayer('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePlayer('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          movePlayer('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePlayer('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateConfetti = () => {
    return Array.from({ length: 30 }, (_, i) => (
      <div
        key={i}
        className="absolute w-3 h-3 rounded-full animate-confetti-infinite pointer-events-none"
        style={{
          left: `${Math.random() * 100}%`,
          backgroundColor: ['#FF6B9D', '#F472B6', '#EC4899', '#DB2777', '#BE185D', '#9D174D'][Math.floor(Math.random() * 6)],
          animationDelay: `${Math.random() * 2}s`
        }}
      />
    ));
  };

  // Rules popup
  if (showRules) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 max-w-4xl w-full">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Love Maze</h3>
                <p className="text-sm text-slate-600">Game 1 of 4</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span className="text-red-600 font-semibold">5:00</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-pink-500" />
                <span className="text-pink-600 font-semibold">0</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <span className="text-2xl">❤️</span>
              <h3 className="text-2xl font-bold text-slate-800">Love Maze Rules</h3>
            </div>
            <div className="text-xl font-semibold text-red-600">
              Starting in {rulesTimer} seconds...
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <Heart className="w-5 h-5 text-pink-600 mr-2" />
                <h4 className="text-lg font-semibold text-pink-800">Objective</h4>
              </div>
              <ul className="text-pink-700 text-sm space-y-1">
                <li>• Navigate from Start (❤️) to Finish (❤️🏁)</li>
                <li>• Avoid Love Guards (💔) patrolling the maze</li>
                <li>• Answer questions to unlock gates</li>
                <li>• Complete within 5 minutes</li>
              </ul>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">💔</span>
                <h4 className="text-lg font-semibold text-red-800">Love Guards</h4>
              </div>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• 3 guards patrol different paths</li>
                <li>• Collision = lose 1 life</li>
                <li>• You start with 3 lives</li>
                <li>• 0 lives = restart maze</li>
              </ul>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <HelpCircle className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="text-lg font-semibold text-purple-800">Locked Gates</h4>
              </div>
              <ul className="text-purple-700 text-sm space-y-1">
                <li>• 2 gates block secret paths</li>
                <li>• Answer multiple choice questions</li>
                <li>• Correct = gate opens</li>
                <li>• Wrong = lose 1 life</li>
              </ul>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <Trophy className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="text-lg font-semibold text-green-800">Controls</h4>
              </div>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Desktop: Arrow keys (↑ ↓ ← →)</li>
                <li>• Mobile: On-screen buttons</li>
                <li>• Cannot pass through walls</li>
                <li>• Reach finish for 100 points</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">🎯</span>
              <h4 className="text-lg font-bold text-slate-800">Pro Tips</h4>
            </div>
            <ul className="text-slate-700 text-sm space-y-1">
              <li>• Watch guard movement patterns to find safe paths</li>
              <li>• Use gates strategically - they provide shortcuts</li>
              <li>• Time management is crucial - don't get stuck</li>
              <li>• If you lose a life, you restart from the beginning</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Countdown screen
  if (showCountdown) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 text-center">
          <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 mb-4 animate-pulse">
            {countdownTimer}
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-4">Get Ready!</h3>
          <p className="text-xl text-slate-600">Love maze challenge starting soon...</p>
          <div className="flex justify-center space-x-4 mt-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-8 rounded-full animate-bounce"
                style={{
                  backgroundColor: ['#FF6B9D', '#F472B6', '#EC4899'][i],
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Retry screen
  if (showRetryScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 text-center relative overflow-hidden max-w-2xl w-full">
          <div className="text-6xl mb-4">💔</div>
          <h3 className="text-4xl font-bold text-slate-800 mb-4">
            Try Again, Beautiful Heart!
          </h3>
          <div className="text-2xl font-semibold text-slate-600 mb-4">
            Attempt #{attempts}
          </div>
          <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-6 mb-6 border border-pink-200">
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              {lives <= 0 ? "You ran out of lives!" : "Time ran out!"} Don't worry - every attempt makes you stronger!
            </p>
            <p className="text-slate-600">
              The maze layout remains the same, but you'll need to navigate more carefully this time.
            </p>
          </div>
          
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-pink-600 mb-2">
              Restarting in {retryTimer} seconds...
            </div>
            <p className="text-sm text-slate-500">
              Fresh start with 3 lives and 5 minutes
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Win screen
  if (showWinScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 text-center relative overflow-hidden max-w-2xl w-full">
          <div className="text-6xl mb-4">❤️🏁</div>
          <h3 className="text-4xl font-bold text-slate-800 mb-4">
            You Escaped the Love Maze!
          </h3>
          <div className="text-4xl font-bold text-slate-800 mb-6">
            Score: {score} points
          </div>
          <div className="text-lg text-slate-600 mb-4">
            Attempt #{attempts}
          </div>
          <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-6 mb-6 border border-pink-200">
            <p className="text-lg text-slate-700 leading-relaxed">
              Congratulations! You successfully navigated through the Love Maze, avoided the guards, and unlocked the secret paths. Your romantic journey continues!
            </p>
          </div>
          <div className="text-2xl font-bold text-pink-600">
            Continuing in {winTimer} seconds...
          </div>
        </div>
      </div>
    );
  }

  // Question modal
  if (showQuestion && currentGate) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-pink-200 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Unlock the Gate</h3>
            <p className="text-lg text-slate-700 mb-6">{currentGate.question}</p>
          </div>
          
          <div className="space-y-3 mb-6">
            {currentGate.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedAnswer(index)}
                className={`w-full p-4 rounded-xl text-left transition-all duration-300 cursor-pointer border-2 ${
                  selectedAnswer === index
                    ? 'bg-pink-100 border-pink-400 text-pink-800'
                    : 'bg-white hover:bg-pink-50 border-pink-200 hover:border-pink-300'
                }`}
              >
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
              </button>
            ))}
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleQuestionAnswer}
              disabled={selectedAnswer === null}
              className={`px-8 py-3 rounded-xl font-semibold transform transition-all duration-300 shadow-lg ${
                selectedAnswer === null
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:scale-105 cursor-pointer'
              }`}
            >
              Submit Answer
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-slate-500">
              Wrong answer will cost you 1 life!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 p-4">
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {generateConfetti()}
        </div>
      )}

      {/* Game Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Love Maze</h3>
                <p className="text-sm text-slate-600">Game 1 of 4</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span className="text-red-600 font-semibold">{formatTime(timeLeft)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-pink-500" />
                <span className="text-pink-600 font-semibold">{score}</span>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(3)].map((_, i) => (
                  <Heart 
                    key={i} 
                    className={`w-5 h-5 ${i < lives ? 'text-red-500 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Love Maze Challenge</h2>
            <p className="text-slate-600">Navigate to the finish while avoiding guards!</p>
          </div>
          
          {/* Maze Grid */}
          <div className="grid grid-cols-15 gap-0 max-w-2xl mx-auto mb-6 bg-slate-100 p-4 rounded-2xl" style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}>
            {maze.map((row, y) =>
              row.map((cell, x) => {
                const isPlayer = playerPos.x === x && playerPos.y === y;
                const guard = guards.find(g => g.x === x && g.y === y);
                const gate = gates.find(g => g.x === x && g.y === y);
                
                return (
                  <div
                    key={`${x}-${y}`}
                    className={`
                      aspect-square flex items-center justify-center text-xs font-bold relative
                      ${cell === 1 ? 'bg-slate-800' : 'bg-white'}
                      ${cell === 2 ? 'bg-gradient-to-br from-pink-200 to-rose-200' : ''}
                      ${gate && !gate.isOpen ? 'bg-purple-200' : ''}
                      ${gate && gate.isOpen ? 'bg-green-200' : ''}
                    `}
                  >
                    {isPlayer && <span className="text-lg">❤️</span>}
                    {guard && <span className="text-lg">💔</span>}
                    {cell === 2 && !isPlayer && <span className="text-lg">🏁</span>}
                    {gate && !gate.isOpen && !isPlayer && <span className="text-lg">🔒</span>}
                    {gate && gate.isOpen && !isPlayer && <span className="text-lg">🔓</span>}
                    {x === 1 && y === 13 && !isPlayer && <span className="text-xs">START</span>}
                  </div>
                );
              })
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex justify-center mb-6 md:hidden">
            <div className="grid grid-cols-3 gap-2">
              <div></div>
              <button
                onClick={() => movePlayer('up')}
                className="bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition-colors cursor-pointer"
              >
                <ArrowUp className="w-6 h-6" />
              </button>
              <div></div>
              <button
                onClick={() => movePlayer('left')}
                className="bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div></div>
              <button
                onClick={() => movePlayer('right')}
                className="bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
              <div></div>
              <button
                onClick={() => movePlayer('down')}
                className="bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition-colors cursor-pointer"
              >
                <ArrowDown className="w-6 h-6" />
              </button>
              <div></div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              Use arrow keys (desktop) or buttons (mobile) to move • Avoid guards • Answer questions to unlock gates
            </p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-4xl mx-auto mt-6 text-center">
        <button
          onClick={onBack}
          className="bg-white/50 backdrop-blur-sm text-slate-700 px-8 py-3 rounded-xl font-medium hover:bg-white/70 transition-all cursor-pointer border border-white/30"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

export default LoveMazeGame;