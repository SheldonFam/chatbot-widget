import React from "react";
import { ChatBubble } from "./ChatBubble";
import { ChatWindow } from "./ChatWindow";
import { ChatbotWidgetProps } from "../types";

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  botName = "AI Assistant",
  theme = "light",
  position = "bottom-right",
  allowUpload = true,
}) => {
  return (
    <>
      <ChatBubble position={position} theme={theme} />
      <ChatWindow
        botName={botName}
        theme={theme}
        position={position}
        allowUpload={allowUpload}
      />
    </>
  );
};
