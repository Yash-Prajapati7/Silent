import React, { useEffect } from 'react';
import { useCurrentState, useNotifications, useRemoveNotification, useClearNotifications, APP_STATES } from './stores/appStore';
import ConnectionStatus from './components/ConnectionStatus';
import HomeScreen from './components/HomeScreen';
import JoinRoomModal from './components/JoinRoomModal';
import CreateRoomModal from './components/CreateRoomModal';
import ChatScreen from './components/ChatScreen';
import NotificationContainer from './components/NotificationContainer';

function App() {
  const currentState = useCurrentState();
  const notifications = useNotifications();
  const removeNotification = useRemoveNotification();
  const clearNotifications = useClearNotifications();

  // Auto-clear notifications after 5 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        clearNotifications();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications, clearNotifications]);

  return (
    <div className="relative">
      {/* Show theme toggle and connection status only on home screen */}
      {currentState === APP_STATES.HOME && (
        <>
          <ConnectionStatus />
        </>
      )}
      
      {/* Render current screen based on state */}
      {currentState === APP_STATES.HOME && <HomeScreen />}
      {currentState === APP_STATES.CHATTING && <ChatScreen />}
      
      {/* Modals */}
      <JoinRoomModal />
      <CreateRoomModal />
      
      {/* Notifications */}
      <NotificationContainer 
        notifications={notifications} 
        onClose={removeNotification} 
      />
    </div>
  );
}

export default App;
