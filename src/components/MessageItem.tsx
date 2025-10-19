import React, { memo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "../types";

interface MessageItemProps {
  message: Message;
  theme: "light" | "dark";
}

const themeStyles = {
  light: {
    user: "bg-blue-600 text-white",
    bot: "bg-gray-100 text-gray-900",
    text: "text-gray-700",
    loading: "bg-gray-200",
  },
  dark: {
    user: "bg-blue-600 text-white",
    bot: "bg-gray-700 text-gray-100",
    text: "text-gray-300",
    loading: "bg-gray-600",
  },
} as const;

export const MessageItem: React.FC<MessageItemProps> = memo(
  ({ message, theme }) => {
    const isUser = message.sender === "user";
    const t = themeStyles[theme];

    const formatTime = (timestamp: number) =>
      new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

    return (
      <motion.div
        className={`flex ${isUser ? "justify-end" : "justify-start"} mb-1`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div
          className={`flex flex-col gap-1 max-w-[min(85%,650px)] ${
            isUser ? "items-end" : "items-start"
          }`}
        >
          <div
            className={`
              px-3 py-2 rounded-2xl shadow-sm overflow-hidden
              ${isUser ? `${t.user} rounded-br-md` : `${t.bot} rounded-bl-md`}
            `}
          >
            {message.isLoading ? (
              <div className={`flex items-center gap-1`}>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className={`w-2 h-2 rounded-full ${t.loading}`}
                    animate={{
                      opacity: [0.2, 1, 0.2],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            ) : isUser ? (
              <p className="whitespace-pre-wrap break-words break-all text-sm leading-relaxed">
                {message.content}
              </p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className={`prose prose-sm max-w-none break-words break-all overflow-x-hidden ${
                  theme === "dark" ? "prose-invert" : ""
                }`}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>

          <span
            className={`text-[10px] opacity-60 ${t.text} ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {formatTime(message.timestamp)}
          </span>
        </div>
      </motion.div>
    );
  }
);

MessageItem.displayName = "MessageItem";
