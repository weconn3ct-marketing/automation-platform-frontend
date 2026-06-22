import { useState, useRef, useCallback } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smartphone,
  Globe,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authStorage } from '../../lib/storage';
import { api } from '../../services/apiClient';
import { getInitials } from '../../lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingsTab = 'profile' | 'security' | 'notifications' | 'privacy';

interface Toast {
  type: 'success' | 'error';
  message: string;
}

interface NotificationPrefs {
  emailNewPost: boolean;
  emailPostPublished: boolean;
  emailWeeklyDigest: boolean;
  emailSecurityAlerts: boolean;
  browserPostPublished: boolean;
  browserMentions: boolean;
}

interface PrivacyPrefs {
  profileVisibility: 'public' | 'team' | 'private';
  showActivityStatus: boolean;
  allowDataExport: boolean;
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS: { id: SettingsTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'profile',       label: 'Profile',       icon: User,   description: 'Your name, email, and avatar' },
  { id: 'security',      label: 'Security',      icon: Lock,   description: 'Password and authentication' },
  { id: 'notifications', label: 'Notifications', icon: Bell,   description: 'Email and browser alerts' },
  { id: 'privacy',       label: 'Privacy',       icon: Shield, description: 'Visibility and data settings' },
];

// ─── Small reusable pieces ────────────────────────────────────────────────────

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="px-6 py-5 border-b border-gray-100">
    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
  </div>
);

const FieldLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1.5">
    {children}
  </label>
);

const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) => {
  const { error, className = '', ...rest } = props;
  return (
    <>
      <input
        {...rest}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
        } ${className}`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </>
  );
};

const Toggle = ({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) => (
  <div className="flex items-start justify-between py-4 border-b border-gray-50 last:border-0">
    <div className="flex-1 pr-4">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        checked ? 'bg-indigo-600' : 'bg-gray-200'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const SettingsPage = () => {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [toast, setToast] = useState<Toast | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Profile state ──────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar ?? null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Avatar must be smaller than 5 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validateProfile = () => {
    const errs: Record<string, string> = {};
    if (!profile.firstName.trim()) errs.firstName = 'First name is required';
    if (!profile.lastName.trim()) errs.lastName = 'Last name is required';
    if (!profile.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) errs.email = 'Enter a valid email address';
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setIsSavingProfile(true);
    try {
      const response = await api.patch<{ user: typeof user }>('/auth/profile', {
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        email: profile.email.trim(),
        ...(avatarPreview && avatarPreview !== user?.avatar ? { avatar: avatarPreview } : {}),
      });
      const updated = response.data.user;
      if (updated) {
        setUser(updated);
        authStorage.setUser(updated);
      }
      showToast('success', 'Profile updated successfully');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Security state ─────────────────────────────────────────────────────────
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [isSavingPw, setIsSavingPw] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);

  const validatePasswords = () => {
    const errs: Record<string, string> = {};
    if (!passwords.current) errs.current = 'Current password is required';
    if (!passwords.next) errs.next = 'New password is required';
    else if (passwords.next.length < 8) errs.next = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(passwords.next)) errs.next = 'Include at least one uppercase letter';
    else if (!/[0-9]/.test(passwords.next)) errs.next = 'Include at least one number';
    if (passwords.next !== passwords.confirm) errs.confirm = 'Passwords do not match';
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;
    setIsSavingPw(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });
      setPasswords({ current: '', next: '', confirm: '' });
      showToast('success', 'Password changed successfully');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to change password');
    } finally {
      setIsSavingPw(false);
    }
  };

  // Password strength indicator
  const pwStrength = (() => {
    const p = passwords.next;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();
  const pwStrengthLabel = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'][pwStrength];
  const pwStrengthColor = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-600'][pwStrength];

  // ── Notification state ─────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    emailNewPost: true,
    emailPostPublished: true,
    emailWeeklyDigest: false,
    emailSecurityAlerts: true,
    browserPostPublished: true,
    browserMentions: false,
  });
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);

  const handleSaveNotifications = async () => {
    setIsSavingNotifs(true);
    try {
      await api.patch('/auth/notifications', notifications);
      showToast('success', 'Notification preferences saved');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save preferences');
    } finally {
      setIsSavingNotifs(false);
    }
  };

  // ── Privacy state ──────────────────────────────────────────────────────────
  const [privacy, setPrivacy] = useState<PrivacyPrefs>({
    profileVisibility: 'team',
    showActivityStatus: true,
    allowDataExport: true,
  });
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const handleSavePrivacy = async () => {
    setIsSavingPrivacy(true);
    try {
      await api.patch('/auth/privacy', privacy);
      showToast('success', 'Privacy settings saved');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save settings');
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  const handleDeleteAccount = async (e: FormEvent) => {
    e.preventDefault();
    if (!deletePassword) return;
    setIsDeletingAccount(true);
    try {
      await api.delete('/auth/account', { data: { password: deletePassword } });
      useAuthStore.getState().logout();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete account');
      setIsDeletingAccount(false);
    }
  };

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderProfile = () => (
    <div className="space-y-6">
      {/* Avatar */}
      <SectionCard>
        <SectionHeader title="Profile Photo" subtitle="Upload a photo to personalise your account" />
        <div className="p-6 flex items-center gap-6">
          <div className="relative shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-indigo-100">
                {getInitials(`${profile.firstName} ${profile.lastName}`)}
              </div>
            )}
            <button
              id="settings-avatar-upload-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-700 transition-colors"
              title="Change avatar"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              id="settings-avatar-input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{profile.email}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Change photo
            </button>
            {avatarPreview && avatarPreview !== (user?.avatar ?? null) && (
              <button
                type="button"
                onClick={() => setAvatarPreview(user?.avatar ?? null)}
                className="mt-2 ml-3 text-xs text-gray-400 hover:text-gray-600"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Profile details form */}
      <SectionCard>
        <SectionHeader title="Personal Information" subtitle="Update your name and email address" />
        <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <FieldLabel htmlFor="settings-first-name">First name</FieldLabel>
              <TextInput
                id="settings-first-name"
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                placeholder="John"
                error={profileErrors.firstName}
                autoComplete="given-name"
              />
            </div>
            <div>
              <FieldLabel htmlFor="settings-last-name">Last name</FieldLabel>
              <TextInput
                id="settings-last-name"
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                placeholder="Doe"
                error={profileErrors.lastName}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="settings-email">Email address</FieldLabel>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <TextInput
                id="settings-email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                placeholder="john@example.com"
                className="pl-10"
                error={profileErrors.email}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="settings-save-profile"
              type="submit"
              disabled={isSavingProfile}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-indigo-200"
            >
              {isSavingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save changes
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      {/* Change password */}
      <SectionCard>
        <SectionHeader title="Change Password" subtitle="Use a strong password with at least 8 characters" />
        <form onSubmit={handleChangePassword} className="p-6 space-y-5">
          {/* Current password */}
          <div>
            <FieldLabel htmlFor="settings-current-password">Current password</FieldLabel>
            <div className="relative">
              <input
                id="settings-current-password"
                type={showPw.current ? 'text' : 'password'}
                value={passwords.current}
                onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  pwErrors.current ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => ({ ...s, current: !s.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPw.current ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {pwErrors.current && <p className="mt-1 text-xs text-red-600">{pwErrors.current}</p>}
          </div>

          {/* New password */}
          <div>
            <FieldLabel htmlFor="settings-new-password">New password</FieldLabel>
            <div className="relative">
              <input
                id="settings-new-password"
                type={showPw.next ? 'text' : 'password'}
                value={passwords.next}
                onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                autoComplete="new-password"
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  pwErrors.next ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => ({ ...s, next: !s.next }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPw.next ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {pwErrors.next && <p className="mt-1 text-xs text-red-600">{pwErrors.next}</p>}

            {/* Strength meter */}
            {passwords.next && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        i <= pwStrength ? pwStrengthColor : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">{pwStrengthLabel}</p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <FieldLabel htmlFor="settings-confirm-password">Confirm new password</FieldLabel>
            <div className="relative">
              <input
                id="settings-confirm-password"
                type={showPw.confirm ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                autoComplete="new-password"
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  pwErrors.confirm ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPw.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {pwErrors.confirm && <p className="mt-1 text-xs text-red-600">{pwErrors.confirm}</p>}
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="settings-save-password"
              type="submit"
              disabled={isSavingPw}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 shadow-sm shadow-indigo-200"
            >
              {isSavingPw ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
              Update password
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Two-factor authentication */}
      <SectionCard>
        <SectionHeader title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account" />
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Smartphone size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Authenticator App</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {twoFaEnabled
                    ? 'Two-factor authentication is enabled.'
                    : 'Use an authenticator app to generate one-time codes.'}
                </p>
              </div>
            </div>
            <button
              id="settings-toggle-2fa"
              type="button"
              onClick={() => {
                setTwoFaEnabled((v) => !v);
                showToast('success', twoFaEnabled ? '2FA disabled' : '2FA setup initiated — check your email');
              }}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                twoFaEnabled
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {twoFaEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Active sessions */}
      <SectionCard>
        <SectionHeader title="Active Sessions" subtitle="Manage devices signed in to your account" />
        <div className="p-6 space-y-3">
          {[
            { device: 'Chrome on Windows', location: 'Current session', isCurrent: true },
            { device: 'Safari on iPhone', location: 'Mumbai, IN · 2 hours ago', isCurrent: false },
          ].map((session, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{session.device}</p>
                  <p className="text-xs text-gray-500">{session.location}</p>
                </div>
              </div>
              {session.isCurrent ? (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                  This device
                </span>
              ) : (
                <button
                  type="button"
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                  onClick={() => showToast('success', 'Session revoked')}
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <SectionCard>
        <SectionHeader title="Email Notifications" subtitle="Choose which emails you want to receive" />
        <div className="px-6">
          <Toggle
            id="notif-email-new-post"
            checked={notifications.emailNewPost}
            onChange={(v) => setNotifications((n) => ({ ...n, emailNewPost: v }))}
            label="New post created"
            description="Get an email when a new post is created in your workspace"
          />
          <Toggle
            id="notif-email-post-published"
            checked={notifications.emailPostPublished}
            onChange={(v) => setNotifications((n) => ({ ...n, emailPostPublished: v }))}
            label="Post published"
            description="Get notified when a scheduled post goes live"
          />
          <Toggle
            id="notif-email-weekly-digest"
            checked={notifications.emailWeeklyDigest}
            onChange={(v) => setNotifications((n) => ({ ...n, emailWeeklyDigest: v }))}
            label="Weekly digest"
            description="A weekly summary of your posting activity and analytics"
          />
          <Toggle
            id="notif-email-security"
            checked={notifications.emailSecurityAlerts}
            onChange={(v) => setNotifications((n) => ({ ...n, emailSecurityAlerts: v }))}
            label="Security alerts"
            description="Important alerts about your account security (recommended)"
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader title="Browser Notifications" subtitle="Push notifications in your browser" />
        <div className="px-6">
          <Toggle
            id="notif-browser-published"
            checked={notifications.browserPostPublished}
            onChange={(v) => setNotifications((n) => ({ ...n, browserPostPublished: v }))}
            label="Post published"
            description="Instant push notification when a post goes live"
          />
          <Toggle
            id="notif-browser-mentions"
            checked={notifications.browserMentions}
            onChange={(v) => setNotifications((n) => ({ ...n, browserMentions: v }))}
            label="Mentions and comments"
            description="Get notified when someone mentions you or comments on your post"
          />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button
          id="settings-save-notifications"
          type="button"
          onClick={handleSaveNotifications}
          disabled={isSavingNotifs}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 shadow-sm shadow-indigo-200"
        >
          {isSavingNotifs ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save preferences
        </button>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      {/* Visibility */}
      <SectionCard>
        <SectionHeader title="Profile Visibility" subtitle="Control who can see your profile information" />
        <div className="p-6 space-y-3">
          {(
            [
              { value: 'public', label: 'Public', desc: 'Anyone with the link can view your profile' },
              { value: 'team', label: 'Team only', desc: 'Only members of your workspace can see your profile' },
              { value: 'private', label: 'Private', desc: 'Only you can see your profile' },
            ] as { value: PrivacyPrefs['profileVisibility']; label: string; desc: string }[]
          ).map((opt) => (
            <label
              key={opt.value}
              htmlFor={`privacy-visibility-${opt.value}`}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                privacy.profileVisibility === opt.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <input
                id={`privacy-visibility-${opt.value}`}
                type="radio"
                name="profileVisibility"
                value={opt.value}
                checked={privacy.profileVisibility === opt.value}
                onChange={() => setPrivacy((p) => ({ ...p, profileVisibility: opt.value }))}
                className="mt-0.5 accent-indigo-600"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </SectionCard>

      {/* Privacy toggles */}
      <SectionCard>
        <SectionHeader title="Activity & Data" subtitle="Control your activity visibility and data settings" />
        <div className="px-6">
          <Toggle
            id="privacy-activity-status"
            checked={privacy.showActivityStatus}
            onChange={(v) => setPrivacy((p) => ({ ...p, showActivityStatus: v }))}
            label="Show activity status"
            description="Let teammates see when you were last active"
          />
          <Toggle
            id="privacy-data-export"
            checked={privacy.allowDataExport}
            onChange={(v) => setPrivacy((p) => ({ ...p, allowDataExport: v }))}
            label="Allow data export"
            description="Allow your account data to be exported for backup"
          />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button
          id="settings-save-privacy"
          type="button"
          onClick={handleSavePrivacy}
          disabled={isSavingPrivacy}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 shadow-sm shadow-indigo-200"
        >
          {isSavingPrivacy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save settings
        </button>
      </div>

      {/* Danger zone */}
      <SectionCard>
        <div className="px-6 py-5 border-b border-red-100">
          <h2 className="text-base font-semibold text-red-700">Danger Zone</h2>
          <p className="text-sm text-red-500 mt-0.5">These actions are irreversible. Please proceed with care.</p>
        </div>
        <div className="p-6">
          {!showDeleteConfirm ? (
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Delete account</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Permanently delete your account and all associated data. This cannot be undone.
                </p>
              </div>
              <button
                id="settings-delete-account-trigger"
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="shrink-0 ml-6 flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                Delete account
              </button>
            </div>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <p className="text-sm font-medium text-red-700">
                Enter your password to confirm account deletion:
              </p>
              <div className="relative">
                <input
                  id="settings-delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your current password"
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div className="flex gap-3">
                <button
                  id="settings-delete-account-cancel"
                  type="button"
                  onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="settings-delete-account-confirm"
                  type="submit"
                  disabled={isDeletingAccount || !deletePassword}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {isDeletingAccount ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Permanently delete
                </button>
              </div>
            </form>
          )}
        </div>
      </SectionCard>
    </div>
  );

  const CONTENT: Record<SettingsTab, () => ReactNode> = {
    profile: renderProfile,
    security: renderSecurity,
    notifications: renderNotifications,
    privacy: renderPrivacy,
  };

  // ── JSX ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen" style={{ background: '#f8fafc' }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Settings"
          subtitle="Manage your profile, security, and preferences"
          showSearch={false}
        />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6">

              {/* ── Left: Tab nav ── */}
              <aside className="lg:w-60 shrink-0">
                <SectionCard>
                  <nav className="p-2">
                    {TABS.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          id={`settings-tab-${tab.id}`}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-0.5 transition-all text-left ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={17} className={isActive ? 'text-white' : 'text-gray-400'} />
                            <span className="text-sm font-medium">{tab.label}</span>
                          </div>
                          {isActive && <ChevronRight size={14} className="text-white/70" />}
                        </button>
                      );
                    })}
                  </nav>
                </SectionCard>
              </aside>

              {/* ── Right: Tab content ── */}
              <div className="flex-1 min-w-0">
                {CONTENT[activeTab]()}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Global toast ── */}
      {toast && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium animate-fade-in"
          style={{
            background: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: toast.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca',
            color: toast.type === 'success' ? '#166534' : '#991b1b',
          }}
        >
          {toast.type === 'success'
            ? <CheckCircle2 size={16} className="text-green-600 shrink-0" />
            : <AlertCircle size={16} className="text-red-600 shrink-0" />}
          {toast.message}
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-1 opacity-50 hover:opacity-100 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
