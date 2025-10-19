import { Message, ChatResponse, StreamChunk, HealthResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Send a message to the chat API and get a response
 */
export async function sendChatMessage(
  message: string,
  conversationHistory: Message[] = []
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversationHistory: conversationHistory.map((msg) => ({
          sender: msg.sender,
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
 * Stream chat responses in real-time
 */
export async function streamChatMessage(
  message: string,
  conversationHistory: Message[] = [],
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversationHistory: conversationHistory.map((msg) => ({
          sender: msg.sender,
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("Response body is not readable");
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete();
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);

          if (data === "[DONE]") {
            onComplete();
            return;
          }

          try {
            const parsed: StreamChunk = JSON.parse(data);
            if (parsed.content) {
              onChunk(parsed.content);
            }
            if (parsed.error) {
              onError(parsed.error);
              return;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    console.error("Streaming Error:", error);
    onError(error instanceof Error ? error.message : "Unknown error occurred");
  }
}

/**
 * Check if the API is available
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data: HealthResponse = await response.json();
    return data.status === "ok";
  } catch (error) {
    console.error("API Health Check Failed:", error);
    return false;
  }
}
