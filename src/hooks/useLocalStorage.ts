"use client";

import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // After hydration, read from localStorage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Listen for changes from other components/tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          console.warn(`Error parsing localStorage value for "${key}"`);
        }
      }
    };

    // Custom event for same-window synchronization
    const handleCustomEvent = (e: CustomEvent<{ key: string; value: T }>) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "local-storage-change" as keyof WindowEventMap,
      handleCustomEvent as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "local-storage-change" as keyof WindowEventMap,
        handleCustomEvent as EventListener
      );
    };
  }, [key]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage and notifies other components.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((currentValue) => {
          const valueToStore =
            value instanceof Function ? value(currentValue) : value;

          // Save to local storage
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));

            // Dispatch custom event for same-window synchronization
            window.dispatchEvent(
              new CustomEvent("local-storage-change", {
                detail: { key, value: valueToStore },
              })
            );
          }

          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}
