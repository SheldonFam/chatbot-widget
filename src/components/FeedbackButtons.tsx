import React, { memo } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

interface FeedbackButtonsProps {
  messageId: string;
  theme: "light" | "dark";
}

// Theme classes for feedback buttons
const FEEDBACK_THEME_CLASSES = {
  light: {
    button: "text-gray-400 hover:text-gray-600",
    active: "text-blue-600",
  },
  dark: {
    button: "text-gray-500 hover:text-gray-300",
    active: "text-blue-400",
  },
} as const;

export const FeedbackButtons: React.FC<FeedbackButtonsProps> = memo(
  ({ messageId, theme }) => {
    const { feedback, updateMessageFeedback } = useChatStore();

    const currentFeedback =
      feedback.find((f) => f.messageId === messageId)?.type || null;

    const handleFeedback = (type: "upvote" | "downvote") => {
      const newFeedback = currentFeedback === type ? null : type;
      updateMessageFeedback(messageId, newFeedback);
    };

    return (
      <motion.div
        className="flex items-center gap-0.5 mt-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        role="group"
        aria-label="Message feedback"
      >
        <motion.button
          className={`
          p-0.5 rounded-full transition-colors duration-200 min-w-[24px] min-h-[24px] flex items-center justify-center
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-opacity-50
          ${
            currentFeedback === "upvote"
              ? FEEDBACK_THEME_CLASSES[theme].active
              : FEEDBACK_THEME_CLASSES[theme].button
          }
        `}
          onClick={() => handleFeedback("upvote")}
          aria-label={
            currentFeedback === "upvote"
              ? "Remove upvote"
              : "Upvote this message"
          }
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            scale: currentFeedback === "upvote" ? 1.1 : 1,
          }}
        >
          <ThumbsUp size={12} className="w-3 h-3" aria-hidden="true" />
        </motion.button>

        <motion.button
          className={`
          p-0.5 rounded-full transition-colors duration-200 min-w-[24px] min-h-[24px] flex items-center justify-center
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-opacity-50
          ${
            currentFeedback === "downvote"
              ? FEEDBACK_THEME_CLASSES[theme].active
              : FEEDBACK_THEME_CLASSES[theme].button
          }
        `}
          onClick={() => handleFeedback("downvote")}
          aria-label={
            currentFeedback === "downvote"
              ? "Remove downvote"
              : "Downvote this message"
          }
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            scale: currentFeedback === "downvote" ? 1.1 : 1,
          }}
        >
          <ThumbsDown size={12} className="w-3 h-3" aria-hidden="true" />
        </motion.button>
      </motion.div>
    );
  }
);

FeedbackButtons.displayName = "FeedbackButtons";
