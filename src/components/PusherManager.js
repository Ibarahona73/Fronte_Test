import React, { useEffect } from 'react';
import Pusher from 'pusher-js';

const PusherManager = ({ onEvent }) => {
  useEffect(() => {
    const pusher = new Pusher('4dbce86002977a403278', {
      cluster: 'us2',
      authEndpoint: '/pusher/auth/',  // Endpoint de autenticación en Django
      auth: {
        headers: {
          'X-CSRFToken': getCookie('csrftoken') // Necesario para Django CSRF
        }
      }
    });

    // Suscribirse a un canal público
    const channel = pusher.subscribe('mi-canal');
    
    // Escuchar eventos
    channel.bind('mi-evento', (data) => {
      onEvent(data);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [onEvent]);

  return null;
};

// Helper para obtener cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export default PusherManager;