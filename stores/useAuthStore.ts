import api from "@/axios/intercepter";
import { UserRole } from "@/validations";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Me {
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    roles: UserRole[];
  };
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
            me: {
              user: response.data.data,
            },
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
  })),
);
