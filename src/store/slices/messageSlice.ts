import { StateCreator } from "zustand";
import { Message } from "../../types";

export interface MessageSlice {
  messages: Message[];
  addMessage: (messageData: Omit<Message, "id" | "timestamp">) => string;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
}

export const createMessageSlice: StateCreator<
  MessageSlice,
  [],
  [],
  MessageSlice
> = (set) => ({
  messages: [],

  addMessage: (messageData) => {
    const newMessage: Message = {
      ...messageData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
    }));

    return newMessage.id;
  },

  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    }));
  },

  clearMessages: () => set({ messages: [] }),
});
