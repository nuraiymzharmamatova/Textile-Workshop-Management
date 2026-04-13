import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  FiHome, FiShoppingCart, FiUsers, FiPackage,
  FiActivity, FiUserCheck, FiBarChart2, FiLogOut,
  FiMenu, FiX, FiSearch, FiBell, FiBox, FiUser
} from 'react-icons/fi';
import Avatar from '../common/Avatar';
import { notificationsApi } from '../../api/services';

const navItems = [
  { path: '/', icon: FiHome, label: 'nav.dashboard' },
  { path: '/orders', icon: FiShoppingCart, label: 'nav.orders' },
  { path: '/clients', icon: FiUsers, label: 'nav.clients' },
  { path: '/inventory', icon: FiPackage, label: 'nav.inventory' },
  { path: '/production', icon: FiActivity, label: 'nav.production' },
  { path: '/employees', icon: FiUserCheck, label: 'nav.employees' },
  { path: '/products', icon: FiBox, label: 'nav.products' },
  { path: '/reports', icon: FiBarChart2, label: 'nav.reports' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationsApi.getAll();
        setNotifications(res.data);
      } catch { /* ignore */ }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const getNotifIcon = (type) => {
    if (type === 'LOW_STOCK') return '📦';
    if (type === 'DEADLINE_SOON') return '⏰';
    if (type === 'DEADLINE_OVERDUE') return '🔴';
    return '📌';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto flex flex-col`}>
        <div className="h-16 px-6 bg-primary-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M14.121 14.121L7.05 21.192a2 2 0 01-2.828 0l-.414-.414a2 2 0 010-2.828L10.879 10.879m3.242 3.242L20.95 7.05a2 2 0 000-2.828l-.414-.414a2 2 0 00-2.828 0L10.879 10.879m3.242 3.242L10.879 10.879" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">Workshop ERP</h1>
              <p className="text-white/50 text-xs">Textile</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/70 hover:text-white">
            <FiX size={22} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto mt-4 px-3">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink key={path} to={path} end={path === '/'} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mb-1 rounded-xl text-sm font-medium transition-all
                ${isActive ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`
              }>
              <Icon size={20} /> {t(label)}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 flex-shrink-0 border-t border-gray-100" />
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600"><FiMenu size={22} /></button>
            <div className="relative hidden sm:block">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder={t('common.search') + '...'}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm w-64 outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {['ru', 'en', 'kg'].map((lng) => (
                <button key={lng} onClick={() => i18n.changeLanguage(lng)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    i18n.language === lng ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {lng.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                <FiBell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-700 text-sm">
                    {t('notifications.title')} ({notifications.length})
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-gray-400 text-center">{t('notifications.noNotifications')}</p>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer"
                          onClick={() => {
                            setShowNotifications(false);
                            if (n.type === 'LOW_STOCK') navigate('/inventory');
                            else navigate('/orders');
                          }}>
                          <div className="flex items-start gap-3">
                            <span className="text-lg">{getNotifIcon(n.type)}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{n.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User */}
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-gray-200">
              <button onClick={() => navigate('/profile')} className="flex items-center gap-3 hover:opacity-80">
                <Avatar name={user?.username || 'Admin'} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-700">{user?.username}</p>
                  <p className="text-xs text-gray-400">{user?.role}</p>
                </div>
              </button>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                <FiLogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
