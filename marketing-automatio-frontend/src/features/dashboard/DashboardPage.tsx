import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Card } from '../../components/ui/Card';
import { Clock, Hourglass, TrendingUp, ExternalLink, Plus, Link2, BarChart3, Settings, Loader2 } from 'lucide-react';
import { api } from '../../services/apiClient';
import { usePostsStore } from '../../store/postsStore';
import type { DashboardMetrics, Post } from '../../types';

const PLATFORM_STYLES: Record<string, { bg: string; icon: React.ReactNode }> = {
  linkedin: {
    bg: 'bg-blue-600',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  instagram: {
    bg: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  facebook: {
    bg: 'bg-blue-700',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
};

const STATUS_COLOR: Record<string, string> = {
  scheduled: 'text-blue-600',
  review: 'text-orange-600',
  draft: 'text-gray-500',
  published: 'text-green-600',
  failed: 'text-red-600',
};

const quickActions = [
  { icon: Link2, label: 'Connect Account', description: 'Link your social media accounts', path: '/dashboard/accounts' },
  { icon: BarChart3, label: 'View Analytics', description: 'Check your performance metrics', path: '/dashboard/history' },
  { icon: Settings, label: 'Settings', description: 'Manage your preferences', path: '/dashboard/accounts' },
];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { fetchPosts, posts } = usePostsStore();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard metrics from backend
    const loadMetrics = async () => {
      try {
        const response = await api.get<DashboardMetrics>('/analytics/dashboard');
        setMetrics(response.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setMetricsLoading(false);
      }
    };

    loadMetrics();
    fetchPosts({ limit: 5, status: 'scheduled' });
  }, [fetchPosts]);

  const metricCards = [
    {
      title: 'Scheduled Posts',
      value: metricsLoading ? '—' : String(metrics?.scheduledPosts ?? 0),
      change: `${metrics?.publishedPosts ?? 0} published total`,
      isPositive: true,
      icon: Clock,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Pending Approvals',
      value: metricsLoading ? '—' : String(metrics?.pendingApprovals ?? 0),
      change: 'Needs your review',
      isPositive: false,
      icon: Hourglass,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Total Reach',
      value: metricsLoading ? '—' : (metrics?.totalReach ?? '0'),
      change: `${metrics?.engagementRate ?? '0%'} engagement rate`,
      isPositive: true,
      icon: TrendingUp,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
  ];

  const upcomingPosts = posts.filter((p) => ['scheduled', 'review', 'draft'].includes(p.status)).slice(0, 5);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header
          title="Dashboard"
          subtitle="Welcome back, manage your social media presence"
        />

        <main className="flex-1 p-8">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {metricCards.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium mb-2">{metric.title}</p>
                      {metricsLoading ? (
                        <div className="flex items-center gap-2 mb-2">
                          <Loader2 className="animate-spin text-gray-400" size={20} />
                          <span className="text-gray-400 text-sm">Loading...</span>
                        </div>
                      ) : (
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</h3>
                      )}
                      <p className={`text-sm font-medium ${metric.isPositive ? 'text-green-600' : 'text-orange-600'}`}>
                        {metric.change}
                      </p>
                    </div>
                    <div className={`w-12 h-12 ${metric.bgColor} rounded-xl flex items-center justify-center`}>
                      <Icon className={metric.iconColor} size={24} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Schedule */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Upcoming Schedule</h2>
                  <button
                    onClick={() => navigate('/dashboard/calendar')}
                    className="text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <ExternalLink size={20} />
                  </button>
                </div>

                {upcomingPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No upcoming posts yet.</p>
                    <button
                      onClick={() => navigate('/dashboard/create')}
                      className="text-indigo-600 font-semibold hover:text-indigo-700"
                    >
                      Create your first post →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingPosts.map((post: Post) => {
                      const firstPlatform = post.platforms?.[0] ?? 'instagram';
                      const style = PLATFORM_STYLES[firstPlatform] ?? PLATFORM_STYLES.instagram;
                      return (
                        <div key={post.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className={`w-12 h-12 ${style.bg} rounded-lg flex items-center justify-center text-white shrink-0`}>
                            {style.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                            <p className="text-sm text-gray-600">
                              {post.scheduledAt
                                ? new Date(post.scheduledAt).toLocaleString()
                                : 'Not scheduled'}
                            </p>
                          </div>
                          <span className={`text-sm font-medium capitalize shrink-0 ${STATUS_COLOR[post.status] ?? 'text-gray-600'}`}>
                            {post.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Create New Post */}
              <Card className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
                <h2 className="text-xl font-bold mb-2">Create New Post</h2>
                <p className="text-indigo-100 mb-6 text-sm">
                  Start crafting your next social media masterpiece with AI
                </p>
                <button
                  onClick={() => navigate('/dashboard/create')}
                  className="w-full bg-white text-indigo-600 font-semibold py-3 px-4 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Create Post
                </button>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Quick Actions</h2>
                <p className="text-gray-600 text-sm mb-6">Manage your social accounts and settings</p>

                <div className="space-y-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => navigate(action.path)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <Icon className="text-gray-600" size={20} />
                        <span className="font-medium text-gray-900">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
