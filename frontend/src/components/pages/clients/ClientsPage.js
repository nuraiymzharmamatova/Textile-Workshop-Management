import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiPhone, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Avatar from '../../common/Avatar';
import Modal from '../../common/Modal';
import Pagination from '../../common/Pagination';
import EmptyState from '../../common/EmptyState';
import LoadingSpinner from '../../common/LoadingSpinner';
import { clientsApi } from '../../../api/services';

export default function ClientsPage() {
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' });
  const itemsPerPage = 12;

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    setLoading(true);
    try { const res = await clientsApi.getAll(); setClients(res.data); }
    catch { toast.error(t('common.error')); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditClient(null); setForm({ name: '', phone: '', address: '', notes: '' }); setShowModal(true); };
  const openEdit = (c) => { setEditClient(c); setForm({ name: c.name, phone: c.phone, address: c.address || '', notes: c.notes || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editClient) { await clientsApi.update(editClient.id, form); toast.success(t('clients.updated')); }
      else { await clientsApi.create(form); toast.success(t('clients.created')); }
      setShowModal(false); fetchClients();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).forEach((msg) => toast.error(msg));
      else toast.error(err.response?.data?.message || t('common.error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('clients.confirmDelete'))) return;
    try { await clientsApi.delete(id); toast.success(t('clients.deleted')); fetchClients(); }
    catch { toast.error(t('common.error')); }
  };

  const filtered = clients.filter((c) => search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('clients.title')}</h2>
          <p className="text-sm text-gray-500">{t('clients.subtitle')}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 text-sm">
          <FiPlus size={18} /> {t('clients.new')}
        </button>
      </div>

      <div className="relative max-w-md mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder={t('clients.search')}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.length === 0 ? <div className="col-span-full"><EmptyState /></div> : (
          paginated.map((client) => (
            <div key={client.id} className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={client.name} size="lg" />
                  <div>
                    <h3 className="font-semibold text-gray-800">{client.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{client.orders?.length || 0} {t('clients.ordersCount')}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(client)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><FiEdit2 size={15} /></button>
                  <button onClick={() => handleDelete(client.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 size={15} /></button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600"><FiPhone size={14} className="text-gray-400" /> {client.phone}</div>
                {client.address && <div className="flex items-center gap-2 text-sm text-gray-600"><FiMapPin size={14} className="text-gray-400" /> {client.address}</div>}
              </div>
              {client.notes && <p className="mt-3 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">{client.notes}</p>}
            </div>
          ))
        )}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editClient ? t('clients.editTitle') : t('clients.createTitle')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('clients.name')}</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('clients.phone')}</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="+996..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('clients.address')}</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">{t('clients.notes')}</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none" />
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
