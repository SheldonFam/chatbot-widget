import { Message } from "../types";
import {
  API_BASE_URL,
  buildHeaders,
  buildFileUploadHeaders,
  ChatServiceError,
} from "./api/client";
import { STREAMING } from "../constants";

/**
 * Upload a PDF file to the backend
 * @param file - The PDF file to upload
 * @returns Promise with fileUri and mimeType
 * @throws ChatServiceError if upload fails
 */
export async function uploadPDF(
  file: File
): Promise<{ fileUri: string; mimeType: string }> {
  try {
    // Create FormData to send file
    const formData = new FormData();
    formData.append("file", file, file.name);

    const response = await fetch(`${API_BASE_URL}/api/v1/documents/upload`, {
      method: "POST",
      headers: buildFileUploadHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();

    if (!data.fileUri) {
      throw new Error("Failed to upload PDF: No file URI returned");
    }

    return {
      fileUri: data.fileUri,
      mimeType: data.mimeType || "application/pdf",
    };
  } catch (error) {
    console.error("PDF Upload Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new ChatServiceError("Failed to upload PDF", errorMessage);
  }
}

/**
 * Generate a Q&A response based on a document
 * @param fileUri - URI of the uploaded PDF file
 * @param question - User's question about the document
 * @param history - Previous conversation history
 * @returns AI response text
 * @throws ChatServiceError if generation fails
 */
export async function generateDocumentQA(
  fileUri: string,
  question: string,
  history: Message[] = []
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/qa`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({
        fileUri,
        question,
        history: history.map((msg) => ({
          role: msg.sender === "bot" ? "assistant" : "user",
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();

    if (!data.response || !data.success) {
      throw new Error(data.error || "AI returned empty response");
    }

    return data.response;
  } catch (error) {
    console.error("Document Q&A Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new ChatServiceError("Failed to generate document Q&A response", errorMessage);
  }
}

/**
 * Generate a streaming Q&A response based on a document
 * @param fileUri - URI of the uploaded PDF file
 * @param question - User's question about the document
 * @param history - Previous conversation history
 * @returns Async generator yielding text chunks
 * @throws ChatServiceError if generation fails
 */
export async function* generateStreamingDocumentQA(
  fileUri: string,
  question: string,
  history: Message[] = []
): AsyncGenerator<string, void, unknown> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/qa`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({
        fileUri,
        question,
        history: history.map((msg) => ({
          role: msg.sender === "bot" ? "assistant" : "user",
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    // Check content-type to determine if it's JSON or SSE
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Handle regular JSON response (non-streaming)
      const data = await response.json();

      if (!data.success || !data.response) {
        throw new Error(data.error || "AI returned empty response");
      }

      // Yield the response text character by character to simulate streaming
      const responseText = data.response;
      for (let i = 0; i < responseText.length; i += STREAMING.SIMULATED_CHUNK_SIZE) {
        yield responseText.slice(i, i + STREAMING.SIMULATED_CHUNK_SIZE);
        // Small delay to simulate streaming
        await new Promise((resolve) => setTimeout(resolve, STREAMING.SIMULATED_DELAY_MS));
      }
      return;
    }

    // Handle SSE streaming response
    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // If we have remaining buffer, try to parse it as JSON (fallback for non-SSE)
          if (buffer.trim()) {
            try {
              const parsed = JSON.parse(buffer.trim());
              if (parsed.success && parsed.response) {
                // Yield the entire response
                yield parsed.response;
              }
            } catch {
              // Not JSON, ignore
            }
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Split by double newline (SSE message separator)
        const messages = buffer.split("\n\n");
        buffer = messages.pop() || ""; // Keep incomplete message

        for (const message of messages) {
          if (!message.trim()) continue;

          // Try SSE format first
          if (message.startsWith("data: ")) {
            const jsonStr = message.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.content) {
                yield parsed.content;
              }
            } catch {
              // Skip invalid JSON
            }
          } else {
            // Try parsing as regular JSON (fallback)
            try {
              const parsed = JSON.parse(message.trim());
              if (parsed.success && parsed.response) {
                yield parsed.response;
              }
            } catch {
              // Not JSON, ignore
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error("Document Q&A streaming error:", error);
    throw new ChatServiceError(
      "Failed to generate streaming document Q&A response",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
