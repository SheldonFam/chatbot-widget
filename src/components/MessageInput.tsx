import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Send, Paperclip, X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { UploadedFile } from "../types";

interface MessageInputProps {
  theme: "light" | "dark";
  allowUpload?: boolean;
}

interface FormData {
  message: string;
}

// Constants for better maintainability
const THEME_CLASSES = {
  light: {
    container:
      "bg-gradient-to-r from-gray-50 to-white border-t border-gray-200",
    input:
      "bg-white text-gray-900 placeholder-gray-500 border-gray-200 focus:border-blue-500",
    button:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl",
    buttonDisabled: "bg-gray-300 text-gray-500",
  },
  dark: {
    container:
      "bg-gradient-to-r from-gray-800 to-gray-700 border-t border-gray-600",
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
  const { addMessage, uploadedFiles, setUploadedFiles, clearUploadedFiles } =
    useChatStore();
  const { register, handleSubmit, reset, watch } = useForm<FormData>();
  const messageValue = watch("message", "");

  const onSubmit = (data: FormData) => {
    // Allow submission if there's either a message or files
    if (!data.message.trim() && uploadedFiles.length === 0) return;

    // Add user message
    addMessage({
      content: data.message.trim() || "📎 File(s) shared",
      sender: "user",
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    });

    // Clear form and files
    reset();
    clearUploadedFiles();

    // Simulate bot response (in a real app, this would be an API call)
    setTimeout(() => {
      const messageContent = data.message.trim();
      const fileCount = uploadedFiles.length;

      let responseText = "";
      if (messageContent && fileCount > 0) {
        responseText = `Thanks for your message: "${messageContent}"\n\nI can see you've uploaded ${fileCount} file(s).`;
      } else if (messageContent) {
        responseText = `Thanks for your message: "${messageContent}"`;
      } else if (fileCount > 0) {
        responseText = `I can see you've uploaded ${fileCount} file(s).`;
      }

      responseText +=
        "\n\nThis is a demo response. In a real implementation, this would be processed by your AI backend.";

      addMessage({
        content: responseText,
        sender: "bot",
      });
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const canSend = messageValue.trim().length > 0 || uploadedFiles.length > 0;

  return (
    <motion.div
      className={`
        p-1.5 space-y-0.5 rounded-b-2xl flex-shrink-0
        ${THEME_CLASSES[theme].container}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* File Tags */}
      {allowUpload && uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploadedFiles.map((file) => (
            <motion.div
              key={file.id}
              className={`
                flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-xs shadow-sm
                ${
                  theme === "light"
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border-blue-200"
                    : "bg-gradient-to-r from-blue-900 to-indigo-900 text-blue-200 border-blue-700"
                }
              `}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-xs">📎</span>
              <span className="truncate max-w-24 font-medium">{file.name}</span>
              <button
                onClick={() => {
                  const newFiles = uploadedFiles.filter(
                    (f) => f.id !== file.id
                  );
                  setUploadedFiles(newFiles);
                }}
                className="ml-1 hover:bg-red-100 hover:text-red-600 rounded-full p-1 transition-colors duration-200"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Message Input Row */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex gap-1 items-center"
      >
        {allowUpload && (
          <FileAttachmentButton
            uploadedFiles={uploadedFiles}
            onFilesChange={setUploadedFiles}
            theme={theme}
          />
        )}

        <div className="flex-1 relative">
          <textarea
            id="message-input"
            {...register("message")}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className={`
        w-full px-2 py-1.5 pr-6 rounded-md border-2 resize-none
        text-sm font-medium
        focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500
        transition-all duration-200
        ${THEME_CLASSES[theme].input}
      `}
            rows={1}
            style={{
              minHeight: "34px",
              maxHeight: "80px",
              height: "auto",
              lineHeight: "1.4",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 80) + "px";
            }}
          />
        </div>

        <motion.button
          type="submit"
          disabled={!canSend}
          className={`
      px-2 py-1.5 rounded-md transition-all duration-200
      flex items-center justify-center min-w-[32px] min-h-[34px]
      focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-opacity-50
      ${
        canSend
          ? THEME_CLASSES[theme].button
          : THEME_CLASSES[theme].buttonDisabled
      }
    `}
          whileHover={canSend ? { scale: 1.05, y: -2 } : {}}
          whileTap={canSend ? { scale: 0.95 } : {}}
        >
          <Send size={14} className="w-3.5 h-3.5" />
        </motion.button>
      </form>
    </motion.div>
  );
};

// File Attachment Button Component
interface FileAttachmentButtonProps {
  uploadedFiles: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  theme: "light" | "dark";
}

// File upload constants
const MAX_FILES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

const FILE_THEME_CLASSES = {
  light: {
    button:
      "text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-2 border-gray-200 hover:border-blue-300",
    dragArea: "border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50",
  },
  dark: {
    button:
      "text-gray-400 hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-900 hover:to-indigo-900 border-2 border-gray-600 hover:border-blue-500",
    dragArea: "border-blue-500 bg-gradient-to-r from-blue-900 to-indigo-900",
  },
} as const;

const FileAttachmentButton: React.FC<FileAttachmentButtonProps> = ({
  uploadedFiles,
  onFilesChange,
  theme,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      return `File type ${file.type} is not supported. Please upload PDF, DOCX, or TXT files.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}.`;
    }
    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        return;
      }

      if (uploadedFiles.length + newFiles.length >= MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files allowed.`);
        return;
      }

      const uploadedFile: UploadedFile = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
      };

      newFiles.push(uploadedFile);
    });

    if (errors.length > 0) {
      alert(errors.join("\n"));
    }

    if (newFiles.length > 0) {
      onFilesChange([...uploadedFiles, ...newFiles]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        aria-label={`Attach file. ${
          uploadedFiles.length >= MAX_FILES ? "Maximum files reached." : ""
        }`}
        className={`
          p-1 rounded-md transition-all duration-200
          min-w-[28px] min-h-[34px] flex items-center justify-center
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-opacity-50
          ${FILE_THEME_CLASSES[theme].button}
          ${dragActive ? FILE_THEME_CLASSES[theme].dragArea : ""}
        `}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        disabled={uploadedFiles.length >= MAX_FILES}
      >
        <Paperclip size={14} className="w-3.5 h-3.5" aria-hidden="true" />
      </motion.button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
        disabled={uploadedFiles.length >= MAX_FILES}
      />
    </div>
  );
};
