import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiShoppingCart, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../../common/StatCard';
import StatusBadge from '../../common/StatusBadge';
import Avatar from '../../common/Avatar';
import LoadingSpinner from '../../common/LoadingSpinner';
import { dashboardApi, ordersApi } from '../../../api/services';

const chartData = [
  { name: 'Пн', sewn: 420, packed: 380 },
  { name: 'Вт', sewn: 380, packed: 350 },
  { name: 'Ср', sewn: 510, packed: 470 },
  { name: 'Чт', sewn: 460, packed: 420 },
  { name: 'Пт', sewn: 550, packed: 500 },
  { name: 'Сб', sewn: 320, packed: 290 },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([dashboardApi.getStats(), ordersApi.getAll()]);
        setStats(statsRes.data);
        setOrders(ordersRes.data.slice(-4).reverse());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('dashboard.title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={FiDollarSign} title={t('dashboard.revenue')}
          value={`${(stats?.monthlyRevenue || 0).toLocaleString()} ${t('common.som')}`} color="bg-green-500" />
        <StatCard icon={FiShoppingCart} title={t('dashboard.totalOrders')}
          value={stats?.totalOrders || 0} color="bg-blue-500" />
        <StatCard icon={FiTrendingUp} title={t('dashboard.activeOrders')}
          value={stats?.activeOrders || 0} color="bg-yellow-500"
          subtitle={`${stats?.completedOrders || 0} ${t('dashboard.completedOrders')}`} />
        <StatCard icon={FiAlertTriangle} title={t('dashboard.lowStock')}
          value={stats?.lowStockMaterials || 0} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">{t('dashboard.productionChart')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="sewn" name={t('production.sewn')} fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="packed" name={t('production.packed')} fill="#93c5fd" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t">
            <div>
              <p className="text-xs text-gray-500">{t('dashboard.sewnThisMonth')}</p>
              <p className="text-lg font-bold text-gray-800">{(stats?.totalSewn || 0).toLocaleString()} {t('common.pcs')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('dashboard.defects')}</p>
              <p className="text-lg font-bold text-red-500">{stats?.totalDefective || 0} {t('common.pcs')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-700">{t('dashboard.recentOrders')}</h3>
            <Link to="/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">{t('dashboard.viewAll')}</Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-gray-400 text-sm">{t('common.noData')}</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 uppercase">
                  <th className="text-left pb-3 font-medium">№</th>
                  <th className="text-left pb-3 font-medium">{t('orders.client')}</th>
                  <th className="text-left pb-3 font-medium">{t('common.status')}</th>
                  <th className="text-right pb-3 font-medium">{t('orders.total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 text-sm font-semibold text-primary-600">#{order.id}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={order.client?.name || 'N/A'} size="sm" />
                        <span className="text-sm text-gray-700">{order.client?.name}</span>
                      </div>
                    </td>
                    <td className="py-3"><StatusBadge status={order.status} /></td>
                    <td className="py-3 text-sm font-medium text-gray-700 text-right">
                      {order.totalPrice?.toLocaleString()} {t('common.som')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
