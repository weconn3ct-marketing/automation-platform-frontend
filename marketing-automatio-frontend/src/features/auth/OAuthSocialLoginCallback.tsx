import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authStorage } from '../../lib/storage';

/**
 * OAuthSocialLoginCallback
 *
 * Handles the redirect from the backend after a successful social login.
 * The backend passes user data and tokens as URL search params.
 * We store them and redirect the user to the dashboard.
 */
export const OAuthSocialLoginCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setToken } = useAuthStore();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const firstName = searchParams.get('firstName') || '';
    const lastName = searchParams.get('lastName') || '';
    const avatar = searchParams.get('avatar') || undefined;
    const platform = searchParams.get('platform') || 'social';

    if (!token || !userId || !email) {
      const url = new URL('/auth/oauth-error', window.location.origin);
      url.searchParams.set('platform', platform);
      url.searchParams.set('error', 'social_login_failed');
      url.searchParams.set('error_description', 'Missing authentication tokens from social login callback.');
      navigate(url.pathname + url.search, { replace: true });
      return;
    }

    // Store tokens via authStorage (same mechanism as regular login)
    authStorage.setToken(token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }

    const now = new Date().toISOString();
    const user = {
      id: userId,
      email,
      firstName,
      lastName,
      avatar: avatar || undefined,
      createdAt: now,
      updatedAt: now,
    };
    authStorage.setUser(user);

    // Update Zustand store
    setUser(user);
    setToken(token);

    // Redirect to dashboard
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 1500);
  }, [searchParams, navigate, setUser, setToken]);

  const platform = searchParams.get('platform') || '';
  const hasToken = !!searchParams.get('token');

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-8 text-center shadow-2xl"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {hasToken ? (
          <>
            {/* Success state */}
            <div className="mb-6 flex justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)' }}
              >
                <CheckCircle2 size={40} className="text-green-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Signed in successfully!
            </h1>
            <p className="text-slate-400 mb-6 text-sm">
              {platform
                ? `Welcome! You're now signed in with ${platform.charAt(0).toUpperCase() + platform.slice(1)}.`
                : "You're now signed in."}
            </p>
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Loader2 size={16} className="animate-spin text-indigo-400" />
              Redirecting to dashboard...
            </div>
          </>
        ) : (
          <>
            {/* Error state */}
            <div className="mb-6 flex justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.4)' }}
              >
                <AlertCircle size={40} className="text-red-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Sign-in Failed
            </h1>
            <p className="text-slate-400 mb-6 text-sm">
              Something went wrong during social login. Please try again.
            </p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthSocialLoginCallback;
