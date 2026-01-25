# Ruta Segura

Aplicación web para planificar viajes seguros en México con datos oficiales de criminalidad del SESNSP.

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build de Producción

```bash
# Crear build optimizado
npm run build

# Preview del build
npm run preview
```

## 📋 Características

- 🗺️ **Mapas Interactivos** - Visualización de rutas con Leaflet
- 📊 **Datos SESNSP** - Estadísticas oficiales de criminalidad
- 🎯 **Análisis de Riesgo** - Evaluación de seguridad por segmentos de ruta
- 💰 **Google AdSense** - Sistema de monetización integrado
- 📧 **Formulario de Contacto** - Comunicación directa con usuarios
- 📱 **Responsive Design** - Funciona en móvil, tablet y desktop

## 🔧 Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
# Google AdSense
VITE_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
VITE_ADSENSE_SLOT_SIDEBAR=XXXXXXXXXX
VITE_ADSENSE_SLOT_BOTTOM=XXXXXXXXXX

# Contacto
VITE_CONTACT_EMAIL=tu@email.com

# Configuración
VITE_DEV_MODE=true
VITE_SHOW_ADS_IN_DEV=false
```

## 📚 Documentación

- [Guía de Deployment](docs/DEPLOYMENT_GUIDE.md) - Cómo desplegar en producción
- [Guía de Datos SESNSP](docs/SESNSP_DATA_GUIDE.md) - Actualización de datos de criminalidad

## 🛠️ Stack Tecnológico

- **React 18** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Leaflet** - Mapas interactivos
- **OSRM** - Cálculo de rutas
- **FormSubmit.co** - Servicio de email

## 📦 Estructura del Proyecto

```
ruta-segura/
├── src/
│   ├── components/      # Componentes React
│   ├── services/        # Lógica de negocio
│   ├── data/           # Datos estáticos
│   └── utils/          # Utilidades
├── docs/               # Documentación
└── public/             # Assets estáticos
```

## 🚀 Deployment

### Vercel (Recomendado)

1. Sube tu código a GitHub
2. Importa en Vercel
3. Configura variables de entorno
4. Deploy automático

Ver [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) para más opciones.

## 📊 Datos SESNSP

Los datos de criminalidad provienen del Secretariado Ejecutivo del Sistema Nacional de Seguridad Pública (SESNSP).

**Actualización:** Mensualmente  
**Fuente:** https://datos.gob.mx

Ver [SESNSP_DATA_GUIDE.md](docs/SESNSP_DATA_GUIDE.md) para instrucciones de actualización.

## 📧 Contacto

Para soporte o consultas: Stonekolbewebservices@gmail.com

## 📄 Licencia

Este proyecto es de código abierto para fines educativos.

---

**Desarrollado con ❤️ para viajes más seguros en México**
