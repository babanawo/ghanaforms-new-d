import { useState } from 'react';

// Fallback in-memory map for environments where localStorage is disabled/restricted
const memoryStore = new Map<string, string>();

export function safeLocalStorageGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // LocalStorage blocked or restricted
  }
  return memoryStore.get(key) ?? null;
}

export function safeLocalStorageSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {
    // LocalStorage blocked or restricted
  }
  memoryStore.set(key, value);
}

export function safeLocalStorageRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
  } catch {
    // LocalStorage blocked
  }
  memoryStore.delete(key);
}

export function useSafeStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const raw = safeLocalStorageGet(key);
    if (raw !== null) {
      try {
        return JSON.parse(raw) as T;
      } catch {
        return initialValue;
      }
    }
    return initialValue;
  });

  const setValue = (val: T | ((prev: T) => T)) => {
    setStoredValue((current) => {
      const nextVal = typeof val === 'function' ? (val as (prev: T) => T)(current) : val;
      safeLocalStorageSet(key, JSON.stringify(nextVal));
      return nextVal;
    });
  };

  return [storedValue, setValue];
}
