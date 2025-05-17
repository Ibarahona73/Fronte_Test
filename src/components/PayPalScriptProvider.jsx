// Este componente envuelve a los componentes hijos con el contexto de PayPal
// para habilitar los botones y funcionalidades de PayPal en la aplicación.
// El "client-id" es necesario para autenticar con PayPal.
// La opción debug: true activa el modo de depuración para desarrollo.

<PayPalScriptProvider options={{ 
    "client-id": "AU0_-KUk48ey1OZO6-E6LtGWurwOqweHGaVjZ7O7Ko4nOVbD9aZ1g7kjBPN7qkpBJGZKxOv4nXDDFl3X",  
    debug: true  
}}>
    {/* Aquí irían los componentes hijos que requieren acceso a PayPal */}
</PayPalScriptProvider>