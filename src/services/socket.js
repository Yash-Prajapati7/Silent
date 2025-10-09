import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  // Initialize socket connection
  connect() {
    if (!this.socket) {
      const socketURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      this.socket = io(socketURL, {
        transports: ['websocket'],
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        this.isConnected = false;
      });

      this.socket.on('reconnect', (attemptNumber) => {
        this.isConnected = true;
      });

      this.socket.on('reconnect_error', (error) => {
        // Silent error handling
      });
    }
    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a room
  joinRoom(roomId, userName) {
    if (this.socket) {
      this.socket.emit('joinRoom', { roomId, userName });
    }
  }

  // Leave a room
  leaveRoom() {
    if (this.socket) {
      this.socket.emit('leaveRoom');
    }
  }

  // Send a message
  sendMessage(roomId, message, replyTo = null) {
    if (this.socket) {
      this.socket.emit('sendMessage', { roomId, message, replyTo });
    }
  }

  // React to a message
  reactToMessage(roomId, messageId, emoji) {
    if (this.socket) {
      this.socket.emit('reactToMessage', { roomId, messageId, emoji });
    }
  }

  // Send typing indicator
  setTyping(roomId, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { roomId, isTyping });
    }
  }

  // Event listeners
  onJoinedRoom(callback) {
    if (this.socket) {
      this.socket.on('joinedRoom', callback);
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('userJoined', callback);
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('userLeft', callback);
    }
  }

  onUserConnected(callback) {
    if (this.socket) {
      this.socket.on('userConnected', callback);
    }
  }

  onUserDisconnected(callback) {
    if (this.socket) {
      this.socket.on('userDisconnected', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  onRoomEnded(callback) {
    if (this.socket) {
      this.socket.on('roomEnded', callback);
    }
  }

  onError(callback) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  onMessageReaction(callback) {
    if (this.socket) {
      this.socket.on('messageReaction', callback);
    }
  }

  // Remove event listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Check if connected
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;
