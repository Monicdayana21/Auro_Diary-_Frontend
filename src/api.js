import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || 'https://aura-diary-backend.vercel.app';
// Strip trailing slash and handle misconfigured literal string
export const BASE_URL = (rawUrl === 'VITE_API_URL' || !rawUrl) 
  ? 'https://aura-diary-backend.vercel.app' 
  : rawUrl.replace(/\/$/, '');

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('aura_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aura_token');
      localStorage.removeItem('aura_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
