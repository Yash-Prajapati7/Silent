import React, { useState } from 'react';
import { ArrowLeft, Lock, Loader2, Dice6 } from 'lucide-react';
import Modal from './Modal';
import { useIsDarkMode } from '../stores/themeStore';
import { 
  useCurrentState, 
  useSetState, 
  useSetRoomData,
  useSetUserData,
  useUserName,
  useUpdateParticipants, 
  useAddNotification, 
  APP_STATES 
} from '../stores/appStore';
import { apiService } from '../services/api';

const JoinRoomModal = () => {
  const isDarkMode = useIsDarkMode();
  const currentState = useCurrentState();
  const setState = useSetState();
  const setRoomData = useSetRoomData();
  const setUserData = useSetUserData();
  const userName = useUserName(); // Get username from store
  const updateParticipants = useUpdateParticipants();
  const addNotification = useAddNotification();
  const [step, setStep] = useState(1); // 1: Room ID, 2: Password (if needed), 3: Username
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [creatorPassword, setCreatorPassword] = useState('');
  const [localUserName, setLocalUserName] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [requiresCreatorPassword, setRequiresCreatorPassword] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [error, setError] = useState('');

  const isOpen = currentState === APP_STATES.JOINING;

  const generateRandomName = async () => {
    try {
      setIsGeneratingName(true);
      const response = await apiService.getRandomNames(1);
      if (response.success && response.names.length > 0) {
        setLocalUserName(response.names[0]);
        setError('');
      }
    } catch (error) {
      setError('Failed to generate random name');
    } finally {
      setIsGeneratingName(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setRoomId('');
    setPassword('');
    setCreatorPassword('');
    setLocalUserName('');
    setRequiresPassword(false);
    setRequiresCreatorPassword(false);
    setIsCreator(false);
    setError('');
    setState(APP_STATES.HOME);
  };

  const handleRoomIdSubmit = async (e) => {
    e.preventDefault();
    if (roomId.trim().length !== 4) {
      setError('Room ID must be 4 digits');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Check if room exists and requires password
      const response = await apiService.checkRoomPassword(parseInt(roomId));
      
      if (response.success) {
        if (response.hasPassword) {
          setRequiresPassword(true);
          setStep(2);
        } else {
          // Room doesn't need password, go to username step
          setStep(3);
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async (roomPassword = null, userNameToJoin = null) => {
    try {
      setIsLoading(true);
      setError('');

      const finalUserName = userNameToJoin || localUserName;
      const roomCreatorPassword = isCreator && requiresCreatorPassword ? creatorPassword.trim() : null;
      const response = await apiService.joinRoom(parseInt(roomId), finalUserName, roomPassword, roomCreatorPassword);
      
      if (response.success) {
        // Store username in global state
        setUserData({ userName: finalUserName });
        
        // Use the isCreator flag from the backend response
        setRoomData({ 
          roomId: parseInt(roomId), 
          isCreator: response.isCreator || false,
          password: requiresPassword ? roomPassword : null 
        });
        updateParticipants(response.participants || []);
        setState(APP_STATES.CHATTING);
      }
    } catch (error) {
      // Check if error is about creator password requirement
      if (error.message.includes('Creator password required')) {
        setRequiresCreatorPassword(true);
        setIsCreator(true);
        setStep(2);
        setError('');
        return;
      }
      // Check if it's an incorrect creator password error
      if (error.message.includes('Incorrect creator password')) {
        setError('Incorrect creator password. Please try again.');
        return;
      }
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (requiresCreatorPassword && !creatorPassword.trim()) {
      setError('Creator password is required');
      return;
    }
    
    if (requiresPassword && !password.trim()) {
      setError('Room password is required');
      return;
    }

    // After password validation, go to username step
    setStep(3);
  };

  const renderStep1 = () => (
    <form onSubmit={handleRoomIdSubmit}>
      <div className="space-y-4">
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Enter the 4-digit room ID to join
        </p>
        
        <input
          type="text"
          value={roomId}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
            setRoomId(value);
            setError('');
          }}
          placeholder="Room ID"
          className={`
            w-full px-4 py-3 rounded-md border text-center text-2xl font-mono
            focus:outline-none transition-colors
            ${isDarkMode
              ? 'bg-[#171717] border-zinc-800 text-[#FAFAFA] placeholder-[#A3A3A3] focus:border-zinc-500'
              : 'bg-[#F4F4F5] border-zinc-200 text-[#09090B] placeholder-[#71717A] focus:border-zinc-400'
            }
            focus:ring-1 ${isDarkMode ? 'focus:ring-zinc-500' : 'focus:ring-zinc-400'}
          `}
          maxLength={4}
          autoComplete="off"
        />
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className={`
              flex-1 py-4 px-6 rounded-md font-medium transition-colors border
              ${isDarkMode
                ? 'bg-transparent text-[#FAFAFA] hover:bg-zinc-800 border-zinc-800'
                : 'bg-transparent text-[#09090B] hover:bg-zinc-100 border-zinc-200'
              }
            `}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={roomId.length !== 4 || isLoading}
            className={`
              flex-1 py-4 px-6 rounded-md font-bold transition-colors flex items-center justify-center gap-2 border-2 neo-btn
              ${roomId.length === 4 && !isLoading
                ? isDarkMode
                  ? 'bg-[#ffe500] text-[#111111] border-white neo-dark hover:bg-[#ffdd00]'
                  : 'bg-[#2f60ff] text-[#FFFFFF] border-black neo-light hover:bg-[#2450df]'
                : 'bg-zinc-800 text-[#A3A3A3] border-zinc-700 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Room'
            )}
          </button>
        </div>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handlePasswordSubmit}>
      <div className="space-y-4">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
            requiresCreatorPassword 
              ? isDarkMode ? 'bg-green-800/20' : 'bg-green-100'
              : isDarkMode ? 'bg-yellow-800/20' : 'bg-yellow-100'
          }`}>
            <Lock className={`w-6 h-6 ${
              requiresCreatorPassword
                ? isDarkMode ? 'text-green-400' : 'text-green-600'
                : isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
            }`} />
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {requiresCreatorPassword 
              ? `Welcome back, room creator! Room ${roomId} requires your creator password.`
              : `Room ${roomId} is password protected`
            }
          </p>
        </div>
        
        {/* Room Password Input */}
        {requiresPassword && (
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="Enter room password"
            className={`
              w-full px-4 py-3 rounded-lg border-2 text-center transition-colors duration-200 font-medium
              ${isDarkMode
                ? 'bg-[#111111] border-white text-white placeholder-gray-400 focus:border-[#ffe500]'
                : 'bg-[#fffaf5] border-black text-black placeholder-gray-500 focus:border-[#2f60ff]'
              }
              focus:outline-none
            `}
            maxLength={50}
            autoComplete="off"
          />
        )}

        {/* Creator Password Input */}
        {requiresCreatorPassword && (
          <input
            type="password"
            value={creatorPassword}
            onChange={(e) => {
              setCreatorPassword(e.target.value);
              setError('');
            }}
            placeholder="Enter creator password"
            className={`
              w-full px-4 py-3 rounded-lg border-2 text-center transition-colors duration-200 font-medium
              ${isDarkMode
                ? 'bg-[#111111] border-white text-white placeholder-gray-400 focus:border-[#b7f5cb]'
                : 'bg-[#fffaf5] border-black text-black placeholder-gray-500 focus:border-[#2f60ff]'
              }
              focus:outline-none
            `}
            maxLength={50}
            autoComplete="off"
          />
        )}
        
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`
              px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2
              ${isDarkMode
                ? 'text-white hover:bg-white/10'
                : 'text-black hover:bg-black/10'
              }
            `}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <button
            type="submit"
            disabled={(requiresPassword && !password.trim()) || (requiresCreatorPassword && !creatorPassword.trim()) || isLoading}
            className={`
              flex-1 py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 border-2 neo-btn
              ${((requiresPassword && password.trim()) || (requiresCreatorPassword && creatorPassword.trim()) || (!requiresPassword && !requiresCreatorPassword)) && !isLoading
                ? isDarkMode
                  ? 'bg-[#b7f5cb] text-[#111111] border-white neo-dark hover:bg-[#9cedb6]'
                  : 'bg-[#ff2d2d] text-white border-black neo-light hover:bg-[#e72626]'
                : 'bg-gray-500 text-gray-300 border-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={async (e) => {
      e.preventDefault();
      if (!localUserName.trim()) {
        setError('Username is required');
        return;
      }
      await joinRoom(requiresPassword ? password.trim() : null, localUserName.trim());
    }}>
      <div className="space-y-4">
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Choose a username to join room <span className="font-mono font-bold">{roomId}</span>
        </p>
        
        <div className="relative">
          <input
            type="text"
            value={localUserName}
            onChange={(e) => {
              setLocalUserName(e.target.value);
              setError('');
            }}
            placeholder="Enter your username"
            className={`
                w-full px-4 py-3 pr-12 rounded-lg border-2 transition-colors duration-200 font-medium
              ${isDarkMode
                  ? 'bg-[#111111] border-white text-white placeholder-gray-400 focus:border-[#ffe500]'
                  : 'bg-[#fffaf5] border-black text-black placeholder-gray-500 focus:border-[#2f60ff]'
              }
              focus:outline-none
            `}
            maxLength={20}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={generateRandomName}
            disabled={isGeneratingName}
            className={`
              absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200
              ${isDarkMode
                ? 'text-white hover:bg-white/10 disabled:text-gray-500'
                : 'text-black hover:bg-black/10 disabled:text-gray-400'
              }
              disabled:cursor-not-allowed
            `}
            title="Generate random username"
          >
            <Dice6 className={`w-5 h-5 ${isGeneratingName ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep(requiresPassword ? 2 : 1)}
            className={`
              px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2
              ${isDarkMode
                ? 'text-white hover:bg-white/10'
                : 'text-black hover:bg-black/10'
              }
            `}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <button
            type="submit"
            disabled={!localUserName.trim() || isLoading}
            className={`
              flex-1 py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 border-2 neo-btn
              ${localUserName.trim() && !isLoading
                ? isDarkMode
                  ? 'bg-[#ffe500] text-[#111111] border-white neo-dark hover:bg-[#ffdd00]'
                  : 'bg-[#2f60ff] text-white border-black neo-light hover:bg-[#2450df]'
                : 'bg-gray-500 text-gray-300 border-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Room'
            )}
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 1 ? "Join Room" : 
        step === 2 ? (requiresCreatorPassword ? "Creator Password" : "Room Password") :
        "Enter Username"
      }
      showCloseButton={!isLoading}
    >
      {step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}
    </Modal>
  );
};

export default JoinRoomModal;
