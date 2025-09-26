import React, { useState, useEffect, useRef } from 'react';
import { Send, LogOut, X, Users, Github, Info, Copy, Smile } from 'lucide-react';
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
import EmojiPicker from 'emoji-picker-react';
import { getUsernameColor, getContrastTextColor } from '../utils/userColors';

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerWidth, setEmojiPickerWidth] = useState(350);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const headerRef = useRef(null); // Ref for header
  const footerRef = useRef(null); // Ref for footer

  const isOpen = currentState === APP_STATES.CHATTING;

  // State to hold the dynamic height for the chat area
  const [chatAreaHeight, setChatAreaHeight] = useState('calc(100vh - 8rem)');

  // Compute emoji picker width and chat area height
  useEffect(() => {
    const computeLayout = () => {
      // Emoji width
      const w = window.innerWidth;
      if (w < 380) setEmojiPickerWidth(260);
      else if (w < 500) setEmojiPickerWidth(300);
      else setEmojiPickerWidth(350);

      // Chat area height calculation
      const headerHeight = headerRef.current?.offsetHeight || 0;
      const footerHeight = footerRef.current?.offsetHeight || 0;
      
      // Calculate remaining height for the chat area
      setChatAreaHeight(`calc(100vh - ${headerHeight + footerHeight}px)`);
    };

    computeLayout();
    window.addEventListener('resize', computeLayout);
    return () => window.removeEventListener('resize', computeLayout);
  }, []); // Empty dependency array runs once on mount and on window resize

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

      // Typing indicator events
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
        console.log('Room ended event received:', data);
        
        // Create a notification based on who ended the room
        let notificationMessage = '';
        let systemMessage = '';
        let notificationType = 'warning';
        
        if (data.endedBy === 'creator' && data.creatorName) {
          // Room ended by creator
          notificationMessage = `Room has been ended by the creator (${data.creatorName})`;
          systemMessage = `🚨 Room has been ended by ${data.creatorName}`;
          
          // If this user is the creator, show different message
          if (userName === data.creatorName) {
            notificationMessage = 'You have ended this room';
            systemMessage = '🚨 You have ended this room';
            notificationType = 'info';
          }
        } else if (data.endedBy === 'system' && data.reason === 'inactivity') {
          // Room ended due to inactivity
          notificationMessage = 'Room has been ended due to inactivity (no messages for 2+ hours)';
          systemMessage = '🚨 Room has been closed due to inactivity (no messages for 2+ hours)';
        } else {
          // Generic message if details aren't available
          notificationMessage = data.message || 'Room has been ended';
          systemMessage = '🚨 Room has been ended';
        }
        
        // Add a system message to the chat
        addMessage({
          sender: 'System',
          message: systemMessage,
          timestamp: new Date(),
          isSystem: true
        });
        
        // Show notification
        addNotification({
          type: notificationType,
          message: notificationMessage
        });
        
        // Always clear storage immediately for any room end reason
        // This helps prevent the "not authorized" messages
        resetState();
        
        // Navigate to home screen after a brief delay to allow notification to be seen
        setTimeout(() => {
          // Force navigation back to home screen
          window.location.href = '/';
        }, 3000); // Slightly longer delay to allow reading the notification
      });

      socketService.onError((data) => {
        console.log('Socket error received:', data);
        
        addNotification({
          type: 'error',
          message: data.message
        });
        
        // If it's an authorization error, check if room still exists
        if (data.message && data.message.includes('not authorized')) {
          // Check if room still exists
          apiService.getRoomInfo(roomId)
            .then(response => {
              if (response && response.success) {
                // Room exists, try to reconnect
                addNotification({
                  type: 'warning',
                  message: 'Attempting to reconnect to room...'
                });
                
                // Try to rejoin the room
                socketService.joinRoom(roomId, userName);
              } else {
                // Room doesn't exist or is no longer active
                addNotification({
                  type: 'warning',
                  message: 'Room may have been ended, returning home'
                });
                resetState();
              }
            })
            .catch(error => {
              // If we can't get room info, assume room is ended
              console.error('Error checking room status:', error);
              addNotification({
                type: 'warning',
                message: 'Unable to verify room status, returning home'
              });
              resetState();
            });
        }
      });

      return () => {
        socketService.removeAllListeners();
        socketService.disconnect();
      };
    }
  }, [isOpen, roomId, userName]);

  // Handle clicks outside emoji picker to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

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

  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
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
      
      // Add success notification
      addNotification({
        type: 'success',
        message: 'Room ended successfully'
      });
    } catch (error) {
      console.error('Error ending room:', error);
      
      // Even if the API call fails, the room might have been ended on the server
      // So we should still reset the state to avoid orphaned UI state
      resetState();
      
      addNotification({
        type: 'warning',
        message: 'Room may have ended, returning to home screen'
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
      h-screen w-full flex flex-col overflow-hidden
      ${isDarkMode
        ? 'bg-black text-white'
        : 'bg-white text-black'
      }
    `}>
      {/* Header - Fixed */}
      <div 
        ref={headerRef} // Add ref to calculate height
        className={`
          flex-shrink-0 p-3 sm:p-4 md:p-6 border-b z-30
          ${isDarkMode
            ? 'border-white/20 bg-black'
            : 'border-black/20 bg-white'
          }
        `}
      >
        <div className="flex items-center justify-between">
          {/* ERROR FIX: Removed the duplicate div here */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className={`
                  w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border-2 text-lg sm:text-2xl
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
                <h1 className="font-bold text-base sm:text-lg truncate">Room {roomId}</h1>
                {isCreator && (
                  <span className={`
                    px-3 py-1 text-xs sm:text-sm rounded-full font-medium border inline-block mt-1
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
              flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border flex-shrink-0 ml-2
              ${isDarkMode ? 'bg-black border-white/20' : 'bg-white border-black/20'}
            `}>
              <Users className="w-4 h-4" />
              <span className="font-medium">{participants.length}</span>
              <span className="text-sm opacity-75 hidden sm:inline">online</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {isCreator ? (
              <button
                onClick={showEndRoomConfirmation}
                disabled={isLoading}
                className={`
                  px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border-2 text-xs sm:text-sm md:text-base
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
                  px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border-2 text-xs sm:text-sm md:text-base
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
      </div>

      {/* Messages - Scrollable area and Room Info Modal Container */}
      <div className="relative flex-1 overflow-hidden">
        {showRoomInfo && (
          <div className={`
            absolute top-0 right-4 md:w-80 z-20 p-4 rounded-lg shadow-xl border backdrop-blur-lg
            ${isDarkMode
              ? 'bg-gray-900/95 border-gray-700 text-white'
              : 'bg-white/95 border-gray-300 text-black'
            }
            max-h-[70vh] overflow-y-auto w-[calc(100%-2rem)] md:w-80
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
                  <span className={`text-2xl font-mono font-bold truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>
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
                    <span className={`font-mono font-medium truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>
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

              {/* Participants List */}
              <div className={`
                p-3 rounded-lg
                ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}
              `}>
                <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Participants ({participants.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {participants.map((participant) => (
                    <div
                      key={participant}
                      className="px-3 py-1 rounded-full text-xs font-medium border inline-block"
                      style={{
                        backgroundColor: getUsernameColor(participant),
                        color: getContrastTextColor(getUsernameColor(participant)),
                        borderColor: getUsernameColor(participant)
                      }}
                    >
                      {participant}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div
          className="overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar"
          style={{
            height: chatAreaHeight, // Use dynamic height
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.isSystem ? 'justify-center' : msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              {msg.isSystem ? (
                // System messages (join/leave notifications)
                <div className={`
                  text-center py-2 px-4 rounded-lg text-sm font-medium max-w-[90%]
                  border-2 border-dashed
                  ${isDarkMode 
                    ? 'text-blue-300 bg-blue-900/20 border-blue-500/50' 
                    : 'text-blue-700 bg-blue-100/50 border-blue-400/50'
                  }
                `}>
                  {msg.message}
                </div>
              ) : (
                <div className={`
                  max-w-[85%] sm:max-w-md md:max-w-lg px-4 py-2 rounded-2xl border-2 break-words
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
                    <div 
                      className="text-xs font-bold mb-2 px-2 py-1 rounded-full inline-block w-fit border"
                      style={{
                        backgroundColor: getUsernameColor(msg.sender),
                        color: getContrastTextColor(getUsernameColor(msg.sender)),
                        borderColor: getUsernameColor(msg.sender)
                      }}
                    >
                      {msg.sender}
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap break-words">{msg.message}</div>
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
            <div className={`text-sm flex items-center gap-1 flex-wrap ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
              {localTypingUsers.map((user, index) => (
                <span key={user}>
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium border inline-block"
                    style={{
                      backgroundColor: getUsernameColor(user),
                      color: getContrastTextColor(getUsernameColor(user)),
                      borderColor: getUsernameColor(user)
                    }}
                  >
                    {user}
                  </span>
                  {index < localTypingUsers.length - 1 && <span>, </span>}
                </span>
              ))}
              <span className="ml-1">
                {localTypingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>


      {/* Message Input - Fixed */}
      <div 
        ref={footerRef} // Add ref to calculate height
        className={`
          flex-shrink-0 p-3 sm:p-4 md:p-6 border-t z-30
          ${isDarkMode
            ? 'border-white/20 bg-black'
            : 'border-black/20 bg-white'
          }
        `}
      >
        <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3 max-w-4xl mx-auto items-center">
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
              flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl border-2 text-sm sm:text-base
              focus:outline-none transition-all duration-300
              ${isDarkMode
                ? 'bg-black border-white text-white placeholder-white/50 focus:border-white/70'
                : 'bg-white border-black text-black placeholder-black/50 focus:border-black/70'
              }
            `}
            maxLength={1000}
          />

          {/* Emoji Button */}
          <div className="relative">
            <button
              ref={emojiButtonRef}
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`
                px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300 flex items-center gap-2 font-medium border-2
                ${isDarkMode
                  ? 'bg-black border-white text-white hover:bg-white/10'
                  : 'bg-white border-black text-black hover:bg-black/10'
                }
              `}
              title="Add emoji"
            >
              <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-full right-0 mb-2 z-50"
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme={isDarkMode ? 'dark' : 'light'}
                  height={400}
                  width={emojiPickerWidth}
                  previewConfig={{
                    showPreview: false
                  }}
                  skinTonesDisabled={false}
                  searchDisabled={false}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!message.trim()}
            className={`
              px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-2xl transition-all duration-300 flex items-center gap-2 font-medium border-2
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
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
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