import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, X, FileText, FileImage, File } from "lucide-react";
import { UploadedFile } from "../types";

interface FileUploadProps {
  uploadedFiles: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  theme: "light" | "dark";
  disabled?: boolean;
}

const MAX_FILES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export const FileUpload: React.FC<FileUploadProps> = ({
  uploadedFiles,
  onFilesChange,
  theme,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const themeClasses = {
    light: {
      button: "text-gray-500 hover:text-gray-700",
      fileTag: "bg-gray-100 text-gray-700 border-gray-200",
      dragArea: "border-gray-300 bg-gray-50",
    },
    dark: {
      button: "text-gray-400 hover:text-gray-200",
      fileTag: "bg-gray-700 text-gray-200 border-gray-600",
      dragArea: "border-gray-600 bg-gray-800",
    },
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText size={14} />;
    if (type.includes("image")) return <FileImage size={14} />;
    return <File size={14} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
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

  const removeFile = (fileId: string) => {
    onFilesChange(uploadedFiles.filter((file) => file.id !== fileId));
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

    if (disabled) return;

    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      {/* File Tags */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {uploadedFiles.map((file) => (
              <motion.div
                key={file.id}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border
                  ${themeClasses[theme].fileTag}
                `}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                {getFileIcon(file.type)}
                <span className="text-sm font-medium truncate max-w-32">
                  {file.name}
                </span>
                <span className="text-xs opacity-75">
                  {formatFileSize(file.size)}
                </span>
                <button
                  onClick={() => removeFile(file.id)}
                  className="ml-1 hover:bg-gray-500 hover:bg-opacity-20 rounded-full p-1"
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-3 sm:p-4 transition-colors
          min-h-[60px] flex items-center justify-center
          ${dragActive ? themeClasses[theme].dragArea : "border-transparent"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="flex items-center justify-center gap-2 text-center">
          <Paperclip size={16} className={themeClasses[theme].button} />
          <span className={`text-xs sm:text-sm ${themeClasses[theme].button}`}>
            {uploadedFiles.length >= MAX_FILES
              ? `Max ${MAX_FILES} files`
              : "Attach files (PDF, DOCX, TXT)"}
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
      </div>
    </div>
  );
};
