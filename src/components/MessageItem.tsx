import React, { memo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "../types";

interface MessageItemProps {
  message: Message;
  theme: "light" | "dark";
}

// Theme classes for message styling
const MESSAGE_THEME_CLASSES = {
  light: {
    user: "bg-blue-600 text-white",
    bot: "bg-gray-100 text-gray-900",
    container: "text-gray-700",
  },
  dark: {
    user: "bg-blue-600 text-white",
    bot: "bg-gray-700 text-gray-100",
    container: "text-gray-300",
  },
} as const;

export const MessageItem: React.FC<MessageItemProps> = memo(
  ({ message, theme }) => {
    const isUser = message.sender === "user";

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <motion.div
        className={`flex ${isUser ? "justify-end" : "justify-start"} mb-0.5`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        role="article"
        aria-label={`${
          isUser ? "Your message" : "Assistant message"
        } at ${formatTime(message.timestamp)}`}
      >
        <div
          className={`max-w-[90%] xs:max-w-[85%] sm:max-w-[80%] md:max-w-[78%] lg:max-w-[75%] xl:max-w-[70%] 2xl:max-w-[68%] 3xl:max-w-[65%] ${
            isUser ? "order-2" : "order-1"
          }`}
        >
          <div
            className={`
            px-1.5 py-1 rounded-md shadow-sm
            ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}
            ${MESSAGE_THEME_CLASSES[theme][isUser ? "user" : "bot"]}
          `}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap break-words text-sm">
                {message.content}
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className={`${MESSAGE_THEME_CLASSES[theme].container} prose-headings:text-gray-900 prose-p:text-gray-700 prose-code:text-gray-800 prose-pre:bg-gray-100`}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {message.files && message.files.length > 0 && (
            <div
              className={`mt-2 flex flex-wrap gap-1 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {message.files.map((file) => (
                <div
                  key={file.id}
                  className={`
                  flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                  ${
                    isUser
                      ? "bg-blue-500 bg-opacity-20 text-blue-100 border border-blue-400 border-opacity-30"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }
                `}
                  role="img"
                  aria-label={`Attached file: ${file.name}`}
                >
                  <span className="text-xs" aria-hidden="true">
                    📎
                  </span>
                  <span className="truncate max-w-24">{file.name}</span>
                </div>
              ))}
            </div>
          )}

          <div
            className={`text-xs mt-0 opacity-60 ${
              MESSAGE_THEME_CLASSES[theme].container
            } ${isUser ? "text-right" : "text-left"}`}
          >
            {formatTime(message.timestamp)}
          </div>
        </div>
      </motion.div>
    );
  }
);

MessageItem.displayName = "MessageItem";
