import { create } from "zustand";

const STORAGE_KEY = "erp-tutorial-complete";

function getInitialState(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

interface TutorialState {
  isComplete: boolean;
  currentStep: number;
  isOpen: boolean;
  complete: () => void;
  skip: () => void;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  reopen: () => void;
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  isComplete: getInitialState(),
  currentStep: 0,
  isOpen: !getInitialState(),

  complete: () => {
    localStorage.setItem(STORAGE_KEY, "true");
    set({ isComplete: true, isOpen: false });
  },

  skip: () => {
    localStorage.setItem(STORAGE_KEY, "true");
    set({ isComplete: true, isOpen: false });
  },

  next: () => {
    const { currentStep } = get();
    if (currentStep >= 7) {
      get().complete();
    } else {
      set({ currentStep: currentStep + 1 });
    }
  },

  prev: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  goTo: (step: number) => {
    set({ currentStep: step });
  },

  reopen: () => {
    set({ isOpen: true, currentStep: 0 });
  },
}));
