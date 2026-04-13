import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiDownload, FiBarChart2, FiTrendingUp, FiAlertTriangle, FiCalendar, FiPlus, FiTrash2 } from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'react-toastify';
import Modal from '../../common/Modal';
import { expensesApi } from '../../../api/services';

const monthlyData = [
  { month: 'Янв', revenue: 980000, expenses: 650000 },
  { month: 'Фев', revenue: 1100000, expenses: 720000 },
  { month: 'Мар', revenue: 1250000, expenses: 780000 },
  { month: 'Апр', revenue: 1050000, expenses: 690000 },
  { month: 'Май', revenue: 1400000, expenses: 850000 },
  { month: 'Июн', revenue: 1240000, expenses: 810000 },
];

const productionData = [
  { month: 'Янв', sewn: 3200, defective: 45 },
  { month: 'Фев', sewn: 3800, defective: 52 },
  { month: 'Мар', sewn: 4100, defective: 38 },
  { month: 'Апр', sewn: 3600, defective: 60 },
  { month: 'Май', sewn: 4800, defective: 35 },
  { month: 'Июн', sewn: 4520, defective: 42 },
];

const statusData = [
  { name: 'completed', value: 45, color: '#22c55e' },
  { name: 'inProgress', value: 28, color: '#3b82f6' },
  { name: 'new', value: 15, color: '#9ca3af' },
  { name: 'cancelled', value: 12, color: '#ef4444' },
];

const statusLabels = {
  completed: { ru: 'Завершён', en: 'Completed', kg: 'Аяктады' },
  inProgress: { ru: 'В работе', en: 'In Progress', kg: 'Иштелүүдө' },
  new: { ru: 'Новый', en: 'New', kg: 'Жаңы' },
  cancelled: { ru: 'Отменён', en: 'Cancelled', kg: 'Жокко чыгарылды' },
};

const EXPENSE_CATEGORIES = ['electricity', 'rent', 'transport', 'other'];

export default function ReportsPage() {
  const { t, i18n } = useTranslation();
  const [period, setPeriod] = useState('6months');
  const lang = i18n.language || 'ru';
  const [expenses, setExpenses] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ category: 'electricity', description: '', amount: '', expenseDate: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    expensesApi.getAll().then(r => setExpenses(r.data)).catch(() => {});
  }, []);

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await expensesApi.create(expenseForm);
      toast.success(t('expenses.created'));
      setShowExpenseModal(false);
      const r = await expensesApi.getAll();
      setExpenses(r.data);
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('reports.title')}</h2>
          <p className="text-sm text-gray-500">{t('reports.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none">
            <option value="1month">{t('reports.lastMonth')}</option>
            <option value="3months">{t('reports.threeMonths')}</option>
            <option value="6months">{t('reports.sixMonths')}</option>
            <option value="1year">{t('reports.year')}</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100">
            <FiDownload size={16} /> PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100">
            <FiDownload size={16} /> Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2"><FiBarChart2 size={18} className="text-green-500" /><span className="text-xs text-gray-500">{t('reports.totalRevenue')}</span></div>
          <p className="text-2xl font-bold text-gray-800">7.02M {t('common.som')}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2"><FiTrendingUp size={18} className="text-blue-500" /><span className="text-xs text-gray-500">{t('reports.avgOrder')}</span></div>
          <p className="text-2xl font-bold text-gray-800">54,200 {t('common.som')}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2"><FiCalendar size={18} className="text-purple-500" /><span className="text-xs text-gray-500">{t('reports.produced')}</span></div>
          <p className="text-2xl font-bold text-gray-800">24,020 {t('common.pcs')}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2"><FiAlertTriangle size={18} className="text-red-500" /><span className="text-xs text-gray-500">{t('reports.defectRate')}</span></div>
          <p className="text-2xl font-bold text-gray-800">1.13%</p>
          <span className="text-xs text-green-600 font-medium">-0.2% ({t('reports.improvement')})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">{t('reports.revenueExpenses')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value) => `${value.toLocaleString()} ${t('common.som')}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="revenue" name={t('reports.revenue')} fill="#22c55e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" name={t('reports.expenses')} fill="#fbbf24" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">{t('reports.productionTrend')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="sewn" name={t('production.sewn')} stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="defective" name={t('production.defective')} stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('reports.orderStatuses')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-gray-600">{statusLabels[s.name]?.[lang] || s.name}</span>
                <span className="ml-auto font-medium text-gray-800">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('reports.topProducts')}</h3>
          <div className="space-y-4">
            {[
              { name: 'Пальто кашемир "A-Line"', count: 245, revenue: 1470000 },
              { name: 'Костюм шерстяной', count: 180, revenue: 1260000 },
              { name: 'Блуза шёлковая', count: 320, revenue: 960000 },
              { name: 'Брюки чинос', count: 410, revenue: 820000 },
            ].map((product, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-400 w-6">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-400">{product.count} {t('common.pcs')}</p>
                </div>
                <p className="text-sm font-semibold text-gray-700">{(product.revenue / 1000).toFixed(0)}K {t('common.som')}</p>
                <div className="w-24 bg-gray-100 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(product.revenue / 1470000) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses section */}
      <div className="mt-8">
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

      {/* Expense Modal */}
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
