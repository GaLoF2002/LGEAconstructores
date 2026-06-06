# CalendarREACT - Proyecto Capstone

Este repositorio contiene una aplicación web desarrollada con el stack **MERN** (MongoDB, Express, React, Node.js) utilizando el patrón de diseño **MVC (Modelo-Vista-Controlador)**, con el objetivo de garantizar una arquitectura escalable, mantenible y eficiente tanto en el lado del servidor como del cliente.

## 🧩 Descripción General

**CalendarREACT** es una solución full-stack que divide correctamente las responsabilidades en capas:

- **Backend** (carpeta `server/`) gestionado con Express y Node.js.
- **Frontend** (carpeta `client/`) desarrollado con React y Vite para una interfaz moderna y de alto rendimiento.
- Integración de herramientas de pruebas, entorno configurado con archivos `.env`, y estructura modular para controladores, servicios, middlewares y modelos.

Esta estructura fue diseñada para garantizar una separación clara entre las responsabilidades de la aplicación, permitiendo que los endpoints, la lógica de negocio y el acceso a datos estén desacoplados y organizados adecuadamente.

## 🏗️ Arquitectura y Organización

### Backend (`/server`)

- `config/` → Configuración de variables de entorno y base de datos.
- `controllers/` → Controladores para manejar la lógica de las rutas.
- `middlewares/` → Middlewares como autenticación.
- `models/` → Modelos Mongoose que definen los esquemas de datos.
- `routes/` → Rutas de la API, organizadas por recursos.
- `services/` → Capa de lógica de negocio reutilizable.
- `uploads/` → Gestión de archivos.
- `server.js` → Archivo principal del servidor.
- `verificaEnv.js` → Verificación de variables críticas de entorno.

### Frontend (`/client`)

- `src/components/` → Componentes reutilizables de interfaz.
- `src/pages/` → Vistas por ruta.
- `src/context/` → Contextos para manejo global de estado.
- `src/services/` → Llamadas a la API backend.
- `src/assets/` → Archivos estáticos como imágenes y estilos.
- `main.jsx` y `App.jsx` → Entrada principal y componente raíz.

## ⚙️ Tecnologías y Herramientas

- **MongoDB + Mongoose**: Base de datos NoSQL flexible y potente.
- **Express.js**: Framework ligero y minimalista para crear APIs REST.
- **Node.js**: Entorno para ejecutar JavaScript en el servidor.
- **React.js**: Librería moderna para construir interfaces reactivas.
- **Vite**: Empaquetador ultrarrápido utilizado en lugar de Webpack por su eficiencia en desarrollo y tiempos de recarga.
- **Yarn**: Gestor de paquetes utilizado por su rapidez y control preciso de dependencias (en lugar de npm).
- **Cypress**: Pruebas end-to-end para asegurar la calidad de la aplicación.
- **Jest**: Configurado para pruebas unitarias en el backend.

## 🚀 Beneficios del uso de Vite y Yarn

- **Vite** permite una experiencia de desarrollo mucho más rápida que herramientas tradicionales como Webpack, gracias a su servidor de desarrollo basado en ESModules y su construcción altamente optimizada.
- **Yarn** ofrece una gestión de dependencias más eficiente, segura y rápida, lo cual es fundamental en proyectos colaborativos y de gran escala.

## 🧪 Pruebas

El proyecto cuenta con pruebas:

- **Backend**: con Jest.
- **Frontend**: pruebas E2E con Cypress.
  
Estas herramientas garantizan la robustez del sistema y ayudan a prevenir regresiones.

## 🛠️ Configuración del Proyecto

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/CalendarREACT.git
2. Instalar dependencias
   cd client or cd server
     ```bash
   yarn install
  Configurar archivos .env tanto en server/ como en client/.
  Levantar el proyecto en desarrollo:
  ```bash
   yarn dev


