/**
 * Configuração central da API.
 * 
 * Se estiver usando um dispositivo físico com Expo + Tunnel:
 * 1. Rode o backend (php artisan serve).
 * 2. Rode o tunnel do backend (ex: ngrok http 8000).
 * 3. Copie a URL gerada e cole em BASE_URL abaixo.
 */

// URL temporária do seu tunnel (pode expirar)
// const TUNNEL_URL = 'https://ready-sloths-sin.loca.lt';

// Seu IP local pode ser mais estável para desenvolvimento na mesma rede Wi-Fi
const LOCAL_IP = '192.168.100.18';

export const API_CONFIG = {
    BASE_URL: `http://${LOCAL_IP}:8000`, // Usando o IP local na porta 8000
    ENDPOINTS: {
        LOGIN: '/api/login',
        REGISTER: '/api/register',
        WORKOUTS: '/api/workouts',
        // Adicione outros endpoints aqui
    }
};

export const getApiUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS) => {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
};
