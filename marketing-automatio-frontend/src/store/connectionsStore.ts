import { create } from 'zustand';
import type { Connection, Platform } from '../types';
import { api } from '../services/apiClient';

interface ConnectionsStore {
  connections: Connection[];
  isLoading: boolean;
  error: string | null;
  // Local state helpers
  setConnections: (connections: Connection[]) => void;
  addConnection: (connection: Connection) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  deleteConnection: (id: string) => void;
  getConnectionByPlatform: (platform: Platform) => Connection | undefined;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  // API actions
  fetchConnections: () => Promise<void>;
  createConnection: (data: Record<string, unknown>) => Promise<Connection>;
  removeConnection: (id: string) => Promise<void>;
  reconnect: (id: string) => Promise<void>;
}

export const useConnectionsStore = create<ConnectionsStore>((set, get) => ({
  connections: [],
  isLoading: false,
  error: null,

  setConnections: (connections) => set({ connections }),

  addConnection: (connection) =>
    set((state) => ({
      connections: [...state.connections.filter((c) => c.platform !== connection.platform), connection],
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
    return get().connections.find((c) => c.platform === platform);
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // ── Real API Actions ──────────────────────────────────────────────────────

  fetchConnections: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Connection[]>('/connections');
      set({ connections: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load connections', isLoading: false });
    }
  },

  createConnection: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Connection>('/connections', data);
      const connection = response.data;
      get().addConnection(connection);
      set({ isLoading: false });
      return connection;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create connection', isLoading: false });
      throw err;
    }
  },

  removeConnection: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/connections/${id}`);
      get().deleteConnection(id);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to remove connection', isLoading: false });
      throw err;
    }
  },

  reconnect: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Connection>(`/connections/${id}/reconnect`);
      get().updateConnection(id, response.data);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to reconnect', isLoading: false });
      throw err;
    }
  },
}));
