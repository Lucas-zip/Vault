import axios from 'axios';

const TOKEN_KEY = 'vault_token';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador: adiciona o token JWT a cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptador: se receber 401 (não autenticado), redireciona para login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== Auth =====
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: {
    name: string;
    email: string;
    password: string;
    cpfCnpj?: string;
    phone?: string;
  }) => api.post('/auth/register', data),
};

// ===== Usuário =====
export const userApi = {
  me: () => api.get('/users/me'),
  update: (data: unknown) => api.put('/users/me', data),
};

// ===== Contas =====
export const accountApi = {
  list: () => api.get('/accounts'),
  get: (id: number) => api.get(`/accounts/${id}`),
  create: (data: unknown) => api.post('/accounts', data),
  update: (id: number, data: unknown) => api.put(`/accounts/${id}`, data),
  delete: (id: number) => api.delete(`/accounts/${id}`),
};

// ===== Categorias =====
export const categoryApi = {
  list: () => api.get('/categories'),
  create: (data: unknown) => api.post('/categories', data),
  update: (id: number, data: unknown) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// ===== Transações =====
export const transactionApi = {
  list: (params?: Record<string, string>) => api.get('/transactions', { params }),
  get: (id: number) => api.get(`/transactions/${id}`),
  create: (data: unknown) => api.post('/transactions', data),
  update: (id: number, data: unknown) => api.put(`/transactions/${id}`, data),
  delete: (id: number) => api.delete(`/transactions/${id}`),
};

// ===== Transferências =====
export const transferApi = {
  create: (data: unknown) => api.post('/transfers', data),
};

// ===== Dashboard =====
export const dashboardApi = {
  summary: () => api.get('/dashboard/summary'),
  accounts: () => api.get('/dashboard/accounts'),
  categories: () => api.get('/dashboard/categories'),
  monthly: () => api.get('/dashboard/monthly'),
  topExpenses: (params?: Record<string, string>) =>
    api.get('/dashboard/top-expenses', { params }),
  pending: () => api.get('/dashboard/pending'),
};

// ===== Relatórios =====
export const reportApi = {
  summary: () => api.get('/reports/summary'),
  incomes: () => api.get('/reports/incomes'),
  expenses: () => api.get('/reports/expenses'),
  monthlyEvolution: () => api.get('/reports/monthly-evolution'),
  topIncomes: () => api.get('/reports/top-incomes'),
  topExpenses: () => api.get('/reports/top-expenses'),
};

// ===== Orçamentos =====
export const budgetApi = {
  list: () => api.get('/budgets'),
  get: (id: number) => api.get(`/budgets/${id}`),
  create: (data: unknown) => api.post('/budgets', data),
  update: (id: number, data: unknown) => api.put(`/budgets/${id}`, data),
  delete: (id: number) => api.delete(`/budgets/${id}`),
  status: () => api.get('/budgets/status'),
};

// ===== Recorrências =====
export const recurrenceApi = {
  list: () => api.get('/recurrences'),
  get: (id: number) => api.get(`/recurrences/${id}`),
  create: (data: unknown) => api.post('/recurrences', data),
  update: (id: number, data: unknown) => api.put(`/recurrences/${id}`, data),
  delete: (id: number) => api.delete(`/recurrences/${id}`),
  execute: (id: number) => api.post(`/recurrences/${id}/execute`),
};

// ===== Transações futuras =====
export const futureApi = {
  list: () => api.get('/futures'),
  get: (id: number) => api.get(`/futures/${id}`),
  create: (data: unknown) => api.post('/futures', data),
  update: (id: number, data: unknown) => api.put(`/futures/${id}`, data),
  delete: (id: number) => api.delete(`/futures/${id}`),
  pay: (id: number) => api.post(`/futures/${id}/pay`),
  upcoming: () => api.get('/futures/upcoming'),
  overdue: () => api.get('/futures/overdue'),
};

export { TOKEN_KEY };
