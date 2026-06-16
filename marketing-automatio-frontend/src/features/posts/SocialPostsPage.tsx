/**
 * SocialPostsPage.tsx
 *
 * Example page demonstrating full integration with:
 *  - useSocialPosts — list cached posts, trigger sync per platform
 *  - useAuditSummary — 30-day activity stats in the header
 *
 * Drop this into your router alongside AccountsPage.
 * Route example: /dashboard/social-posts
 */

import { useState } from 'react';
import {
  RefreshCw,
  Loader2,
  AlertCircle,
  Image,
  Video,
  FileText,
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { useSocialPosts } from '../../hooks/useSocialPosts';
import { useAuditSummary } from '../../hooks/useAudit';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Card } from '../../components/ui/Card';
import type { SocialPost } from '../../types';

type SocialPlatform = 'facebook' | 'instagram' | 'linkedin';

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORMS: { id: SocialPlatform; label: string; icon: string; color: string }[] = [
  { id: 'facebook', label: 'Facebook', icon: '👥', color: 'bg-blue-100 text-blue-800' },
  { id: 'instagram', label: 'Instagram', icon: '📸', color: 'bg-purple-100 text-purple-800' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'bg-sky-100 text-sky-800' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MediaIcon({ mediaType }: { mediaType: string | null }) {
  if (mediaType === 'video' || mediaType === 'VIDEO') return <Video size={14} className="text-purple-500" />;
  if (mediaType === 'image' || mediaType === 'IMAGE' || mediaType === 'CAROUSEL_ALBUM')
    return <Image size={14} className="text-blue-500" />;
  return <FileText size={14} className="text-gray-400" />;
}

function SyncResultBadge({ status }: { status: 'success' | 'error' | 'skipped' }) {
  if (status === 'success') return <CheckCircle2 size={14} className="text-green-600" />;
  if (status === 'error') return <XCircle size={14} className="text-red-500" />;
  return <Clock size={14} className="text-gray-400" />;
}

function PostCard({ post }: { post: SocialPost }) {
  const platform = PLATFORMS.find(p => p.id === post.platform);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{platform?.icon ?? '🌐'}</span>
          <div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${platform?.color ?? 'bg-gray-100'}`}>
              {platform?.label ?? post.platform}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <MediaIcon mediaType={post.mediaType} />
          {post.permalink && (
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600"
              title="View on platform"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Thumbnail */}
      {post.thumbnailUrl && (
        <img
          src={post.thumbnailUrl}
          alt="Post media"
          className="w-full h-40 object-cover rounded-lg mb-3 bg-gray-100"
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}

      {/* Content */}
      {post.content && (
        <p className="text-sm text-gray-700 mb-3 line-clamp-3">{post.content}</p>
      )}

      {/* Engagement */}
      <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span className="flex items-center gap-1">
          <Heart size={12} className="text-red-400" />
          {post.likeCount.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle size={12} className="text-blue-400" />
          {post.commentCount.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <Share2 size={12} className="text-green-400" />
          {post.shareCount.toLocaleString()}
        </span>
        {post.postedAt && (
          <span className="ml-auto text-gray-400">
            {new Date(post.postedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export const SocialPostsPage = () => {
  const [activePlatform, setActivePlatform] = useState<SocialPlatform | undefined>(undefined);

  const {
    posts,
    pagination,
    isLoading,
    isSyncing,
    syncResults,
    totalSynced,
    error,
    syncError,
    syncPosts,
    refetch,
  } = useSocialPosts({ platform: activePlatform, limit: 20 });

  const { summary } = useAuditSummary();

  const handleSync = async (platform?: SocialPlatform) => {
    await syncPosts(platform ?? activePlatform);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header
          title="Social Posts"
          subtitle="View and sync posts from your connected platforms"
        />

        <main className="flex-1 p-8 space-y-6">

          {/* Activity summary bar */}
          {summary && (
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-indigo-600">{summary.last30Days.connections}</p>
                <p className="text-xs text-gray-500 mt-1">Connections (30d)</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{summary.last30Days.syncs}</p>
                <p className="text-xs text-gray-500 mt-1">Syncs (30d)</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-700">{pagination?.total ?? posts.length}</p>
                <p className="text-xs text-gray-500 mt-1">Cached Posts</p>
              </Card>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Platform filter tabs */}
            <button
              onClick={() => setActivePlatform(undefined)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !activePlatform
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Platforms
            </button>
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePlatform(p.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activePlatform === p.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{p.icon}</span>
                {p.label}
              </button>
            ))}

            {/* Sync buttons */}
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => handleSync()}
                disabled={isSyncing}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isSyncing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                {isSyncing ? 'Syncing...' : activePlatform ? `Sync ${activePlatform}` : 'Sync All'}
              </button>
            </div>
          </div>

          {/* Sync results banner */}
          {syncResults && (
            <Card className="p-4 bg-green-50 border border-green-200">
              <p className="text-sm font-semibold text-green-800 mb-2">
                ✓ Sync complete — {totalSynced} posts synced
              </p>
              <div className="flex flex-wrap gap-3">
                {syncResults.map(r => (
                  <div key={r.platform} className="flex items-center gap-1.5 text-sm text-gray-700">
                    <SyncResultBadge status={r.status} />
                    <span className="capitalize font-medium">{r.platform}</span>
                    <span className="text-gray-500">
                      {r.status === 'success'
                        ? `${r.postsSynced} posts`
                        : r.status === 'error'
                        ? r.error
                        : 'skipped'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Sync error */}
          {syncError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
              {syncError}
            </div>
          )}

          {/* Fetch error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
              {error}
              <button onClick={refetch} className="ml-auto underline text-red-700">Retry</button>
            </div>
          )}

          {/* Posts grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-indigo-400" />
            </div>
          ) : posts.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-400 text-lg mb-2">No posts found</p>
              <p className="text-gray-400 text-sm mb-6">
                Connect a social account and click <strong>Sync All</strong> to import posts.
              </p>
              <button
                onClick={() => handleSync()}
                disabled={isSyncing}
                className="mx-auto flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                <RefreshCw size={16} />
                Sync Now
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination info */}
          {pagination && pagination.totalPages > 1 && (
            <p className="text-center text-sm text-gray-500">
              Showing {posts.length} of {pagination.total} posts
            </p>
          )}
        </main>
      </div>
    </div>
  );
};

export default SocialPostsPage;
