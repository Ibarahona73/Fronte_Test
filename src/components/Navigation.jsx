import { Link } from "react-router-dom";

export function Navigation(){
    return(

        
        <div>
        <Link to={"/Ventas"}> {/* Despliegue de datos  */}
        <h1>Historial de Ventas</h1> 
        </Link>
        
        
        <Link to={"/VentasCreate"}>Crear Tarea</Link> {/* Formulario Crear */}

        {/*
          TareasF es como decir Tarea-Create, el formulario 
      */}
         

        </div>
    )
}

