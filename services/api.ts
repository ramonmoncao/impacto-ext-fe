import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://impacto-ext-be.onrender.com',
});

// Interceptor para adicionar o token JWT a todas as requisições
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erro ao recuperar token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Limpa o token expirado
        await AsyncStorage.removeItem('authToken');        
        console.log('Token expirado. Favor fazer login novamente.');
      } catch (err) {
        console.error('Erro ao lidar com token expirado:', err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;