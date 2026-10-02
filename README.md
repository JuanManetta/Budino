# 🥐 Budino · Dashboard de Ventas & Pastelería Artesanal

Aplicación web mobile-first desarrollada a medida para el control de ventas diarios, gestión de catálogo de productos, cálculo automático de recaudación y visualización en calendario interactivo. Diseñada con una estética cálida y artesanal.

---

## ✨ Características Principales

- 🔐 **Acceso Privado:** Pantalla de autenticación con contraseña protegida mediante `localStorage` para uso exclusivo.
- 📊 **Resumen y Métricas (KPIs):** Visualización instantánea de la recaudación del día, semana y mes.
- ⚡ **Registro Rápido Inteligente:** Al seleccionar un producto y cambiar la cantidad, la app calcula y multiplica automáticamente el precio total basándose en los datos de la base de datos.
- 📅 **Calendario Interactivo:** 
  - Visualización dinámica del mes actual con navegación entre meses.
  - Marcado automático de días con ventas e indicadores visuales de recaudación (ej. `$5k`).
  - Panel desplegable con el detalle completo de las ventas al hacer clic en cualquier día.
- 📦 **Gestión de Catálogo (CRUD):** Permite añadir nuevos productos (nombre, peso/tamaño y precio base), editarlos o eliminarlos en tiempo real.
- 📈 **Mix de Productos:** Porcentajes de salida y proporción de ventas por variedad y tamaño de budines.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React + Vite
- **Estilos:** CSS Puro / Tradicional (Diseño *aesthetic* y responsive optimizado para celular)
- **Iconos:** Lucide React
- **Base de Datos & Backend:** Supabase (PostgreSQL con Row Level Security activo)