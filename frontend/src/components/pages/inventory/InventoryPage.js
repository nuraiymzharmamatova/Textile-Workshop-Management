import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiSearch, FiAlertTriangle, FiPackage, FiDollarSign, FiEdit2, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-toastify';
import StatCard from '../../common/StatCard';
import Pagination from '../../common/Pagination';
import EmptyState from '../../common/EmptyState';
import LoadingSpinner from '../../common/LoadingSpinner';
import Modal from '../../common/Modal';
import { materialsApi } from '../../../api/services';

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
    try { const res = await materialsApi.getAll(); setMaterials(res.data); }
    catch { toast.error(t('common.error')); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditMaterial(null); setForm({ name: '', unit: 'METER', quantity: 0, minQuantity: 0, pricePerUnit: 0, supplier: '' }); setShowModal(true); };
  const openEdit = (m) => { setEditMaterial(m); setForm({ name: m.name, unit: m.unit, quantity: m.quantity, minQuantity: m.minQuantity, pricePerUnit: m.pricePerUnit, supplier: m.supplier || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMaterial) { await materialsApi.update(editMaterial.id, form); toast.success(t('inventory.updated')); }
      else { await materialsApi.create(form); toast.success(t('inventory.created')); }
      setShowModal(false); fetchMaterials();
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('inventory.confirmDelete'))) return;
    try { await materialsApi.delete(id); toast.success(t('inventory.deleted')); fetchMaterials(); }
    catch { toast.error(t('common.error')); }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    try { await materialsApi.addPurchase(purchaseForm); toast.success(t('inventory.purchaseAdded')); setShowPurchaseModal(false); fetchMaterials(); }
    catch (err) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  const lowStockCount = materials.filter((m) => m.lowStock).length;
  const totalValue = materials.reduce((sum, m) => sum + (m.quantity || 0) * (m.pricePerUnit || 0), 0);
  const filtered = materials.filter((m) => search === '' || m.name.toLowerCase().includes(search.toLowerCase()) || m.supplier?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const unitLabel = (u) => t(`inventory.units.${u}`) || u;
  const unitName = (u) => t(`inventory.unitNames.${u}`) || u;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('inventory.title')}</h2>
          <p className="text-sm text-gray-500">{t('inventory.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setPurchaseForm({ materialId: '', quantity: '', totalCost: '', supplier: '', purchaseDate: new Date().toISOString().split('T')[0] }); setShowPurchaseModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 border border-primary-600 text-primary-600 rounded-xl font-medium hover:bg-primary-50 text-sm">
            <FiShoppingBag size={18} /> {t('inventory.addPurchase')}
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 text-sm">
            <FiPlus size={18} /> {t('inventory.newMaterial')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard icon={FiPackage} title={t('inventory.totalItems')} value={materials.length} color="bg-blue-500" />
        <StatCard icon={FiAlertTriangle} title={t('inventory.criticalStock')} value={lowStockCount} color="bg-red-500"
          subtitle={lowStockCount > 0 ? t('inventory.needPurchase') : t('inventory.allGood')} />
        <StatCard icon={FiDollarSign} title={t('inventory.stockValue')} value={`${(totalValue / 1000).toFixed(0)}K ${t('common.som')}`} color="bg-green-500" />
      </div>

      <div className="relative max-w-md mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder={t('inventory.search')}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {paginated.length === 0 ? <EmptyState /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-400 uppercase">
                  <th className="text-left px-6 py-4 font-medium">{t('inventory.name')}</th>
                  <th className="text-center px-6 py-4 font-medium">{t('inventory.unit')}</th>
                  <th className="text-center px-6 py-4 font-medium">{t('inventory.quantity')}</th>
                  <th className="text-center px-6 py-4 font-medium">{t('inventory.minQuantity')}</th>
                  <th className="text-right px-6 py-4 font-medium">{t('inventory.pricePerUnit')}</th>
                  <th className="text-left px-6 py-4 font-medium">{t('inventory.supplier')}</th>
                  <th className="text-center px-6 py-4 font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((m) => (
                  <tr key={m.id} className={`hover:bg-gray-50 ${m.lowStock ? 'bg-red-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.lowStock ? 'bg-red-100' : 'bg-gray-100'}`}>
                          <FiPackage size={18} className={m.lowStock ? 'text-red-500' : 'text-gray-400'} />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">{unitLabel(m.unit)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-semibold ${m.lowStock ? 'text-red-600' : 'text-gray-800'}`}>{m.quantity}</span>
                      {m.lowStock && <FiAlertTriangle className="inline ml-2 text-red-500" size={14} />}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-center">{m.minQuantity}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right">{m.pricePerUnit?.toLocaleString()} {t('common.som')}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{m.supplier || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(m)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><FiEdit2 size={16} /></button>
                        <button onClick={() => handleDelete(m.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editMaterial ? t('inventory.editTitle') : t('inventory.createTitle')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('inventory.name')}</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('inventory.unit')}</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                {['METER','KILOGRAM','PIECE','ROLL','SPOOL'].map(u => <option key={u} value={u}>{unitName(u)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('inventory.pricePerUnit')} ({t('common.som')})</label>
              <input type="number" min="0" step="0.01" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: parseFloat(e.target.value) || 0 })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('inventory.quantity')}</label>
              <input type="number" min="0" step="0.001" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('inventory.minQuantity')}</label>
              <input type="number" min="0" step="0.001" value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('inventory.supplier')}</label>
            <input type="text" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 text-sm">{t('common.cancel')}</button>
            <button type="submit" className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 text-sm">{t('common.save')}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} title={t('inventory.purchaseTitle')}>
        <form onSubmit={handlePurchase} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('inventory.selectMaterial')}</label>
            <select value={purchaseForm.materialId} onChange={(e) => setPurchaseForm({ ...purchaseForm, materialId: e.target.value })} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
              <option value="">{t('inventory.selectMaterial')}</option>
              {materials.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.quantity} {unitLabel(m.unit)})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('inventory.purchaseQty')}</label>
              <input type="number" min="0.001" step="0.001" value={purchaseForm.quantity}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('inventory.purchaseCost')} ({t('common.som')})</label>
              <input type="number" min="0" step="0.01" value={purchaseForm.totalCost}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, totalCost: e.target.value })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('inventory.purchaseDate')}</label>
            <input type="date" value={purchaseForm.purchaseDate}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowPurchaseModal(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 text-sm">{t('common.cancel')}</button>
            <button type="submit" className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 text-sm">{t('common.save')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
