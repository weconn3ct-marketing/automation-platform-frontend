import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Card } from '../../components/ui/Card';
import {
  Sparkles,
  Image as ImageIcon,
  FileText,
  Send,
  RefreshCw,
  Calendar as CalendarIcon,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { usePostsStore } from '../../store/postsStore';
import type { Platform, ContentType, ToneStyle, Post } from '../../types';

const PLATFORMS: { id: Platform; label: string; icon: React.ReactNode; bg: string }[] = [
  {
    id: 'instagram-feed',
    label: 'Instagram Feed',
    bg: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    id: 'instagram-reels',
    label: 'Instagram Reels',
    bg: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M6 2l12 10-12 10z" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    bg: 'bg-blue-600',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    bg: 'bg-blue-700',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

export const CreatePostPage = () => {
  const navigate = useNavigate();
  const { createPost, publishPost } = usePostsStore();

  const [topic, setTopic] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [contentType, setContentType] = useState<ContentType>('text');
  const [tone, setTone] = useState<ToneStyle>('professional');
  const [imagePrompt, setImagePrompt] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const [generatedPost, setGeneratedPost] = useState<Post | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleGenerate = async () => {
    if (!topic || selectedPlatforms.length === 0) return;
    setIsGenerating(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const post = await createPost({
        topic,
        platforms: selectedPlatforms,
        contentType,
        tone,
        imagePrompt: imagePrompt || undefined,
      });
      setGeneratedPost(post);
    } catch (err: any) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setGeneratedPost(null);
    await handleGenerate();
  };

  const handlePostNow = async () => {
    if (!generatedPost) return;
    setIsPublishing(true);
    setError(null);
    try {
      await publishPost(generatedPost.id);
      setSuccessMsg('🎉 Post published successfully to ' + selectedPlatforms.join(', ') + '!');
      setTimeout(() => navigate('/dashboard/history'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to publish post');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSchedule = async () => {
    if (!generatedPost || !scheduledAt) return;
    setIsScheduling(true);
    setError(null);
    try {
      const { editPost } = usePostsStore.getState();
      await editPost(generatedPost.id, {
        status: 'scheduled',
        scheduledAt,
      });
      setSuccessMsg('📅 Post scheduled for ' + new Date(scheduledAt).toLocaleString() + '!');
      setTimeout(() => navigate('/dashboard/calendar'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to schedule post');
    } finally {
      setIsScheduling(false);
    }
  };

  const metadata = generatedPost?.metadata as any;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header
          title="Create New Post"
          subtitle="Let AI agents help you create engaging social media content"
        />

        <main className="flex-1 p-8">
          {/* Error / Success banner */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-800 text-sm font-medium">
              ⚠️ {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-800 text-sm font-medium flex items-center gap-2">
              <CheckCircle2 size={18} />
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Left: Input Section ─────────────────────────────────── */}
            <div className="space-y-6">
              {/* Topic */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-indigo-600" size={20} />
                  <h2 className="text-lg font-bold text-gray-900">Topic & Research</h2>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic / Prompt for AI Agent
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter the topic for your post… (e.g. 'Latest trends in AI marketing automation')"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </Card>

              {/* Platform Selection */}
              <Card className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Platform Selection</h2>
                <div className="space-y-3">
                  {PLATFORMS.map((p) => (
                    <label
                      key={p.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedPlatforms.includes(p.id)
                          ? 'border-indigo-400 bg-indigo-50'
                          : 'border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(p.id)}
                        onChange={() => togglePlatform(p.id)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`w-8 h-8 ${p.bg} rounded-lg flex items-center justify-center`}>
                          {p.icon}
                        </div>
                        <span className="font-medium text-gray-900">{p.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Content Type */}
              <Card className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Content Type</h2>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="text">Text Post</option>
                  <option value="article">Article (long-form)</option>
                  <option value="carousel">Carousel (up to 9 images)</option>
                  <option value="image">Image Post</option>
                  <option value="video">Video Post</option>
                </select>
              </Card>

              {/* AI Config */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-indigo-600" size={20} />
                  <h2 className="text-lg font-bold text-gray-900">AI Configuration</h2>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tone / Style</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as ToneStyle)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                    <option value="creative">Creative</option>
                    <option value="humorous">Humorous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon size={16} />
                      Image Prompt (optional)
                    </div>
                  </label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the image you want… (e.g. 'Modern office with diverse team collaborating')"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              </Card>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!topic || selectedPlatforms.length === 0 || isGenerating}
                className="w-full bg-indigo-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating & Saving…
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Content with AI
                  </>
                )}
              </button>
            </div>

            {/* ── Right: Preview Section ──────────────────────────────── */}
            <div className="space-y-6">
              <Card className="p-6 sticky top-8">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="text-indigo-600" size={20} />
                  <h2 className="text-lg font-bold text-gray-900">Preview & Output</h2>
                </div>

                {!generatedPost ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-gray-400" size={40} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Content Yet</h3>
                    <p className="text-gray-600 text-sm max-w-sm mx-auto">
                      Fill in the details on the left and click "Generate Content with AI" to
                      preview and save your post.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Generated text */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-indigo-600">📝</span>
                        Generated Content
                        <span className="ml-auto text-xs text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle2 size={12} /> Saved to backend
                        </span>
                      </h3>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {generatedPost.content}
                        </p>
                      </div>
                    </div>

                    {/* Platforms */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-indigo-600">🎯</span>
                        Target Platforms
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {generatedPost.platforms?.map((platform) => (
                          <span
                            key={platform}
                            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium capitalize"
                          >
                            {platform.replace(/-/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Metadata */}
                    {metadata && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-indigo-600">📊</span>
                          Content Metrics
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200">
                            <p className="text-2xl font-bold text-blue-700">{metadata.characterCount ?? '—'}</p>
                            <p className="text-xs text-blue-600 font-medium mt-1">Characters</p>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center border border-green-200">
                            <p className="text-2xl font-bold text-green-700">{metadata.wordCount ?? '—'}</p>
                            <p className="text-xs text-green-600 font-medium mt-1">Words</p>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center border border-purple-200">
                            <p className="text-2xl font-bold text-purple-700">
                              {metadata.hashtags?.length ?? 0}
                            </p>
                            <p className="text-xs text-purple-600 font-medium mt-1">Hashtags</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Schedule picker */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <CalendarIcon size={14} className="inline mr-1" />
                        Schedule Date & Time (optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-gray-200 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleRegenerate}
                          disabled={isGenerating}
                          className="bg-white border-2 border-indigo-600 text-indigo-600 font-semibold py-3 px-4 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <RefreshCw size={18} />
                          Regenerate
                        </button>
                        <button
                          onClick={handlePostNow}
                          disabled={isPublishing || !!successMsg}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                          {isPublishing ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Send size={18} />
                          )}
                          Post Now
                        </button>
                      </div>
                      <button
                        onClick={handleSchedule}
                        disabled={!scheduledAt || isScheduling || !!successMsg}
                        className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isScheduling ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <CalendarIcon size={18} />
                        )}
                        Schedule for Later
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreatePostPage;
