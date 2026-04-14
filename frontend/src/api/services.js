import api from './axios';

export const dashboardApi = {
  getStats: () => api.get('/dashboard'),
};

export const clientsApi = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

export const ordersApi = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const productsApi = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const materialsApi = {
  getAll: () => api.get('/materials'),
  getById: (id) => api.get(`/materials/${id}`),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`),
  getLowStock: () => api.get('/materials/low-stock'),
  addPurchase: (data) => api.post('/materials/purchases', data),
  checkStock: (productId, quantity) => api.get('/materials/check-stock', { params: { productId, quantity } }),
};

export const employeesApi = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getSalary: (params) => api.get('/employees/salary', { params }),
};

export const productionApi = {
  getAll: (params) => api.get('/production', { params }),
  create: (data) => api.post('/production', data),
  delete: (id) => api.delete(`/production/${id}`),
  getByDate: (date) => api.get(`/production/date/${date}`),
  getDailySummary: (from, to) => api.get('/production/summary/daily', { params: { from, to } }),
};

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
};

export const profileApi = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/profile/password', data),
};

export const expensesApi = {
  getAll: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

export const technicalCardApi = {
  getByProduct: (productId) => api.get(`/technical-card/product/${productId}`),
  create: (data) => api.post('/technical-card', data),
  delete: (id) => api.delete(`/technical-card/${id}`),
};

export const employeeOperationsApi = {
  getByEmployee: (employeeId) => api.get(`/employee-operations/employee/${employeeId}`),
  assign: (employeeId, operationId) => api.post('/employee-operations', { employeeId, operationId }),
  remove: (id) => api.delete(`/employee-operations/${id}`),
};

export const sewingOperationsApi = {
  getByProduct: (productId) => api.get(`/sewing-operations/product/${productId}`),
  getAll: () => api.get('/sewing-operations'),
  create: (data) => api.post('/sewing-operations', data),
  delete: (id) => api.delete(`/sewing-operations/${id}`),
};

export const exportApi = {
  salaryExcel: (month) => api.get('/export/salary/excel', { params: { month }, responseType: 'blob' }),
  salaryPdf: (month) => api.get('/export/salary/pdf', { params: { month }, responseType: 'blob' }),
  reportExcel: () => api.get('/export/report/excel', { responseType: 'blob' }),
  reportPdf: () => api.get('/export/report/pdf', { responseType: 'blob' }),
};

export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
