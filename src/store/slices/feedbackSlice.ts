import { StateCreator } from "zustand";
import { MessageFeedback, ChatFeedback } from "../../types";

export interface FeedbackSlice {
  feedback: MessageFeedback[];
  chatFeedback: ChatFeedback | null;
  updateMessageFeedback: (
    messageId: string,
    feedbackType: MessageFeedback["type"] | null
  ) => void;
  submitChatFeedback: (feedback: ChatFeedback) => void;
}

export const createFeedbackSlice: StateCreator<
  FeedbackSlice,
  [],
  [],
  FeedbackSlice
> = (set) => ({
  feedback: [],
  chatFeedback: null,

  updateMessageFeedback: (messageId, feedbackType) => {
    set((state) => {
      const feedback = state.feedback.filter((f) => f.messageId !== messageId);
      if (feedbackType) feedback.push({ messageId, type: feedbackType });
      return { feedback };
    });
  },

  submitChatFeedback: (feedback) => set({ chatFeedback: feedback }),
});
