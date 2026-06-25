// store/page-title.ts
import { create } from "zustand";

interface PageTitleStore {
  title: string;
  setTitle: (title: string) => void;
  clearTitle: () => void;
}

export const usePageTitle = create<PageTitleStore>((set) => ({
  title: "",
  setTitle: (title) => set({ title }),
  clearTitle: () => set({ title: "" }),
}));
