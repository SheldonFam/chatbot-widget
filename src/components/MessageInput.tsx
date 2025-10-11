import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { FileUpload } from "./FileUpload";

interface MessageInputProps {
  theme: "light" | "dark";
  allowUpload?: boolean;
}

interface FormData {
  message: string;
}

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
  const {
    addMessage,
    updateMessage,
    uploadedFiles,
    setUploadedFiles,
    clearUploadedFiles,
  } = useChatStore();

  const { register, handleSubmit, reset, watch } = useForm<FormData>();
  const messageValue = watch("message", "");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = messageValue.trim().length > 0 || uploadedFiles.length > 0;

  /** 🧩 Resize dynamically when value changes */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 80) + "px";
  }, [messageValue]);

  /** 🔧 Remove a single uploaded file */
  const removeFile = (fileId: string) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== fileId));
  };

  /** 💬 Submit logic */
  const onSubmit = (data: FormData) => {
    if (!data.message.trim() && uploadedFiles.length === 0) return;

    addMessage({
      content: data.message.trim() || "📎 File(s) shared",
      sender: "user",
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    });

    const userMsg = data.message.trim();
    const fileCount = uploadedFiles.length;

    reset();
    clearUploadedFiles();

    // Add a loading message immediately and capture its ID
    const loadingMessageId = addMessage({
      content: "",
      sender: "bot",
      isLoading: true,
    });

    // Demo bot reply - update the loading message after delay
    setTimeout(() => {
      let response = "";

      if (userMsg && fileCount > 0)
        response = `Thanks for your message: "${userMsg}"\n\nYou uploaded ${fileCount} file(s).`;
      else if (userMsg) response = `Thanks for your message: "${userMsg}"`;
      else response = `I see you've uploaded ${fileCount} file(s).`;

      updateMessage(loadingMessageId, {
        content: `${response}\n\n(This is a demo response from your AI backend.)`,
        isLoading: false,
      });
    }, 1000);
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2 w-full"
      >
        {/* Uploaded Files */}
        {allowUpload && uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center gap-2 px-2 py-1 rounded-md border text-sm ${
                  theme === "light"
                    ? "bg-gray-100 border-gray-200 text-gray-700"
                    : "bg-gray-700 border-gray-600 text-gray-200"
                }`}
              >
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="hover:bg-gray-500 hover:bg-opacity-20 rounded-full p-1"
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
              disabled={uploadedFiles.length >= 3}
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
              canSend
                ? THEME_CLASSES[theme].button
                : THEME_CLASSES[theme].buttonDisabled
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
