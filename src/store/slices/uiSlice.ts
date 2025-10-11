import { StateCreator } from "zustand";

export interface UISlice {
  isOpen: boolean;
  isMinimized: boolean;
  isFullWidth: boolean;
  isFeedbackModalOpen: boolean;

  toggleChat: () => void;
  minimizeChat: () => void;
  toggleFullWidth: () => void;
  openFeedbackModal: () => void;
  closeFeedbackModal: () => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  isOpen: false,
  isMinimized: false,
  isFullWidth: false,
  isFeedbackModalOpen: false,

  toggleChat: () => set((s) => ({ isOpen: !s.isOpen, isMinimized: false })),
  minimizeChat: () => set({ isMinimized: true }),
  toggleFullWidth: () => set((s) => ({ isFullWidth: !s.isFullWidth })),
  openFeedbackModal: () => set({ isFeedbackModalOpen: true }),
  closeFeedbackModal: () => set({ isFeedbackModalOpen: false }),
});
