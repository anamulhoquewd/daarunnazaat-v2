import api from "@/axios/intercepter";

function useLogout() {
  const handleLogout = async () => {
    try {
      const response = await api.post("/auth/sign-out", null);

      if (!response.data.success) {
        throw new Error(response.data.error.message);
      }

      // Redirect to sign in page
      window.location.href = "/auth/sign-in";
    } catch (error: any) {
      console.warn(error);
    }
  };

  return { handleLogout };
}

export default useLogout;
