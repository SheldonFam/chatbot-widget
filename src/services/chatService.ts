import { Message, ChatResponse } from "../types";
import { API_BASE_URL, buildHeaders, ChatServiceError } from "./api/client";

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
          role: msg.sender === "bot" ? "assistant" : "user",
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
