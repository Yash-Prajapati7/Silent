import React from 'react';
import { Users, Plus } from 'lucide-react';
import { useIsDarkMode } from '../stores/themeStore';
import { useSetState, APP_STATES } from '../stores/appStore';

const HomeScreen = () => {
  const isDarkMode = useIsDarkMode();
  const setState = useSetState();

  const handleJoinRoom = () => {
    setState(APP_STATES.JOINING);
  };

  const handleCreateRoom = () => {
    setState(APP_STATES.CREATING);
  };

  return (
    <div className={`
      min-h-screen flex items-center justify-center px-4 relative overflow-hidden
      ${isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-black'
      }
    `}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo/Title */}
        <div className="text-center">
          <div className="mb-6">
            <div className={`
              w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6
              ${isDarkMode 
                ? 'bg-white shadow-2xl' 
                : 'bg-white shadow-xl'
              }
            `}>
              <Users className="w-10 h-10 text-black" />
            </div>
          </div>
          <h1 className={`
            text-5xl md:text-7xl font-bold mb-4 tracking-tight
            ${isDarkMode ? 'text-white' : 'text-gray-900'}
          `}>
            Silent<span className={`
              ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'}
            `}>Chat</span>
          </h1>
          <p className={`
            text-xl font-medium
            ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
          `}>
            Anonymous • Ephemeral • Secure
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-6">
          <button
            onClick={handleJoinRoom}
            className={`
              w-full py-5 px-8 rounded-2xl font-bold text-lg
              transition-all duration-300 transform hover:scale-105 active:scale-95
              flex items-center justify-center gap-3 group
              ${isDarkMode
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
              }
              shadow-2xl hover:shadow-3xl backdrop-blur-lg
            `}
          >
            <Users className="w-6 h-6 transition-transform duration-300" />
            Join Room
          </button>

          <button
            onClick={handleCreateRoom}
            className={`
              w-full py-5 px-8 rounded-2xl font-bold text-lg
              transition-all duration-300 transform hover:scale-105 active:scale-95
              flex items-center justify-center gap-3 group
              ${isDarkMode
                ? 'bg-gray-800/80 text-white hover:bg-gray-700/80 border-2 border-gray-600/50'
                : 'bg-white/80 text-gray-900 hover:bg-gray-50/80 border-2 border-gray-300/50'
              }
              backdrop-blur-lg shadow-xl hover:shadow-2xl
            `}
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            Create Room
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-8">
          <p className={`
            text-sm
            ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}
          `}>
            Secure • Anonymous • Self-destructing
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
