import React, { useState } from 'react';
import { Copy, Check, Loader2 } from 'lucide-react';
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

const CreateRoomModal = () => {
  const isDarkMode = useIsDarkMode();
  const currentState = useCurrentState();
  const setState = useSetState();
  const setRoomData = useSetRoomData();
  const userName = useUserName(); // Get username from store
  const updateParticipants = useUpdateParticipants();
  const addNotification = useAddNotification();

  const [step, setStep] = useState(1); // 1: Password setup, 2: Room created
  const [roomId, setRoomId] = useState(null);
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const isOpen = currentState === APP_STATES.CREATING;

  const handleClose = () => {
    setStep(1);
    setRoomId(null);
    setPassword('');
    setHasPassword(false);
    setError('');
    setCopied(false);
    setState(APP_STATES.HOME);
  };

  const createRoom = async () => {
    try {
      setIsLoading(true);
      setError('');

      const roomPassword = hasPassword ? password.trim() : null;
      const response = await apiService.createRoom(userName, roomPassword);

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

  const handlePasswordSetup = (e) => {
    e.preventDefault();
    if (hasPassword && !password.trim()) {
      setError('Password is required when enabled');
      return;
    }
    createRoom();
  };

  const handleJoinRoom = async () => {
    try {
      setIsLoading(true);
      setError('');

      const roomPassword = hasPassword ? password.trim() : null;
      const response = await apiService.joinRoom(roomId, userName, roomPassword);

      if (response.success) {
        setRoomData({ roomId, isCreator: true });
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
      <div className="text-center">
        <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Room Settings
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Configure your room options
        </p>
      </div>

      {error && (
        <div className="text-center">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handlePasswordSetup} className="space-y-6">
        {/* Password Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Room Password
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Add a password to make your room private
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setHasPassword(!hasPassword);
                if (!hasPassword) setPassword('');
              }}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${hasPassword
                  ? isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                  : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${hasPassword ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {hasPassword && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter room password"
              className={`
                w-full px-4 py-3 rounded-lg border-2 transition-colors duration-200
                ${isDarkMode
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-white focus:bg-gray-700'
                  : 'bg-white border-gray-300 text-black placeholder-gray-500 focus:border-black focus:bg-gray-50'
                }
                focus:outline-none
              `}
              maxLength={50}
            />
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2
            ${isDarkMode
              ? 'bg-white text-black hover:bg-gray-100 disabled:bg-gray-600 disabled:text-gray-400'
              : 'bg-black text-white hover:bg-gray-900 disabled:bg-gray-300 disabled:text-gray-500'
            }
            disabled:cursor-not-allowed
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating Room...</span>
            </>
          ) : (
            <span>Create Room</span>
          )}
        </button>
      </form>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Room Created Successfully!
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Share these details with others to join
        </p>
      </div>

      {/* Room Details */}
      <div className="space-y-4">
        {/* Room ID */}
        <div className={`
          p-4 rounded-lg border-2 border-dashed
          ${isDarkMode ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'}
        `}>
          <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Room ID
          </p>
          <div className="flex items-center justify-between">
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

        {/* Password (if set) */}
        {hasPassword && (
          <div className={`
            p-4 rounded-lg border-2 border-dashed
            ${isDarkMode ? 'border-yellow-600/50 bg-yellow-800/20' : 'border-yellow-300 bg-yellow-50'}
          `}>
            <p className={`text-xs mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
              Password
            </p>
            <div className="flex items-center justify-between">
              <span className={`font-mono font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {password}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(password);
                  addNotification({ type: 'success', message: 'Password copied!' });
                }}
                className={`
                  p-2 rounded-lg transition-colors
                  ${isDarkMode
                    ? 'hover:bg-white/10 text-white'
                    : 'hover:bg-black/10 text-black'
                  }
                `}
                title="Copy password"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-center">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleJoinRoom}
        disabled={isLoading}
        className={`
          w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2
          ${isDarkMode
            ? 'bg-white text-black hover:bg-gray-100 disabled:bg-gray-600 disabled:text-gray-400'
            : 'bg-black text-white hover:bg-gray-900 disabled:bg-gray-300 disabled:text-gray-500'
          }
          disabled:cursor-not-allowed
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Joining Room...</span>
          </>
        ) : (
          <span>Join Room & Start Chatting</span>
        )}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? "Room Settings" : "Room Created"}
      showCloseButton={!isLoading}
    >
      {step === 1 ? renderStep1() : renderStep2()}
    </Modal>
  );
};

export default CreateRoomModal;
