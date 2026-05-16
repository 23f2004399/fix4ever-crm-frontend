import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Add request interceptor to attach auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  verifyAdmin: () => api.get('/admin/verify'),

  logout: () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    window.location.href = '/login'
  },
}

// User Management APIs
export const userManagementAPI = {
  createUser: (data: any) =>
    api.post('/admin/user-management/users/create', data),

  getPendingApprovals: (params?: any) =>
    api.get('/admin/user-management/approvals/pending', { params }),

  getAllAdminUsers: (params?: any) =>
    api.get('/admin/user-management/admins', { params }),

  getAdminUserDetails: (adminUserId: string) =>
    api.get(`/admin/user-management/admins/${adminUserId}`),

  reviewAdminUser: (adminUserId: string, data: any) =>
    api.post(`/admin/user-management/admins/${adminUserId}/review`, data),

  saveDraft: (adminUserId: string, data: any) =>
    api.post(`/admin/user-management/admins/${adminUserId}/draft`, data),

  updatePermissions: (adminUserId: string, permissions: any) =>
    api.put(`/admin/user-management/admins/${adminUserId}/permissions`, {
      permissions,
    }),

  deactivateUser: (adminUserId: string) =>
    api.post(`/admin/user-management/admins/${adminUserId}/deactivate`),

  getStatistics: () => api.get('/admin/user-management/statistics'),
}

// Regional Manager APIs
export const regionalManagerAPI = {
  getDashboard: () => api.get('/admin/regional/dashboard'),

  getRequests: (params?: any) =>
    api.get('/admin/regional/requests', { params }),

  reassignRequest: (requestId: string, data: any) =>
    api.post(`/admin/regional/requests/${requestId}/reassign`, data),

  getAvailableTechnicians: (requestId: string, params?: any) =>
    api.get(`/admin/regional/requests/${requestId}/available-technicians`, {
      params,
    }),

  getCaptains: (params?: any) =>
    api.get('/admin/regional/captains', { params }),
}

// CRM Manager APIs
export const crmManagerAPI = {
  getStatistics: () => api.get('/admin/crm/statistics'),

  getPendingApprovals: (params?: any) =>
    api.get('/admin/crm/approvals/pending', { params }),

  getCaptains: (params?: any) => api.get('/admin/crm/captains', { params }),

  getCaptainDetails: (captainId: string) =>
    api.get(`/admin/crm/captains/${captainId}`),

  reviewCaptain: (captainId: string, data: any) =>
    api.post(`/admin/crm/captains/${captainId}/review`, data),

  getTechnicians: (params?: any) =>
    api.get('/admin/crm/technicians', { params }),

  getTechnicianDetails: (technicianId: string) =>
    api.get(`/admin/crm/technicians/${technicianId}`),

  reviewTechnician: (technicianId: string, data: any) =>
    api.post(`/admin/crm/technicians/${technicianId}/review`, data),
}

// Chat Center APIs
export const chatCenterAPI = {
  getStatistics: () => api.get('/admin/chat-center/statistics'),

  getAllChats: (params?: any) => api.get('/admin/chat-center/', { params }),

  getChatDetails: (chatId: string) => api.get(`/admin/chat-center/${chatId}`),

  sendMessage: (chatId: string, data: any) =>
    api.post(`/admin/chat-center/${chatId}/message`, data),

  createChat: (data: any) => api.post('/admin/chat-center/create', data),

  updateChatStatus: (chatId: string, data: any) =>
    api.put(`/admin/chat-center/${chatId}/status`, data),

  escalateChat: (chatId: string, data: any) =>
    api.post(`/admin/chat-center/${chatId}/escalate`, data),

  markAsRead: (chatId: string) =>
    api.post(`/admin/chat-center/${chatId}/mark-read`),

  getContacts: (params?: any) =>
    api.get('/admin/chat-center/contacts/list', { params }),
}

// Vendor APIs (existing)
export const vendorAPI = {
  getApplications: (params?: any) =>
    api.get('/admin/vendor-applications', { params }),

  getApplication: (vendorId: string) =>
    api.get(`/admin/vendor-applications/${vendorId}`),

  reviewApplication: (vendorId: string, data: any) =>
    api.post(`/admin/vendor-applications/${vendorId}/review`, data),

  getStats: () => api.get('/admin/vendor-stats'),
}

// Service Request APIs (existing)
export const serviceRequestAPI = {
  getAll: (params?: any) => api.get('/admin/service-requests', { params }),

  assignTechnician: (data: any) => api.post('/admin/assign-technician', data),

  getAvailableTechnicians: (params?: any) =>
    api.get('/admin/available-technicians', { params }),
}
