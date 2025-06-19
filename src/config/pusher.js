import Pusher from 'pusher-js';

// Configuración de Pusher
export const PUSHER_CONFIG = {
  key: 'qZLZMg.GvMK6Q',
  cluster: 'us2',
  encrypted: true,
  authEndpoint: '/pusher/auth/',
  auth: {
    headers: {
      'X-CSRFToken': getCookie('csrftoken')
    }
  }
};

// Helper para obtener cookies
function getCookie(name) {
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
      encrypted: PUSHER_CONFIG.encrypted,
      authEndpoint: PUSHER_CONFIG.authEndpoint,
      auth: PUSHER_CONFIG.auth
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