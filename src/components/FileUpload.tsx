import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Paperclip } from "lucide-react";
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

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type))
      return `Only PDF, DOCX, or TXT files are allowed.`;
    if (file.size > MAX_FILE_SIZE) return `Max file size is 10 MB.`;
    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles: UploadedFile[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      if (uploadedFiles.length + newFiles.length >= MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files allowed.`);
        return;
      }

      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        return;
      }

      newFiles.push({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
      });
    });

    if (errors.length > 0) alert(errors.join("\n"));
    if (newFiles.length > 0) onFilesChange([...uploadedFiles, ...newFiles]);
  };

  const themeClasses = {
    light: "text-gray-500 hover:text-gray-700",
    dark: "text-gray-400 hover:text-gray-200",
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`p-1.5 rounded-md flex items-center justify-center transition-all duration-200 ${
          themeClasses[theme]
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        whileHover={!disabled ? { scale: 1.05, y: -1 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
      >
        <Paperclip size={16} />
      </motion.button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
        disabled={disabled}
      />
    </>
  );
};
