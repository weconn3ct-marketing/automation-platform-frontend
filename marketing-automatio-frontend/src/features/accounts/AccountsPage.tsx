import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Card } from '../../components/ui/Card';
import {
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useConnectionsStore } from '../../store/connectionsStore';
import { useOAuth } from '../../hooks/useOAuth';
import type { Platform } from '../../types';

type BasicPlatform = 'instagram' | 'linkedin' | 'facebook';

export const AccountsPage = () => {
  const {
    connections,
    isLoading,
    fetchConnections,
    removeConnection,
  } = useConnectionsStore();

  const { isInitiating, error, connectPlatform, clearError } = useOAuth();

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const [showInstagramForm, setShowInstagramForm] = useState(false);

  // Instagram Form State (for manual fallback)
  const [instagramForm, setInstagramForm] = useState({
    appId: '',
    appSecret: '',
    businessAccountId: '',
    facebookPageId: '',
    accessToken: '',
  });

  const platformInfo = {
    instagram: {
      name: 'Instagram Business',
      icon: '📸',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
    },
    linkedin: {
      name: 'LinkedIn',
      icon: '💼',
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    facebook: {
      name: 'Facebook Page',
      icon: '👥',
      color: 'from-blue-700 to-blue-800',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
  };

  const getConnection = (platform: Platform) => {
    return connections.find(c => c.platform === platform);
  };

  const handleConnectPlatform = async (platform: 'facebook' | 'instagram' | 'linkedin') => {
    clearError();
    if (platform === 'instagram') {
      setShowInstagramForm(true);
    } else {
      try {
        await connectPlatform(platform);
      } catch (err) {
        console.error(`Failed to connect ${platform}:`, err);
      }
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (confirm('Are you sure you want to disconnect this account?')) {
      await removeConnection(connectionId);
    }
  };

  const handleOAuthConnect = async (platform: 'facebook' | 'instagram' | 'linkedin') => {
    clearError();
    try {
      await connectPlatform(platform);
    } catch (err) {
      console.error(`Failed to connect ${platform}:`, err);
    }
  };

  const getDaysUntilExpiry = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const now = new Date().getTime();
    const expiryTime = new Date(expiresAt).getTime();
    const days = Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {(isLoading || isInitiating) && (
        <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-gray-600">
          <Loader2 size={16} className="animate-spin text-indigo-600" />
          {isInitiating ? 'Connecting...' : 'Syncing...'}
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 shadow-lg rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-red-800 max-w-sm">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
          <div className="flex-1">{error.message}</div>
          <button onClick={clearError} className="text-red-600 hover:text-red-800 ml-2">
            ✕
          </button>
        </div>
      )}

      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header
          title="Connected Accounts"
          subtitle="Manage your social media integrations with OAuth"
        />

        <main className="flex-1 p-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {(['instagram', 'linkedin', 'facebook'] as BasicPlatform[]).map(platform => {
              const connection = getConnection(platform as Platform);
              const info = platformInfo[platform as BasicPlatform];

              return (
                <Card key={platform} className={`p-6 ${info.bgColor} border ${info.borderColor}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center text-2xl`}>
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{info.name}</h3>
                        {connection && (
                          <p className="text-sm text-gray-600">{connection.accountName}</p>
                        )}
                      </div>
                    </div>
                    {connection ? (
                      <div>
                        {connection.status === 'connected' && (
                          <CheckCircle2 className="text-green-600" size={24} />
                        )}
                        {connection.status === 'error' && (
                          <XCircle className="text-red-600" size={24} />
                        )}
                      </div>
                    ) : (
                      <XCircle className="text-gray-400" size={24} />
                    )}
                  </div>

                  {connection ? (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-700">
                        <p className="mb-1">
                          <span className="font-medium">Status:</span>{' '}
                          {connection.status === 'connected' ? (
                            <span className="text-green-600 font-semibold">Connected</span>
                          ) : (
                            <span className="text-red-600 font-semibold">Error</span>
                          )}
                        </p>
                        {connection.lastSync && (
                          <p className="mb-1">
                            <span className="font-medium">Last Sync:</span>{' '}
                            {new Date(connection.lastSync).toLocaleString()}
                          </p>
                        )}
                        {connection.expiresAt && (
                          <p className="mb-1">
                            <span className="font-medium">Expires in:</span>{' '}
                            <span className={getDaysUntilExpiry(connection.expiresAt)! < 7 ? 'text-red-600 font-semibold' : ''}>
                              {getDaysUntilExpiry(connection.expiresAt)} days
                            </span>
                          </p>
                        )}
                      </div>

                      {connection.errorMessage && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-xs text-red-800">{connection.errorMessage}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOAuthConnect(platform as 'facebook' | 'instagram' | 'linkedin')}
                          disabled={isInitiating}
                          className="flex-1 bg-white text-gray-700 text-sm font-semibold py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RefreshCw size={14} />
                          {connection.status === 'error' ? 'Reconnect' : 'Refresh'}
                        </button>
                        <button
                          onClick={() => handleDisconnect(connection.id)}
                          disabled={isLoading}
                          className="bg-white text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConnectPlatform(platform as 'facebook' | 'instagram' | 'linkedin')}
                      disabled={isInitiating}
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={18} />
                      Connect {info.name}
                    </button>
                  )}
                </Card>
              );
            })}
          </div>

          {/* OAuth Info Alert */}
          <Card className="p-4 mb-8 bg-blue-50 border border-blue-200">
            <div className="flex gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">OAuth Authentication</h3>
                <p className="text-sm text-blue-800">
                  Your connections use OAuth 2.0 for secure authorization. Tokens are automatically managed and refreshed. Manual credential entry is available as a fallback for Instagram.
                </p>
              </div>
            </div>
          </Card>

          {/* Instagram Connection Form Modal (Fallback) */}
          {showInstagramForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
                      📸
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Connect Instagram</h2>
                      <p className="text-sm text-gray-600">Choose your connection method</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInstagramForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {/* OAuth Option */}
                  <div className="border-2 border-indigo-200 rounded-lg p-6 bg-indigo-50">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="text-green-600" size={20} />
                      OAuth 2.0 (Recommended)
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Secure, automatic token management with no manual credentials needed
                    </p>
                    <button
                      onClick={() => {
                        setShowInstagramForm(false);
                        handleOAuthConnect('instagram');
                      }}
                      disabled={isInitiating}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isInitiating ? 'Connecting...' : 'Connect with Facebook OAuth'}
                    </button>
                  </div>

                  {/* Manual Option */}
                  <div className="border-2 border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Manual Configuration</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Enter your Instagram credentials manually (for advanced users)
                    </p>

                    {/* Form fields hidden by default */}
                    <details className="space-y-4">
                      <summary className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-700">
                        Show manual setup →
                      </summary>

                      <div className="space-y-4 pt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Facebook App ID
                          </label>
                          <input
                            type="text"
                            value={instagramForm.appId}
                            onChange={(e) => setInstagramForm({ ...instagramForm, appId: e.target.value })}
                            placeholder="Your credentials are secure with OAuth"
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            Manual credentials are deprecated. Use OAuth instead.
                          </p>
                        </div>
                      </div>
                    </details>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => setShowInstagramForm(false)}
                      className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
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

export default AccountsPage;
