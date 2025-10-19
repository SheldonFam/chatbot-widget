import React from "react";
import { ChatBubble } from "./ChatBubble";
import { ChatWindow } from "./ChatWindow";
import { ErrorBoundary } from "./ErrorBoundary";
import { ChatbotWidgetProps } from "../types";

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  botName = "AI Assistant",
  theme = "light",
  position = "bottom-right",
  allowUpload = true,
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to error reporting service in production
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    console.error("ChatbotWidget Error:", error, errorInfo);
  };

  return (
    <ErrorBoundary onError={handleError}>
      <ChatBubble position={position} theme={theme} />
      <ChatWindow
        botName={botName}
        theme={theme}
        position={position}
        allowUpload={allowUpload}
      />
    </ErrorBoundary>
  );
};
