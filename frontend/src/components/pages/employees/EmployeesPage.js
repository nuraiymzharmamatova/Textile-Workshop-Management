import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiSearch, FiEdit2, FiUsers, FiUserCheck } from 'react-icons/fi';
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
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [form, setForm] = useState({
    fullName: '', phone: '', position: '', salaryType: 'PIECEWORK', ratePerItem: 0, fixedSalary: 0, active: true
  });

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchSalary(); }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    try { const res = await employeesApi.getAll(); setEmployees(res.data); }
    catch { toast.error(t('common.error')); }
    finally { setLoading(false); }
  };

  const fetchSalary = async () => {
    try { const res = await employeesApi.getSalary({ month: selectedMonth }); setSalaryData(res.data); }
    catch { setSalaryData([]); }
  };

  const openCreate = () => {
    setEditEmployee(null);
    setForm({ fullName: '', phone: '', position: '', salaryType: 'PIECEWORK', ratePerItem: 0, fixedSalary: 0, active: true });
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setEditEmployee(emp);
    setForm({
      fullName: emp.fullName, phone: emp.phone || '', position: emp.position,
      salaryType: emp.salaryType || 'PIECEWORK', ratePerItem: emp.ratePerItem || 0,
      fixedSalary: emp.fixedSalary || 0, active: emp.active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editEmployee) {
        await employeesApi.update(editEmployee.id, form);
        toast.success(t('employees.updated'));
      } else {
        await employeesApi.create(form);
        toast.success(t('employees.created'));
      }
      setShowModal(false);
      fetchData(); fetchSalary();
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  const activeEmployees = employees.filter(e => e.active);
  const filteredEmployees = employees.filter(e =>
    search === '' || e.fullName.toLowerCase().includes(search.toLowerCase()) || e.position?.toLowerCase().includes(search.toLowerCase())
  );
  const totalSalary = salaryData.reduce((s, r) => s + (r.totalSalary || 0), 0);
  const totalDefects = salaryData.reduce((s, r) => s + (r.totalDefective || 0), 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('employees.title')}</h2>
          <p className="text-sm text-gray-500">{t('employees.subtitle')}</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 text-sm">
          <FiPlus size={18} /> {t('employees.new')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employees List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiUsers size={18} className="text-primary-600" />
              <h3 className="font-semibold text-gray-700">{t('employees.activeEmployees')} ({activeEmployees.length})</h3>
            </div>
          </div>

          {/* Req 3: Search */}
          <div className="relative mb-4">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t('employees.search')}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>

          <div className="space-y-3">
            {filteredEmployees.map((emp) => (
              <div key={emp.id} className={`bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow ${!emp.active ? 'opacity-50' : ''}`}>
                <Avatar name={emp.fullName} size="lg" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">{emp.fullName}</p>
                    <StatusBadge status={emp.active ? 'ACTIVE' : 'INACTIVE'} />
                  </div>
                  <p className="text-sm text-gray-500">{emp.position}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {emp.salaryType === 'FIXED'
                      ? `${t('employees.fixed')}: ${emp.fixedSalary?.toLocaleString()} ${t('employees.perMonth')}`
                      : `${t('employees.piecework')}: ${emp.ratePerItem} ${t('employees.perItem')}`
                    }
                  </p>
                </div>
                <button onClick={() => openEdit(emp)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                  <FiEdit2 size={16} />
                </button>
              </div>
            ))}
            <button onClick={openCreate}
              className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-5 text-gray-400 hover:border-primary-300 hover:text-primary-600 transition-colors flex items-center justify-center gap-2">
              <FiPlus size={20} /> {t('employees.addEmployee')}
            </button>
          </div>

          <div className="flex gap-3 mt-4">
            <div className="bg-blue-50 rounded-xl px-4 py-3 flex-1 text-center">
              <p className="text-xs text-blue-600 font-medium">{t('employees.staff')}</p>
              <p className="text-lg font-bold text-blue-700">{employees.length} {t('common.persons')}</p>
            </div>
            <div className="bg-green-50 rounded-xl px-4 py-3 flex-1 text-center">
              <p className="text-xs text-green-600 font-medium">{t('employees.onShift')}</p>
              <p className="text-lg font-bold text-green-700">{activeEmployees.length}</p>
            </div>
          </div>
        </div>

        {/* Salary */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiUserCheck size={18} className="text-primary-600" />
              <h3 className="font-semibold text-gray-700">{t('employees.salaryCalc')}</h3>
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
                      <th className="text-left px-5 py-3 font-medium">{t('employees.fullName')}</th>
                      <th className="text-center px-3 py-3 font-medium">{t('employees.salaryType')}</th>
                      <th className="text-center px-3 py-3 font-medium">{t('employees.totalSewn')}</th>
                      <th className="text-center px-3 py-3 font-medium">{t('employees.totalDefective')}</th>
                      <th className="text-right px-5 py-3 font-medium">{t('employees.totalSalary')}</th>
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
                        <td className="px-3 py-4 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            row.salaryType === 'FIXED' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {row.salaryType === 'FIXED' ? t('employees.fixed') : t('employees.piecework')}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-600 text-center">{row.totalSewn} {t('common.pcs')}</td>
                        <td className="px-3 py-4 text-center">
                          <span className={`text-sm font-medium ${row.totalDefective > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {row.totalDefective}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-gray-800 text-right">{row.totalSalary?.toLocaleString()} {t('common.som')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between p-5 bg-gray-50 border-t">
                  <div>
                    <p className="text-xs text-gray-500">{t('employees.totalPayroll')}</p>
                    <p className="text-2xl font-bold text-gray-800">{totalSalary.toLocaleString()} {t('common.som')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{t('employees.totalDefects')}</p>
                    <p className="text-2xl font-bold text-red-600">{totalDefects}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editEmployee ? t('employees.editTitle') : t('employees.createTitle')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('employees.fullName')}</label>
            <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('employees.phone')}</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('employees.position')}</label>
            <input type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('employees.salaryType')}</label>
            <select value={form.salaryType} onChange={(e) => setForm({ ...form, salaryType: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
              <option value="PIECEWORK">{t('employees.piecework')}</option>
              <option value="FIXED">{t('employees.fixed')}</option>
            </select>
          </div>
          {form.salaryType === 'PIECEWORK' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('employees.ratePerItem')} ({t('common.som')})</label>
              <input type="number" min="0" step="0.01" value={form.ratePerItem}
                onChange={(e) => setForm({ ...form, ratePerItem: parseFloat(e.target.value) || 0 })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('employees.fixedSalary')} ({t('common.som')})</label>
              <input type="number" min="0" step="0.01" value={form.fixedSalary}
                onChange={(e) => setForm({ ...form, fixedSalary: parseFloat(e.target.value) || 0 })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 text-sm">{t('common.cancel')}</button>
            <button type="submit" className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 text-sm">{t('common.save')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
