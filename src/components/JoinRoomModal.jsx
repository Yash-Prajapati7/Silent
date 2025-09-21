import React, { useState } from 'react';
import { ArrowLeft, Dice6, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { useIsDarkMode } from '../stores/themeStore';
import { 
  useCurrentState, 
  useSetState, 
  useSetRoomData, 
  useSetUserData, 
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
  const updateParticipants = useUpdateParticipants();
  const addNotification = useAddNotification();
  const [step, setStep] = useState(1); // 1: Room ID, 2: Username
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isOpen = currentState === APP_STATES.JOINING;

  const handleClose = () => {
    setStep(1);
    setRoomId('');
    setUserName('');
    setError('');
    setState(APP_STATES.HOME);
  };

  const handleRoomIdSubmit = (e) => {
    e.preventDefault();
    if (roomId.trim().length === 4) {
      setStep(2);
      setError('');
    } else {
      setError('Room ID must be 4 digits');
    }
  };

  const generateRandomName = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getRandomNames(1);
      if (response.success && response.names.length > 0) {
        setUserName(response.names[0]);
      }
    } catch (error) {
      setError('Failed to generate random name');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError('Username is required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await apiService.joinRoom(parseInt(roomId), userName.trim());
      
      if (response.success) {
        setRoomData({ roomId: parseInt(roomId), isCreator: false });
        setUserData({ userName: userName.trim() });
        updateParticipants(response.participants || []);
        setState(APP_STATES.CHATTING);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
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
            disabled={roomId.length !== 4}
            className={`
              flex-1 py-3 px-4 rounded-lg font-medium transition-colors
              ${roomId.length === 4
                ? isDarkMode
                  ? 'bg-white text-black hover:bg-gray-100'
                  : 'bg-black text-white hover:bg-gray-900'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }
            `}
          >
            Next
          </button>
        </div>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleJoinRoom}>
      <div className="space-y-4">
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Choose your username for room {roomId}
        </p>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                setError('');
              }}
              placeholder="Enter username"
              className={`
                flex-1 px-4 py-3 rounded-lg border
                focus:outline-none focus:ring-2 transition-colors
                ${isDarkMode
                  ? 'bg-gray-900 border-gray-600 text-white focus:ring-white/30 placeholder-gray-500'
                  : 'bg-gray-50 border-gray-300 text-black focus:ring-black/30 placeholder-gray-400'
                }
              `}
              maxLength={20}
            />
            
            <button
              type="button"
              onClick={generateRandomName}
              disabled={isLoading}
              className={`
                p-3 rounded-lg transition-colors
                ${isDarkMode
                  ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                  : 'bg-gray-200 text-black hover:bg-gray-300 border border-gray-400'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              title="Generate random name"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Dice6 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
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
            disabled={!userName.trim() || isLoading}
            className={`
              flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
              ${userName.trim() && !isLoading
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
      title={step === 1 ? "Join Room" : "Choose Username"}
    >
      {step === 1 ? renderStep1() : renderStep2()}
    </Modal>
  );
};

export default JoinRoomModal;
