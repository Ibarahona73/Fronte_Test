import { useEffect } from 'react';
import * as Ably from 'ably';

export function useStockRealtimeUpdater(onStockUpdate) {
    useEffect(() => {
        const ably = new Ably.Realtime('qZLZMg.GvMK6Q:qaQcoQyJSX2q7Gl4TFi-HV2Vj1NMnjltCM4e_JoUJgc');
        const channel = ably.channels.get('stock-updates');

        channel.subscribe('actualizacion', (message) => {
            const { producto_id, nuevo_stock } = message.data;
            onStockUpdate(producto_id, nuevo_stock);
        });

        return () => {
            channel.unsubscribe();
            ably.close();
        };
    }, [onStockUpdate]);
}