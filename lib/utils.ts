import { IPagination } from "@/interfaces";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
      Buffer.from(base64, "base64").toString("utf-8")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid token format", error);
    return null;
  }
}

export const handleAxiosError = (error: any) => {
  // Axios error structure
  if (error.response) {
    // Backend returns a response with status code (4xx, 5xx)

    return {
      message:
        error.response.data.message || "An error occurred on the server.",
      status: error.response.status,
    };
  } else if (error.request) {
    // Request was made but no response was received
    return {
      message: "No response from the server. Please check your connection.",
      status: null,
    };
  } else {
    // Something happened while setting up the request
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
};
