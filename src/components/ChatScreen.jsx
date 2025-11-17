import React, { useState, useEffect, useRef } from 'react';
import { Send, LogOut, X, Users, Github, Info, Copy, Smile, Paperclip, Loader2, ArrowDown, Reply, Heart } from 'lucide-react';
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
  useAddReactionToMessage,
  useResetState,
  APP_STATES
} from '../stores/appStore';
import { apiService } from '../services/api';
import socketService from '../services/socket';
import fileUploadService from '../services/fileUploadService';
import ThemeToggle from './ThemeToggle';
import ConfirmationModal from './ConfirmationModal';
import EmojiPicker from 'emoji-picker-react';
import { getUsernameColor, getContrastTextColor } from '../utils/userColors';

// Simple file link component with yellow background
const FileLink = ({ url, timestamp }) => {
  const [isExpired, setIsExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  
  useEffect(() => {
    const uploadTime = new Date(timestamp).getTime();
    const expiryTime = uploadTime + (55 * 60 * 1000); // 55 minutes
    
    if (Date.now() >= expiryTime) {
      setIsExpired(true);
      return;
    }
    
    const updateTimer = () => {
      const now = Date.now();
      if (now >= expiryTime) {
        setIsExpired(true);
        return;
      }
      
      const remaining = expiryTime - now;
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeRemaining(`${minutes}m ${seconds}s`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    const timeout = setTimeout(() => setIsExpired(true), expiryTime - Date.now());
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [timestamp]);
  
  // Convert to download URL and ensure it starts with https
  const downloadUrl = url.includes('/dl/') 
    ? url.replace(/^http:/, 'https:') 
    : url.replace(/tmpfiles\.org\/(\d+)\//, 'tmpfiles.org/dl/$1/').replace(/^http:/, 'https:');
  
  // Inline styles to override everything
  const containerStyle = {
    backgroundColor: '#FDFD96',
    color: '#000000',
    padding: '12px',
    borderRadius: '8px',
    margin: '8px 0',
    border: '1px solid #d0d0d0',
    width: '100%',
    display: 'block'
  };
  
  const linkStyle = {
    color: '#000000',
    fontWeight: '500',
    textDecoration: isExpired ? 'line-through' : 'none',
    opacity: isExpired ? '0.5' : '1',
    cursor: isExpired ? 'not-allowed' : 'pointer',
    wordBreak: 'break-all',
    display: 'block'
  };
  
  const timerStyle = {
    color: '#000000',
    fontSize: '12px',
    marginTop: '8px',
    opacity: '0.7'
  };
  
  return (
    <div style={containerStyle}>
      {isExpired ? (
        <span style={linkStyle}>
          {downloadUrl}
        </span>
      ) : (
        <a 
          href={downloadUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={linkStyle}
          onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
          onMouseOut={(e) => e.target.style.textDecoration = 'none'}
        >
          {downloadUrl}
        </a>
      )}
      <div style={timerStyle}>
        {isExpired ? 'File expired' : `Expires in: ${timeRemaining}`}
      </div>
    </div>
  );
};

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
  const addReactionToMessage = useAddReactionToMessage();
  const resetState = useResetState();

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [localTypingUsers, setLocalTypingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null });
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerWidth, setEmojiPickerWidth] = useState(350);
  const [isUploading, setIsUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // For resetting file input
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(null); // Store message ID for reaction picker

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const headerRef = useRef(null); // Ref for header
  const footerRef = useRef(null); // Ref for footer
  const fileInputRef = useRef(null); // Ref for file input
  const messagesContainerRef = useRef(null); // Ref for messages container

  const isOpen = currentState === APP_STATES.CHATTING;

  // State to hold the dynamic height for the chat area
  const [chatAreaHeight, setChatAreaHeight] = useState('calc(100vh - 8rem)');

  // Compute emoji picker width
  useEffect(() => {
    const computeLayout = () => {
      // Responsive emoji picker width
      const w = window.innerWidth;
      if (w < 320) setEmojiPickerWidth(240);
      else if (w < 380) setEmojiPickerWidth(260);
      else if (w < 480) setEmojiPickerWidth(280);
      else if (w < 600) setEmojiPickerWidth(320);
      else setEmojiPickerWidth(350);
    };

    computeLayout();
    window.addEventListener('resize', computeLayout);
    return () => window.removeEventListener('resize', computeLayout);
  }, []); // Empty dependency array runs once on mount and on window resize

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check if user is scrolled to bottom
  const checkIfAtBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 100;
      setIsAtBottom(isBottom);
      setShowScrollButton(!isBottom);
    }
  };

  // Handle scroll event
  const handleScroll = () => {
    checkIfAtBottom();
  };

  // Auto-scroll only if user is already at bottom
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    } else {
      // Show scroll button when new message arrives and user is not at bottom
      setShowScrollButton(true);
    }
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
          isOwn: data.sender === userName,
          id: data.id || `${Date.now()}-${Math.random()}`,
          replyTo: data.replyTo || null,
          reactions: {}
        });
      });

      socketService.onMessageReaction((data) => {
        addReactionToMessage(data.messageId, data.userName, data.emoji);
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
      
      // Close reaction picker when clicking outside
      if (showReactionPicker && !event.target.closest('.emoji-picker-react')) {
        setShowReactionPicker(null);
      }
      
      // Close message actions when clicking outside
      if (selectedMessageId && !event.target.closest('[data-message-id]')) {
        setSelectedMessageId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker, showReactionPicker, selectedMessageId]);

  const loadChatHistory = async () => {
    try {
      const response = await apiService.getChatHistory(roomId);
      if (response.success) {
        const formattedMessages = response.chats.map(chat => ({
          sender: chat.sender,
          message: chat.message,
          timestamp: chat.timestamp,
          isOwn: chat.sender === userName,
          // Use MongoDB _id, tempId (for buffered messages), or fallback
          id: chat._id || chat.tempId || chat.id || `${Date.now()}-${Math.random()}`,
          replyTo: chat.replyTo || null,
          // Ensure reactions is a plain object
          reactions: chat.reactions && typeof chat.reactions === 'object' ? chat.reactions : {}
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

    // Send via socket with replyTo if replying
    socketService.sendMessage(roomId, message.trim(), replyingTo?.id);

    // Clear input and reply state
    setMessage('');
    setReplyingTo(null);
    handleStopTyping();
  };

  const handleMessageClick = (messageId) => {
    // Toggle selection - if clicking same message, deselect
    setSelectedMessageId(selectedMessageId === messageId ? null : messageId);
  };

  const handleReply = (msg) => {
    setReplyingTo(msg);
    setSelectedMessageId(null);
    // Focus on input field
    document.querySelector('input[type="text"]')?.focus();
  };

  const handleReact = (messageId) => {
    setShowReactionPicker(messageId);
    setSelectedMessageId(null);
  };

  const handleEmojiReact = (emojiData, messageId) => {
    socketService.reactToMessage(roomId, messageId, emojiData.emoji);
    setShowReactionPicker(null);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
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

  // File upload handling functions
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      
      if (files.length === 1) {
        // Single file upload
        const file = files[0];
        addNotification({ type: 'info', message: `Uploading "${file.name}"...` });
        
        const response = await fileUploadService.uploadFile(file);
        console.log("File Upload response!", response);
        
        if (response.success && response.url) {
          // Send the file URL as a message to the chat
          socketService.sendMessage(roomId, response.url);
          
          addNotification({ 
            type: 'success', 
            message: `File "${file.name}" uploaded successfully` 
          });
        } else {
          addNotification({ 
            type: 'error', 
            message: `Upload failed: ${response.message || 'Unknown error'}` 
          });
        }
      } else {
        // Multiple files upload
        addNotification({ 
          type: 'info', 
          message: `Uploading ${files.length} files...`
        });
        
        const response = await fileUploadService.uploadMultipleFiles(files);
        
        // Send each successfully uploaded file URL as a separate message
        if (response.success) {
          const successfulUploads = response.results.filter(result => result.success);
          
          for (const upload of successfulUploads) {
            socketService.sendMessage(roomId, upload.url);
          }
          
          addNotification({ 
            type: 'success', 
            message: `Successfully uploaded ${successfulUploads.length} of ${files.length} files` 
          });
        } else {
          addNotification({ 
            type: 'error', 
            message: response.message || 'Failed to upload files'
          });
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
      addNotification({ 
        type: 'error', 
        message: `Upload failed: ${error.message || 'Unknown error'}` 
      });
    } finally {
      setIsUploading(false);
      // Reset file input so the same files can be uploaded again if needed
      setFileInputKey(Date.now());
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
    <div
      style={{ minHeight: '100dvh' }}
      className={`
      w-full flex flex-col overflow-hidden fixed inset-0
      ${isDarkMode
        ? 'bg-black text-white'
        : 'bg-white text-black'
      }
    `}>
      {/* Header - Fixed with responsive layout */}
      <div 
        ref={headerRef}
        className={`
          sticky top-0 flex-shrink-0 p-3 sm:p-4 border-b z-30
          ${isDarkMode
            ? 'border-white/20 bg-black'
            : 'border-black/20 bg-white'
          }
        `}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Left Side: Icon and Room Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className={`
              w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border-2 text-2xl flex-shrink-0
              ${isDarkMode
                ? 'bg-white text-black border-white'
                : 'bg-black text-white border-black'
              }
            `}>
              🤫
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base sm:text-lg truncate">Room {roomId}</h1>
              {isCreator && (
                <span className={`
                  px-2 py-0.5 text-xs rounded-full font-medium border inline-block mt-0.5
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

          {/* Right Side: Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Participants Count Badge */}
            <div className={`
              flex items-center gap-2 px-3 py-2 rounded-lg border
              ${isDarkMode ? 'bg-black border-white/20' : 'bg-white border-black/20'}
            `}>
              <Users className="w-5 h-5" />
              <span className="font-medium text-sm">{participants.length}</span>
            </div>

            {/* Room Info Button */}
            <button
              onClick={() => setShowRoomInfo(true)}
              className={`
                p-2 rounded-lg transition-colors
                ${isDarkMode
                  ? 'text-white hover:bg-white/10'
                  : 'text-black hover:bg-black/10'
                }
              `}
              title="Room Information"
            >
              <Info className="w-5 h-5" />
            </button>

            {/* End or Leave Button */}
            {isCreator ? (
              <button
                onClick={showEndRoomConfirmation}
                disabled={isLoading}
                className={`
                  flex items-center gap-1 px-2 py-2 sm:px-3 rounded-lg transition-colors bg-red-500
                  ${isDarkMode
                    ? 'text-white hover:bg-red-600'
                    : 'text-black hover:bg-red-600'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                title="End Room"
              >
                <X className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">End Room</span>
              </button>
            ) : (
              <button
                onClick={showLeaveConfirmation}
                disabled={isLoading}
                className={`
                  flex items-center gap-1 px-2 py-2 sm:px-3 rounded-lg transition-colors bg-red-500
                  ${isDarkMode
                    ? 'text-white hover:bg-red-600'
                    : 'text-black hover:bg-red-600'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                title="Leave Room"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Leave Room</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages - Scrollable area and Room Info Modal Container */}
      <div className="relative flex-1 overflow-hidden flex flex-col">
        {/* Room Info Panel - Responsive */}
        {showRoomInfo && (
          <>
          {/* Backdrop for mobile */}
          <div 
            onClick={() => setShowRoomInfo(false)}
            className={`
              fixed inset-0 bg-black/60 z-40 sm:hidden
              transition-opacity duration-300
              ${showRoomInfo ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
          />
          <div className={`
            fixed top-0 right-0 bottom-0 w-full max-w-sm sm:max-w-none sm:w-80 sm:top-4 sm:bottom-auto sm:right-4 z-50 p-4 rounded-t-2xl sm:rounded-lg shadow-2xl border backdrop-blur-xl
            transition-transform duration-300 ease-in-out
            ${showRoomInfo ? 'translate-y-0' : 'translate-y-full sm:translate-y-0'}
            ${isDarkMode
              ? 'bg-gray-900/90 border-gray-700 text-white'
              : 'bg-white/90 border-gray-300 text-black'
            }
          `}>
            <div className="space-y-4 max-h-full overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b" style={{borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}}>
                <h3 className="font-bold text-lg">Room Details</h3>
                <button
                  onClick={() => setShowRoomInfo(false)}
                  className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Room ID */}
              <div className={`p-3 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-gray-50'}`}>
                <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Room ID</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xl font-mono font-bold truncate">{roomId}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(roomId.toString());
                      addNotification({ type: 'success', message: 'Room ID copied!' });
                    }}
                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                    title="Copy room ID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Room Password */}
              {roomPassword && (
                <div className={`p-3 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-yellow-600/50 bg-yellow-800/20' : 'border-yellow-300 bg-yellow-50'}`}>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Password</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-medium truncate">{roomPassword}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(roomPassword);
                        addNotification({ type: 'success', message: 'Password copied!' });
                      }}
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                      title="Copy password"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Participants List */}
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Participants ({participants.length})</p>
                <div className="flex flex-wrap gap-2">
                  {participants.map((p) => (
                    <div
                      key={p}
                      className="px-3 py-1 rounded-full text-xs font-medium border"
                      style={{
                        backgroundColor: getUsernameColor(p),
                        color: getContrastTextColor(getUsernameColor(p)),
                        borderColor: getUsernameColor(p)
                      }}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Other Actions Section */}
              <div className="pt-4 border-t" style={{borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}}>
                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Theme</span>
                      <ThemeToggle inline={true} />
                   </div>
                   <button
                    onClick={() => window.open('https://github.com/Yash-Prajapati7', '_blank')}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                  >
                    <span>Visit on GitHub</span>
                    <Github className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          </>
        )}

        {/* Chat Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4 custom-scrollbar relative"
          style={{
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
                  text-center py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium max-w-[95%] sm:max-w-[90%]
                  border-2 border-dashed
                  ${isDarkMode 
                    ? 'text-blue-300 bg-blue-900/20 border-blue-500/50' 
                    : 'text-blue-700 bg-blue-100/50 border-blue-400/50'
                  }
                `}>
                  {msg.message}
                </div>
              ) : (
                /* Check if this is a file message and render differently */
                (msg.message.includes('tmpfiles.org')) ? (
                  /* File message - render with special styling */
                  <div className="max-w-[95%] sm:max-w-[85%] md:max-w-lg">
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
                    <FileLink url={msg.message} timestamp={msg.timestamp} />
                    <div className={`
                      text-xs mt-1 opacity-70
                      ${msg.isOwn ? 'text-right' : 'text-left'}
                    `} style={{ color: isDarkMode ? 'white' : 'black' }}>
                      {formatTimestamp(msg.timestamp)}
                    </div>
                  </div>
                ) : (
                  /* Regular text message */
                  <div className="max-w-[90%] sm:max-w-[85%] md:max-w-lg" data-message-id={msg.id}>
                    <div 
                      onClick={() => !msg.isSystem && handleMessageClick(msg.id)}
                      className={`
                        px-3 sm:px-4 py-2 sm:py-2 rounded-2xl border-2 break-words cursor-pointer
                        transition-all duration-200
                        ${selectedMessageId === msg.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                        ${msg.isOwn
                          ? isDarkMode
                            ? 'bg-white text-black border-white hover:bg-gray-100'
                            : 'bg-black text-white border-black hover:bg-gray-900'
                          : isDarkMode
                            ? 'bg-black text-white border-white hover:bg-gray-900'
                            : 'bg-white text-black border-black hover:bg-gray-100'
                        }
                      `}
                    >
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
                      
                      {/* Show replied-to message if this is a reply */}
                      {msg.replyTo && (
                        <div className={`
                          mb-2 p-2 rounded-lg border-l-4 text-xs
                          ${isDarkMode ? 'bg-white/10 border-white/30' : 'bg-black/10 border-black/30'}
                        `}>
                          <div className="font-semibold mb-1 text-xs sm:text-sm">
                            ↩ Replying to: {messages.find(m => m.id === msg.replyTo)?.sender || 'Unknown'}
                          </div>
                          <div className="truncate opacity-70 text-xs">
                            {messages.find(m => m.id === msg.replyTo)?.message || 'Message not found'}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-sm whitespace-pre-wrap break-words">
                        {msg.message}
                      </div>
                      
                      {/* Reactions */}
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(msg.reactions).map(([emoji, users]) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                // Show who reacted
                                addNotification({
                                  type: 'info',
                                  message: `${users.join(', ')} reacted with ${emoji}`
                                });
                              }}
                              className={`
                                px-2 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1
                                transition-all duration-200 active:scale-95
                                min-h-[32px] min-w-[44px]
                                ${isDarkMode ? 'bg-white/20 hover:bg-white/30' : 'bg-black/10 hover:bg-black/20'}
                              `}
                              title={users.join(', ')}
                            >
                              <span className="text-base">{emoji}</span>
                              <span className="font-medium">{users.length}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <div className={`
                        text-xs mt-1 opacity-70
                        ${msg.isOwn ? 'text-right' : 'text-left'}
                      `}>
                        {formatTimestamp(msg.timestamp)}
                      </div>
                    </div>
                    
                    {/* Action Buttons - Show when message is selected */}
                    {selectedMessageId === msg.id && !msg.isSystem && (
                      <div className="flex gap-2 mt-2 justify-center animate-fadeIn">
                        <button
                          onClick={() => handleReply(msg)}
                          className={`
                            flex items-center gap-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium
                            transition-all duration-200 active:scale-95
                            min-h-[44px] sm:min-h-auto
                            ${isDarkMode
                              ? 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
                              : 'bg-black/10 hover:bg-black/20 text-black border border-black/30'
                            }
                          `}
                        >
                          <Reply className="w-4 h-4" />
                          <span className="hidden xs:inline">Reply</span>
                        </button>
                        <button
                          onClick={() => handleReact(msg.id)}
                          className={`
                            flex items-center gap-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium
                            transition-all duration-200 active:scale-95
                            min-h-[44px] sm:min-h-auto
                            ${isDarkMode
                              ? 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
                              : 'bg-black/10 hover:bg-black/20 text-black border border-black/30'
                            }
                          `}
                        >
                          <Heart className="w-4 h-4" />
                          <span className="hidden xs:inline">React</span>
                        </button>
                      </div>
                    )}
                    
                    {/* Reaction Picker - Show when reacting to this message */}
                    {showReactionPicker === msg.id && (
                      <div className="mt-2 relative">
                        <div className={`
                          absolute z-50
                          ${msg.isOwn 
                            ? 'bottom-full right-0 mb-2' 
                            : 'bottom-full left-0 mb-2'
                          }
                          sm:left-1/2 sm:transform sm:-translate-x-1/2
                        `}>
                          <EmojiPicker
                            onEmojiClick={(emojiData) => handleEmojiReact(emojiData, msg.id)}
                            theme={isDarkMode ? 'dark' : 'light'}
                            height={300}
                            width={Math.min(280, window.innerWidth - 40)}
                            previewConfig={{ showPreview: false }}
                            skinTonesDisabled={true}
                            searchDisabled={false}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          ))}

          {/* Typing indicator with improved mobile display */}
          {localTypingUsers.length > 0 && (
            <div className={`text-xs sm:text-sm flex items-center gap-1 flex-wrap px-2 ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
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

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <button
              onClick={() => {
                scrollToBottom();
                setShowScrollButton(false);
              }}
              className={`
                fixed bottom-24 right-4 sm:bottom-28 sm:right-6 p-3 rounded-full shadow-lg z-40
                transition-all duration-300 transform hover:scale-110 border-2
                ${isDarkMode
                  ? 'bg-white text-black border-white hover:bg-gray-100'
                  : 'bg-black text-white border-black hover:bg-gray-900'
                }
              `}
              title="Scroll to bottom"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div 
        ref={footerRef}
        className={`
          sticky bottom-0 flex-shrink-0 border-t z-30
          ${isDarkMode
            ? 'border-white/20 bg-black'
            : 'border-black/20 bg-white'
          }
        `}
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Reply Preview */}
        {replyingTo && (
          <div className={`
            p-2 sm:p-3 border-b flex items-start sm:items-center justify-between gap-2
            ${isDarkMode ? 'border-white/20 bg-white/5' : 'border-black/20 bg-black/5'}
          `}>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-semibold mb-1 flex items-center gap-1">
                <Reply className="w-3 h-3 sm:w-4 sm:h-4" />
                Replying to {replyingTo.sender}
              </div>
              <div className="text-xs opacity-70 truncate">
                {replyingTo.message}
              </div>
            </div>
            <button
              onClick={handleCancelReply}
              className={`
                ml-2 p-2 rounded-full transition-colors flex-shrink-0
                min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto flex items-center justify-center
                ${isDarkMode ? 'hover:bg-white/10 active:bg-white/20' : 'hover:bg-black/10 active:bg-black/20'}
              `}
              title="Cancel reply"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="p-2 sm:p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3 max-w-4xl mx-auto items-end">
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
              flex-1 px-4 py-2 sm:py-3 rounded-2xl border-2 text-sm sm:text-base min-h-[44px] sm:min-h-[48px]
              focus:outline-none transition-all duration-300
              ${isDarkMode
                ? 'bg-black border-white text-white placeholder-white/50 focus:border-white/70'
                : 'bg-white border-black text-black placeholder-black/50 focus:border-black/70'
              }
            `}
            maxLength={1000}
          />

          {/* Action Buttons Container */}
          <div className='flex items-center gap-2'>
            {/* File Upload Button */}
            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                key={fileInputKey}
                multiple
              />
              <button
                type="button"
                onClick={handleFileClick}
                disabled={isUploading}
                className={`
                  p-2.5 sm:p-3 rounded-full transition-all duration-300 flex items-center justify-center border-2 min-h-[44px] min-w-[44px] sm:min-h-[48px] sm:min-w-[48px]
                  ${isDarkMode
                    ? 'bg-black border-white text-white hover:bg-white/10'
                    : 'bg-white border-black text-black hover:bg-black/10'
                  }
                  ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}
                `}
                title="Upload file"
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Paperclip className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Emoji Button */}
            <div className="relative">
              <button
                ref={emojiButtonRef}
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`
                  p-2.5 sm:p-3 rounded-full transition-all duration-300 flex items-center justify-center border-2 min-h-[44px] min-w-[44px] sm:min-h-[48px] sm:min-w-[48px]
                  ${isDarkMode
                    ? 'bg-black border-white text-white hover:bg-white/10'
                    : 'bg-white border-black text-black hover:bg-black/10'
                  }
                `}
                title="Add emoji"
              >
                <Smile className="w-5 h-5" />
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
                    height={350}
                    width={emojiPickerWidth}
                    previewConfig={{ showPreview: false }}
                    skinTonesDisabled={false}
                    searchDisabled={false}
                  />
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!message.trim() || isUploading}
              className={`
                p-2.5 sm:p-3 rounded-full transition-all duration-300 flex items-center justify-center border-2 min-h-[44px] min-w-[44px] sm:min-h-[48px] sm:min-w-[48px]
                ${message.trim() && !isUploading
                  ? isDarkMode
                    ? 'bg-white text-black border-white hover:bg-black hover:text-white transform hover:scale-105'
                    : 'bg-black text-white border-black hover:bg-white hover:text-black transform hover:scale-105'
                  : isDarkMode
                    ? 'bg-black text-white/30 border-white/30 cursor-not-allowed'
                    : 'bg-white text-black/30 border-black/30 cursor-not-allowed'
                }
              `}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
        </div>
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