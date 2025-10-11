import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Square, MessageSquare } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { MessageItem } from "./MessageItem";
import { FeedbackButtons } from "./FeedbackButtons";
import { MessageInput } from "./MessageInput";
import { FeedbackModal } from "./FeedbackModal";
import { ChatbotWidgetProps } from "../types";

interface ChatWindowProps extends ChatbotWidgetProps {
  position: "bottom-right" | "bottom-left";
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  botName = "AI Assistant",
  theme = "light",
  position,
  allowUpload = true,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const {
    messages,
    isOpen,
    isMinimized,
    isFullWidth,
    isFeedbackModalOpen,
    toggleChat,
    toggleFullWidth,
    openFeedbackModal,
    closeFeedbackModal,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => setIsMounted(true), []);

  // Disable body scroll when chat open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleClose = () => toggleChat();

  if (!isMounted || !isOpen) return null;

  const themeStyles = {
    light: {
      container: "bg-white border-gray-200 shadow-2xl backdrop-blur-md",
      header:
        "bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200",
      messages: "bg-white",
    },
    dark: {
      container: "bg-gray-900 border-gray-700 shadow-2xl backdrop-blur-md",
      header:
        "bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600",
      messages: "bg-gray-900",
    },
  } as const;

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={chatWindowRef}
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: isMinimized ? 0.95 : 1,
        }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`
          fixed z-[9999] flex flex-col rounded-2xl border
          ${themeStyles[theme].container}
          ${
            isFullWidth
              ? "inset-[1rem] w-[calc(100vw-2rem)] h-[calc(100dvh-2rem)]"
              : "w-[clamp(18rem,90vw,26rem)] h-[min(80dvh,600px)]"
          }
        `}
        style={
          isFullWidth
            ? undefined
            : position === "bottom-right"
            ? {
                right: "max(1rem, env(safe-area-inset-right))",
                bottom: "max(1rem, env(safe-area-inset-bottom))",
              }
            : {
                left: "max(1rem, env(safe-area-inset-left))",
                bottom: "max(1rem, env(safe-area-inset-bottom))",
              }
        }
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-t-2xl ${themeStyles[theme].header}`}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
              <MessageSquare className="text-white w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{botName}</h3>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] opacity-70">Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClose}
              aria-label="Minimize"
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={toggleFullWidth}
              aria-label="Maximize"
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              onClick={openFeedbackModal}
              aria-label="Feedback"
              className="p-1 rounded hover:bg-red-100 text-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Body */}
        {!isMinimized && (
          <>
            <div
              className={`flex-1 overflow-y-auto px-3 py-2 ${themeStyles[theme].messages}`}
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold mb-1">Welcome!</h3>
                  <p className="text-xs opacity-70">
                    Start chatting with {botName} — ask questions or upload
                    files.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id}>
                    <MessageItem message={msg} theme={theme} />
                    {msg.sender === "bot" && (
                      <div className="ml-4">
                        <FeedbackButtons messageId={msg.id} theme={theme} />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 dark:border-gray-700">
              <MessageInput theme={theme} allowUpload={allowUpload} />
            </div>
          </>
        )}

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={closeFeedbackModal}
          theme={theme}
        />
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
