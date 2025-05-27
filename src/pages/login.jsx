import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { loginUser } from '../api/datos.api'; // Asegúrate que la ruta sea correcta
import { useAuth } from '../components/AuthenticationContext'; // Asegúrate que la ruta sea correcta
import { useNavigate } from 'react-router-dom'; // Para redirigir después del login

// Componente de Login
export function Login() {
  // Estados para usuario (correo) y contraseña
  const [email, setEmail] = useState(''); // Cambiado a email para claridad
  const [password, setPassword] = useState(''); // Cambiado a password

  // Obtiene la función login del contexto de autenticación
  const { login } = useAuth();
  const navigate = useNavigate();


  // Maneja el envío del formulario de login
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Llama a la función loginUser de tu API
      const userData = await loginUser(email, password);
            

      if(!userData)
      {
        Swal.fire({        
        icon: 'error',
        title: 'Error',
        text: error.error || 'No se encontro el estudiante. favor, verifica tu correo y contraseña.'

        })
      }

      // Si el loginUser no lanzó un error (fue exitoso)
      // Llama a la función login del contexto para actualizar el estado de autenticación

      login(userData); // Pasa los datos del usuario si es necesario por el contexto
      

      // Muestra un mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Login exitoso',
        timer: 1500, // Opcional: cierra la alerta después de 1.5 segundos
        showConfirmButton: false
      }).then(() => {
          // Verifica si hay una ruta guardada para redirigir después del login
          const redirectPath = localStorage.getItem('redirectAfterLogin');
          if (redirectPath) {
              localStorage.removeItem('redirectAfterLogin'); // Limpia la ruta guardada
              navigate(redirectPath);
          } else {
              navigate('/'); // Si no hay ruta guardada, redirige al inicio
          }
      });

    } catch (error) {
      // Si loginUser lanzó un error (credenciales incorrectas, etc.)
      console.error("Error de login:", error); // Loggea el error para depuración

      // Muestra un mensaje de error con SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Error',
        // Usa el mensaje de error del backend si está disponible, sino uno genérico
        text: error.error || 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.',
      });
    }
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
            placeholder="Correo"
            value={email} // Usa el estado 'email'
            onChange={e => setEmail(e.target.value)} // Actualiza el estado 'email'
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
            value={password} // Usa el estado 'password'
            onChange={e => setPassword(e.target.value)} // Actualiza el estado 'password'
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