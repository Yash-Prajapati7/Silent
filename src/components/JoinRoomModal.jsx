import React, { useState } from 'react';
import { ArrowLeft, Lock, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { useIsDarkMode } from '../stores/themeStore';
import { 
  useCurrentState, 
  useSetState, 
  useSetRoomData, 
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
  const userName = useUserName(); // Get username from store
  const updateParticipants = useUpdateParticipants();
  const addNotification = useAddNotification();
  const [step, setStep] = useState(1); // 1: Room ID, 2: Password (if needed)
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isOpen = currentState === APP_STATES.JOINING;

  const handleClose = () => {
    setStep(1);
    setRoomId('');
    setPassword('');
    setRequiresPassword(false);
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
          // Room doesn't need password, join directly
          joinRoom();
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async (roomPassword = null) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await apiService.joinRoom(parseInt(roomId), userName, roomPassword);
      
      if (response.success) {
        setRoomData({ roomId: parseInt(roomId), isCreator: false });
        updateParticipants(response.participants || []);
        setState(APP_STATES.CHATTING);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    await joinRoom(password.trim());
  };

  const renderStep1 = () => (
    <form onSubmit={handleRoomIdSubmit}>
      <div className="space-y-4">
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Enter the 4-digit room ID to join as <span className="font-medium">{userName}</span>
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
            w-full px-4 py-3 rounded-lg border text-center text-2xl font-mono
            focus:outline-none focus:ring-2 transition-colors
            ${isDarkMode
              ? 'bg-gray-900 border-gray-600 text-white focus:ring-white/30 placeholder-gray-500'
              : 'bg-gray-50 border-gray-300 text-black focus:ring-black/30 placeholder-gray-400'
            }
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
              flex-1 py-3 px-4 rounded-lg font-medium transition-colors
              ${isDarkMode
                ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                : 'bg-gray-200 text-black hover:bg-gray-300 border border-gray-400'
              }
            `}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={roomId.length !== 4 || isLoading}
            className={`
              flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
              ${roomId.length === 4 && !isLoading
                ? isDarkMode
                  ? 'bg-white text-black hover:bg-gray-100'
                  : 'bg-black text-white hover:bg-gray-900'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
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
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${isDarkMode ? 'bg-yellow-800/20' : 'bg-yellow-100'}`}>
            <Lock className={`w-6 h-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Room {roomId} is password protected
          </p>
        </div>
        
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          placeholder="Enter room password"
          className={`
            w-full px-4 py-3 rounded-lg border-2 text-center transition-colors duration-200
            ${isDarkMode
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-white focus:bg-gray-700'
              : 'bg-white border-gray-300 text-black placeholder-gray-500 focus:border-black focus:bg-gray-50'
            }
            focus:outline-none
          `}
          maxLength={50}
          autoComplete="off"
        />
        
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
            disabled={!password.trim() || isLoading}
            className={`
              flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
              ${password.trim() && !isLoading
                ? isDarkMode
                  ? 'bg-white text-black hover:bg-gray-100'
                  : 'bg-black text-white hover:bg-gray-900'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
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
      title={step === 1 ? "Join Room" : "Room Password"}
      showCloseButton={!isLoading}
    >
      {step === 1 ? renderStep1() : renderStep2()}
    </Modal>
  );
};

export default JoinRoomModal;
