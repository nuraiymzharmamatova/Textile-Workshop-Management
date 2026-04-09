import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiSearch, FiAlertTriangle, FiPackage, FiShoppingBag, FiDollarSign, FiEdit2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import StatCard from '../../common/StatCard';
import Pagination from '../../common/Pagination';
import EmptyState from '../../common/EmptyState';
import LoadingSpinner from '../../common/LoadingSpinner';
import Modal from '../../common/Modal';
import { materialsApi } from '../../../api/services';

const unitLabels = { METER: 'м', KILOGRAM: 'кг', PIECE: 'шт', ROLL: 'рул', SPOOL: 'кат' };

export default function InventoryPage() {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [editMaterial, setEditMaterial] = useState(null);
  const [form, setForm] = useState({ name: '', unit: 'METER', quantity: 0, minQuantity: 0, pricePerUnit: 0, supplier: '' });
  const [purchaseForm, setPurchaseForm] = useState({ materialId: '', quantity: '', totalCost: '', supplier: '', purchaseDate: '' });

  const itemsPerPage = 10;

  useEffect(() => { fetchMaterials(); }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await materialsApi.getAll();
      setMaterials(res.data);
    } catch (err) {
      console.error('Failed to fetch materials:', err);
      toast.error('Ошибка загрузки материалов');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditMaterial(null);
    setForm({ name: '', unit: 'METER', quantity: 0, minQuantity: 0, pricePerUnit: 0, supplier: '' });
    setShowModal(true);
  };

  const openEdit = (m) => {
    setEditMaterial(m);
    setForm({ name: m.name, unit: m.unit, quantity: m.quantity, minQuantity: m.minQuantity, pricePerUnit: m.pricePerUnit, supplier: m.supplier || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMaterial) {
        await materialsApi.update(editMaterial.id, form);
        toast.success('Материал обновлён');
      } else {
        await materialsApi.create(form);
        toast.success('Материал добавлен');
      }
      setShowModal(false);
      fetchMaterials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    try {
      await materialsApi.addPurchase(purchaseForm);
      toast.success('Закупка добавлена');
      setShowPurchaseModal(false);
      fetchMaterials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const lowStockCount = materials.filter((m) => m.lowStock).length;
  const totalValue = materials.reduce((sum, m) => sum + (m.quantity || 0) * (m.pricePerUnit || 0), 0);

  const filtered = materials.filter((m) =>
    search === '' || m.name.toLowerCase().includes(search.toLowerCase()) || m.supplier?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Склад и учёт</h2>
          <p className="text-sm text-gray-500">Управление материалами и фурнитурой</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => {
            setPurchaseForm({ materialId: '', quantity: '', totalCost: '', supplier: '', purchaseDate: new Date().toISOString().split('T')[0] });
            setShowPurchaseModal(true);
          }} className="flex items-center gap-2 px-5 py-2.5 border border-primary-600 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition-colors text-sm">
            <FiShoppingBag size={18} /> Добавить закупку
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors text-sm">
            <FiPlus size={18} /> Новый материал
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard icon={FiPackage} title="Всего позиций" value={materials.length} color="bg-blue-500" />
        <StatCard icon={FiAlertTriangle} title="Критический остаток" value={lowStockCount} color="bg-red-500"
          subtitle={lowStockCount > 0 ? 'Требуется закупка!' : 'Всё в порядке'} />
        <StatCard icon={FiDollarSign} title="Стоимость склада" value={`${(totalValue / 1000).toFixed(0)}K сом`} color="bg-green-500" />
      </div>

      <div className="relative max-w-md mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder="Поиск материалов..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {paginated.length === 0 ? <EmptyState /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-400 uppercase">
                  <th className="text-left px-6 py-4 font-medium">Наименование</th>
                  <th className="text-center px-6 py-4 font-medium">Ед.</th>
                  <th className="text-center px-6 py-4 font-medium">Количество</th>
                  <th className="text-center px-6 py-4 font-medium">Мин.</th>
                  <th className="text-right px-6 py-4 font-medium">Цена/ед.</th>
                  <th className="text-left px-6 py-4 font-medium">Поставщик</th>
                  <th className="text-center px-6 py-4 font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((m) => (
                  <tr key={m.id} className={`hover:bg-gray-50 transition-colors ${m.lowStock ? 'bg-red-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.lowStock ? 'bg-red-100' : 'bg-gray-100'}`}>
                          <FiPackage size={18} className={m.lowStock ? 'text-red-500' : 'text-gray-400'} />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">{unitLabels[m.unit] || m.unit}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-semibold ${m.lowStock ? 'text-red-600' : 'text-gray-800'}`}>
                        {m.quantity}
                      </span>
                      {m.lowStock && <FiAlertTriangle className="inline ml-2 text-red-500" size={14} />}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-center">{m.minQuantity}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right">{m.pricePerUnit?.toLocaleString()} сом</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{m.supplier || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => openEdit(m)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                        <FiEdit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Material Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editMaterial ? 'Редактировать материал' : 'Новый материал'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Наименование</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Единица</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                <option value="METER">Метр</option><option value="KILOGRAM">Килограмм</option>
                <option value="PIECE">Штука</option><option value="ROLL">Рулон</option><option value="SPOOL">Катушка</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Цена за ед.</label>
              <input type="number" min="0" step="0.01" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: parseFloat(e.target.value) || 0 })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Количество</label>
              <input type="number" min="0" step="0.001" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Мин. остаток</label>
              <input type="number" min="0" step="0.001" value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Поставщик</label>
            <input type="text" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 text-sm">{t('common.cancel')}</button>
            <button type="submit" className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 text-sm">{t('common.save')}</button>
          </div>
        </form>
      </Modal>

      {/* Purchase Modal */}
      <Modal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} title="Добавить закупку">
        <form onSubmit={handlePurchase} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Материал</label>
            <select value={purchaseForm.materialId} onChange={(e) => setPurchaseForm({ ...purchaseForm, materialId: e.target.value })} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
              <option value="">Выберите материал</option>
              {materials.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.quantity} {unitLabels[m.unit]})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Количество</label>
              <input type="number" min="0.001" step="0.001" value={purchaseForm.quantity}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Общая стоимость</label>
              <input type="number" min="0" step="0.01" value={purchaseForm.totalCost}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, totalCost: e.target.value })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Дата закупки</label>
            <input type="date" value={purchaseForm.purchaseDate}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowPurchaseModal(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 text-sm">{t('common.cancel')}</button>
            <button type="submit" className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 text-sm">Сохранить</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
