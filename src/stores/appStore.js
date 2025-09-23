import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// App states
export const APP_STATES = {
  HOME: 'home',
  JOINING: 'joining',
  CREATING: 'creating',
  CHATTING: 'chatting'
};

export const useAppStore = create((set, get) => ({
        // State
        currentState: APP_STATES.HOME,
        roomId: null,
        userName: null,
        isCreator: false,
        roomPassword: null,
        participants: [],
        messages: [],
        notifications: [],
        typingUsers: [],
        isConnected: false,

        // Actions
        setState: (newState) => set({ currentState: newState }),

        setRoomData: (roomData) => set({
          roomId: roomData.roomId,
          isCreator: roomData.isCreator || false,
          roomPassword: roomData.password || null
        }),

        setUserData: (userData) => set({
          userName: userData.userName
        }),

        addMessage: (message) => set((state) => ({
          messages: [...state.messages, message]
        })),

        setMessages: (messages) => set({ messages }),

        updateParticipants: (participants) => set({ participants }),

        addNotification: (notification) => set((state) => ({
          notifications: [...state.notifications, {
            id: Date.now(),
            ...notification
          }]
        })),

        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),

        clearNotifications: () => set({ notifications: [] }),

        setTypingUsers: (typingUsers) => set({ typingUsers }),

        addTypingUser: (userName) => set((state) => ({
          typingUsers: state.typingUsers.includes(userName)
            ? state.typingUsers
            : [...state.typingUsers, userName]
        })),

        removeTypingUser: (userName) => set((state) => ({
          typingUsers: state.typingUsers.filter(u => u !== userName)
        })),

        setConnected: (isConnected) => set({ isConnected }),

        resetState: () => set({
          currentState: APP_STATES.HOME,
          roomId: null,
          userName: null,
          isCreator: false,
          participants: [],
          messages: [],
          notifications: [],
          typingUsers: [],
          isConnected: false
        }),

        // Computed values
        get currentScreen() {
          return get().currentState;
        },

        get isInRoom() {
          return get().roomId !== null;
        },

        get messageCount() {
          return get().messages.length;
        }
}));

// Auto-clear notifications will be handled in the component level

// Selectors for better performance
export const useCurrentState = () => useAppStore((state) => state.currentState);
export const useRoomId = () => useAppStore((state) => state.roomId);
export const useUserName = () => useAppStore((state) => state.userName);
export const useIsCreator = () => useAppStore((state) => state.isCreator);
export const useRoomPassword = () => useAppStore((state) => state.roomPassword);
export const useMessages = () => useAppStore((state) => state.messages);
export const useParticipants = () => useAppStore((state) => state.participants);
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useTypingUsers = () => useAppStore((state) => state.typingUsers);
export const useConnectionStatus = () => useAppStore((state) => state.isConnected);

// Individual action selectors to prevent re-renders
export const useSetState = () => useAppStore((state) => state.setState);
export const useSetRoomData = () => useAppStore((state) => state.setRoomData);
export const useSetUserData = () => useAppStore((state) => state.setUserData);
export const useAddMessage = () => useAppStore((state) => state.addMessage);
export const useSetMessages = () => useAppStore((state) => state.setMessages);
export const useUpdateParticipants = () => useAppStore((state) => state.updateParticipants);
export const useAddNotification = () => useAppStore((state) => state.addNotification);
export const useRemoveNotification = () => useAppStore((state) => state.removeNotification);
export const useClearNotifications = () => useAppStore((state) => state.clearNotifications);
export const useSetTypingUsers = () => useAppStore((state) => state.setTypingUsers);
export const useAddTypingUser = () => useAppStore((state) => state.addTypingUser);
export const useRemoveTypingUser = () => useAppStore((state) => state.removeTypingUser);
export const useSetConnected = () => useAppStore((state) => state.setConnected);
export const useResetState = () => useAppStore((state) => state.resetState);

export default useAppStore;
