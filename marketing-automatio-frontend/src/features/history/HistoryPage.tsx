import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Card } from '../../components/ui/Card';
import { 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Search,
  ExternalLink,
  Download,
  Eye,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { usePostsStore } from '../../store/postsStore';
import type { Post } from '../../types';

type Platform = 'instagram' | 'linkedin' | 'facebook' | 'all';
type Status = 'success' | 'failed' | 'all';

interface PostHistory {
  id: string;
  platform: 'instagram' | 'linkedin' | 'facebook';
  status: 'success' | 'failed';
  title: string;
  content: string;
  dateTime: Date;
  mediaUrls: string[];
  mediaSizes: number[];
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
  errorMessage?: string;
  postUrl?: string;
}

function mapPostToHistory(post: Post): PostHistory {
  const primaryPlatform = post.platforms[0] || 'instagram';
  const platform = (['instagram', 'linkedin', 'facebook'].includes(primaryPlatform)
    ? primaryPlatform
    : 'instagram') as 'instagram' | 'linkedin' | 'facebook';
  const status: 'success' | 'failed' = post.status === 'failed' ? 'failed' : 'success';
  const dateTime = new Date(post.publishedAt || post.updatedAt || post.createdAt);
  return {
    id: post.id,
    platform,
    status,
    title: post.title,
    content: post.content,
    dateTime,
    mediaUrls: post.imageUrls || [],
    mediaSizes: [],
    engagement: undefined,
    errorMessage: post.status === 'failed'
      ? 'Publishing failed. Please check your platform connection and retry.'
      : undefined,
    postUrl: undefined,
  };
}

export const HistoryPage = () => {
  const { posts: rawPosts, fetchPosts, isLoading } = usePostsStore();
  const [posts, setPosts] = useState<PostHistory[]>([]);
  const [platformFilter, setPlatformFilter] = useState<Platform>('all');
  const [statusFilter, setStatusFilter] = useState<Status>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedPost, setSelectedPost] = useState<PostHistory | null>(null);

  useEffect(() => {
    fetchPosts({ limit: 100 });
  }, [fetchPosts]);

  useEffect(() => {
    const historyPosts = rawPosts
      .filter(p => p.status === 'published' || p.status === 'failed')
      .map(mapPostToHistory);
    setPosts(historyPosts);
  }, [rawPosts]);

  const filteredPosts = posts.filter(post => {
    const matchesPlatform = platformFilter === 'all' || post.platform === platformFilter;
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesSearch = 
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = 
      dateFilter === '' ||
      post.dateTime.toISOString().split('T')[0] === dateFilter;

    return matchesPlatform && matchesStatus && matchesSearch && matchesDate;
  });

  const platformColors = {
    instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
    linkedin: 'bg-blue-600',
    facebook: 'bg-blue-700',
  };

  const platformLabels = {
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
  };

  const formatFileSize = (mb: number) => {
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(mb * 1024).toFixed(0)} KB`;
  };

  const getSuccessRate = () => {
    const total = posts.length;
    const successful = posts.filter(p => p.status === 'success').length;
    return total > 0 ? ((successful / total) * 100).toFixed(1) : '0';
  };

  const getTotalPosts = () => posts.length;
  const getSuccessfulPosts = () => posts.filter(p => p.status === 'success').length;
  const getFailedPosts = () => posts.filter(p => p.status === 'failed').length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title="Post History" 
          subtitle="View published content and workflow execution results"
        />
        
        <main className="flex-1 p-8">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-indigo-600" />
              <span className="ml-3 text-gray-600 font-medium">Loading post history...</span>
            </div>
          )}
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Total Posts</p>
              <h3 className="text-3xl font-bold text-gray-900">{getTotalPosts()}</h3>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Successful</p>
              <h3 className="text-3xl font-bold text-green-600">{getSuccessfulPosts()}</h3>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Failed</p>
              <h3 className="text-3xl font-bold text-red-600">{getFailedPosts()}</h3>
            </Card>
            <Card className="p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Success Rate</p>
              <h3 className="text-3xl font-bold text-indigo-600">{getSuccessRate()}%</h3>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="text-indigo-600" size={20} />
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Platform Filter */}
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value as Platform)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Platforms</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Status)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>

              {/* Date Filter */}
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {(platformFilter !== 'all' || statusFilter !== 'all' || searchQuery || dateFilter) && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Showing {filteredPosts.length} of {posts.length} posts
                </span>
                <button
                  onClick={() => {
                    setPlatformFilter('all');
                    setStatusFilter('all');
                    setSearchQuery('');
                    setDateFilter('');
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </Card>

          {/* Posts List */}
          {filteredPosts.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-400" size={40} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Found</h3>
                <p className="text-gray-600">No posts found matching your filters. Try adjusting your search criteria.</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    {/* Platform Icon */}
                    <div className={`w-12 h-12 ${platformColors[post.platform]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-lg font-bold">
                        {post.platform[0].toUpperCase()}
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{post.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex-shrink-0">
                          {post.status === 'success' ? (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                              <CheckCircle2 size={16} />
                              <span className="text-sm font-medium">Success</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                              <XCircle size={16} />
                              <span className="text-sm font-medium">Failed</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Error Message */}
                      {post.errorMessage && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 mt-2">
                          <p className="text-xs text-red-800">{post.errorMessage}</p>
                        </div>
                      )}

                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-6 mt-4">
                        {/* Date/Time */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarIcon size={16} />
                          <span className="text-sm">
                            {post.dateTime.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                            {' at '}
                            {post.dateTime.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>

                        {/* Platform Badge */}
                        <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                          {platformLabels[post.platform]}
                        </span>

                        {/* Media Count */}
                        {post.mediaUrls.length > 0 && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <ImageIcon size={16} />
                            <span className="text-sm">
                              {post.mediaUrls.length} image{post.mediaUrls.length !== 1 ? 's' : ''}
                              {post.mediaSizes.some(size => size > 8) && (
                                <span className="text-red-600 font-semibold ml-1">⚠️</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Engagement Stats - Bottom of Card */}
                      {post.engagement && (
                        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-pink-600">
                            <span className="text-2xl">❤️</span>
                            <div>
                              <p className="text-lg font-bold">{post.engagement.likes}</p>
                              <p className="text-xs text-gray-600">Likes</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-blue-600">
                            <span className="text-2xl">💬</span>
                            <div>
                              <p className="text-lg font-bold">{post.engagement.comments}</p>
                              <p className="text-xs text-gray-600">Comments</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-green-600">
                            <span className="text-2xl">🔄</span>
                            <div>
                              <p className="text-lg font-bold">{post.engagement.shares}</p>
                              <p className="text-xs text-gray-600">Shares</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - Right Side */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors font-medium text-sm whitespace-nowrap"
                        title="View Details"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                      {post.postUrl && (
                        <a
                          href={post.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm whitespace-nowrap"
                          title="View on Platform"
                        >
                          <ExternalLink size={16} />
                          <span>Open</span>
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Post Detail Modal */}
          {selectedPost && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Post Details</h2>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Platform & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${platformColors[selectedPost.platform]} rounded-lg flex items-center justify-center`}>
                        <span className="text-white font-bold">
                          {selectedPost.platform[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{platformLabels[selectedPost.platform]}</p>
                        <p className="text-sm text-gray-600">
                          {selectedPost.dateTime.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      {selectedPost.status === 'success' ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                          <CheckCircle2 size={20} />
                          <span className="font-medium">Published Successfully</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                          <XCircle size={20} />
                          <span className="font-medium">Publishing Failed</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {selectedPost.errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-red-900 mb-1">Error Details:</p>
                      <p className="text-sm text-red-800">{selectedPost.errorMessage}</p>
                    </div>
                  )}

                  {/* Title & Content */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{selectedPost.title}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
                  </div>

                  {/* Media */}
                  {selectedPost.mediaUrls.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Media Files</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedPost.mediaUrls.map((url, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={url}
                              alt={`Media ${idx + 1}`}
                              className="w-full h-40 object-cover rounded-lg"
                            />
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                              {formatFileSize(selectedPost.mediaSizes[idx])}
                              {selectedPost.mediaSizes[idx] > 8 && (
                                <span className="text-red-400 ml-1">⚠️ Exceeds 8MB</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Engagement */}
                  {selectedPost.engagement && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Engagement Metrics</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-pink-50 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-pink-600">{selectedPost.engagement.likes}</p>
                          <p className="text-sm text-gray-600">Likes</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-blue-600">{selectedPost.engagement.comments}</p>
                          <p className="text-sm text-gray-600">Comments</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-green-600">{selectedPost.engagement.shares}</p>
                          <p className="text-sm text-gray-600">Shares</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    {selectedPost.postUrl && (
                      <a
                        href={selectedPost.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={18} />
                        View on {platformLabels[selectedPost.platform]}
                      </a>
                    )}
                    <button className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                      <Download size={18} />
                      Download Report
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HistoryPage;
