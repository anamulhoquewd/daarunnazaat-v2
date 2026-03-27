import api from "@/axios/intercepter";
import { IGuardian, IStaff, UserRole } from "@/validations";
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
  staff?: IStaff | null;
  guardian?: IGuardian | null;
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

        let staff = null;
        let guardian = null;

        if (response.data.data.roles.includes("staff")) {
          staff = await api.get(`/staffs/by?userId=${response.data.data._id}`);
        }

        if (response.data.data.roles.includes("guardian")) {
          guardian = await api.get(
            `/guardians/by?userId=${response.data.data._id}`,
          );
        }

        if (response.data?.success) {
          set({
            me: {
              user: response.data.data,
              staff: staff?.data.data || null,
              guardian: guardian?.data.data || null,
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
