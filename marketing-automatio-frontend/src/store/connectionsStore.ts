import { create } from 'zustand';
import type { Connection, Platform } from '../types';

interface ConnectionsStore {
  connections: Connection[];
  isLoading: boolean;
  error: string | null;
  setConnections: (connections: Connection[]) => void;
  addConnection: (connection: Connection) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  deleteConnection: (id: string) => void;
  getConnectionByPlatform: (platform: Platform) => Connection | undefined;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useConnectionsStore = create<ConnectionsStore>((set, get) => ({
  connections: [],
  isLoading: false,
  error: null,

  setConnections: (connections) => set({ connections }),

  addConnection: (connection) =>
    set((state) => ({
      connections: [...state.connections.filter(c => c.platform !== connection.platform), connection],
    })),

  updateConnection: (id, updates) =>
    set((state) => ({
      connections: state.connections.map((connection) =>
        connection.id === id ? { ...connection, ...updates } : connection
      ),
    })),

  deleteConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((connection) => connection.id !== id),
    })),

  getConnectionByPlatform: (platform) => {
    return get().connections.find(c => c.platform === platform);
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));
