import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSave, FiFileText, FiUsers, FiTarget } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Avatar from '../../common/Avatar';
import LoadingSpinner from '../../common/LoadingSpinner';
import { productionApi, ordersApi, employeesApi } from '../../../api/services';

export default function ProductionPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    orderId: '', employeeId: '', reportDate: new Date().toISOString().split('T')[0],
    sewn: 0, packed: 0, defective: 0, notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, ordersRes, employeesRes] = await Promise.all([
          productionApi.getAll(), ordersApi.getAll(), employeesApi.getAll()
        ]);
        setReports(reportsRes.data);
        setOrders(ordersRes.data.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'));
        setEmployees(employeesRes.data.filter(e => e.active));
      } catch (err) {
        console.error('Failed to fetch production data:', err);
        toast.error('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await productionApi.create({
        ...form,
        orderId: parseInt(form.orderId),
        employeeId: parseInt(form.employeeId),
      });
      toast.success('Отчёт сохранён');
      setForm({ ...form, sewn: 0, packed: 0, defective: 0, notes: '' });
      const res = await productionApi.getAll();
      setReports(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка при сохранении');
    } finally {
      setSubmitting(false);
    }
  };

  const totalSewn = reports.reduce((s, r) => s + (r.sewn || 0), 0);
  const totalDefective = reports.reduce((s, r) => s + (r.defective || 0), 0);
  const defectRate = totalSewn > 0 ? ((totalDefective / totalSewn) * 100).toFixed(1) : 0;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Отчёт по производству</h2>
          <p className="text-sm text-gray-500">Регистрация ежедневных результатов</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-blue-50 rounded-xl px-5 py-3 text-center">
            <p className="text-xs text-blue-600 font-medium">Всего сшито</p>
            <p className="text-xl font-bold text-blue-700">{totalSewn.toLocaleString()} шт.</p>
          </div>
          <div className="bg-red-50 rounded-xl px-5 py-3 text-center">
            <p className="text-xs text-red-600 font-medium">Брак</p>
            <p className="text-xl font-bold text-red-700">{defectRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <FiFileText size={20} className="text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-700">Новый отчёт</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Заказ</label>
              <select value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                <option value="">Выберите заказ...</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>#{o.id} — {o.product?.name} ({o.client?.name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Сотрудник</label>
              <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                <option value="">Выберите сотрудника...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.fullName} — {emp.position}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Дата</label>
              <input type="date" value={form.reportDate} onChange={(e) => setForm({ ...form, reportDate: e.target.value })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Сшито</label>
                <input type="number" min="0" value={form.sewn} onChange={(e) => setForm({ ...form, sewn: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none text-center" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Упак.</label>
                <input type="number" min="0" value={form.packed} onChange={(e) => setForm({ ...form, packed: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none text-center" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Брак</label>
                <input type="number" min="0" value={form.defective} onChange={(e) => setForm({ ...form, defective: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none text-center" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Примечания</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none" />
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm">
              <FiSave size={18} />
              {submitting ? 'Сохранение...' : 'Сохранить отчёт'}
            </button>
          </form>
        </div>

        {/* Reports list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <FiTarget size={18} className="text-primary-600" />
                <span className="text-sm text-gray-500">Всего отчётов</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{reports.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <FiUsers size={18} className="text-primary-600" />
                <span className="text-sm text-gray-500">Активные сотрудники</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{employees.length}</p>
              <div className="flex -space-x-2 mt-3">
                {employees.slice(0, 4).map((emp) => (
                  <Avatar key={emp.id} name={emp.fullName} size="sm" />
                ))}
                {employees.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                    +{employees.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">Все отчёты</h3>

            {reports.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">{t('common.noData')}</p>
            ) : (
              <div className="space-y-3">
                {reports.slice().reverse().slice(0, 10).map((report) => (
                  <div key={report.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Avatar name={report.employee?.fullName || 'N/A'} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">{report.employee?.fullName}</p>
                      <p className="text-xs text-gray-400">{report.employee?.position} | {report.reportDate}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-gray-600">{report.order?.product?.name}</p>
                      <p className="text-xs text-gray-400">Заказ #{report.order?.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
                        {report.sewn} шт.
                      </div>
                      {report.defective > 0 && (
                        <div className="bg-red-100 text-red-700 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
                          {report.defective}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
