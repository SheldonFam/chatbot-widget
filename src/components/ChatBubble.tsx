import React from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

interface ChatBubbleProps {
  position: "bottom-right" | "bottom-left";
  theme: "light" | "dark";
}

const POSITION = {
  "bottom-right": "bottom-5 right-5",
  "bottom-left": "bottom-5 left-5",
} as const;

const THEME = {
  light: {
    button: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg",
    pulse: "bg-blue-400",
  },
  dark: {
    button: "bg-gray-800 hover:bg-gray-700 text-white shadow-lg",
    pulse: "bg-blue-500",
  },
} as const;

export const ChatBubble: React.FC<ChatBubbleProps> = ({ position, theme }) => {
  const { isOpen, toggleChat } = useChatStore();
  if (isOpen) return null;

  return (
    <motion.button
      aria-label="Open chat"
      onClick={toggleChat}
      className={`
        fixed z-[9998] w-14 h-14 rounded-full flex items-center justify-center
        ${POSITION[position]} ${THEME[theme].button}
        transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300
      `}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 250, damping: 20, delay: 0.2 },
      }}
      exit={{ opacity: 0, scale: 0 }}
    >
      <motion.div
        animate={{
          rotate: [0, 10, -10, 0],
        }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.div>

      <motion.div
        className={`absolute inset-0 rounded-full ${THEME[theme].pulse} opacity-30`}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.button>
  );
};
