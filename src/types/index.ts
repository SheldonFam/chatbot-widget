// ============================================
// Message Types
// ============================================

export type MessageSender = "user" | "bot";

export interface Message {
  id: string;
  content: string;
  sender: MessageSender;
  timestamp: number; // Unix timestamp in milliseconds
  files?: UploadedFile[];
  isLoading?: boolean;
  isStreaming?: boolean;
  feedback?: "positive" | "negative" | null;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string; // For preview purposes
  content?: string | ArrayBuffer; // For file content
}

export interface MessageFeedback {
  messageId: string;
  type: "upvote" | "downvote" | null;
}

export interface ChatFeedback {
  rating: number; // 1-5 stars
  comment: string;
  submittedAt: Date;
}

// ============================================
// Widget Configuration
// ============================================

export interface ChatbotWidgetProps {
  botName?: string;
  theme?: "light" | "dark";
  position?: "bottom-right" | "bottom-left";
  allowUpload?: boolean;
}

export interface ChatState {
  messages: Message[];
  feedback: MessageFeedback[];
  isOpen: boolean;
  isMinimized: boolean;
  isFullWidth: boolean;
  isFeedbackModalOpen: boolean;
  chatFeedback: ChatFeedback | null;
  uploadedFiles: UploadedFile[];
}

export interface ChatActions {
  addMessage: (message: Omit<Message, "id" | "timestamp">) => string;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  updateMessageFeedback: (
    messageId: string,
    feedback: "upvote" | "downvote" | null
  ) => void;
  toggleChat: () => void;
  minimizeChat: () => void;
  toggleFullWidth: () => void;
  openFeedbackModal: () => void;
  closeFeedbackModal: () => void;
  setUploadedFiles: (files: UploadedFile[]) => void;
  clearUploadedFiles: () => void;
  submitChatFeedback: (feedback: ChatFeedback) => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

// ============================================
// API Request/Response Types
// ============================================

export interface ChatRequest {
  message: string;
  conversationHistory?: Message[];
}

export interface ChatResponse {
  success: boolean;
  response: string;
  error?: string;
  details?: string;
}

export interface StreamChunk {
  content?: string;
  error?: string;
}

// ============================================
// Health Check
// ============================================

export interface HealthResponse {
  status: "ok" | "error";
  message: string;
  timestamp?: number;
}
