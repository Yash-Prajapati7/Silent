import React, { useState } from 'react';
import { 
  Users, Plus, ArrowLeft, Dice6, Loader2, Github, HelpCircle, 
  Sparkles, ShieldCheck, MessageSquare, MessageCircle, Send 
} from 'lucide-react';
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
    setState(APP_STATES.JOINING);
  };

  const handleCreateRoom = () => {
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

    setUserData({ userName: userName.trim() });
    
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

  // Neobrutalist border color based on theme
  const strokeColor = isDarkMode ? '#FAFAFA' : '#111111';

  return (
    <div className={`
      min-h-screen flex items-center justify-center px-4 py-6 sm:py-10 relative overflow-hidden
      ${isDarkMode 
        ? 'bg-[#000000] text-[#FAFAFA] neo-grid-bg' 
        : 'bg-[#f4f0ec] text-[#111111] neo-grid-bg-light'
      }
    `}>
      {/* Existing Decorative SVG dribbles */}
      <svg className="absolute top-6 left-2 w-28 h-28 sm:w-40 sm:h-40 opacity-80 pointer-events-none" viewBox="0 0 200 200" aria-hidden="true">
        <path d="M37.8,-58.4C48.3,-52.8,55.7,-40.4,63.2,-27.8C70.8,-15.2,78.4,-2.3,76.2,9.7C74.1,21.8,62.2,33,50.4,40.7C38.6,48.5,27,52.8,14.2,60.1C1.4,67.4,-12.7,77.7,-24.3,74.2C-36,70.7,-45.2,53.5,-54,39.1C-62.9,24.6,-71.3,12.3,-72.7,-0.8C-74.2,-13.9,-68.7,-27.8,-60.2,-39.3C-51.7,-50.9,-40.2,-60.1,-27.8,-64.9C-15.4,-69.6,-2.2,-69.8,10.6,-67.2C23.3,-64.6,46.7,-59.1,37.8,-58.4Z" transform="translate(100 100)" fill={isDarkMode ? '#d7c9ff' : '#ff2d2d'} />
      </svg>
      <svg className="absolute bottom-4 right-2 w-24 h-24 sm:w-36 sm:h-36 opacity-80 pointer-events-none" viewBox="0 0 200 200" aria-hidden="true">
        <path d="M49.3,-45.9C63.1,-35.5,73.1,-17.8,74.4,1.2C75.8,20.1,68.4,40.2,54.6,49.7C40.9,59.3,20.4,58.4,3.2,55.2C-14,52,-28,46.4,-38.6,36.8C-49.2,27.1,-56.5,13.5,-58.2,-1.7C-59.9,-16.9,-56.1,-33.7,-45.5,-44.1C-34.9,-54.4,-17.5,-58.2,0.2,-58.4C17.8,-58.6,35.6,-55.2,49.3,-45.9Z" transform="translate(100 100)" fill={isDarkMode ? '#b7f5cb' : '#2f60ff'} />
      </svg>

      {/* --- NEW: Floating Chat Elements --- */}
      <MessageSquare className={`absolute top-[20%] left-[25%] w-10 h-10 -rotate-12 opacity-30 pointer-events-none ${isDarkMode ? 'text-[#ffe500]' : 'text-[#ff2d2d]'}`} />
      <MessageCircle className={`absolute bottom-[20%] right-[25%] w-14 h-14 rotate-12 opacity-30 pointer-events-none ${isDarkMode ? 'text-[#b7f5cb]' : 'text-[#2f60ff]'}`} />
      <Send className={`absolute top-[30%] right-[30%] w-8 h-8 rotate-45 opacity-30 pointer-events-none ${isDarkMode ? 'text-[#ff2d2d]' : 'text-[#ffe500]'}`} />

      {/* --- NEW: Left Background Illustration (Person 1) --- */}
      <div className="hidden lg:block absolute left-8 xl:left-20 top-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-90 transition-transform hover:scale-105">
        <svg width="220" height="260" viewBox="0 0 250 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Chat Bubble */}
          <path d="M80 50 C80 20 220 20 220 50 C220 80 180 100 150 100 L120 120 L120 100 C90 100 80 80 80 50 Z" 
                fill="#ffe500" stroke={strokeColor} strokeWidth="8" strokeLinejoin="round"/>
          <circle cx="125" cy="55" r="8" fill="#111111" />
          <circle cx="150" cy="55" r="8" fill="#111111" />
          <circle cx="175" cy="55" r="8" fill="#111111" />
          {/* Person Head */}
          <rect x="20" y="160" width="100" height="100" rx="20" 
                fill="#ff2d2d" stroke={strokeColor} strokeWidth="8" />
          {/* Eyes */}
          <rect x="40" y="190" width="20" height="20" rx="10" fill="#111111" />
          <rect x="80" y="190" width="20" height="20" rx="10" fill="#111111" />
          {/* Mouth */}
          <path d="M50 230 Q70 250 90 230" stroke="#111111" strokeWidth="6" strokeLinecap="round"/>
        </svg>
      </div>

      {/* --- NEW: Right Background Illustration (Person 2) --- */}
      <div className="hidden lg:block absolute right-8 xl:right-20 top-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-90 transition-transform hover:scale-105">
        <svg width="220" height="260" viewBox="0 0 250 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Chat Bubble */}
          <path d="M30 100 C30 70 170 70 170 100 C170 130 130 150 100 150 L70 170 L70 150 C40 150 30 130 30 100 Z" 
                fill="#b7f5cb" stroke={strokeColor} strokeWidth="8" strokeLinejoin="round"/>
          <path d="M70 95 L130 95 M70 115 L110 115" stroke="#111111" strokeWidth="8" strokeLinecap="round"/>
          {/* Person Head */}
          <circle cx="180" cy="220" r="50" 
                fill="#2f60ff" stroke={strokeColor} strokeWidth="8" />
          {/* Eyes */}
          <rect x="155" y="200" width="15" height="15" rx="7.5" fill="#FAFAFA" />
          <rect x="190" y="200" width="15" height="15" rx="7.5" fill="#FAFAFA" />
          {/* Glasses Line */}
          <path d="M145 207 L215 207" stroke="#FAFAFA" strokeWidth="4" />
        </svg>
      </div>

      {/* Top-right corner controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <div className="relative group">
          <button
            onClick={() => window.open('https://github.com/Yash-Prajapati7', '_blank')}
            className={`
              neo-btn p-2.5 border-2 transition-colors duration-200
              ${isDarkMode
                ? 'text-[#FAFAFA] border-white bg-[#111111] neo-dark hover:bg-[#2f60ff]'
                : 'text-[#111111] border-black bg-[#fffaf5] neo-light hover:bg-[#ffe500]'
              }
            `}
            title="Visit GitHub Profile"
          >
            <Github className="w-5 h-5" />
          </button>
          
          <div className={`
            absolute top-full right-0 mt-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 border-2
            ${isDarkMode ? 'bg-[#111111] text-[#FAFAFA] border-white' : 'bg-[#fffaf5] text-[#111111] border-black'}
          `}>
            Yash-Prajapati7
          </div>
        </div>

        <div className="relative group">
          <button
            onClick={() => setShowFAQModal(true)}
            className={`
              neo-btn p-2.5 border-2 transition-colors duration-200
              ${isDarkMode
                ? 'text-[#FAFAFA] border-white bg-[#111111] neo-dark hover:bg-[#ff2d2d]'
                : 'text-[#111111] border-black bg-[#fffaf5] neo-light hover:bg-[#ffc2a6]'
              }
            `}
            title="FAQs & About"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          
          <div className={`
            absolute top-full right-0 mt-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 border-2
            ${isDarkMode ? 'bg-[#111111] text-[#FAFAFA] border-white' : 'bg-[#fffaf5] text-[#111111] border-black'}
          `}>
            FAQs & About
          </div>
        </div>

        <ThemeToggle inline={true} />
      </div>

      {/* Main Card */}
      <div className={`max-w-md w-full space-y-7 relative z-10 p-5 sm:p-7 neo-card ${isDarkMode ? 'border-white bg-[#101010]/95 neo-dark' : 'border-black bg-[#fffaf5] neo-light'}`}>

        {/* Title */}
        <div className="text-center">
          <h1 className={`
            text-5xl sm:text-6xl md:text-7xl font-extrabold mb-4 tracking-tight
            ${isDarkMode ? 'text-[#FAFAFA]' : 'text-[#111111]'}
          `}>
            SilentChat
          </h1>
          <p className={`
            text-base sm:text-lg font-medium
            ${isDarkMode ? 'text-[#d7c9ff]' : 'text-[#2f60ff]'}
          `}>
            Anonymous • Ephemeral • Secure
          </p>
        </div>

        {/* Content */}
        {!showUsernameInput ? (
          <div className="space-y-4 relative z-20">
            <button
              onClick={handleJoinRoom}
              className={`
                w-full py-4 px-6 neo-btn font-bold text-lg
                flex items-center justify-center gap-3 border-2
                ${isDarkMode
                  ? 'bg-[#ffe500] text-[#111111] border-white neo-dark hover:bg-[#ffcf00]'
                  : 'bg-[#2f60ff] text-[#ffffff] border-black neo-light hover:bg-[#1f4df0]'
                }
              `}
            >
              <Users className="w-5 h-5" />
              Join Room
            </button>

            <button
              onClick={handleCreateRoom}
              className={`
                w-full py-4 px-6 neo-btn font-bold text-lg
                flex items-center justify-center gap-3 border-2
                ${isDarkMode
                  ? 'bg-[#ff2d2d] text-white border-white neo-dark hover:bg-[#e72424]'
                  : 'bg-[#b7f5cb] text-[#111111] border-black neo-light hover:bg-[#9cedb6]'
                }
              `}
            >
              <Plus className="w-5 h-5" />
              Create Room
            </button>
          </div>
        ) : (
          <div className="space-y-6 relative z-20">
            <div className="flex items-center space-x-3 mb-6">
              <button
                onClick={handleBack}
                className={`
                  p-2.5 neo-btn border-2 transition-colors duration-200
                  ${isDarkMode
                    ? 'text-[#FAFAFA] bg-[#111111] border-white neo-dark hover:bg-[#2f60ff]'
                    : 'text-[#111111] bg-[#fffaf5] border-black neo-light hover:bg-[#ffe500]'
                  }
                `}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className={`
                text-xl font-extrabold tracking-tight
                ${isDarkMode ? 'text-[#FAFAFA]' : 'text-[#111111]'}
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
                      flex-1 px-4 py-3 rounded-md border-2 transition-colors duration-200 font-medium
                      ${isDarkMode
                        ? 'bg-[#111111] border-white text-[#FAFAFA] placeholder-[#9ca3af] focus:border-[#ffe500]'
                        : 'bg-[#fffaf5] border-black text-[#111111] placeholder-[#6b7280] focus:border-[#2f60ff]'
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
                      px-4 py-3 rounded-md border-2 neo-btn transition-colors duration-200
                      ${isDarkMode
                        ? 'bg-[#2f60ff] border-white text-[#FAFAFA] neo-dark hover:bg-[#2450df]'
                        : 'bg-[#ffe500] border-black text-[#111111] neo-light hover:bg-[#ffdf00]'
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
                  w-full py-4 px-6 rounded-md font-bold text-lg neo-btn transition-all duration-200 border-2
                  ${isDarkMode
                    ? 'bg-[#b7f5cb] text-[#111111] border-white neo-dark hover:bg-[#9cedb6] disabled:bg-[#3f3f46] disabled:text-[#a1a1aa]'
                    : 'bg-[#ff2d2d] text-[#ffffff] border-black neo-light hover:bg-[#ea2525] disabled:bg-[#d4d4d8] disabled:text-[#6b7280]'
                  }
                  disabled:cursor-not-allowed
                `}
              >
                {nextAction === 'create' ? 'Continue to Create' : 'Continue to Join'}
              </button>
            </form>
          </div>
        )}

        <div className="text-center pt-4 border-t-2 relative z-20" style={{ borderColor: isDarkMode ? '#ffffff' : '#111111' }}>
          <p className={`
            text-sm font-semibold flex items-center justify-center gap-2
            ${isDarkMode ? 'text-[#ffc2a6]' : 'text-[#ff2d2d]'}
          `}>
            <ShieldCheck className="w-4 h-4" />
            Secure • Anonymous • Self-destructing
          </p>
        </div>
      </div>

      <Modal
        isOpen={showFAQModal}
        onClose={() => setShowFAQModal(false)}
        title="FAQs & About"
      >
        <div className="space-y-6">
          <div>
            <h3 className={`text-lg font-extrabold mb-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Frequently Asked Questions
            </h3>
            <ul className={`space-y-2 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
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