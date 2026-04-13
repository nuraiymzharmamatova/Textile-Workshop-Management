import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiPackage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import StatusBadge, { getStatusLabel } from '../../common/StatusBadge';
import Avatar from '../../common/Avatar';
import Pagination from '../../common/Pagination';
import EmptyState from '../../common/EmptyState';
import LoadingSpinner from '../../common/LoadingSpinner';
import Modal from '../../common/Modal';
import { ordersApi, clientsApi, productsApi, materialsApi, technicalCardApi } from '../../../api/services';

const ORDER_STATUSES = ['NEW', 'IN_PROGRESS', 'CUTTING', 'SEWING', 'PACKAGING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

export default function OrdersPage() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [form, setForm] = useState({ clientId: '', productId: '', quantity: 1, deadline: '', notes: '' });
  const [techCard, setTechCard] = useState([]);
  const [newTc, setNewTc] = useState({ materialId: '', quantityPerUnit: '' });
  const itemsPerPage = 10;

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try { const res = await ordersApi.getAll(); setOrders(res.data); }
    catch { toast.error(t('common.error')); }
    finally { setLoading(false); }
  };

  const fetchFormData = async () => {
    try {
      const [c, p, m] = await Promise.all([clientsApi.getAll(), productsApi.getAll(), materialsApi.getAll()]);
      setClients(c.data); setProducts(p.data); setAllMaterials(m.data);
    } catch {}
  };

  const loadTechCard = async (productId) => {
    if (!productId) { setTechCard([]); return; }
    try {
      const res = await technicalCardApi.getByProduct(productId);
      setTechCard(res.data);
    } catch { setTechCard([]); }
  };

  const openCreateModal = () => {
    setEditOrder(null);
    setForm({ clientId: '', productId: '', quantity: 1, deadline: '', notes: '' });
    setTechCard([]); setNewTc({ materialId: '', quantityPerUnit: '' });
    fetchFormData();
    setShowModal(true);
  };

  const openEditModal = (order) => {
    setEditOrder(order);
    setForm({ clientId: order.client?.id || '', productId: order.product?.id || '', quantity: order.quantity, deadline: order.deadline || '', notes: order.notes || '' });
    setNewTc({ materialId: '', quantityPerUnit: '' });
    fetchFormData();
    if (order.product?.id) loadTechCard(order.product.id);
    setShowModal(true);
  };

  const handleProductChange = (pid) => {
    setForm({ ...form, productId: pid });
    loadTechCard(pid);
  };

  const addTechCardItem = async () => {
    if (!newTc.materialId || !newTc.quantityPerUnit || !form.productId) return;
    try {
      await technicalCardApi.create({ productId: parseInt(form.productId), materialId: parseInt(newTc.materialId), quantityPerUnit: parseFloat(newTc.quantityPerUnit) });
      await loadTechCard(form.productId);
      setNewTc({ materialId: '', quantityPerUnit: '' });
      toast.success(t('common.save'));
    } catch { toast.error(t('common.error')); }
  };

  const deleteTechCardItem = async (tcId) => {
    try {
      await technicalCardApi.delete(tcId);
      setTechCard(techCard.filter(tc => tc.id !== tcId));
    } catch { toast.error(t('common.error')); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editOrder) { await ordersApi.update(editOrder.id, form); toast.success(t('orders.updated')); }
      else { await ordersApi.create(form); toast.success(t('orders.created')); }
      setShowModal(false); fetchOrders();
    } catch (err) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try { await ordersApi.updateStatus(id, newStatus); toast.success(t('orders.statusUpdated')); fetchOrders(); }
    catch { toast.error(t('common.error')); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('orders.confirmDelete'))) return;
    try { await ordersApi.delete(id); toast.success(t('orders.deleted')); fetchOrders(); }
    catch { toast.error(t('common.error')); }
  };

  const filtered = orders.filter((o) => {
    const matchSearch = search === '' || o.client?.name?.toLowerCase().includes(search.toLowerCase()) || o.product?.name?.toLowerCase().includes(search.toLowerCase()) || String(o.id).includes(search);
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const unitLabel = (u) => t(`inventory.units.${u}`) || u;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('orders.title')}</h2>
          <p className="text-sm text-gray-500">{t('orders.subtitle')}</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 text-sm">
          <FiPlus size={18} /> {t('orders.new')}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder={t('orders.search')}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm cursor-pointer focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="ALL">{t('orders.allStatuses')}</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{getStatusLabel(s, i18n.language)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {paginated.length === 0 ? <EmptyState /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-400 uppercase">
                    <th className="text-left px-6 py-4 font-medium">№</th>
                    <th className="text-left px-6 py-4 font-medium">{t('orders.client')}</th>
                    <th className="text-left px-6 py-4 font-medium">{t('orders.model')}</th>
                    <th className="text-center px-6 py-4 font-medium">{t('orders.quantity')}</th>
                    <th className="text-right px-6 py-4 font-medium">{t('orders.total')}</th>
                    <th className="text-center px-6 py-4 font-medium">{t('common.status')}</th>
                    <th className="text-center px-6 py-4 font-medium">{t('orders.deadline')}</th>
                    <th className="text-center px-6 py-4 font-medium">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4"><span className="text-sm font-bold text-primary-600">#{order.id}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={order.client?.name || 'N/A'} size="sm" />
                          <span className="text-sm font-medium text-gray-700">{order.client?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{order.product?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-center">{order.quantity} {t('common.pcs')}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800 text-right">{order.totalPrice?.toLocaleString()} {t('common.som')}</td>
                      <td className="px-6 py-4 text-center">
                        <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs border-none bg-transparent cursor-pointer focus:outline-none">
                          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{getStatusLabel(s, i18n.language)}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-center">{order.deadline || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(order)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><FiEdit2 size={16} /></button>
                          <button onClick={() => handleDelete(order.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400">
              {t('orders.showing')} {paginated.length} {t('orders.of')} {filtered.length} {t('orders.orderWord')}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editOrder ? t('orders.editTitle') : t('orders.createTitle')} subtitle={t('orders.formSubtitle')}
        maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('orders.client')}</label>
              <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">{t('orders.selectClient')}</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('orders.model')}</label>
              <select value={form.productId} onChange={(e) => handleProductChange(e.target.value)} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">{t('orders.selectProduct')}</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.price?.toLocaleString()} {t('common.som')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('orders.quantity')}</label>
              <input type="number" min="1" value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('orders.deadline')}</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('orders.notes')}</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
          </div>

          {/* Material usage section - editable */}
          {form.productId && (
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FiPackage size={16} className="text-primary-600" />
                <p className="text-sm font-semibold text-gray-700">{t('orders.materialUsage')}</p>
              </div>

              {techCard.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {techCard.map((tc) => {
                    const needed = (tc.quantityPerUnit * form.quantity).toFixed(1);
                    const available = tc.material?.quantity || 0;
                    const isEnough = parseFloat(available) >= parseFloat(needed);
                    return (
                      <div key={tc.id} className={`flex items-center justify-between rounded-lg px-3 py-2 ${isEnough ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className="flex-1">
                          <span className="text-sm text-gray-700 font-medium">{tc.material?.name}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {tc.quantityPerUnit} {unitLabel(tc.material?.unit)} x {form.quantity} = <b>{needed}</b>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{t('orders.inStock')}: {available}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isEnough ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {isEnough ? t('orders.enough') : t('orders.notEnough')}
                          </span>
                          <button type="button" onClick={() => deleteTechCardItem(tc.id)} className="text-gray-400 hover:text-red-500">
                            <FiX size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-yellow-600 bg-yellow-50 rounded-lg p-2 mb-3">{t('orders.noTechCard')}</p>
              )}

              {/* Add new material to tech card */}
              <div className="flex gap-2">
                <select value={newTc.materialId} onChange={(e) => setNewTc({ ...newTc, materialId: e.target.value })}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none">
                  <option value="">{t('orders.material')}...</option>
                  {allMaterials.filter(m => !techCard.some(tc => tc.material?.id === m.id)).map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.quantity} {unitLabel(m.unit)})</option>
                  ))}
                </select>
                <input type="number" min="0.001" step="0.001" value={newTc.quantityPerUnit}
                  onChange={(e) => setNewTc({ ...newTc, quantityPerUnit: e.target.value })}
                  placeholder={t('orders.perUnit')}
                  className="w-28 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" />
                <button type="button" onClick={addTechCardItem}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200">
                  <FiPlus size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 text-sm">{t('common.cancel')}</button>
            <button type="submit" className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 text-sm">{t('orders.save')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
