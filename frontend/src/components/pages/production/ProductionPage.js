import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSave, FiFileText, FiTarget, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../common/LoadingSpinner';
import { productionApi, ordersApi } from '../../../api/services';

export default function ProductionPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [orders, setOrders] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    orderId: '', reportDate: new Date().toISOString().split('T')[0],
    sewn: 0, packed: 0, defective: 0, notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, ordersRes] = await Promise.all([
          productionApi.getAll(), ordersApi.getAll()
        ]);
        setReports(reportsRes.data);
        setOrders(ordersRes.data.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'));
      } catch (err) {
        console.error(err);
        toast.error(t('common.error'));
      } finally { setLoading(false); }
    };
    fetchData();
  }, [t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await productionApi.create({
        orderId: parseInt(form.orderId),
        reportDate: form.reportDate,
        sewn: form.sewn, packed: form.packed, defective: form.defective,
        notes: form.notes,
      });
      toast.success(t('production.reportSaved'));
      setForm({ ...form, sewn: 0, packed: 0, defective: 0, notes: '' });
      const res = await productionApi.getAll();
      setReports(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('production.confirmDelete'))) return;
    try {
      await productionApi.delete(id);
      toast.success(t('production.reportDeleted'));
      const res = await productionApi.getAll();
      setReports(res.data);
    } catch { toast.error(t('common.error')); }
  };

  const totalSewn = reports.reduce((s, r) => s + (r.sewn || 0), 0);
  const totalDefective = reports.reduce((s, r) => s + (r.defective || 0), 0);
  const defectRate = totalSewn > 0 ? ((totalDefective / totalSewn) * 100).toFixed(1) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayReports = reports.filter(r => r.reportDate === todayStr);
  const todaySewn = todayReports.reduce((s, r) => s + (r.sewn || 0), 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('production.title')}</h2>
          <p className="text-sm text-gray-500">{t('production.subtitle')}</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-blue-50 rounded-xl px-5 py-3 text-center">
            <p className="text-xs text-blue-600 font-medium">{t('production.totalSewn')}</p>
            <p className="text-xl font-bold text-blue-700">{totalSewn.toLocaleString()} {t('common.pcs')}</p>
          </div>
          <div className="bg-green-50 rounded-xl px-5 py-3 text-center">
            <p className="text-xs text-green-600 font-medium">{t('production.todayReports')}</p>
            <p className="text-xl font-bold text-green-700">{todaySewn} {t('common.pcs')}</p>
          </div>
          <div className="bg-red-50 rounded-xl px-5 py-3 text-center">
            <p className="text-xs text-red-600 font-medium">{t('production.defectRate')}</p>
            <p className="text-xl font-bold text-red-700">{defectRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <FiFileText size={20} className="text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-700">{t('production.newReport')}</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('production.order')}</label>
              <select value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                <option value="">{t('production.selectOrder')}</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>#{o.id} — {o.product?.name} ({o.client?.name})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('production.date')}</label>
              <input type="date" value={form.reportDate} onChange={(e) => setForm({ ...form, reportDate: e.target.value })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('production.sewn')}</label>
                <input type="number" min="0" value={form.sewn} onChange={(e) => setForm({ ...form, sewn: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none text-center" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('production.packed')}</label>
                <input type="number" min="0" value={form.packed} onChange={(e) => setForm({ ...form, packed: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none text-center" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('production.defective')}</label>
                <input type="number" min="0" value={form.defective} onChange={(e) => setForm({ ...form, defective: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none text-center" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('production.notes')}</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none" />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
              <FiSave size={18} />
              {submitting ? t('production.saving') : t('production.saveReport')}
            </button>
          </form>
        </div>

        {/* Reports */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <FiTarget size={18} className="text-primary-600 mb-2" />
              <span className="text-sm text-gray-500">{t('production.totalReports')}</span>
              <p className="text-3xl font-bold text-gray-800 mt-1">{reports.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <FiFileText size={18} className="text-green-600 mb-2" />
              <span className="text-sm text-gray-500">{t('production.todayReports')}</span>
              <p className="text-3xl font-bold text-gray-800 mt-1">{todayReports.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">{t('production.allReports')}</h3>
            {reports.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">{t('common.noData')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-400 uppercase">
                      <th className="text-left px-4 py-3 font-medium">{t('production.date')}</th>
                      <th className="text-left px-4 py-3 font-medium">{t('production.order')}</th>
                      <th className="text-center px-4 py-3 font-medium">{t('production.sewn')}</th>
                      <th className="text-center px-4 py-3 font-medium">{t('production.packed')}</th>
                      <th className="text-center px-4 py-3 font-medium">{t('production.defective')}</th>
                      <th className="text-center px-4 py-3 font-medium">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.slice().reverse().slice(0, 20).map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{r.reportDate}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          #{r.order?.id} — {r.order?.product?.name}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold">{r.sewn}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">{r.packed}</td>
                        <td className="px-4 py-3 text-center">
                          {r.defective > 0 ? (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">{r.defective}</span>
                          ) : <span className="text-green-600 text-sm">0</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => handleDelete(r.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <FiTrash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
