import { useEffect, useRef, useCallback } from "react";
import { checkAPIHealth } from "../services/chatService";
import { useChatStore } from "../store/useChatStore";

const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const HEALTH_CHECK_RETRY_DELAY = 5000; // 5 seconds for retry after failure

/**
 * Custom hook to manage API health checks
 * - Checks immediately when chat opens
 * - Rechecks periodically while chat is open
 * - Retries faster if unhealthy
 *
 * @returns Object with health status and helper methods
 */
export function useAPIHealth() {
  const { isOpen, apiHealthStatus, setAPIHealthStatus, setLastHealthCheck } =
    useChatStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusRef = useRef(apiHealthStatus);

  // Keep ref in sync with state
  useEffect(() => {
    statusRef.current = apiHealthStatus;
  }, [apiHealthStatus]);

  const performHealthCheck = useCallback(
    async (isRetry = false) => {
      // Don't check if already checking (unless it's a retry)
      if (statusRef.current === "checking" && !isRetry) {
        return;
      }

      setAPIHealthStatus("checking");

      try {
        const isHealthy = await checkAPIHealth();
        setAPIHealthStatus(isHealthy ? "healthy" : "unhealthy");
        setLastHealthCheck(Date.now());

        // If unhealthy, schedule a retry sooner
        if (!isHealthy) {
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }
          retryTimeoutRef.current = setTimeout(() => {
            performHealthCheck(true);
          }, HEALTH_CHECK_RETRY_DELAY);
        }
      } catch (error) {
        console.error("Health check error:", error);
        setAPIHealthStatus("unhealthy");
        setLastHealthCheck(Date.now());

        // Retry on error
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        retryTimeoutRef.current = setTimeout(() => {
          performHealthCheck(true);
        }, HEALTH_CHECK_RETRY_DELAY);
      }
    },
    [setAPIHealthStatus, setLastHealthCheck]
  );

  useEffect(() => {
    if (!isOpen) {
      // Clear intervals when chat is closed
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      return;
    }

    // Initial check when chat opens
    performHealthCheck();

    // Set up periodic health checks
    intervalRef.current = setInterval(() => {
      performHealthCheck();
    }, HEALTH_CHECK_INTERVAL);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [isOpen, performHealthCheck]); // Include performHealthCheck in dependencies

  return {
    status: apiHealthStatus,
    isHealthy: apiHealthStatus === "healthy",
    isChecking: apiHealthStatus === "checking",
    refresh: () => performHealthCheck(),
  };
}
