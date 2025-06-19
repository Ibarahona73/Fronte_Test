import { useEffect } from 'react';
import { getPusherInstance } from '../config/pusher';

export const usePusherDebug = () => {
  useEffect(() => {
    const pusher = getPusherInstance();
    
    // Debug de conexión
    const handleConnectionStateChange = (stateChange) => {
      console.log('Pusher connection state changed:', {
        current: stateChange.current,
        previous: stateChange.previous,
        reason: stateChange.reason
      });
    };

    // Debug de eventos
    const handleEvent = (eventName, data) => {
      console.log('Pusher event received:', { eventName, data });
    };

    // Suscribirse a eventos de debug
    pusher.connection.bind('state_change', handleConnectionStateChange);
    
    // Suscribirse al canal de debug
    const debugChannel = pusher.subscribe('stock-updates');
    debugChannel.bind_global(handleEvent);

    return () => {
      pusher.connection.unbind('state_change', handleConnectionStateChange);
      debugChannel.unbind_global(handleEvent);
      pusher.unsubscribe('stock-updates');
    };
  }, []);
}; 