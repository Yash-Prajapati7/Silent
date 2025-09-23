import React, { useState, useEffect, useRef } from 'react';
import { Send, LogOut, X, Users, Github, Info, Copy } from 'lucide-react';
import { useIsDarkMode } from '../stores/themeStore';
import { 
  useCurrentState, 
  useRoomId,
  useUserName,
  useIsCreator,
  useRoomPassword,
  useMessages, 
  useParticipants, 
  useTypingUsers,
  useAddMessage,
  useSetMessages,
  useUpdateParticipants,
  useAddNotification,
  useResetState,
  APP_STATES 
} from '../stores/appStore';
import { apiService } from '../services/api';
import socketService from '../services/socket';
import ThemeToggle from './ThemeToggle';
import ConfirmationModal from './ConfirmationModal';

const ChatScreen = () => {
  const isDarkMode = useIsDarkMode();
  const currentState = useCurrentState();
  const roomId = useRoomId();
  const userName = useUserName();
  const isCreator = useIsCreator();
  const roomPassword = useRoomPassword();
  const messages = useMessages();
  const participants = useParticipants();
  const typingUsers = useTypingUsers();
  const addMessage = useAddMessage();
  const setMessages = useSetMessages();
  const updateParticipants = useUpdateParticipants();
  const addNotification = useAddNotification();
  const resetState = useResetState();
  
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [localTypingUsers, setLocalTypingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null });
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isOpen = currentState === APP_STATES.CHATTING;

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection and event listeners
  useEffect(() => {
    if (isOpen && roomId && userName) {
      const socket = socketService.connect();
      
      // Join room via socket
      socketService.joinRoom(roomId, userName);

      // Set up event listeners
      socketService.onJoinedRoom((data) => {
        updateParticipants(data.participants || []);
        loadChatHistory();
      });

      socketService.onNewMessage((data) => {
        addMessage({
          sender: data.sender,
          message: data.message,
          timestamp: data.timestamp,
          isOwn: data.sender === userName
        });
      });

      socketService.onUserJoined((data) => {
        updateParticipants(data.participants || []);
        // Add system message to chat
        addMessage({
          sender: 'System',
          message: data.message,
          timestamp: new Date().toISOString(),
          isSystem: true
        });
      });

      socketService.onUserLeft((data) => {
        updateParticipants(data.participants || []);
        // Add system message to chat
        addMessage({
          sender: 'System',
          message: data.message,
          timestamp: new Date().toISOString(),
          isSystem: true
        });
      });

      // Removed userConnected and userDisconnected listeners to prevent duplicate messages
      // Only userJoined and userLeft events are handled now

      socketService.onUserTyping((data) => {
        if (data.userName !== userName) {
          setLocalTypingUsers(prev => {
            if (data.isTyping) {
              // Add user to typing list if not already there
              return prev.includes(data.userName) ? prev : [...prev, data.userName];
            } else {
              // Remove user from typing list
              return prev.filter(u => u !== data.userName);
            }
          });
          
          // Auto-remove typing indicator after 5 seconds
          if (data.isTyping) {
            setTimeout(() => {
              setLocalTypingUsers(prev => prev.filter(u => u !== data.userName));
            }, 5000);
          }
        }
      });

      socketService.onRoomEnded((data) => {
        addNotification({
          type: 'warning',
          message: data.message
        });
        setTimeout(() => {
          handleLeaveRoom();
        }, 3000);
      });

      socketService.onError((data) => {
        addNotification({
          type: 'error',
          message: data.message
        });
      });

      return () => {
        socketService.removeAllListeners();
        socketService.disconnect();
      };
    }
  }, [isOpen, roomId, userName]);

  const loadChatHistory = async () => {
    try {
      const response = await apiService.getChatHistory(roomId);
      if (response.success) {
        const formattedMessages = response.chats.map(chat => ({
          sender: chat.sender,
          message: chat.message,
          timestamp: chat.timestamp,
          isOwn: chat.sender === userName
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      // Error loading chat history - silent fail
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Send via socket
    socketService.sendMessage(roomId, message.trim());
    
    // Clear input
    setMessage('');
    handleStopTyping();
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.setTyping(roomId, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      socketService.setTyping(roomId, false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const showLeaveConfirmation = () => {
    setConfirmModal({ isOpen: true, type: 'leave' });
  };

  const showEndRoomConfirmation = () => {
    setConfirmModal({ isOpen: true, type: 'end' });
  };

  const handleLeaveRoom = async () => {
    try {
      setIsLoading(true);
      
      // Leave via API
      await apiService.leaveRoom(roomId, userName);
      
      // Leave via socket
      socketService.leaveRoom();
      
      // Reset state and go home
      resetState();
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to leave room'
      });
    } finally {
      setIsLoading(false);
      setConfirmModal({ isOpen: false, type: null });
    }
  };

  const handleEndRoom = async () => {
    try {
      setIsLoading(true);
      
      // End room
      await apiService.endRoom(roomId, userName);
      
      // Reset state and go home
      resetState();
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to end room'
      });
    } finally {
      setIsLoading(false);
      setConfirmModal({ isOpen: false, type: null });
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: null });
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === 'leave') {
      handleLeaveRoom();
    } else if (confirmModal.type === 'end') {
      handleEndRoom();
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className={`
      min-h-screen w-full flex flex-col
      ${isDarkMode 
        ? 'bg-black text-white' 
        : 'bg-white text-black'
      }
    `}>
      {/* Header - Fixed */}
      <div className={`
        w-full flex items-center justify-between p-4 md:p-6 border-b fixed top-0 left-0 right-0 z-10
        ${isDarkMode 
          ? 'border-white/20 bg-black' 
          : 'border-black/20 bg-white'
        }
      `}>
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center border-2 text-2xl
                ${isDarkMode 
                  ? 'bg-white text-black border-white' 
                  : 'bg-black text-white border-black'
                }
              `}>
                🤫
              </div>
              
              {/* Room Info Button */}
              <button
                onClick={() => setShowRoomInfo(!showRoomInfo)}
                className={`
                  p-2 rounded-lg transition-all duration-200 hover:scale-105 relative
                  ${isDarkMode
                    ? 'text-white hover:bg-white/10'
                    : 'text-black hover:bg-black/10'
                  }
                `}
                title="Room Information"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-lg truncate">Room {roomId}</h1>
              {isCreator && (
                <span className={`
                  px-3 py-1 text-xs rounded-full font-medium border
                  ${isDarkMode 
                    ? 'bg-white text-black border-white' 
                    : 'bg-black text-white border-black'
                  }
                `}>
                  Creator
                </span>
              )}
            </div>
          </div>
          <div className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border flex-shrink-0
            ${isDarkMode ? 'bg-black border-white/20' : 'bg-white border-black/20'}
          `}>
            <Users className="w-4 h-4" />
            <span className="font-medium">{participants.length}</span>
            <span className="text-sm opacity-75 hidden sm:inline">online</span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {isCreator ? (
            <button
              onClick={showEndRoomConfirmation}
              disabled={isLoading}
              className={`
                px-3 md:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border-2 text-sm md:text-base
                ${isDarkMode
                  ? 'bg-white text-black border-white hover:bg-black hover:text-white'
                  : 'bg-black text-white border-black hover:bg-white hover:text-black'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">End Room</span>
              <span className="sm:hidden">End</span>
            </button>
          ) : (
            <button
              onClick={showLeaveConfirmation}
              disabled={isLoading}
              className={`
                px-3 md:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border-2 text-sm md:text-base
                ${isDarkMode
                  ? 'bg-white text-black border-white hover:bg-black hover:text-white'
                  : 'bg-black text-white border-black hover:bg-white hover:text-black'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          )}
          
          {/* GitHub Button */}
          <div className="relative group">
            <button
              onClick={() => window.open('https://github.com/Yash-Prajapati7', '_blank')}
              className={`
                p-2 rounded-lg transition-all duration-200 hover:scale-105
                ${isDarkMode
                  ? 'text-white hover:bg-white/10'
                  : 'text-black hover:bg-black/10'
                }
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

          {/* Theme Toggle on the extreme right */}
          <ThemeToggle inline={true} />
        </div>
      </div>

      {/* Room Info Dropdown */}
      {showRoomInfo && (
        <div className={`
          fixed top-16 left-4 right-4 md:left-auto md:right-4 md:w-80 z-20 p-4 rounded-lg shadow-xl border backdrop-blur-lg
          ${isDarkMode
            ? 'bg-gray-900/95 border-gray-700 text-white'
            : 'bg-white/95 border-gray-300 text-black'
          }
        `}>
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Room Details</h3>
              <button
                onClick={() => setShowRoomInfo(false)}
                className={`
                  p-1 rounded-lg transition-colors
                  ${isDarkMode
                    ? 'hover:bg-white/10'
                    : 'hover:bg-black/10'
                  }
                `}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Room ID */}
            <div className={`
              p-3 rounded-lg border-2 border-dashed
              ${isDarkMode ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'}
            `}>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Room ID
              </p>
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-mono font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {roomId}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(roomId.toString());
                    addNotification({ type: 'success', message: 'Room ID copied!' });
                  }}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${isDarkMode
                      ? 'hover:bg-white/10 text-white'
                      : 'hover:bg-black/10 text-black'
                    }
                  `}
                  title="Copy room ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Room Password (if exists) */}
            {roomPassword && (
              <div className={`
                p-3 rounded-lg border-2 border-dashed
                ${isDarkMode ? 'border-yellow-600/50 bg-yellow-800/20' : 'border-yellow-300 bg-yellow-50'}
              `}>
                <p className={`text-xs mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  Password
                </p>
                <div className="flex items-center justify-between">
                  <span className={`font-mono font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {roomPassword}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(roomPassword);
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

            {/* Participants Count */}
            <div className={`
              p-3 rounded-lg
              ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}
            `}>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Participants
              </p>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">{participants.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages - Scrollable area with padding for fixed header and footer */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-30 pb-24" style={{ height: 'calc(100vh - 8rem)', minHeight: 'calc(100vh - 8rem)' }}>
        {/* Notifications are now handled globally in App.jsx */}

        {/* Chat Messages */}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.isSystem ? 'justify-center' : msg.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            {msg.isSystem ? (
              // System messages (join/leave notifications)
              <div className={`
                text-center py-2 px-4 rounded-lg text-sm italic
                ${isDarkMode ? 'text-white/70' : 'text-black/70'}
              `}>
                {msg.message}
              </div>
            ) : (
              <div className={`
                max-w-xs sm:max-w-md md:max-w-lg px-4 py-2 rounded-2xl border-2
                ${msg.isOwn
                  ? isDarkMode
                    ? 'bg-white text-black border-white'
                    : 'bg-black text-white border-black'
                  : isDarkMode
                    ? 'bg-black text-white border-white'
                    : 'bg-white text-black border-black'
                }
              `}>
                {!msg.isOwn && (
                  <div className={`
                    text-xs font-medium mb-1 opacity-70
                  `}>
                    {msg.sender}
                  </div>
                )}
                <div className="text-sm">{msg.message}</div>
                <div className={`
                  text-xs mt-1 opacity-70
                  ${msg.isOwn ? 'text-right' : 'text-left'}
                `}>
                  {formatTimestamp(msg.timestamp)}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {localTypingUsers.length > 0 && (
          <div className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
            {localTypingUsers.join(', ')} {localTypingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed */}
      <div className={`
        w-full p-4 md:p-6 border-t fixed bottom-0 left-0 right-0 z-10
        ${isDarkMode 
          ? 'border-white/20 bg-black' 
          : 'border-black/20 bg-white'
        }
      `}>
        <form onSubmit={handleSendMessage} className="flex gap-3 md:gap-4 max-w-4xl mx-auto">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onBlur={handleStopTyping}
            placeholder="Type a message..."
            className={`
              flex-1 px-4 md:px-6 py-3 md:py-4 rounded-2xl border-2 text-base md:text-lg
              focus:outline-none transition-all duration-300
              ${isDarkMode
                ? 'bg-black border-white text-white placeholder-white/50 focus:border-white/70'
                : 'bg-white border-black text-black placeholder-black/50 focus:border-black/70'
              }
            `}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className={`
              px-4 md:px-6 py-3 md:py-4 rounded-2xl transition-all duration-300 flex items-center gap-2 font-medium border-2
              ${message.trim()
                ? isDarkMode
                  ? 'bg-white text-black border-white hover:bg-black hover:text-white transform hover:scale-105'
                  : 'bg-black text-white border-black hover:bg-white hover:text-black transform hover:scale-105'
                : isDarkMode
                ? 'bg-black text-white/30 border-white/30 cursor-not-allowed'
                : 'bg-white text-black/30 border-black/30 cursor-not-allowed'
              }
            `}
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={confirmModal.type === 'end' ? 'End Room' : 'Leave Room'}
        message={
          confirmModal.type === 'end' 
            ? 'Are you sure you want to end this room? This will remove all participants and cannot be undone.'
            : 'Are you sure you want to leave this room? You will need to rejoin with the room ID.'
        }
        confirmText={confirmModal.type === 'end' ? 'End Room' : 'Leave Room'}
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatScreen;
