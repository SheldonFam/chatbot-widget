import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Paperclip } from "lucide-react";
import { UploadedFile } from "../types";
import { uploadPDF } from "../services/documentService";
import { ChatServiceError } from "../services/api/client";
import { FILE_UPLOAD } from "../constants";

interface FileUploadProps {
  uploadedFiles: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  theme: "light" | "dark";
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  uploadedFiles,
  onFilesChange,
  theme,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!(FILE_UPLOAD.ALLOWED_TYPES as readonly string[]).includes(file.type))
      return `Only PDF, DOCX, or TXT files are allowed.`;
    if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) return `Max file size is ${FILE_UPLOAD.MAX_SIZE_MB} MB.`;
    return null;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const newFiles: UploadedFile[] = [];
    const errors: string[] = [];

    // First, validate all files
    const validFiles: File[] = [];
    Array.from(files).forEach((file) => {
      if (uploadedFiles.length + newFiles.length >= FILE_UPLOAD.MAX_FILES) {
        errors.push(`Maximum ${FILE_UPLOAD.MAX_FILES} files allowed.`);
        return;
      }

      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        return;
      }

      // Create UploadedFile entry immediately (before upload)
      newFiles.push({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        isUploading: true,
      });
      validFiles.push(file);
    });

    if (errors.length > 0) alert(errors.join("\n"));
    if (newFiles.length === 0) return;

    // Add files to state immediately (with uploading status)
    const updatedFiles = [...uploadedFiles, ...newFiles];
    onFilesChange(updatedFiles);
    setIsUploading(true);

    // Upload each file
    const uploadPromises = validFiles.map(async (file, index) => {
      const fileIndex = uploadedFiles.length + index;
      try {
        // Only upload PDF files for now (backend expects PDF)
        if (file.type === "application/pdf") {
          const result = await uploadPDF(file);

          // Update the file with fileUri
          updatedFiles[fileIndex] = {
            ...updatedFiles[fileIndex],
            fileUri: result.fileUri,
            isUploading: false,
          };
        } else {
          // For non-PDF files, mark as uploaded but without fileUri
          // You may want to handle DOCX/TXT differently based on backend support
          updatedFiles[fileIndex] = {
            ...updatedFiles[fileIndex],
            isUploading: false,
            uploadError: "Only PDF files are supported for document Q&A",
          };
        }
      } catch (error) {
        const errorMessage =
          error instanceof ChatServiceError
            ? error.originalError || error.message
            : error instanceof Error
              ? error.message
              : "Upload failed";

        updatedFiles[fileIndex] = {
          ...updatedFiles[fileIndex],
          isUploading: false,
          uploadError: errorMessage,
        };
      }
    });

    await Promise.all(uploadPromises);
    onFilesChange([...updatedFiles]);
    setIsUploading(false);
  };

  const themeClasses = {
    light: "text-gray-500 hover:text-gray-700",
    dark: "text-gray-400 hover:text-gray-200",
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={`p-1.5 rounded-md flex items-center justify-center transition-all duration-200 ${
          themeClasses[theme]
        } ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        whileHover={!disabled && !isUploading ? { scale: 1.05, y: -1 } : {}}
        whileTap={!disabled && !isUploading ? { scale: 0.95 } : {}}
        title={isUploading ? "Uploading files..." : "Upload file"}
      >
        <Paperclip size={16} />
      </motion.button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={FILE_UPLOAD.ALLOWED_EXTENSIONS}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
        disabled={disabled}
      />
    </>
  );
};
