import { HealthResponse } from "../types";
import { API_BASE_URL, buildHeaders } from "./api/client";

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
