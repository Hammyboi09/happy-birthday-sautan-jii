import React, { useState, useEffect } from 'react';
import { Crown, Clock, Trophy, Target, HelpCircle, Zap } from 'lucide-react';

interface BonusBalloonGameProps {
  onComplete: () => void;
  onBack: () => void;
}

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
  speedX: number;
  speedY: number;
  size: number;
  isPopped: boolean;
}

const BonusBalloonGame: React.FC<BonusBalloonGameProps> = ({ onComplete, onBack }) => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showRules, setShowRules] = useState(true);
  const [rulesTimer, setRulesTimer] = useState(10);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownTimer, setCountdownTimer] = useState(3);
  const [gameReady, setGameReady] = useState(false);
  const [showWinScreen, setShowWinScreen] = useState(false);
  const [winTimer, setWinTimer] = useState(5);
  const [attempts, setAttempts] = useState(1);
  const [showRetryScreen, setShowRetryScreen] = useState(false);
  const [retryTimer, setRetryTimer] = useState(4);
  const [totalBalloons] = useState(20); // Fixed number of balloons
  const [balloonsPopped, setBalloonsPopped] = useState(0);

  const colors = ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB347', '#98FB98'];

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
      initializeGame();
    }
  }, [showCountdown, countdownTimer]);

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

  const generateBalloon = (id: number): Balloon => {
    return {
      id,
      x: Math.random() * 80 + 10, // Keep balloons away from edges
      y: Math.random() * 70 + 15, // Keep balloons away from edges
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 4, // Random horizontal speed
      speedY: (Math.random() - 0.5) * 4, // Random vertical speed
      size: 40 + Math.random() * 20, // Random size between 40-60px
      isPopped: false
    };
  };

  const initializeGame = () => {
    // Generate fixed number of balloons
    const newBalloons = Array.from({ length: totalBalloons }, (_, i) => generateBalloon(i));
    setBalloons(newBalloons);
    setScore(0);
    setTimeLeft(15);
    setBalloonsPopped(0);
    setGameActive(true);
    setGameCompleted(false);
  };

  const resetGame = () => {
    setAttempts(prev => prev + 1);
    setRetryTimer(4);
    initializeGame();
  };

  const popBalloon = (balloonId: number) => {
    if (!gameActive) return;

    setBalloons(prevBalloons => 
      prevBalloons.map(balloon => 
        balloon.id === balloonId && !balloon.isPopped
          ? { ...balloon, isPopped: true }
          : balloon
      )
    );

    const balloon = balloons.find(b => b.id === balloonId);
    if (balloon && !balloon.isPopped) {
      setScore(prev => prev + 1);
      setBalloonsPopped(prev => prev + 1);
      playSound(800, 0.1);
    }
  };

  const playSound = (frequency: number, duration: number) => {
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
      const audioContext = new (AudioContext || webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    }
  };

  // Game loop for balloon movement and timer
  useEffect(() => {
    if (!gameActive || gameCompleted) return;

    // Separate interval for balloon movement (every 100ms for smooth animation)
    const movementInterval = setInterval(() => {
      // Move balloons
      setBalloons(prevBalloons => 
        prevBalloons.map(balloon => {
          if (balloon.isPopped) return balloon;

          let newX = balloon.x + balloon.speedX;
          let newY = balloon.y + balloon.speedY;
          let newSpeedX = balloon.speedX;
          let newSpeedY = balloon.speedY;

          // Bounce off walls
          if (newX <= 5 || newX >= 90) {
            newSpeedX = -newSpeedX;
            newX = Math.max(5, Math.min(90, newX));
          }
          if (newY <= 5 || newY >= 85) {
            newSpeedY = -newSpeedY;
            newY = Math.max(5, Math.min(85, newY));
          }

          return {
            ...balloon,
            x: newX,
            y: newY,
            speedX: newSpeedX,
            speedY: newSpeedY
          };
        })
      );
    }, 100); // Update balloon positions every 100ms

    // Separate interval for timer (every 1000ms for actual seconds)
    const timerInterval = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          setGameActive(false);
          setGameCompleted(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000); // Update timer every 1000ms (1 second)

    return () => {
      clearInterval(movementInterval);
      clearInterval(timerInterval);
    };
  }, [gameActive, gameCompleted]);

  // Check game completion
  useEffect(() => {
    if (gameCompleted) {
      const canContinue = score >= 10; // Need 10+ points to continue
      if (canContinue) {
        setTimeout(() => {
          setShowWinScreen(true);
        }, 1000);
      } else {
        setTimeout(() => {
          setShowRetryScreen(true);
        }, 1000);
      }
    }
  }, [gameCompleted, score]);

  // Rules popup
  if (showRules) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 max-w-4xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Bonus Balloon Pop</h3>
                <p className="text-sm text-slate-600">Game 4 of 4</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span className="text-red-600 font-semibold">0:15</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-600 font-semibold">0</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <span className="text-2xl">🎈</span>
              <h3 className="text-2xl font-bold text-slate-800">Bonus Balloon Pop Rules</h3>
            </div>
            <div className="text-xl font-semibold text-red-600">
              Starting in {rulesTimer} seconds...
            </div>
          </div>

          {/* Main Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Game Objective */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <Target className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="text-lg font-semibold text-blue-800">Game Objective</h4>
              </div>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Pop as many balloons as possible</li>
                <li>• 20 balloons total in the container</li>
                <li>• Click or tap balloons to pop them</li>
                <li>• Balloons move around the container</li>
              </ul>
            </div>

            {/* Time Limit */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <Clock className="w-5 h-5 text-red-600 mr-2" />
                <h4 className="text-lg font-semibold text-red-800">Time Limit</h4>
              </div>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• You have exactly 15 seconds</li>
                <li>• Timer starts immediately after countdown</li>
                <li>• Game ends when timer reaches 0</li>
                <li>• No time extensions available</li>
              </ul>
            </div>

            {/* Scoring System */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <Trophy className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="text-lg font-semibold text-green-800">Scoring System</h4>
              </div>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Each balloon popped = 1 point</li>
                <li>• No bonus points or multipliers</li>
                <li>• Maximum possible score: 20 points</li>
                <li>• Need 10+ points to advance</li>
              </ul>
            </div>

            {/* Balloon Movement */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <Zap className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="text-lg font-semibold text-purple-800">Balloon Movement</h4>
              </div>
              <ul className="text-purple-700 text-sm space-y-1">
                <li>• Balloons move in random directions</li>
                <li>• They bounce off container walls</li>
                <li>• Different speeds for each balloon</li>
                <li>• Popped balloons stop moving</li>
              </ul>
            </div>
          </div>

          {/* Game Flow */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6 border border-yellow-200">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">🎯</span>
              <h4 className="text-xl font-bold text-slate-800">Game Flow</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <h5 className="font-semibold text-slate-800 mb-1">Setup</h5>
                <p className="text-sm text-slate-600">20 balloons appear in container</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold text-green-600">2</span>
                </div>
                <h5 className="font-semibold text-slate-800 mb-1">Start Timer</h5>
                <p className="text-sm text-slate-600">15-second countdown begins</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <h5 className="font-semibold text-slate-800 mb-1">Pop Balloons</h5>
                <p className="text-sm text-slate-600">Click/tap moving balloons</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold text-yellow-600">4</span>
                </div>
                <h5 className="font-semibold text-slate-800 mb-1">Win Condition</h5>
                <p className="text-sm text-slate-600">Score 10+ points to advance</p>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">💡</span>
              <h4 className="text-lg font-bold text-slate-800">Pro Tips</h4>
            </div>
            <ul className="text-slate-700 text-sm space-y-1">
              <li>• Focus on balloons moving slowly or in predictable patterns</li>
              <li>• Click slightly ahead of fast-moving balloons</li>
              <li>• Don't panic - 15 seconds is enough time with good strategy</li>
              <li>• Larger balloons are easier targets but worth the same points</li>
              <li>• Practice your clicking/tapping speed and accuracy</li>
              <li>• Each retry gives you the same 20 balloons to practice with</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Countdown screen
  if (showCountdown) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 text-center">
          <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 mb-4 animate-pulse">
            {countdownTimer}
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-4">Get Ready!</h3>
          <p className="text-xl text-slate-600">Balloon popping challenge starting soon...</p>
          <div className="flex justify-center space-x-4 mt-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-8 rounded-full animate-bounce"
                style={{
                  backgroundColor: ['#FF6B9D', '#4ECDC4', '#45B7D1'][i],
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Retry screen for failed attempts
  if (showRetryScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 text-center relative overflow-hidden max-w-2xl w-full">
          <div className="text-6xl mb-4">🎈</div>
          <h3 className="text-4xl font-bold text-slate-800 mb-4">
            Keep Popping, Royal Challenger!
          </h3>
          <div className="text-2xl font-semibold text-slate-600 mb-4">
            Attempt #{attempts}
          </div>
          <div className="text-xl font-bold text-slate-800 mb-6">
            Score: {score} points ({balloonsPopped}/{totalBalloons} balloons popped)
          </div>
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6 mb-6 border border-blue-200">
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              You need <strong>10+ points</strong> to complete the royal challenge.
            </p>
            <p className="text-slate-600">
              You popped {balloonsPopped} out of {totalBalloons} balloons. Focus on your clicking speed and accuracy!
            </p>
          </div>
          
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              New challenge starting in {retryTimer} seconds...
            </div>
            <p className="text-sm text-slate-500">
              Fresh balloons will be loaded for your next attempt
            </p>
          </div>
          
          <div className="text-sm text-slate-500">
            💡 <strong>Pro Tip:</strong> Click slightly ahead of fast-moving balloons to catch them!
          </div>
        </div>
      </div>
    );
  }

  // Win screen
  if (showWinScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 text-center relative overflow-hidden max-w-2xl w-full">
          <div className="text-6xl mb-4">🎈</div>
          <h3 className="text-4xl font-bold text-slate-800 mb-4">
            Balloon Challenge Complete!
          </h3>
          <div className="text-4xl font-bold text-slate-800 mb-6">
            Final Score: {score} points
          </div>
          <div className="text-2xl font-semibold text-green-600 mb-6">
            Balloons Popped: {balloonsPopped}/{totalBalloons}
          </div>
          <div className="text-lg text-slate-600 mb-4">
            Attempt #{attempts}
          </div>
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 mb-6 border border-green-200">
            <p className="text-lg text-slate-700 leading-relaxed">
              Excellent reflexes! You've successfully completed the final challenge of the Crown Path. Your royal journey is now complete!
            </p>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            Completing Crown Path in {winTimer} seconds...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      {/* Game Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Bonus Balloon Pop</h3>
                <p className="text-sm text-slate-600">Game 4 of 4</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span className="text-red-600 font-semibold">{timeLeft}s</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-600 font-semibold">{score}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Royal Balloon Challenge</h2>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-slate-800 mb-4">
                Score: <span className="text-pink-500">{score} points</span>
              </div>
              <div className="text-lg text-slate-600 mb-4">
                Balloons Popped: {balloonsPopped}/{totalBalloons}
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-slate-600">Time Left: {timeLeft}s</span>
                <span className="text-sm text-slate-600">Attempt #{attempts}</span>
              </div>
            
              <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(balloonsPopped / totalBalloons) * 100}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Game Container */}
          <div className="relative h-96 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl overflow-hidden border-4 border-blue-300 mb-6">
            {balloons.map((balloon) => (
              <button
                key={balloon.id}
                onClick={() => popBalloon(balloon.id)}
                disabled={balloon.isPopped}
                className={`absolute rounded-full shadow-lg transform transition-all duration-200 cursor-pointer flex items-center justify-center font-bold text-white ${
                  balloon.isPopped 
                    ? 'opacity-30 scale-75 cursor-not-allowed' 
                    : 'hover:scale-110 hover:shadow-xl'
                }`}
                style={{
                  left: `${balloon.x}%`,
                  top: `${balloon.y}%`,
                  width: `${balloon.size}px`,
                  height: `${balloon.size}px`,
                  backgroundColor: balloon.isPopped ? '#gray' : balloon.color,
                  transform: `translate(-50%, -50%) ${balloon.isPopped ? 'scale(0.75)' : 'scale(1)'}`,
                }}
              >
                {balloon.isPopped ? '💥' : '🎈'}
              </button>
            ))}
            
            {!gameActive && !gameCompleted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6">
                  <p className="text-xl text-slate-700 mb-2">
                    Pop the moving balloons!
                  </p>
                  <p className="text-sm text-slate-600">
                    Click or tap balloons to pop them • 1 point each • Need 10+ to advance
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              Pop 10 or more balloons out of {totalBalloons} to complete the royal challenge!
            </p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-2xl mx-auto mt-6 text-center">
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

export default BonusBalloonGame;