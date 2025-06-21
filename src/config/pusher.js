import Pusher from 'pusher-js';

// Configuración de Pusher
export const PUSHER_CONFIG = {
  key: '4dbce86002977a403278',
  cluster: 'us2',
  forceTLS: true,
  enabledTransports: ['ws', 'wss', 'xhr_streaming', 'xhr_polling']
};

// Helper para obtener cookies
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Instancia global de Pusher
let globalPusherInstance = null;

export const getPusherInstance = () => {
  if (!globalPusherInstance) {
    globalPusherInstance = new Pusher(PUSHER_CONFIG.key, {
      cluster: PUSHER_CONFIG.cluster,
      forceTLS: PUSHER_CONFIG.forceTLS,
      enabledTransports: PUSHER_CONFIG.enabledTransports
    });
  }
  return globalPusherInstance;
};

export const cleanupPusher = () => {
  if (globalPusherInstance) {
    globalPusherInstance.disconnect();
    globalPusherInstance = null;
  }
};

export default getPusherInstance; 