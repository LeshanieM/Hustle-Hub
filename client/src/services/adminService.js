import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth header
const adminAxios = axios.create({
    baseURL: `${API_URL}/admin`
});

// Add interceptor to add token to every request
adminAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const adminService = {
    // Product management
    getAllProducts: async () => {
        const res = await adminAxios.get('/products');
        return res.data;
    },

    toggleProductFlag: async (id) => {
        const res = await adminAxios.patch(`/products/${id}/flag`);
        return res.data;
    },

    getProductById: async (id) => {
        const res = await adminAxios.get(`/products/${id}`);
        return res.data;
    },

    // User management
    getAllUsers: async () => {
        const res = await adminAxios.get('/users');
        return res.data;
    },

    // Store management
    getAllStores: async () => {
        const res = await adminAxios.get('/stores');
        return res.data;
    },

    updateStoreStatus: async (id, status) => {
        const res = await adminAxios.put(`/stores/${id}/status`, { status });
        return res.data;
    },

    // Booking management
    getAllBookings: async (params) => {
        const res = await adminAxios.get('/bookings', { params });
        return res.data;
    },

    getBookingStats: async () => {
        const res = await adminAxios.get('/bookings/stats');
        return res.data;
    },

    overrideBookingStatus: async (id, status, reason) => {
        const res = await adminAxios.patch(`/bookings/${id}/status`, { status, reason });
        return res.data;
    },

    // System management
    getAuditLogs: async () => {
        const res = await adminAxios.get('/audit-logs');
        return res.data;
    }
};
