import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Square, MessageSquare, AlertCircle } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { MessageWithFeedback } from "./MessageWithFeedback";
import { MessageInput } from "./MessageInput";
import { FeedbackModal } from "./FeedbackModal";
import { useAPIHealth } from "../hooks/useAPIHealth";
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

  // Use the health check hook
  const { status: isHealthy, isChecking } = useAPIHealth();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => setIsMounted(true), []);

  // Disable body scroll when chat open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleClose = () => toggleChat();

  if (!isMounted || !isOpen) return null;

  // Status indicator configuration
  const getStatusConfig = () => {
    if (isChecking) {
      return {
        color: "bg-yellow-500",
        text: "Checking...",
        icon: null,
      };
    }
    if (isHealthy) {
      return {
        color: "bg-green-500",
        text: "Online",
        icon: null,
      };
    }
    return {
      color: "bg-red-500",
      text: "Offline",
      icon: <AlertCircle className="w-2 h-2" />,
    };
  };

  const statusConfig = getStatusConfig();

  const themeStyles = {
    light: {
      container: "bg-white border-gray-200 shadow-2xl backdrop-blur-md",
      header: "bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200",
      messages: "bg-white",
      headerButton: "hover:bg-gray-200",
      headerButtonText: "text-gray-700",
      headerText: "text-gray-900",
      closeButton: "hover:bg-red-100 text-red-600",
      closeButtonIcon: "text-red-600",
      welcomeIcon: "bg-blue-100",
      welcomeIconText: "text-blue-600",
      welcomeText: "text-gray-900",
      welcomeSubtext: "text-gray-600",
      errorBg: "bg-red-50",
      errorBorder: "border-red-200",
      errorText: "text-red-600",
      border: "border-gray-200",
      statusText: "text-gray-600",
    },
    dark: {
      container: "bg-gray-900 border-gray-700 shadow-2xl backdrop-blur-md",
      header: "bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600",
      messages: "bg-gray-900",
      headerButton: "hover:bg-gray-700",
      headerButtonText: "text-gray-300",
      headerText: "text-gray-100",
      closeButton: "hover:bg-red-900/30 text-red-400",
      closeButtonIcon: "text-red-400",
      welcomeIcon: "bg-blue-900/30",
      welcomeIconText: "text-blue-400",
      welcomeText: "text-gray-100",
      welcomeSubtext: "text-gray-400",
      errorBg: "bg-red-900/20",
      errorBorder: "border-red-800",
      errorText: "text-red-400",
      border: "border-gray-700",
      statusText: "text-gray-400",
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
              <h3 className={`font-semibold text-sm ${themeStyles[theme].headerText}`}>
                {botName}
              </h3>
              <div className="flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    statusConfig.color
                  } ${isChecking ? "animate-pulse" : ""}`}
                ></span>
                <span
                  className={`text-[10px] opacity-70 flex items-center gap-1 ${themeStyles[theme].statusText}`}
                >
                  {statusConfig.text}
                  {statusConfig.icon}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClose}
              aria-label="Minimize"
              className={`p-1 rounded ${themeStyles[theme].headerButton}`}
            >
              <Minus className={`w-3 h-3 ${themeStyles[theme].headerButtonText}`} />
            </button>
            <button
              onClick={toggleFullWidth}
              aria-label="Maximize"
              className={`p-1 rounded ${themeStyles[theme].headerButton}`}
            >
              <Square className={`w-3 h-3 ${themeStyles[theme].headerButtonText}`} />
            </button>
            <button
              onClick={openFeedbackModal}
              aria-label="Feedback"
              className={`p-1 rounded ${themeStyles[theme].closeButton}`}
            >
              <X className={`w-3 h-3 ${themeStyles[theme].closeButtonIcon}`} />
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
                  <div
                    className={`w-12 h-12 ${themeStyles[theme].welcomeIcon} rounded-full flex items-center justify-center mb-3`}
                  >
                    <MessageSquare
                      className={`w-5 h-5 ${themeStyles[theme].welcomeIconText}`}
                    />
                  </div>
                  <h3 className={`font-bold mb-1 ${themeStyles[theme].welcomeText}`}>
                    Welcome!
                  </h3>
                  <p
                    className={`text-xs opacity-70 ${themeStyles[theme].welcomeSubtext}`}
                  >
                    Start chatting with {botName} — ask questions or upload files.
                  </p>
                  {!isHealthy && !isChecking && (
                    <div
                      className={`mt-3 px-3 py-2 ${themeStyles[theme].errorBg} rounded-lg border ${themeStyles[theme].errorBorder}`}
                    >
                      <p className={`text-xs ${themeStyles[theme].errorText}`}>
                        ⚠️ Chat service is currently unavailable
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageWithFeedback key={msg.id} message={msg} theme={theme} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`border-t ${themeStyles[theme].border}`}>
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
