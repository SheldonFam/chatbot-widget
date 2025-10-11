import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createMessageSlice, MessageSlice } from "./slices/messageSlice";
import { createFeedbackSlice, FeedbackSlice } from "./slices/feedbackSlice";
import { createUISlice, UISlice } from "./slices/uiSlice";
import { createUploadSlice, UploadSlice } from "./slices/uploadSlice";

export type ChatStore = MessageSlice & FeedbackSlice & UISlice & UploadSlice;

const STORAGE_KEY = "chatbot-widget-storage";

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}

function mergePersistedState(
  persistedState: unknown,
  currentState: ChatStore
): ChatStore {
  if (!isObject(persistedState)) return currentState;

  const merged = {
    ...currentState,
    ...(persistedState as Partial<ChatStore>),
  };

  if (merged.messages) {
    merged.messages = merged.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  }

  if (merged.chatFeedback?.submittedAt) {
    merged.chatFeedback.submittedAt = new Date(merged.chatFeedback.submittedAt);
  }

  return merged;
}

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set, get, store) => ({
        ...createMessageSlice(set, get, store),
        ...createFeedbackSlice(set, get, store),
        ...createUISlice(set, get, store),
        ...createUploadSlice(set, get, store),
      }),
      {
        name: STORAGE_KEY,
        version: 1,
        merge: mergePersistedState,
        migrate: (persistedState, _version) => persistedState as ChatStore, // ✅ prevent warning
        partialize: (state) => ({
          messages: state.messages,
          feedback: state.feedback,
          chatFeedback: state.chatFeedback,
        }),
      }
    ),
    { name: "ChatStore" }
  )
);
