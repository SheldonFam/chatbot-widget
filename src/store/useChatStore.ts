import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Message, MessageFeedback, ChatState, ChatActions } from "../types";

const STORAGE_KEY = "chatbot-widget-storage";

interface ChatStore extends ChatState, ChatActions {}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      messages: [],
      feedback: [],
      isOpen: false,
      isMinimized: false,
      isFullWidth: false,
      isFeedbackModalOpen: false,
      chatFeedback: null,
      uploadedFiles: [],

      // Actions
      addMessage: (messageData) => {
        const newMessage: Message = {
          ...messageData,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
        }));

        // Auto-save to storage
        get().saveToStorage();
      },

      updateMessageFeedback: (messageId, feedbackType) => {
        set((state) => {
          const existingFeedbackIndex = state.feedback.findIndex(
            (f) => f.messageId === messageId
          );

          let newFeedback: MessageFeedback[] = [...state.feedback];

          if (existingFeedbackIndex >= 0) {
            if (feedbackType === null) {
              // Remove feedback
              newFeedback.splice(existingFeedbackIndex, 1);
            } else {
              // Update existing feedback
              newFeedback[existingFeedbackIndex] = {
                messageId,
                type: feedbackType,
              };
            }
          } else if (feedbackType !== null) {
            // Add new feedback
            newFeedback.push({
              messageId,
              type: feedbackType,
            });
          }

          return { feedback: newFeedback };
        });

        // Auto-save to storage
        get().saveToStorage();
      },

      toggleChat: () => {
        set((state) => ({
          isOpen: !state.isOpen,
          isMinimized: false,
        }));
      },

      minimizeChat: () => {
        set({ isMinimized: true });
      },

      toggleFullWidth: () => {
        set((state) => ({ isFullWidth: !state.isFullWidth }));
      },

      openFeedbackModal: () => {
        set({ isFeedbackModalOpen: true });
      },

      closeFeedbackModal: () => {
        set({ isFeedbackModalOpen: false });
      },

      setUploadedFiles: (files) => {
        set({ uploadedFiles: files });
      },

      clearUploadedFiles: () => {
        set({ uploadedFiles: [] });
      },

      submitChatFeedback: (feedback) => {
        set({ chatFeedback: feedback });
        get().saveToStorage();
      },

      loadFromStorage: () => {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            // Convert timestamp strings back to Date objects
            const messages = parsed.state.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }));

            set({
              messages,
              feedback: parsed.state.feedback || [],
              chatFeedback: parsed.state.chatFeedback
                ? {
                    ...parsed.state.chatFeedback,
                    submittedAt: new Date(
                      parsed.state.chatFeedback.submittedAt
                    ),
                  }
                : null,
            });
          }
        } catch (error) {
          console.error("Failed to load chat data from storage:", error);
        }
      },

      saveToStorage: () => {
        try {
          const state = get();
          const dataToStore = {
            state: {
              messages: state.messages,
              feedback: state.feedback,
              chatFeedback: state.chatFeedback,
            },
            version: 1,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
        } catch (error) {
          console.error("Failed to save chat data to storage:", error);
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        messages: state.messages,
        feedback: state.feedback,
        chatFeedback: state.chatFeedback,
      }),
    }
  )
);
