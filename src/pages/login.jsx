import React, { useState } from 'react';
import Swal from 'sweetalert2';

export function Login() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí va la lógica de autenticación
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
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTq2pwE1N4DauKGIcLHrcj30esYCiIxXkJHaA&s"
          alt="UTH Florida"
          style={{ width: 120, marginBottom: 20 }}
        />
        <h1 style={{ fontWeight: 'bold', marginBottom: 10 }}>UTH FLORIDA</h1>
        <p style={{ textAlign: 'center', maxWidth: 200 }}>
          Un clic a distancia
        </p>
      </div>

      {/* Lado Derecho: Login */}
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
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 48 }}>👤</span>
          </div>
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