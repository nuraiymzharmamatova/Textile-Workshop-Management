import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiBox, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Modal from '../../common/Modal';
import EmptyState from '../../common/EmptyState';
import LoadingSpinner from '../../common/LoadingSpinner';
import { productsApi, sewingOperationsApi } from '../../../api/services';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: 0, laborCost: 0 });
  const [operations, setOperations] = useState([]);
  const [newOp, setNewOp] = useState({ name: '', cost: '' });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productsApi.getAll();
      setProducts(res.data);
    } catch { toast.error(t('common.error')); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: '', description: '', price: 0, laborCost: 0 });
    setOperations([]);
    setNewOp({ name: '', cost: '' });
    setShowModal(true);
  };

  const addOperation = async () => {
    if (!newOp.name || !newOp.cost || !editProduct) return;
    try {
      await sewingOperationsApi.create({ productId: editProduct.id, name: newOp.name, cost: parseFloat(newOp.cost) });
      const res = await sewingOperationsApi.getByProduct(editProduct.id);
      setOperations(res.data);
      setNewOp({ name: '', cost: '' });
    } catch { toast.error(t('common.error')); }
  };

  const deleteOperation = async (opId) => {
    try {
      await sewingOperationsApi.delete(opId);
      setOperations(operations.filter(o => o.id !== opId));
    } catch { toast.error(t('common.error')); }
  };

  const openEdit = async (p) => {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description || '', price: p.price, laborCost: p.laborCost || 0 });
    try { const res = await sewingOperationsApi.getByProduct(p.id); setOperations(res.data); }
    catch { setOperations(p.sewingOperations || []); }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProduct) {
        await productsApi.update(editProduct.id, form);
        toast.success(t('products.updated'));
      } else {
        await productsApi.create(form);
        toast.success(t('products.created'));
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('products.confirmDelete'))) return;
    try {
      await productsApi.delete(id);
      toast.success(t('products.deleted'));
      fetchProducts();
    } catch { toast.error(t('common.error')); }
  };

  const filtered = products.filter(p =>
    search === '' || p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('products.title')}</h2>
          <p className="text-sm text-gray-500">{t('products.subtitle')}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 text-sm">
          <FiPlus size={18} /> {t('products.new')}
        </button>
      </div>

      <div className="relative max-w-md mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={t('products.search')}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? <EmptyState /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-400 uppercase">
                  <th className="text-left px-6 py-4 font-medium">{t('products.name')}</th>
                  <th className="text-left px-6 py-4 font-medium">{t('products.description')}</th>
                  <th className="text-right px-6 py-4 font-medium">{t('products.price')}</th>
                  <th className="text-right px-6 py-4 font-medium">{t('products.laborCost')}</th>
                  <th className="text-center px-6 py-4 font-medium">{t('products.materials')}</th>
                  <th className="text-center px-6 py-4 font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                          <FiBox size={18} className="text-primary-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">{p.description || '—'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 text-right">{p.price?.toLocaleString()} {t('common.som')}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right">{p.laborCost?.toLocaleString() || '—'} {t('common.som')}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-center">
                      {p.sewingOperations?.length || 0} {t('operations.title').toLowerCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                          <FiEdit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editProduct ? t('products.editTitle') : t('products.createTitle')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('products.name')}</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('products.description')}</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('products.price')} ({t('common.som')})</label>
              <input type="number" min="0" step="0.01" value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('products.laborCost')} ({t('common.som')})</label>
              <input type="number" min="0" step="0.01" value={form.laborCost}
                onChange={(e) => setForm({ ...form, laborCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </div>
          </div>
          {/* Sewing operations - only for existing products */}
          {editProduct && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('operations.title')}</label>
              <div className="bg-gray-50 rounded-xl p-3 space-y-2 mb-2">
                {operations.length === 0 ? (
                  <p className="text-xs text-gray-400">{t('common.noData')}</p>
                ) : (
                  operations.map((op) => (
                    <div key={op.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-700">{op.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary-600">{op.cost} {t('common.som')}</span>
                        <button type="button" onClick={() => deleteOperation(op.id)} className="text-gray-400 hover:text-red-500">
                          <FiX size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                {operations.length > 0 && (
                  <div className="text-xs text-gray-500 pt-1 border-t">
                    {t('operations.totalCost')}: <b>{operations.reduce((s, o) => s + (o.cost || 0), 0)} {t('common.som')}</b>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newOp.name} onChange={(e) => setNewOp({ ...newOp, name: e.target.value })}
                  placeholder={t('operations.name')} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" />
                <input type="number" min="0" step="0.01" value={newOp.cost} onChange={(e) => setNewOp({ ...newOp, cost: e.target.value })}
                  placeholder={t('operations.cost')} className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" />
                <button type="button" onClick={addOperation} className="px-3 py-2 bg-primary-100 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-200">
                  <FiPlus size={16} />
                </button>
              </div>
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
