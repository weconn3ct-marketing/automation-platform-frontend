// ─── Platform & Status ───────────────────────────────────────────────────────

export type Platform = 'instagram' | 'linkedin' | 'facebook' | 'instagram-feed' | 'instagram-reels';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'pending';
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'review';
export type ContentType = 'text' | 'article' | 'carousel' | 'video' | 'image';
export type ToneStyle = 'professional' | 'casual' | 'friendly' | 'formal' | 'creative' | 'humorous';

// ─── User & Auth ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

// ─── Connection ───────────────────────────────────────────────────────────────

export interface Connection {
  id: string;
  userId?: string;
  platform: Platform;
  status: ConnectionStatus;
  accountName?: string;
  accountId?: string;
  connectedAt?: string;
  lastSync?: string;
  /** Never returned from API — use hasAccessToken instead */
  accessToken?: never;
  /** Never returned from API — use hasRefreshToken instead */
  refreshToken?: never;
  hasAccessToken?: boolean;
  hasRefreshToken?: boolean;
  expiresAt?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  oauthProvider?: 'facebook' | 'instagram' | 'linkedin';
  createdAt?: string;
  updatedAt?: string;
}

export interface InstagramConnectionForm {
  appId: string;
  appSecret: string;
  businessAccountId: string;
  facebookPageId: string;
  accessToken: string;
}

export interface LinkedInConnectionForm {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  organizationId: string;
  accessToken: string;
}

// ─── Social Posts (fetched from platforms) ───────────────────────────────────

export interface SocialPost {
  id: string;
  userId: string;
  connectionId: string;
  platform: string;
  platformPostId: string;
  content: string | null;
  caption: string | null;
  mediaType: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  permalink: string | null;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  postedAt: string | null;
  fetchedAt: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SyncResult {
  platform: string;
  status: 'success' | 'error' | 'skipped';
  postsSynced: number;
  error?: string;
}

export interface SyncResponse {
  results: SyncResult[];
  totalSynced: number;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'ACCOUNT_CONNECT'
  | 'ACCOUNT_DISCONNECT'
  | 'ACCOUNT_RECONNECT'
  | 'TOKEN_REFRESH'
  | 'OAUTH_INITIATE'
  | 'OAUTH_CALLBACK_SUCCESS'
  | 'OAUTH_CALLBACK_ERROR'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_SIGNUP'
  | 'USER_PROFILE_UPDATE'
  | 'USER_ACCOUNT_DELETE'
  | 'SOCIAL_POSTS_SYNC';

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  platform?: string;
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditSummary {
  last30Days: {
    connections: number;
    disconnections: number;
    syncs: number;
  };
  recentActivity: Pick<AuditLog, 'id' | 'action' | 'platform' | 'createdAt'>[];
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export interface PostEngagement {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  impressions: number;
}

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  level: NotificationLevel;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  platforms: Platform[];
  status: PostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  imageUrls?: string[];
  videoUrl?: string;
  contentType: ContentType;
  tone?: ToneStyle;
  topic?: string;
  imagePrompt?: string;
  metadata?: PostMetadata;
  engagement?: PostEngagement | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostMetadata {
  characterCount: number;
  wordCount: number;
  estimatedReach?: string;
  hashtags?: string[];
  mentions?: string[];
}

export interface CreatePostInput {
  topic: string;
  platforms: Platform[];
  contentType: ContentType;
  tone: ToneStyle;
  imagePrompt?: string;
  scheduledAt?: string;
  title?: string;
  content?: string;
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Dashboard & Analytics ────────────────────────────────────────────────────

export interface DashboardMetrics {
  scheduledPosts: number;
  pendingApprovals: number;
  publishedPosts: number;
  connectedAccounts: number;
  totalReach: string;
  engagementRate: string;
}

export interface AnalyticsData {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  clickThroughRate?: number;
  impressions?: number;
}
