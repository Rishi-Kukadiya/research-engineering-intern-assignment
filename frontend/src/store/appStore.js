import { create } from "zustand";

export const useAppStore = create((set) => ({
  activePage: "timeseries",
  setActivePage: (page) => set({ activePage: page }),
}));