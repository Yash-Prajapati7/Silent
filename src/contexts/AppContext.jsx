import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// App states
export const APP_STATES = {
  HOME: 'home',
  JOINING: 'joining',
  CREATING: 'creating',
  CHATTING: 'chatting'
};

// Action types
const ACTION_TYPES = {
  SET_STATE: 'SET_STATE',
  SET_ROOM_DATA: 'SET_ROOM_DATA',
  SET_USER_DATA: 'SET_USER_DATA',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_MESSAGES: 'SET_MESSAGES',
  UPDATE_PARTICIPANTS: 'UPDATE_PARTICIPANTS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  RESET_STATE: 'RESET_STATE'
};

// Initial state
const initialState = {
  currentState: APP_STATES.HOME,
  roomId: null,
  userName: null,
  isCreator: false,
  participants: [],
  messages: [],
  notifications: [],
  typingUsers: [],
  isConnected: false
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_STATE:
      return { ...state, currentState: action.payload };
      
    case ACTION_TYPES.SET_ROOM_DATA:
      return { 
        ...state, 
        roomId: action.payload.roomId,
        isCreator: action.payload.isCreator || false 
      };
      
    case ACTION_TYPES.SET_USER_DATA:
      return { 
        ...state, 
        userName: action.payload.userName 
      };
      
    case ACTION_TYPES.ADD_MESSAGE:
      return { 
        ...state, 
        messages: [...state.messages, action.payload] 
      };
      
    case ACTION_TYPES.SET_MESSAGES:
      return { 
        ...state, 
        messages: action.payload 
      };
      
    case ACTION_TYPES.UPDATE_PARTICIPANTS:
      return { 
        ...state, 
        participants: action.payload 
      };
      
    case ACTION_TYPES.ADD_NOTIFICATION:
      return { 
        ...state, 
        notifications: [...state.notifications, { 
          id: Date.now(), 
          ...action.payload 
        }] 
      };
      
    case ACTION_TYPES.REMOVE_NOTIFICATION:
      return { 
        ...state, 
        notifications: state.notifications.filter(n => n.id !== action.payload) 
      };
      
    case ACTION_TYPES.CLEAR_NOTIFICATIONS:
      return { 
        ...state, 
        notifications: [] 
      };
      
    case ACTION_TYPES.RESET_STATE:
      return { 
        ...initialState, 
        currentState: APP_STATES.HOME 
      };
      
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const actions = {
    setState: (newState) => {
      dispatch({ type: ACTION_TYPES.SET_STATE, payload: newState });
    },
    
    setRoomData: (roomData) => {
      dispatch({ type: ACTION_TYPES.SET_ROOM_DATA, payload: roomData });
    },
    
    setUserData: (userData) => {
      dispatch({ type: ACTION_TYPES.SET_USER_DATA, payload: userData });
    },
    
    addMessage: (message) => {
      dispatch({ type: ACTION_TYPES.ADD_MESSAGE, payload: message });
    },
    
    setMessages: (messages) => {
      dispatch({ type: ACTION_TYPES.SET_MESSAGES, payload: messages });
    },
    
    updateParticipants: (participants) => {
      dispatch({ type: ACTION_TYPES.UPDATE_PARTICIPANTS, payload: participants });
    },
    
    addNotification: (notification) => {
      dispatch({ type: ACTION_TYPES.ADD_NOTIFICATION, payload: notification });
    },
    
    removeNotification: (id) => {
      dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: id });
    },
    
    clearNotifications: () => {
      dispatch({ type: ACTION_TYPES.CLEAR_NOTIFICATIONS });
    },
    
    resetState: () => {
      dispatch({ type: ACTION_TYPES.RESET_STATE });
    }
  };

  // Auto-clear notifications after 5 seconds
  useEffect(() => {
    if (state.notifications.length > 0) {
      const timer = setTimeout(() => {
        actions.clearNotifications();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.notifications]);

  const value = {
    state,
    actions,
    APP_STATES
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
