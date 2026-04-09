import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FiUser, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch {
      toast.error(t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-primary-600 to-primary-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-white/10">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14.121 14.121L7.05 21.192a2 2 0 01-2.828 0l-.414-.414a2 2 0 010-2.828L10.879 10.879m3.242 3.242L20.95 7.05a2 2 0 000-2.828l-.414-.414a2 2 0 00-2.828 0L10.879 10.879m3.242 3.242L10.879 10.879" />
        </svg>
      </div>
      <div className="absolute bottom-10 right-10 text-white/10">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md mx-4">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M14.121 14.121L7.05 21.192a2 2 0 01-2.828 0l-.414-.414a2 2 0 010-2.828L10.879 10.879m3.242 3.242L20.95 7.05a2 2 0 000-2.828l-.414-.414a2 2 0 00-2.828 0L10.879 10.879m3.242 3.242L10.879 10.879" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Workshop ERP</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
            {t('auth.login')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <FiUser size={14} />
              {t('auth.username')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('auth.username')}
              required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <FiLock size={14} />
                {t('auth.password')}
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white outline-none transition-all text-sm pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {t('auth.submit')}
                <FiArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Language Switcher */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {['ru', 'en', 'kg'].map((lng) => (
            <button
              key={lng}
              onClick={() => i18n.changeLanguage(lng)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                i18n.language === lng
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {lng.toUpperCase()}
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; 2026 Workshop ERP
        </p>
      </div>
    </div>
  );
}
