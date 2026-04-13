import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUser, FiLock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../common/LoadingSpinner';
import { profileApi } from '../../../api/services';

export default function ProfilePage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    profileApi.get().then(res => {
      setProfile(res.data);
      setProfileForm({ fullName: res.data.fullName, phone: res.data.phone });
    }).catch(() => toast.error(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await profileApi.update(profileForm);
      setProfile(res.data);
      toast.success(t('profile.profileUpdated'));
    } catch { toast.error(t('common.error')); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error(t('profile.passwordMismatch'));
      return;
    }
    try {
      await profileApi.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success(t('profile.passwordChanged'));
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || t('profile.wrongPassword'));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('profile.title')}</h2>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <FiUser size={20} className="text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-700">{t('profile.personalInfo')}</h3>
        </div>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('auth.username')}</label>
            <input type="text" value={profile?.username || ''} disabled
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('employees.fullName')}</label>
            <input type="text" value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('employees.phone')}</label>
            <input type="tel" value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <button type="submit" className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 text-sm">
            {t('common.save')}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <FiLock size={20} className="text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-700">{t('profile.changePassword')}</h3>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('profile.currentPassword')}</label>
            <input type="password" value={passForm.currentPassword}
              onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('profile.newPassword')}</label>
            <input type="password" value={passForm.newPassword}
              onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} required minLength={6}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('profile.confirmPassword')}</label>
            <input type="password" value={passForm.confirmPassword}
              onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })} required minLength={6}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <button type="submit" className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 text-sm">
            {t('profile.changePassword')}
          </button>
        </form>
      </div>
    </div>
  );
}
