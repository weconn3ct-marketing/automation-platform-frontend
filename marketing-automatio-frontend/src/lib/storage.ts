import { STORAGE_KEYS } from './constants';

/**
 * Local storage helper functions with type safety
 */

export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  },
};

/**
 * Auth-specific storage helpers
 */
export const authStorage = {
  getToken: (): string | null => {
    return storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  },

  setToken: (token: string): void => {
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  removeToken: (): void => {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
  },

  getUser: () => {
    return storage.get(STORAGE_KEYS.USER);
  },

  setUser: (user: any): void => {
    storage.set(STORAGE_KEYS.USER, user);
  },

  removeUser: (): void => {
    storage.remove(STORAGE_KEYS.USER);
  },

  clearAuth: (): void => {
    authStorage.removeToken();
    authStorage.removeUser();
  },
};
