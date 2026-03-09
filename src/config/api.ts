/**
 * Configuração central da API.
 * 
 * Se estiver usando um dispositivo físico com Expo + Tunnel:
 * 1. Rode o backend (php artisan serve).
 * 2. Rode o tunnel do backend (ex: ngrok http 8000).
 * 3. Copie a URL gerada e cole em BASE_URL abaixo.
 */

// URL temporária do seu tunnel
const TUNNEL_URL = 'https://ready-sloths-sin.loca.lt';

export const API_CONFIG = {
    BASE_URL: TUNNEL_URL,
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
