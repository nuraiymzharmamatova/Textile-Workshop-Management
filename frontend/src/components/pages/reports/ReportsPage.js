import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiDownload, FiBarChart2, FiTrendingUp, FiAlertTriangle, FiCalendar, FiPlus, FiTrash2 } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'react-toastify';
import Modal from '../../common/Modal';
import LoadingSpinner from '../../common/LoadingSpinner';
import { expensesApi, dashboardApi, ordersApi, exportApi } from '../../../api/services';
import { getStatusLabel } from '../../common/StatusBadge';

const EXPENSE_CATEGORIES = ['electricity', 'rent', 'transport', 'other'];

const statusColors = {
  COMPLETED: '#22c55e', IN_PROGRESS: '#3b82f6', SEWING: '#ec4899',
  NEW: '#9ca3af', CANCELLED: '#ef4444', CUTTING: '#6366f1',
  PACKAGING: '#a855f7', SHIPPED: '#06b6d4',
};

export default function ReportsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'ru';
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ category: 'electricity', description: '', amount: '', expenseDate: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, ordersRes, expensesRes] = await Promise.all([
          dashboardApi.getStats(), ordersApi.getAll(), expensesApi.getAll()
        ]);
        setStats(statsRes.data);
        setOrders(ordersRes.data);
        setExpenses(expensesRes.data);
      } catch { toast.error(t('common.error')); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [t]);

  const handleExport = async (format) => {
    try {
      const res = format === 'pdf' ? await exportApi.reportPdf() : await exportApi.reportExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url;
      a.download = `financial_report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click(); window.URL.revokeObjectURL(url);
    } catch { toast.error(t('common.error')); }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await expensesApi.create(expenseForm);
      toast.success(t('expenses.created'));
      setShowExpenseModal(false);
      const r = await expensesApi.getAll(); setExpenses(r.data);
      const s = await dashboardApi.getStats(); setStats(s.data);
    } catch { toast.error(t('common.error')); }
  };

  const handleExpenseDelete = async (id) => {
    if (!window.confirm(t('expenses.confirmDelete'))) return;
    try {
      await expensesApi.delete(id);
      toast.success(t('expenses.deleted'));
      setExpenses(expenses.filter(e => e.id !== id));
    } catch { toast.error(t('common.error')); }
  };

  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  // Calculate real stats
  const totalRevenue = stats?.monthlyRevenue || 0;
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const avgOrder = completedOrders.length > 0
    ? (completedOrders.reduce((s, o) => s + (o.totalPrice || 0), 0) / completedOrders.length).toFixed(0)
    : 0;
  const totalProduced = stats?.totalSewn || 0;
  const totalDefective = stats?.totalDefective || 0;
  const defectRate = totalProduced > 0 ? ((totalDefective / totalProduced) * 100).toFixed(1) : 0;

  // Status distribution for pie chart
  const statusCounts = {};
  orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status, value: count, color: statusColors[status] || '#9ca3af',
    label: getStatusLabel(status, lang),
  }));

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('reports.title')}</h2>
          <p className="text-sm text-gray-500">{t('reports.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100">
            <FiDownload size={16} /> PDF
          </button>
          <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100">
            <FiDownload size={16} /> Excel
          </button>
        </div>
      </div>

      {/* Real stats from API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2"><FiBarChart2 size={18} className="text-green-500" /><span className="text-xs text-gray-500">{t('reports.totalRevenue')}</span></div>
          <p className="text-2xl font-bold text-gray-800">{totalRevenue.toLocaleString()} {t('common.som')}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2"><FiTrendingUp size={18} className="text-blue-500" /><span className="text-xs text-gray-500">{t('reports.avgOrder')}</span></div>
          <p className="text-2xl font-bold text-gray-800">{Number(avgOrder).toLocaleString()} {t('common.som')}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2"><FiCalendar size={18} className="text-purple-500" /><span className="text-xs text-gray-500">{t('reports.produced')}</span></div>
          <p className="text-2xl font-bold text-gray-800">{totalProduced.toLocaleString()} {t('common.pcs')}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2"><FiAlertTriangle size={18} className="text-red-500" /><span className="text-xs text-gray-500">{t('reports.defectRate')}</span></div>
          <p className="text-2xl font-bold text-gray-800">{defectRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Order status pie */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('reports.orderStatuses')}</h3>
          {pieData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">{t('common.noData')}</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [value, props.payload.label]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {pieData.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-gray-600">{s.label}</span>
                    <span className="ml-auto font-medium text-gray-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Financial summary */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('reports.revenueExpenses')}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
              <span className="text-sm text-green-700 font-medium">{t('reports.revenue')}</span>
              <span className="text-lg font-bold text-green-800">{totalRevenue.toLocaleString()} {t('common.som')}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
              <span className="text-sm text-red-700 font-medium">{t('reports.expenses')}</span>
              <span className="text-lg font-bold text-red-800">{totalExpenses.toLocaleString()} {t('common.som')}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
              <span className="text-sm text-blue-700 font-bold">{t('reports.totalRevenue')} - {t('reports.expenses')}</span>
              <span className="text-lg font-bold text-blue-800">{(totalRevenue - totalExpenses).toLocaleString()} {t('common.som')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">{t('expenses.title')}</h3>
          <button onClick={() => { setExpenseForm({ category: 'electricity', description: '', amount: '', expenseDate: new Date().toISOString().split('T')[0] }); setShowExpenseModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700">
            <FiPlus size={16} /> {t('expenses.new')}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {expenses.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">{t('common.noData')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-400 uppercase">
                    <th className="text-left px-6 py-3 font-medium">{t('expenses.category')}</th>
                    <th className="text-left px-6 py-3 font-medium">{t('expenses.description')}</th>
                    <th className="text-right px-6 py-3 font-medium">{t('expenses.amount')}</th>
                    <th className="text-center px-6 py-3 font-medium">{t('expenses.date')}</th>
                    <th className="text-center px-6 py-3 font-medium">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-700">{t(`expenses.${exp.category}`) || exp.category}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{exp.description || '—'}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-800 text-right">{exp.amount?.toLocaleString()} {t('common.som')}</td>
                      <td className="px-6 py-3 text-sm text-gray-500 text-center">{exp.expenseDate}</td>
                      <td className="px-6 py-3 text-center">
                        <button onClick={() => handleExpenseDelete(exp.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <FiTrash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-3 bg-gray-50 border-t text-sm font-semibold text-gray-700">
                {t('expenses.total')}: {totalExpenses.toLocaleString()} {t('common.som')}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} title={t('expenses.new')}>
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('expenses.category')}</label>
            <select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{t(`expenses.${c}`)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('expenses.description')}</label>
            <input type="text" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('expenses.amount')} ({t('common.som')})</label>
              <input type="number" min="0" step="0.01" value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('expenses.date')}</label>
              <input type="date" value={expenseForm.expenseDate}
                onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 text-sm">{t('common.cancel')}</button>
            <button type="submit" className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 text-sm">{t('common.save')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
