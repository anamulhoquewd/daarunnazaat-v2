import api from "@/axios/intercepter";
import { removeStorage } from "@/store/local";

function useLogout() {
  const logout = async () => {
    try {
      const response = await api.post("/admins/auth/sign-out", null);

      if (!response.data.success) {
        throw new Error(response.data.error.message);
      }

      console.log("Logout successful");
      removeStorage("accessToken");

      // Redirect to sign in page
      window.location.href = "/auth/sign-in";
    } catch (error: any) {
      console.warn(error);
    }
  };

  return { logout };
}

export default useLogout;
