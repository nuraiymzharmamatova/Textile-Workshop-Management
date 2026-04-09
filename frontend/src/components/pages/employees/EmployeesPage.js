import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiEdit2, FiUsers, FiUserCheck, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Avatar from '../../common/Avatar';
import StatusBadge from '../../common/StatusBadge';
import Modal from '../../common/Modal';
import LoadingSpinner from '../../common/LoadingSpinner';
import { employeesApi } from '../../../api/services';

export default function EmployeesPage() {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [form, setForm] = useState({ fullName: '', phone: '', position: '', ratePerItem: 0, active: true });

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchSalary(); }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await employeesApi.getAll();
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      toast.error('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalary = async () => {
    try {
      const res = await employeesApi.getSalary({ month: selectedMonth });
      setSalaryData(res.data);
    } catch (err) {
      console.error('Failed to fetch salary:', err);
      setSalaryData([]);
    }
  };

  const openCreate = () => {
    setEditEmployee(null);
    setForm({ fullName: '', phone: '', position: '', ratePerItem: 0, active: true });
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setEditEmployee(emp);
    setForm({ fullName: emp.fullName, phone: emp.phone || '', position: emp.position, ratePerItem: emp.ratePerItem, active: emp.active });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editEmployee) {
        await employeesApi.update(editEmployee.id, form);
        toast.success('Сотрудник обновлён');
      } else {
        await employeesApi.create(form);
        toast.success('Сотрудник добавлен');
      }
      setShowModal(false);
      fetchData();
      fetchSalary();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const activeEmployees = employees.filter((e) => e.active);
  const totalSalary = salaryData.reduce((s, r) => s + (r.totalSalary || 0), 0);
  const totalDefects = salaryData.reduce((s, r) => s + (r.totalDefective || 0), 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Сотрудники и зарплаты</h2>
          <p className="text-sm text-gray-500">Расчёт сдельных зарплат, управление персоналом</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors text-sm">
          <FiPlus size={18} /> Новый сотрудник
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employees List */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FiUsers size={18} className="text-primary-600" />
            <h3 className="font-semibold text-gray-700">Сотрудники ({activeEmployees.length} активных)</h3>
          </div>

          <div className="space-y-3">
            {employees.map((emp) => (
              <div key={emp.id} className={`bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow ${!emp.active ? 'opacity-50' : ''}`}>
                <Avatar name={emp.fullName} size="lg" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">{emp.fullName}</p>
                    <StatusBadge status={emp.active ? 'ACTIVE' : 'INACTIVE'} />
                  </div>
                  <p className="text-sm text-gray-500">{emp.position}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{emp.ratePerItem} сом / шт</p>
                </div>
                <button onClick={() => openEdit(emp)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                  <FiEdit2 size={16} />
                </button>
              </div>
            ))}

            <button onClick={openCreate}
              className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-5 text-gray-400 hover:border-primary-300 hover:text-primary-600 transition-colors flex items-center justify-center gap-2">
              <FiPlus size={20} /> Добавить сотрудника
            </button>
          </div>
        </div>

        {/* Salary Calculation */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiUserCheck size={18} className="text-primary-600" />
              <h3 className="font-semibold text-gray-700">Калькуляция зарплат</h3>
            </div>
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {salaryData.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">{t('common.noData')}</p>
            ) : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-400 uppercase">
                      <th className="text-left px-5 py-3 font-medium">Сотрудник</th>
                      <th className="text-center px-3 py-3 font-medium">Сшито</th>
                      <th className="text-center px-3 py-3 font-medium">Брак</th>
                      <th className="text-right px-3 py-3 font-medium">Ставка</th>
                      <th className="text-right px-5 py-3 font-medium">Итого</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {salaryData.map((row) => (
                      <tr key={row.employeeId} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={row.employeeName} size="sm" />
                            <span className="text-sm font-medium text-gray-700">{row.employeeName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-600 text-center">{row.totalSewn} шт.</td>
                        <td className="px-3 py-4 text-center">
                          <span className={`text-sm font-medium ${row.totalDefective > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {row.totalDefective}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 text-right">{row.ratePerItem} сом</td>
                        <td className="px-5 py-4 text-sm font-bold text-gray-800 text-right">{row.totalSalary?.toLocaleString()} сом</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex items-center justify-between p-5 bg-gray-50 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Общая выплата</p>
                    <p className="text-2xl font-bold text-gray-800">{totalSalary.toLocaleString()} сом</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Общий брак</p>
                    <p className="text-2xl font-bold text-red-600">{totalDefects}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editEmployee ? 'Редактировать сотрудника' : 'Новый сотрудник'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">ФИО</label>
            <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Телефон</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Должность</label>
            <input type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Ставка за изделие (сом)</label>
            <input type="number" min="0" step="0.01" value={form.ratePerItem}
              onChange={(e) => setForm({ ...form, ratePerItem: parseFloat(e.target.value) || 0 })} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 text-sm">{t('common.cancel')}</button>
            <button type="submit" className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 text-sm">{t('common.save')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
