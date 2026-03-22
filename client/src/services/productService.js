import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// For this frontend task, we can use mock data if backend isn't ready.
// (Removing in-memory mock storage to ensure DB consistency)

export const productService = {
  getAllProducts: async () => {
    const res = await axios.get(`${API_URL}/products`);
    return res.data;
  },

  getProductsByOwner: async (ownerId) => {
    const res = await axios.get(`${API_URL}/products/owner/${ownerId}`);
    return res.data;
  },

  getProductById: async (id) => {
    const res = await axios.get(`${API_URL}/products/${id}`);
    return res.data;
  },

  createProduct: async (productData) => {
    const res = await axios.post(`${API_URL}/products`, productData);
    return res.data;
  },

  updateProduct: async (id, productData) => {
    const res = await axios.put(`${API_URL}/products/${id}`, productData);
    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await axios.delete(`${API_URL}/products/${id}`);
    return res.data;
  }
};
