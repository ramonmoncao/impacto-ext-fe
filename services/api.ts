import axios from 'axios';

const api = axios.create({
  // Se estiver usando o emulador Android, use 'http://10.0.2.2:8080'
  // Se for celular físico, use o IP da sua máquina
  baseURL: 'http://192.168.0.243:8080', 
});

export default api;