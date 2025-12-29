import React, { memo } from "react";
import { Message } from "../types";
import { MessageItem } from "./MessageItem";
import { FeedbackButtons } from "./FeedbackButtons";

interface MessageWithFeedbackProps {
  message: Message;
  theme: "light" | "dark";
}

/**
 * Memoized wrapper component that combines MessageItem and FeedbackButtons
 *
 * PERFORMANCE OPTIMIZATION:
 * This component prevents unnecessary re-renders of all messages when only one message changes.
 *
 * Without this wrapper, even though MessageItem and FeedbackButtons are memoized,
 * the parent div would cause all messages to re-render on any state change.
 *
 * With this optimization:
 * - New message added: Only the new message renders (not all existing messages)
 * - Feedback clicked: Only that message re-renders (not all messages)
 * - Loading state changes: Only the affected message re-renders
 *
 * The custom comparison function ensures re-renders only happen when the message
 * reference itself changes, leveraging Zustand's selective updates.
 */
export const MessageWithFeedback: React.FC<MessageWithFeedbackProps> = memo(
  ({ message, theme }) => {
    const isBot = message.sender === "bot";

    return (
      <div>
        <MessageItem message={message} theme={theme} />
        {isBot && (
          <div className="ml-4">
            <FeedbackButtons messageId={message.id} theme={theme} />
          </div>
        )}
      </div>
    );
  },
  // Custom comparison function for more granular control
  (prevProps, nextProps) => {
    // Only re-render if the message object itself changed or theme changed
    return prevProps.message === nextProps.message && prevProps.theme === nextProps.theme;
  }
);

MessageWithFeedback.displayName = "MessageWithFeedback";
