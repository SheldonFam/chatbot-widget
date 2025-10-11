import { StateCreator } from "zustand";
import { UploadedFile } from "../../types";

export interface UploadSlice {
  uploadedFiles: UploadedFile[];
  setUploadedFiles: (files: UploadedFile[]) => void;
  clearUploadedFiles: () => void;
}

export const createUploadSlice: StateCreator<
  UploadSlice,
  [],
  [],
  UploadSlice
> = (set) => ({
  uploadedFiles: [],
  setUploadedFiles: (files) => set({ uploadedFiles: files }),
  clearUploadedFiles: () => set({ uploadedFiles: [] }),
});
