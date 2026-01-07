import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { FileUpload } from "./FileUpload";
import { sendStreamingChatMessage } from "../services/chatService";
import { generateStreamingDocumentQA } from "../services/documentService";
import { ChatServiceError } from "../services/api/client";
import { CHAT, FILE_UPLOAD, UI } from "../constants";

interface MessageInputProps {
  theme: "light" | "dark";
  allowUpload?: boolean;
}

interface FormData {
  message: string;
}

const THEME_CLASSES = {
  light: {
    container: "bg-gradient-to-r from-gray-50 to-white border-t border-gray-200",
    input:
      "bg-white text-gray-900 placeholder-gray-500 border-gray-200 focus:border-blue-500",
    button:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
    buttonDisabled: "bg-gray-300 text-gray-500",
  },
  dark: {
    container: "bg-gradient-to-r from-gray-800 to-gray-700 border-t border-gray-600",
    input:
      "bg-gray-800 text-gray-100 placeholder-gray-400 border-gray-600 focus:border-blue-400",
    button:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
    buttonDisabled: "bg-gray-600 text-gray-400",
  },
} as const;

export const MessageInput: React.FC<MessageInputProps> = ({
  theme,
  allowUpload = true,
}) => {
  const {
    addMessage,
    updateMessage,
    messages,
    uploadedFiles,
    setUploadedFiles,
    clearUploadedFiles,
  } = useChatStore();

  const { register, handleSubmit, reset, watch } = useForm<FormData>();
  const messageValue = watch("message", "");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if files are ready (uploaded and have fileUri, or not PDF files)
  const filesReady = uploadedFiles.every(
    (file) => !file.isUploading && (file.fileUri || file.type !== "application/pdf")
  );
  const hasUploadErrors = uploadedFiles.some((file) => file.uploadError);

  const canSend =
    (messageValue.trim().length > 0 || uploadedFiles.length > 0) &&
    !isProcessing &&
    filesReady &&
    !hasUploadErrors;

  /** 🧩 Resize dynamically when value changes */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, UI.TEXTAREA_MAX_HEIGHT_PX) + "px";
  }, [messageValue]);

  /** 🔧 Remove a single uploaded file */
  const removeFile = (fileId: string) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== fileId));
  };

  /** 💬 Submit logic - Now with real AI! */
  const onSubmit = async (data: FormData) => {
    if (!data.message.trim() && uploadedFiles.length === 0) return;
    if (isProcessing) return;

    setIsProcessing(true);

    const userMsg = data.message.trim() || "📎 File(s) shared";
    const filesToUpload = [...uploadedFiles];
    const hasFiles = filesToUpload.length > 0;

    // Mark files as uploading
    if (hasFiles) {
      setUploadedFiles(filesToUpload.map((file) => ({ ...file, isUploading: true })));
    }

    // Add user message
    addMessage({
      content: userMsg,
      sender: "user",
      files: hasFiles ? filesToUpload : undefined,
    });

    reset();
    clearUploadedFiles();

    // Add a loading message immediately and capture its ID
    const loadingMessageId = addMessage({
      content: "",
      sender: "bot",
      isLoading: true,
      isStreaming: false,
    });

    try {
      // Get conversation history (exclude the message we just added and the loading message)
      const conversationHistory = messages
        .filter((msg) => msg.id !== loadingMessageId) // Exclude loading message
        .slice(-CHAT.MAX_HISTORY_MESSAGES);

      let fullResponse = "";
      let hasReceivedContent = false;

      if (hasFiles) {
        // Handle document Q&A flow
        // Files should already be uploaded when selected (via FileUpload component)
        const uploadedFileUris: string[] = [];
        const uploadErrors: string[] = [];

        for (const file of filesToUpload) {
          if (file.uploadError) {
            uploadErrors.push(`${file.name}: ${file.uploadError}`);
          } else if (file.fileUri) {
            uploadedFileUris.push(file.fileUri);
          } else if (file.isUploading) {
            uploadErrors.push(`${file.name}: Still uploading, please wait...`);
          } else {
            uploadErrors.push(`${file.name}: Upload failed or not completed`);
          }
        }

        if (uploadErrors.length > 0) {
          throw new Error(`Upload issues: ${uploadErrors.join(", ")}`);
        }

        if (uploadedFileUris.length === 0) {
          throw new Error("No files were successfully uploaded");
        }

        // Use the first file URI for document Q&A (backend may support multiple later)
        const fileUri = uploadedFileUris[0];
        const question = userMsg || "What is this document about?";

        // Stream document Q&A response
        for await (const chunk of generateStreamingDocumentQA(
          fileUri,
          question,
          conversationHistory
        )) {
          if (chunk) {
            fullResponse += chunk;

            if (!hasReceivedContent && fullResponse.trim()) {
              hasReceivedContent = true;
              updateMessage(loadingMessageId, {
                isLoading: false,
                isStreaming: true,
                content: fullResponse,
              });
            } else if (hasReceivedContent) {
              updateMessage(loadingMessageId, {
                content: fullResponse,
                isStreaming: true,
              });
            }
          }
        }
      } else {
        // Regular chat flow
        for await (const chunk of sendStreamingChatMessage(
          userMsg,
          conversationHistory
        )) {
          if (chunk) {
            fullResponse += chunk;

            if (!hasReceivedContent && fullResponse.trim()) {
              hasReceivedContent = true;
              updateMessage(loadingMessageId, {
                isLoading: false,
                isStreaming: true,
                content: fullResponse,
              });
            } else if (hasReceivedContent) {
              updateMessage(loadingMessageId, {
                content: fullResponse,
                isStreaming: true,
              });
            }
          }
        }
      }

      // Streaming complete
      if (!hasReceivedContent) {
        updateMessage(loadingMessageId, {
          content:
            "I received your message but didn't generate a response. Please try again.",
          isLoading: false,
          isStreaming: false,
        });
      } else {
        updateMessage(loadingMessageId, {
          content: fullResponse,
          isLoading: false,
          isStreaming: false,
        });
      }
    } catch (error) {
      console.error("Chat streaming error:", error);

      const errorMessage =
        error instanceof ChatServiceError
          ? error.originalError || error.message
          : error instanceof Error
            ? error.message
            : "Unknown error occurred";

      updateMessage(loadingMessageId, {
        content: `Sorry, I encountered an error: ${errorMessage}`,
        isLoading: false,
        isStreaming: false,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /** ⌨️ Enter to send */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <motion.div
      className={`p-2 rounded-b-2xl flex-shrink-0 ${THEME_CLASSES[theme].container}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 w-full">
        {/* Uploaded Files */}
        {allowUpload && uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center gap-2 px-2 py-1 rounded-md border text-sm ${
                  theme === "light"
                    ? file.uploadError
                      ? "bg-red-50 border-red-200 text-red-700"
                      : file.isUploading
                        ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                        : "bg-gray-100 border-gray-200 text-gray-700"
                    : file.uploadError
                      ? "bg-red-900/20 border-red-800 text-red-400"
                      : file.isUploading
                        ? "bg-yellow-900/20 border-yellow-800 text-yellow-400"
                        : "bg-gray-700 border-gray-600 text-gray-200"
                }`}
              >
                <span className={`truncate max-w-[${UI.FILE_NAME_MAX_WIDTH_PX}px]`}>
                  {file.name}
                  {file.isUploading && " (uploading...)"}
                </span>
                {file.uploadError && (
                  <span className="text-xs opacity-70" title={file.uploadError}>
                    ⚠️
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="hover:bg-gray-500 hover:bg-opacity-20 rounded-full p-1"
                  disabled={file.isUploading}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input row */}
        <div
          className={`flex items-center gap-2 rounded-xl p-2 ${
            theme === "light"
              ? "bg-white border border-gray-200"
              : "bg-gray-800 border border-gray-600"
          }`}
        >
          {allowUpload && (
            <FileUpload
              uploadedFiles={uploadedFiles}
              onFilesChange={setUploadedFiles}
              theme={theme}
              disabled={uploadedFiles.length >= FILE_UPLOAD.MAX_FILES || isProcessing}
            />
          )}

          <textarea
            {...register("message")}
            ref={(e) => {
              register("message").ref(e);
              textareaRef.current = e; // assign to ref
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className={`flex-1 resize-none border-0 bg-transparent text-sm focus:outline-none leading-[1.5] py-[6px] ${
              theme === "light" ? "text-gray-900" : "text-gray-100"
            }`}
            rows={1}
          />

          <motion.button
            type="submit"
            disabled={!canSend}
            className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center min-w-[36px] min-h-[36px] ${
              canSend ? THEME_CLASSES[theme].button : THEME_CLASSES[theme].buttonDisabled
            }`}
            whileHover={canSend ? { scale: 1.05, y: -1 } : {}}
            whileTap={canSend ? { scale: 0.95 } : {}}
          >
            <Send size={16} />
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};
