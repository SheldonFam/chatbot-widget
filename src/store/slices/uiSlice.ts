import { StateCreator } from "zustand";

export type APIHealthStatus = "checking" | "healthy" | "unhealthy" | "unknown";

export interface UISlice {
  isOpen: boolean;
  isMinimized: boolean;
  isFullWidth: boolean;
  isFeedbackModalOpen: boolean;
  apiHealthStatus: APIHealthStatus;
  lastHealthCheck: number | null;

  toggleChat: () => void;
  minimizeChat: () => void;
  toggleFullWidth: () => void;
  openFeedbackModal: () => void;
  closeFeedbackModal: () => void;
  setAPIHealthStatus: (status: APIHealthStatus) => void;
  setLastHealthCheck: (timestamp: number) => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  isOpen: false,
  isMinimized: false,
  isFullWidth: false,
  isFeedbackModalOpen: false,
  apiHealthStatus: "unknown",
  lastHealthCheck: null,

  toggleChat: () => set((s) => ({ isOpen: !s.isOpen, isMinimized: false })),
  minimizeChat: () => set({ isMinimized: true }),
  toggleFullWidth: () => set((s) => ({ isFullWidth: !s.isFullWidth })),
  openFeedbackModal: () => set({ isFeedbackModalOpen: true }),
  closeFeedbackModal: () => set({ isFeedbackModalOpen: false }),
  setAPIHealthStatus: (status) => set({ apiHealthStatus: status }),
  setLastHealthCheck: (timestamp) => set({ lastHealthCheck: timestamp }),
});
