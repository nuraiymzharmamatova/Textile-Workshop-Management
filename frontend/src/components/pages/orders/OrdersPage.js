import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import StatusBadge, { getStatusLabel } from '../../common/StatusBadge';
import Avatar from '../../common/Avatar';
import Pagination from '../../common/Pagination';
import EmptyState from '../../common/EmptyState';
import LoadingSpinner from '../../common/LoadingSpinner';
import Modal from '../../common/Modal';
import { ordersApi, clientsApi, productsApi, materialsApi } from '../../../api/services';

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
  const [form, setForm] = useState({ clientId: '', productId: '', quantity: 1, deadline: '', notes: '' });
  const [stockWarnings, setStockWarnings] = useState([]);
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
      const [c, p] = await Promise.all([clientsApi.getAll(), productsApi.getAll()]);
      setClients(c.data); setProducts(p.data);
    } catch {}
  };

  const checkStockAvailability = async (productId, quantity) => {
    if (!productId || !quantity) { setStockWarnings([]); return; }
    try { const res = await materialsApi.checkStock(productId, quantity); setStockWarnings(res.data.warnings || []); }
    catch { setStockWarnings([]); }
  };

  const openCreateModal = () => {
    setEditOrder(null);
    setForm({ clientId: '', productId: '', quantity: 1, deadline: '', notes: '' });
    setStockWarnings([]);
    fetchFormData();
    setShowModal(true);
  };

  const openEditModal = (order) => {
    setEditOrder(order);
    setForm({ clientId: order.client?.id || '', productId: order.product?.id || '', quantity: order.quantity, deadline: order.deadline || '', notes: order.notes || '' });
    fetchFormData();
    setShowModal(true);
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
        title={editOrder ? t('orders.editTitle') : t('orders.createTitle')} subtitle={t('orders.formSubtitle')}>
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
              <select value={form.productId} onChange={(e) => { const pid = e.target.value; setForm({ ...form, productId: pid }); checkStockAvailability(pid, form.quantity); }} required
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
                onChange={(e) => { const qty = parseInt(e.target.value) || 1; setForm({ ...form, quantity: qty }); checkStockAvailability(form.productId, qty); }} required
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
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
          </div>
          {stockWarnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-2">{t('orders.stockWarning')}</p>
              {stockWarnings.map((w, i) => (
                <p key={i} className="text-xs text-yellow-700">
                  {w.materialName}: {t('orders.stockNeeded')} {w.required} — {t('orders.stockAvailable')} {w.available}
                </p>
              ))}
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
