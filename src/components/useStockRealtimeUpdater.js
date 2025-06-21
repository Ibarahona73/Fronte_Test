import { useEffect, useRef, useCallback } from 'react';
import { getPusherInstance, cleanupPusher } from '../config/pusher';

let connectionAttempts = 0;
const MAX_RETRIES = 3;

const useStockRealtimeUpdater = (callback) => {
  const channelRef = useRef(null);
  const isMountedRef = useRef(true);
  const retryTimeoutRef = useRef(null);

  const setupPusher = useCallback(async () => {
    try {
      const pusher = getPusherInstance();

      // Esperar a que la conexión esté lista
      await new Promise((resolve, reject) => {
        if (pusher.connection.state === 'connected') {
          console.log('Pusher ya conectado');
          resolve();
          return;
        }

        const onConnected = () => {
          console.log('Pusher conectado exitosamente');
          pusher.connection.unbind('connected', onConnected);
          pusher.connection.unbind('error', onError);
          resolve();
        };

        const onError = (err) => {
          console.error('Error de conexión Pusher:', err);
          pusher.connection.unbind('connected', onConnected);
          pusher.connection.unbind('error', onError);
          // Mensaje de error más detallado
          const errorMessage = err?.error?.data?.message || err?.error?.data?.code || 'Razón desconocida';
          reject(new Error(`La conexión falló: ${errorMessage}`));
        };

        pusher.connection.bind('connected', onConnected);
        pusher.connection.bind('error', onError);
      });

      // Si llegamos aquí, la conexión está establecida
      if (!isMountedRef.current) return;

      // Suscribirse al canal de stock
      const channel = pusher.subscribe('stock-updates');
      channelRef.current = channel;

      console.log('Suscrito al canal stock-updates');

      // Escuchar eventos de actualización de stock
      channel.bind('stock-updated', (data) => {
        console.log('Evento stock-updated recibido:', data);
        if (isMountedRef.current && callback) {
          callback(data.producto_id, data.stock_actual);
        }
      });

      // Escuchar eventos de carrito
      channel.bind('carrito-updated', (data) => {
        console.log('Evento carrito-updated recibido:', data);
        if (isMountedRef.current && callback) {
          // Para eventos de carrito, usar stock_actual si está disponible
          const stockValue = data.stock_actual !== undefined ? data.stock_actual : data.nuevo_stock;
          callback(data.producto_id, stockValue);
        }
      });

      // Escuchar eventos generales de actualización
      channel.bind('actualizacion', (data) => {
        console.log('Evento actualizacion recibido:', data);
        if (isMountedRef.current && callback) {
          callback(data.producto_id, data.nuevo_stock);
        }
      });

      connectionAttempts = 0; // Resetear intentos al conectar exitosamente

    } catch (error) {
      console.error('Error al configurar Pusher:', error);
      
      // Intentar reconectar si no excedimos el máximo de intentos
      if (connectionAttempts < MAX_RETRIES && isMountedRef.current) {
        connectionAttempts++;
        console.log(`Reintentando conexión Pusher (${connectionAttempts}/${MAX_RETRIES})`);
        retryTimeoutRef.current = setTimeout(() => {
          setupPusher();
        }, 3000 * connectionAttempts); // Backoff exponencial
      }
    }
  }, [callback]);

  useEffect(() => {
    isMountedRef.current = true;
    console.log('Iniciando configuración de Pusher');
    setupPusher();

    return () => {
      console.log('Limpiando configuración de Pusher');
      isMountedRef.current = false;
      
      // Limpiar timeout de reconexión si existe
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      // Desuscribirse del canal
      if (channelRef.current) {
        channelRef.current.unbind_all();
        const pusher = getPusherInstance();
        pusher.unsubscribe('stock-updates');
        console.log('Desuscrito del canal stock-updates');
      }
    };
  }, [setupPusher]);

  return null;
};

export { cleanupPusher };
export default useStockRealtimeUpdater; 