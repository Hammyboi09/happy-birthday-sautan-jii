import React, { useState, useRef } from 'react';
import { Heart, User, Camera, Square, Brain, HelpCircle, Clock } from 'lucide-react';

interface LoveWelcomeProps {
  onStartJourney: () => void;
}

const LoveWelcome: React.FC<LoveWelcomeProps> = ({ onStartJourney }) => {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgb(254, 242, 242)' }}
    >
      <div className="max-w-3xl w-full">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/30">
          {/* Heart Icon */}
          <div className="text-center mb-10">
            <Heart className="w-20 h-20 mx-auto text-pink-500 mb-6" />
            <h1 className="text-5xl font-bold text-slate-800 mb-6">
              Welcome to Love Path!
            </h1>
            <p className="text-slate-600 text-xl leading-relaxed max-w-2xl mx-auto">
              Embark on a romantic journey through 4 heartwarming games. Each victory brings you closer to the ultimate love celebration!
            </p>
          </div>

          {/* Player Character Section */}
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Your Player Character</h2>
            <div className="flex items-center justify-center space-x-6">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center border-3 border-pink-300 overflow-hidden">
                {userPhoto ? (
                  <img 
                    src={userPhoto} 
                    alt="User avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-pink-600" />
                )}
              </div>
              <button 
                onClick={triggerFileInput}
                className="bg-pink-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors cursor-pointer flex items-center space-x-2 text-lg"
              >
                <Camera className="w-5 h-5" />
                <span>Add Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Game Cards Grid */}
          <div className="grid grid-cols-2 gap-6 mb-10">
            {/* Love Maze */}
            <div className="bg-pink-100 border-3 border-pink-300 rounded-2xl p-8 text-center">
              <Heart className="w-12 h-12 mx-auto text-slate-700 mb-4" />
              <h3 className="font-semibold text-slate-800 mb-2 text-lg">Love Maze</h3>
              <p className="text-slate-600 text-base">5:00</p>
            </div>

            {/* Memory Match */}
            <div className="bg-slate-100 border-3 border-slate-300 rounded-2xl p-8 text-center">
              <Brain className="w-12 h-12 mx-auto text-slate-700 mb-4" />
              <h3 className="font-semibold text-slate-800 mb-2 text-lg">Memory Match</h3>
              <p className="text-slate-600 text-base">0:45</p>
            </div>

            {/* Romance Quiz */}
            <div className="bg-slate-100 border-3 border-slate-300 rounded-2xl p-8 text-center">
              <HelpCircle className="w-12 h-12 mx-auto text-slate-700 mb-4" />
              <h3 className="font-semibold text-slate-800 mb-2 text-lg">Romance Quiz</h3>
              <p className="text-slate-600 text-base">1:15</p>
            </div>

            {/* Love Balloon Pop */}
            <div className="bg-slate-100 border-3 border-slate-300 rounded-2xl p-8 text-center">
              <Clock className="w-12 h-12 mx-auto text-slate-700 mb-4" />
              <h3 className="font-semibold text-slate-800 mb-2 text-lg">Love Balloon Pop</h3>
              <p className="text-slate-600 text-base">0:30</p>
            </div>
          </div>

          {/* Total Points */}
          <div className="text-center mb-10">
            <p className="text-2xl font-semibold text-slate-800">Total Points: 0</p>
          </div>

          {/* Begin Button */}
          <div className="text-center">
            <button
              onClick={onStartJourney}
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-16 py-5 rounded-2xl text-2xl font-bold hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
            >
              Begin Love Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoveWelcome;