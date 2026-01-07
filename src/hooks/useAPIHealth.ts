import { useEffect, useRef, useCallback } from "react";
import { checkAPIHealth } from "../services/healthService";
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCheckingRef = useRef(false); // More explicit than status comparison

  const performHealthCheck = useCallback(
    async (isRetry = false) => {
      // Prevent concurrent checks
      if (isCheckingRef.current && !isRetry) {
        return;
      }

      // Clear any pending retry
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      isCheckingRef.current = true;
      setAPIHealthStatus("checking");

      try {
        const isHealthy = await checkAPIHealth();
        setAPIHealthStatus(isHealthy ? "healthy" : "unhealthy");
        setLastHealthCheck(Date.now());

        // Schedule retry if unhealthy
        if (!isHealthy) {
          retryTimeoutRef.current = setTimeout(() => {
            performHealthCheck(true);
          }, HEALTH_CHECK_RETRY_DELAY);
        }
      } catch (error) {
        console.error("Health check error:", error);
        setAPIHealthStatus("unhealthy");
        setLastHealthCheck(Date.now());

        // Schedule retry on error
        retryTimeoutRef.current = setTimeout(() => {
          performHealthCheck(true);
        }, HEALTH_CHECK_RETRY_DELAY);
      } finally {
        isCheckingRef.current = false;
      }
    },
    [setAPIHealthStatus, setLastHealthCheck]
  );

  // Separate effect to avoid recreating intervals
  const performHealthCheckRef = useRef(performHealthCheck);
  useEffect(() => {
    performHealthCheckRef.current = performHealthCheck;
  }, [performHealthCheck]);

  useEffect(() => {
    if (!isOpen) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      isCheckingRef.current = false;
      return;
    }

    // Initial check
    performHealthCheckRef.current();

    // Periodic checks
    intervalRef.current = setInterval(() => {
      performHealthCheckRef.current();
    }, HEALTH_CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      isCheckingRef.current = false;
    };
  }, [isOpen]); // Only depend on isOpen

  return {
    status: apiHealthStatus,
    isHealthy: apiHealthStatus === "healthy",
    isChecking: apiHealthStatus === "checking",
    refresh: () => performHealthCheckRef.current(),
  };
}
