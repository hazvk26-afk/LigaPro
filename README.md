# LigaPro Manager

Plataforma oficial integrada para la gestión del campeonato de fútbol ecuatoriano, que conecta a hinchas con estadísticas en tiempo real y ofrece a los administradores herramientas de control reglamentario, programación de partidos y disciplina en la nube.

---

## 🚀 Arquitectura y Tecnologías
- **Frontend:** React, TypeScript, Vite.
- **Estilos:** TailwindCSS (v4) con la paleta de colores corporativos del sistema de diseño **"LigaPro Elite"**.
- **Backend y Base de Datos:** **Supabase** (PostgreSQL) con políticas de seguridad RLS, índices de rendimiento y triggers PL/pgSQL para la automatización disciplinaria.
- **Control de Versiones:** Repositorio en GitHub integrado.

---

## 📂 Estructura del Repositorio
- `/app`: Código fuente del cliente web en React.
- `schema.sql`: DDL estructural de base de datos normalizado (Tablas, RLS, Triggers).
- `seed.sql`: Datos semilla iniciales del campeonato (Series, Clubes, Estadios, Jugadores y Partidos).
- `SRS_LigaPro_Manager.md`: Especificación formal de requisitos del proyecto.

---

## 🛠️ Instrucciones de Ejecución Local

1. **Instalar dependencias:**
   ```bash
   cd app
   npm install
   ```

2. **Configuración de Variables de Entorno:**
   Crea o verifica el archivo `.env` en la raíz de la carpeta `/app` con tus claves:
   ```env
   VITE_SUPABASE_URL=https://dqhjpswxbibylzfphcoo.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

---

## ☁️ Configuración de Supabase

Para recrear el backend en tu proyecto de Supabase:
1. Ve a la pestaña **SQL Editor** en tu Supabase Dashboard.
2. Abre un query, copia el contenido de `schema.sql` y ejecútalo (**Run**).
3. Abre otro query, copia el contenido de `seed.sql` y ejecútalo (**Run**).
