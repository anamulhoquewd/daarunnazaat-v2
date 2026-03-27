// Set to local storage
export const setStorage = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    return localStorage.setItem(key, value);
  }
  return null;
};

// Get from local storage
export const getStorage = (key: string) => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

// Remove from local storage
export const removeStorage = (key: string) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};
