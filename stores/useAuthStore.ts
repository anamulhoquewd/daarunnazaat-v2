import api from "@/axios/intercepter";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type Role = "student" | "staff" | "admin" | "guardian" | "super_admin";
export type ProfileModel = "Student" | "Staff" | "Guardian" | null;

interface Me {
  _id: string;
  email: string;
  role: Role;
  profileModel: ProfileModel;
  profile: any; // Student | Staff | Guardian
}

interface AuthState {
  // state
  me: Me | null;
  isAuthenticated: boolean;
  loading: boolean;

  // actions
  fetchMe: () => Promise<void>;
  setMe: (me: Me) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    me: null,
    isAuthenticated: false,
    loading: true,

    setMe: (me) =>
      set({
        me,
        isAuthenticated: true,
        loading: false,
      }),

    clearAuth: () =>
      set({
        me: null,
        isAuthenticated: false,
        loading: false,
      }),

    fetchMe: async () => {
      try {
        const response = await api.get("/users/me");

        if (response.data?.success) {
          set({
            me: response.data.data,
            isAuthenticated: true,
            loading: false,
          });
        } else {
          set({
            me: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      } catch (error) {
        set({
          me: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    },
  }))
);
