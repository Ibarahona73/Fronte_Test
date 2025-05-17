import React, { useState } from 'react';
import Swal from 'sweetalert2';

// Componente de Login
export function Login() {
  // Estados para usuario y contraseña
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  // Maneja el envío del formulario de login
  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí va la lógica de autenticación (simulada con SweetAlert2)
    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido!',
      text: 'Login simulado',
    });
  };

  return (
    <div style={{
      display: 'flex',
      height: '90vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff'
    }}>
      {/* Lado Izquierdo: Logo y Slogan */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Logo de UTH Florida */}
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTq2pwE1N4DauKGIcLHrcj30esYCiIxXkJHaA&s"
          alt="UTH Florida"
          style={{ width: 120, marginBottom: 20 }}
        />
        {/* Nombre de la universidad */}
        <h1 style={{ fontWeight: 'bold', marginBottom: 10 }}>UTH FLORIDA</h1>
        {/* Slogan */}
        <p style={{ textAlign: 'center', maxWidth: 200 }}>
          Un clic a distancia
        </p>
      </div>

      {/* Lado Derecho: Formulario de Login */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <form
          onSubmit={handleSubmit}
          style={{
            border: '2px solid #222',
            borderRadius: 20,
            padding: 40,
            minWidth: 350,
            boxShadow: '0 2px 8px #eee',
            background: '#fff'
          }}
        >
          {/* Icono de usuario */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 48 }}>👤</span>
          </div>
          {/* Input de usuario/correo */}
          <input
            type="text"
            placeholder="Usuario o Correo"
            value={user}
            onChange={e => setUser(e.target.value)}
            style={{
              width: '100%',
              padding: 10,
              marginBottom: 15,
              border: '1.5px solid #222',
              borderRadius: 4
            }}
            required
          />
          {/* Input de contraseña */}
          <input
            type="password"
            placeholder="Contraseña"
            value={pass}
            onChange={e => setPass(e.target.value)}
            style={{
              width: '100%',
              padding: 10,
              marginBottom: 15,
              border: '1.5px solid #222',
              borderRadius: 4
            }}
            required
          />
          {/* Botón de ingresar */}
          <div style={{ textAlign: 'center', marginBottom: 15 }}>
            <button
              type="submit"
              style={{
                padding: '8px 24px',
                background: '#fff',
                border: '2px solid #222',
                borderRadius: 4,
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Ingresar
            </button>
          </div>
          {/* Enlace para recuperar contraseña */}
          <div style={{ textAlign: 'center' }}>
            <a href="#" style={{ color: '#1976d2', fontSize: 14 }}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;