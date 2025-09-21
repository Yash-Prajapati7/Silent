import React, { useState } from 'react';
import { Copy, Check, Dice6, Loader2 } from 'lucide-react';
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

const CreateRoomModal = () => {
  const isDarkMode = useIsDarkMode();
  const currentState = useCurrentState();
  const setState = useSetState();
  const setRoomData = useSetRoomData();
  const setUserData = useSetUserData();
  const updateParticipants = useUpdateParticipants();
  const addNotification = useAddNotification();
  const [step, setStep] = useState(1); // 1: Creating room, 2: Username
  const [roomId, setRoomId] = useState(null);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const isOpen = currentState === APP_STATES.CREATING;

  const handleClose = () => {
    setStep(1);
    setRoomId(null);
    setUserName('');
    setError('');
    setCopied(false);
    setState(APP_STATES.HOME);
  };

  React.useEffect(() => {
    if (isOpen && step === 1) {
      createRoom();
    }
  }, [isOpen]);

  const createRoom = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Use a temporary creator name for room creation - we'll update it when joining
      const tempCreatorName = `Creator_${Date.now()}`;
      const response = await apiService.createRoom(tempCreatorName);
      
      if (response.success) {
        setRoomId(response.roomId);
        setStep(2);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = roomId.toString();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError('Username is required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Join the room as the creator with the chosen username
      const response = await apiService.joinRoom(roomId, userName.trim());
      
      if (response.success) {
        setRoomData({ roomId, isCreator: true });
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
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-white' : 'text-black'}`} />
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Creating your room...
          </p>
        </div>
      ) : error ? (
        <div className="text-center space-y-4">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={createRoom}
            className={`
              px-6 py-3 rounded-lg font-medium transition-colors
              ${isDarkMode
                ? 'bg-white text-black hover:bg-gray-100'
                : 'bg-black text-white hover:bg-gray-900'
              }
            `}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Your room has been created!
            </p>
            
            <div className={`
              p-4 rounded-lg border-2 border-dashed
              ${isDarkMode ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-gray-50'}
            `}>
              <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Room ID
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className={`text-3xl font-mono font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {roomId}
                </span>
                <button
                  onClick={copyRoomId}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${isDarkMode
                      ? 'hover:bg-white/10 text-white'
                      : 'hover:bg-black/10 text-black'
                    }
                  `}
                  title="Copy room ID"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <p className={`text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Share this Room ID with others so they can join your conversation
          </p>
          
          <button
            onClick={() => setStep(2)}
            className={`
              w-full py-3 px-4 rounded-lg font-medium transition-colors
              ${isDarkMode
                ? 'bg-white text-black hover:bg-gray-100'
                : 'bg-black text-white hover:bg-gray-900'
              }
            `}
          >
            Proceed
          </button>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <form onSubmit={handleCreateRoom}>
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
            onClick={handleClose}
            className={`
              px-4 py-3 rounded-lg font-medium transition-colors
              ${isDarkMode
                ? 'text-white hover:bg-white/10'
                : 'text-black hover:bg-black/10'
              }
            `}
          >
            Cancel
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
                Creating...
              </>
            ) : (
              'Enter Room'
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
      title={step === 1 ? "Creating Room" : "Choose Username"}
      showCloseButton={!isLoading}
    >
      {step === 1 ? renderStep1() : renderStep2()}
    </Modal>
  );
};

export default CreateRoomModal;
