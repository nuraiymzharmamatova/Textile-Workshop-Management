import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiSearch, FiFilter, FiDownload, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import StatusBadge from '../../common/StatusBadge';
import Avatar from '../../common/Avatar';
import Pagination from '../../common/Pagination';
import EmptyState from '../../common/EmptyState';
import LoadingSpinner from '../../common/LoadingSpinner';
import Modal from '../../common/Modal';
import { ordersApi, clientsApi, productsApi, materialsApi } from '../../../api/services';

const ORDER_STATUSES = ['NEW', 'IN_PROGRESS', 'CUTTING', 'SEWING', 'PACKAGING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

export default function OrdersPage() {
  const { t } = useTranslation();
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
    try {
      const response = await ordersApi.getAll();
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      toast.error('Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const [clientsRes, productsRes] = await Promise.all([clientsApi.getAll(), productsApi.getAll()]);
      setClients(clientsRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error('Failed to fetch form data:', err);
    }
  };

  const checkStockAvailability = async (productId, quantity) => {
    if (!productId || !quantity) { setStockWarnings([]); return; }
    try {
      const res = await materialsApi.checkStock(productId, quantity);
      setStockWarnings(res.data.warnings || []);
    } catch { setStockWarnings([]); }
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
    setForm({
      clientId: order.client?.id || '',
      productId: order.product?.id || '',
      quantity: order.quantity,
      deadline: order.deadline || '',
      notes: order.notes || '',
    });
    fetchFormData();
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editOrder) {
        await ordersApi.update(editOrder.id, form);
        toast.success('Заказ обновлён');
      } else {
        await ordersApi.create(form);
        toast.success('Заказ создан');
      }
      setShowModal(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка при сохранении');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await ordersApi.updateStatus(id, newStatus);
      toast.success('Статус обновлён');
      fetchOrders();
    } catch (err) {
      toast.error('Ошибка при обновлении статуса');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить заказ?')) return;
    try {
      await ordersApi.delete(id);
      toast.success('Заказ удалён');
      fetchOrders();
    } catch (err) {
      toast.error('Ошибка при удалении');
    }
  };

  const filtered = orders.filter((order) => {
    const matchSearch = search === '' ||
      order.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      String(order.id).includes(search);
    const matchStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('nav.orders')}</h2>
          <p className="text-sm text-gray-500">Управление заказами, статусы, дедлайны</p>
        </div>
        <button onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors text-sm">
          <FiPlus size={18} /> Новый заказ
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Поиск по клиенту или изделию..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
        </div>
        <select value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm cursor-pointer focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="ALL">Все статусы</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
                    <th className="text-left px-6 py-4 font-medium">Клиент</th>
                    <th className="text-left px-6 py-4 font-medium">Модель</th>
                    <th className="text-center px-6 py-4 font-medium">Кол-во</th>
                    <th className="text-right px-6 py-4 font-medium">Сумма</th>
                    <th className="text-center px-6 py-4 font-medium">Статус</th>
                    <th className="text-center px-6 py-4 font-medium">Дедлайн</th>
                    <th className="text-center px-6 py-4 font-medium">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-primary-600">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={order.client?.name || 'N/A'} size="sm" />
                          <span className="text-sm font-medium text-gray-700">{order.client?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{order.product?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-center">{order.quantity} шт.</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800 text-right">{order.totalPrice?.toLocaleString()} сом</td>
                      <td className="px-6 py-4 text-center">
                        <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs border-none bg-transparent cursor-pointer focus:outline-none">
                          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-center">{order.deadline || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(order)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <FiEdit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(order.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400">
              Показано {paginated.length} из {filtered.length} заказов
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editOrder ? 'Редактировать заказ' : 'Создать новый заказ'}
        subtitle="Заполните информацию о заказе">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Клиент</label>
              <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">Выберите клиента</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Модель</label>
              <select value={form.productId} onChange={(e) => { const pid = e.target.value; setForm({ ...form, productId: pid }); checkStockAvailability(pid, form.quantity); }} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">Выберите модель</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.price?.toLocaleString()} сом</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Количество</label>
              <input type="number" min="1" value={form.quantity}
                onChange={(e) => { const qty = parseInt(e.target.value) || 1; setForm({ ...form, quantity: qty }); checkStockAvailability(form.productId, qty); }} required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Крайний срок</label>
              <input type="date" value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Примечания</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
              placeholder="Особенности ткани, фурнитуры или замеры..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
          </div>
          {/* Stock warnings */}
          {stockWarnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-2">{t('orders.stockWarning')}</p>
              {stockWarnings.map((w, i) => (
                <p key={i} className="text-xs text-yellow-700">
                  {w.materialName}: {t('orders.stockNeeded')} {w.required} — {t('orders.stockAvailable')} {w.available} (deficit: {w.deficit})
                </p>
              ))}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 text-sm">{t('common.cancel')}</button>
            <button type="submit"
              className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 text-sm">{t('orders.save')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
