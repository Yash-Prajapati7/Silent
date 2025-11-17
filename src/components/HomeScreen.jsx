import React, { useState } from 'react';
import { Users, Plus, ArrowLeft, Dice6, Loader2, Github, HelpCircle } from 'lucide-react';
import { useIsDarkMode } from '../stores/themeStore';
import { useSetState, useSetUserData, APP_STATES } from '../stores/appStore';
import { apiService } from '../services/api';
import ThemeToggle from './ThemeToggle';
import Modal from './Modal';

const HomeScreen = () => {
  const isDarkMode = useIsDarkMode();
  const setState = useSetState();
  const setUserData = useSetUserData();
  
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [nextAction, setNextAction] = useState(''); // 'create' or 'join'
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);

  const handleJoinRoom = () => {
    // For joining, go directly to the JOIN modal (which will ask for room ID/password first)
    setState(APP_STATES.JOINING);
  };

  const handleCreateRoom = () => {
    // For creating, ask for username first
    setNextAction('create');
    setShowUsernameInput(true);
  };

  const generateRandomName = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getRandomNames(10);
      if (response.success && response.names.length > 0) {
        setUserName(response.names[0]);
      }
    } catch (error) {
      setError('Failed to generate random name');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError('Username is required');
      return;
    }

    // Store username in global state
    setUserData({ userName: userName.trim() });
    
    // Navigate to appropriate flow
    if (nextAction === 'create') {
      setState(APP_STATES.CREATING);
    } else {
      setState(APP_STATES.JOINING);
    }
  };

  const handleBack = () => {
    setShowUsernameInput(false);
    setNextAction('');
    setUserName('');
    setError('');
  };

  return (
    <div className={`
      min-h-screen flex items-center justify-center px-4 relative overflow-hidden
      ${isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-black'
      }
    `}>
      {/* Top-right corner controls */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
        {/* GitHub Button */}
        <div className="relative group">
          <button
            onClick={() => window.open('https://github.com/Yash-Prajapati7', '_blank')}
            className={`
              p-3 rounded-xl transition-all duration-200 hover:scale-105
              ${isDarkMode
                ? 'text-white hover:bg-white/10 bg-gray-800/30 backdrop-blur-lg'
                : 'text-black hover:bg-black/10 bg-white/30 backdrop-blur-lg'
              }
              shadow-lg hover:shadow-xl
            `}
            title="Visit GitHub Profile"
          >
            <Github className="w-5 h-5" />
          </button>
          
          {/* Tooltip */}
          <div className={`
            absolute top-full right-0 mt-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10
            ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'}
          `}>
            Yash-Prajapati7
            <div className={`absolute bottom-full right-2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent ${isDarkMode ? 'border-b-gray-800' : 'border-b-gray-900'}`}></div>
          </div>
        </div>

        {/* FAQ Button */}
        <div className="relative group">
          <button
            onClick={() => setShowFAQModal(true)}
            className={`
              p-3 rounded-xl transition-all duration-200 hover:scale-105
              ${isDarkMode
                ? 'text-white hover:bg-white/10 bg-gray-800/30 backdrop-blur-lg'
                : 'text-black hover:bg-black/10 bg-white/30 backdrop-blur-lg'
              }
              shadow-lg hover:shadow-xl
            `}
            title="FAQs & About"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          
          {/* Tooltip */}
          <div className={`
            absolute top-full right-0 mt-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10
            ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'}
          `}>
            FAQs & About
            <div className={`absolute bottom-full right-2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent ${isDarkMode ? 'border-b-gray-800' : 'border-b-gray-900'}`}></div>
          </div>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle inline={true} />
      </div>
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

        {/* Content */}
        {!showUsernameInput ? (
          /* Buttons */
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
        ) : (
          /* Username Input Form */
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <button
                onClick={handleBack}
                className={`
                  p-2 rounded-lg transition-colors duration-200
                  ${isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-white/10'
                    : 'text-gray-700 hover:text-black hover:bg-black/10'
                  }
                `}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className={`
                text-2xl font-bold
                ${isDarkMode ? 'text-white' : 'text-gray-900'}
              `}>
                Choose Username
              </h2>
            </div>

            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your username"
                    className={`
                      flex-1 px-4 py-3 rounded-lg border-2 transition-colors duration-200
                      ${isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-white focus:bg-gray-700'
                        : 'bg-white border-gray-300 text-black placeholder-gray-500 focus:border-black focus:bg-gray-50'
                      }
                      focus:outline-none
                    `}
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={generateRandomName}
                    disabled={isLoading}
                    className={`
                      px-4 py-3 rounded-lg border-2 transition-colors duration-200
                      ${isDarkMode
                        ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700'
                        : 'bg-white border-gray-300 text-black hover:bg-gray-50'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Dice6 className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!userName.trim()}
                className={`
                  w-full py-3 px-6 rounded-lg font-medium transition-all duration-200
                  ${isDarkMode
                    ? 'bg-white text-black hover:bg-gray-100 disabled:bg-gray-600 disabled:text-gray-400'
                    : 'bg-black text-white hover:bg-gray-900 disabled:bg-gray-300 disabled:text-gray-500'
                  }
                  disabled:cursor-not-allowed
                `}
              >
                {nextAction === 'create' ? 'Continue to Create Room' : 'Continue to Join Room'}
              </button>
            </form>
          </div>
        )}

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

      {/* FAQ Modal */}
      <Modal
        isOpen={showFAQModal}
        onClose={() => setShowFAQModal(false)}
        title="FAQs & About"
      >
        <div className="space-y-6">
          {/* FAQs */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Frequently Asked Questions
            </h3>
            <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>
                <strong>Data Deletion:</strong> Chat and room data gets automatically deleted either when the room is ended by the creator or after 2 hours of inactivity.
              </li>
              <li>
                <strong>File Uploads:</strong> Files uploaded in chats are automatically deleted after 60 minutes. Maximum file size is 100MB per file.
              </li>
              <li>
                <strong>Encryption:</strong> The data is encrypted in the database.
              </li>
              <li>
                <strong>Anonymity:</strong> It is completely anonymous (unless you keep a guessable username, pun intended).
              </li>
              <li>
                <strong>Pricing:</strong> Free forever.
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HomeScreen;
