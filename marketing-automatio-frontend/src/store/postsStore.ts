import { create } from 'zustand';
import type { Post, CreatePostInput } from '../types';
import { api } from '../services/apiClient';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PostsStore {
  posts: Post[];
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;
  // Local state helpers
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  // API actions
  fetchPosts: (params?: { page?: number; limit?: number; status?: string }) => Promise<void>;
  createPost: (input: CreatePostInput) => Promise<Post>;
  editPost: (id: string, updates: Partial<Post>) => Promise<Post>;
  removePost: (id: string) => Promise<void>;
  publishPost: (id: string) => Promise<Post>;
}

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const usePostsStore = create<PostsStore>((set, get) => ({
  posts: [],
  pagination: DEFAULT_PAGINATION,
  isLoading: false,
  error: null,

  setPosts: (posts) => set({ posts }),
  addPost: (post) =>
    set((state) => ({ posts: [post, ...state.posts] })),
  updatePost: (id, updates) =>
    set((state) => ({
      posts: state.posts.map((post) => (post.id === id ? { ...post, ...updates } : post)),
    })),
  deletePost: (id) =>
    set((state) => ({ posts: state.posts.filter((post) => post.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // ── Real API Actions ──────────────────────────────────────────────────────

  fetchPosts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams();
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      if (params.status) query.set('status', params.status);

      const response = await api.get<{ data: Post[]; pagination: PaginationState }>(
        `/posts?${query.toString()}`
      );
      set({
        posts: response.data.data,
        pagination: response.data.pagination,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load posts', isLoading: false });
    }
  },

  createPost: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Post>('/posts', input);
      const post = response.data;
      get().addPost(post);
      set({ isLoading: false });
      return post;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create post', isLoading: false });
      throw err;
    }
  },

  editPost: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put<Post>(`/posts/${id}`, updates);
      const post = response.data;
      get().updatePost(id, post);
      set({ isLoading: false });
      return post;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update post', isLoading: false });
      throw err;
    }
  },

  removePost: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/posts/${id}`);
      get().deletePost(id);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete post', isLoading: false });
      throw err;
    }
  },

  publishPost: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Post>(`/posts/${id}/publish`);
      const post = response.data;
      get().updatePost(id, post);
      set({ isLoading: false });
      return post;
    } catch (err: any) {
      set({ error: err.message || 'Failed to publish post', isLoading: false });
      throw err;
    }
  },
}));
