import { create } from "zustand";

interface AuthState {
  user: {
    id: string;
    name?: string;
    email: string;
    role: string;
    storeId?: string;
  } | null;
  token: string | null;
  setAuth: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("accessToken") : null,
  setAuth: (user, token) => {
    localStorage.setItem("accessToken", token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem("accessToken");
    set({ user: null, token: null });
  },
}));
