import { Message, ChatResponse, HealthResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const API_KEY = import.meta.env.VITE_API_KEY || "34567890";

/**
 * Custom error class for chat service errors
 */
export class ChatServiceError extends Error {
  constructor(
    message: string,
    public originalError?: string
  ) {
    super(message);
    this.name = "ChatServiceError";
  }
}

/**
 * Build headers for API requests with Authorization header
 *
 * Supports API key authentication via Authorization header (Bearer token format).
 * The backend also accepts x-api-key header as an alternative format.
 *
 * Expected format: Authorization: Bearer <api-key>
 * Alternative format: x-api-key: <api-key>
 */
function buildHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (API_KEY) {
    headers["Authorization"] = `Bearer ${API_KEY}`;
  } else if (import.meta.env.DEV) {
    // Only warn in development to avoid console spam in production
    console.warn(
      "VITE_API_KEY is not set. API requests may fail authentication. " +
        "Set VITE_API_KEY in your .env file for authenticated requests."
    );
  }

  return headers;
}

/**
 * Send a message to the chat API and get a response
 */
export async function sendChatMessage(
  message: string,
  conversationHistory: Message[] = []
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({
        message,
        history: conversationHistory.map((msg) => ({
          role: msg.sender === "bot" ? "assistant" : "user", // ✅ Convert sender to role, and "bot" to "assistant"
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Chat API Error:", error);
    return {
      success: false,
      response: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Generate a streaming chat response
 *
 * Backend format: SSE with data: {"content":"..."}
 *
 * @param message - Current user message
 * @param conversationHistory - Previous conversation history
 * @returns Async generator yielding text chunks
 * @throws ChatServiceError if generation fails
 */
export async function* sendStreamingChatMessage(
  message: string,
  conversationHistory: Message[] = []
): AsyncGenerator<string, void, unknown> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/stream`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({
        message,
        history: conversationHistory.map((msg) => ({
          role: msg.sender === "bot" ? "assistant" : "user",
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Split by double newline (SSE message separator)
        const messages = buffer.split("\n\n");
        buffer = messages.pop() || ""; // Keep incomplete message

        for (const message of messages) {
          if (!message.trim() || !message.startsWith("data: ")) continue;

          const jsonStr = message.slice(6).trim(); // Remove "data: "
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.content) {
              yield parsed.content;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error("Chat streaming error:", error);
    throw new ChatServiceError(
      "Failed to generate streaming response",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * Check if the API is available with timeout
 * @param timeout - Timeout in milliseconds (default: 5000ms)
 * @returns Promise<boolean> - true if API is healthy, false otherwise
 */
export async function checkAPIHealth(timeout: number = 5000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
      signal: controller.signal,
      method: "GET",
      headers: buildHeaders(),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`API health check returned status ${response.status}`);
      return false;
    }

    // Check if response is actually JSON (not HTML)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.warn(
        `API health check returned non-JSON content: ${contentType}. ` +
          `This usually means the backend server at ${API_BASE_URL} is not running or the /api/health endpoint doesn't exist.`
      );
      return false;
    }

    const data: HealthResponse = await response.json();
    return data.status === "ok";
  } catch (error) {
    // Handle timeout, network errors, etc.
    if (error instanceof Error && error.name === "AbortError") {
      console.warn(
        `API health check timed out after ${timeout}ms. ` +
          `Make sure the backend server is running at ${API_BASE_URL}`
      );
    } else if (error instanceof TypeError && error.message.includes("fetch")) {
      console.warn(
        `Failed to connect to API at ${API_BASE_URL}. ` +
          `This usually means the backend server is not running.`
      );
    } else {
      console.error("API Health Check Failed:", error);
    }
    return false;
  }
}
