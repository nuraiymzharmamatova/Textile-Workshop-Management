import api from './axios';

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard'),
};

// Clients
export const clientsApi = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  search: (query) => api.get(`/clients/search?query=${query}`),
};

// Orders
export const ordersApi = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Products
export const productsApi = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Materials (Inventory)
export const materialsApi = {
  getAll: () => api.get('/materials'),
  getById: (id) => api.get(`/materials/${id}`),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`),
  getLowStock: () => api.get('/materials/low-stock'),
  addPurchase: (data) => api.post('/materials/purchases', data),
};

// Employees
export const employeesApi = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getSalary: (params) => api.get('/employees/salary', { params }),
};

// Production Reports
export const productionApi = {
  getAll: (params) => api.get('/production', { params }),
  create: (data) => api.post('/production', data),
  getByDate: (date) => api.get(`/production/date/${date}`),
  getByEmployee: (employeeId) => api.get(`/production/employee/${employeeId}`),
  getByOrder: (orderId) => api.get(`/production/order/${orderId}`),
};

// Reports
export const reportsApi = {
  getMonthly: (params) => api.get('/reports/monthly', { params }),
  exportPdf: (params) => api.get('/reports/export/pdf', { params, responseType: 'blob' }),
  exportExcel: (params) => api.get('/reports/export/excel', { params, responseType: 'blob' }),
};

// File upload
export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
