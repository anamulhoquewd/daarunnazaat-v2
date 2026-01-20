import { IPagination } from "@/validations";
import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

const STORAGE_KEY = "student-registration-form";

export const saveToStorage = (data: any) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getFromStorage = () => {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearStorage = () => {
  sessionStorage.removeItem(STORAGE_KEY);
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to decode payload. used for decode to public data. not for verification
export function decodeJwtPayload(token: string) {
  try {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, "base64").toString("utf-8"),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid token format", error);
    return null;
  }
}

export const handleAxiosError = (error: any) => {
  console.error("API Error:", error);
  // Axios error structure
  if (error.response) {
    // Backend returns a response with status code (4xx, 5xx)
    toast.error(
      error.response.data.error.message || "An error occurred on the server.",
    );

    return {
      message:
        error.response.data.error.message || "An error occurred on the server.",
      status: error.response.status,
    };
  } else if (error.request) {
    // Request was made but no response was received
    toast.error("No response from the server. Please check your connection.");
    return {
      message: "No response from the server. Please check your connection.",
      status: null,
    };
  } else {
    // Something happened while setting up the request
    toast.error("An error occurred while setting up the request.");
    return {
      message: "An error occurred while setting up the request.",
      status: null,
    };
  }
};

export const defaultPagination: IPagination = {
  page: 1,
  total: 0,
  totalPages: 0,
  nextPage: null,
  prevPage: null,
  limit: 10,
};

export const buildQuery = (filters: any) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  });

  return params.toString();
};

export const scrollToFirstError = (errors: any) => {
  const findFirstError = (obj: any, path = ""): string | null => {
    for (const key in obj) {
      const value = obj[key];
      const currentPath = path ? `${path}.${key}` : key;

      if (value?.message) {
        return currentPath;
      }

      if (typeof value === "object") {
        const deep = findFirstError(value, currentPath);
        if (deep) return deep;
      }
    }
    return null;
  };

  return findFirstError(errors);
};
