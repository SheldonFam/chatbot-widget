/**
 * Application-wide constants
 * Centralized location for magic numbers and configuration values
 */

// File Upload Configuration
export const FILE_UPLOAD = {
  MAX_FILES: 3,
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB in bytes
  ALLOWED_TYPES: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ] as const,
  ALLOWED_EXTENSIONS: ".pdf,.docx,.txt",
} as const;

// API Health Check Configuration
export const HEALTH_CHECK = {
  INTERVAL_MS: 30000, // 30 seconds - regular health check interval
  RETRY_DELAY_MS: 5000, // 5 seconds - retry delay after failure
} as const;

// Streaming Configuration
export const STREAMING = {
  SIMULATED_DELAY_MS: 10, // Delay for simulated streaming
  SIMULATED_CHUNK_SIZE: 10, // Characters per chunk for simulated streaming
} as const;

// Chat Configuration
export const CHAT = {
  MAX_HISTORY_MESSAGES: 10, // Maximum number of messages to include in conversation history
} as const;

// UI Configuration
export const UI = {
  TEXTAREA_MAX_HEIGHT_PX: 80, // Maximum height for auto-expanding textarea
  FILE_NAME_MAX_WIDTH_PX: 120, // Maximum width for truncated file names
} as const;
