/**
 * Safe localStorage utility to prevent parsing errors
 */

// Safe localStorage getter with error handling
export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    const item = localStorage.getItem(key);

    if (item === null || item === undefined) {
      return defaultValue;
    }

    // Try to parse as JSON, fallback to string
    try {
      return JSON.parse(item);
    } catch (parseError) {
      console.warn(
        `Failed to parse item from local storage: ${key}`,
        parseError
      );
      // If parsing fails, return the raw string or default value
      return item || defaultValue;
    }
  } catch (error) {
    console.error(`Error accessing localStorage for key: ${key}`, error);
    return defaultValue;
  }
};

// Safe localStorage setter with error handling
export const setToLocalStorage = (key, value) => {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
    return true;
  } catch (error) {
    console.error(`Error setting localStorage for key: ${key}`, error);
    return false;
  }
};

// Safe localStorage remover
export const removeFromLocalStorage = (key) => {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage for key: ${key}`, error);
    return false;
  }
};

// Clear all localStorage with error handling
export const clearLocalStorage = () => {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing localStorage", error);
    return false;
  }
};

// Check if localStorage is available
export const isLocalStorageAvailable = () => {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    const test = "__localStorage_test__";
    localStorage.setItem(test, "test");
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};

// Clean up corrupted localStorage entries
export const cleanupLocalStorage = () => {
  if (!isLocalStorageAvailable()) {
    return;
  }

  const keysToRemove = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      try {
        const value = localStorage.getItem(key);
        if (value && value !== "undefined" && value !== "null") {
          // Try to parse to validate
          JSON.parse(value);
        }
      } catch (error) {
        console.warn(`Removing corrupted localStorage entry: ${key}`, error);
        keysToRemove.push(key);
      }
    }
  }

  // Remove corrupted entries
  keysToRemove.forEach((key) => {
    removeFromLocalStorage(key);
  });

  if (keysToRemove.length > 0) {
    console.log(
      `Cleaned up ${keysToRemove.length} corrupted localStorage entries`
    );
  }
};

// Initialize cleanup on module load
if (typeof window !== "undefined") {
  // Clean up on page load
  cleanupLocalStorage();
}
