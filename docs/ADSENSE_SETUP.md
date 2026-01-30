# Configuración de Google AdSense - Próximos Pasos

## ✅ Completado

Tu Publisher ID ya está configurado:
- **Publisher ID:** `ca-pub-7796615370362618`
- **Archivo:** `index.html` ✅
- **Variables de entorno:** `.env` ✅

---

## 📋 Próximos Pasos

### 1. Crear Unidades de Anuncio

Ve al **Dashboard de Google AdSense**:
1. Inicia sesión en https://adsense.google.com
2. Ve a **Anuncios** → **Por unidad de anuncio**
3. Click en **"Nueva unidad de anuncio"**

### 2. Crear Primera Unidad (Sidebar)

**Configuración:**
- **Nombre:** `Ruta Segura - Sidebar`
- **Tipo:** Display ads
- **Tamaño:** Responsive
- **Formato:** Vertical o cuadrado

**Después de crear:**
1. Copia el **ID de la unidad** (ej: `1234567890`)
2. Pégalo en `.env`:
   ```
   VITE_ADSENSE_SLOT_SIDEBAR=1234567890
   ```

### 3. Crear Segunda Unidad (Bottom - Opcional)

**Configuración:**
- **Nombre:** `Ruta Segura - Bottom`
- **Tipo:** Display ads
- **Tamaño:** Responsive
- **Formato:** Horizontal

**Después de crear:**
1. Copia el **ID de la unidad**
2. Pégalo en `.env`:
   ```
   VITE_ADSENSE_SLOT_BOTTOM=0987654321
   ```

---

## 🚀 Activar Anuncios

### En Desarrollo (Local)

Por defecto, los anuncios NO se muestran en desarrollo. Para verlos:

1. Edita `.env`:
   ```
   VITE_SHOW_ADS_IN_DEV=true
   ```

2. Reinicia el servidor:
   ```bash
   npm run dev
   ```

### En Producción (Vercel)

Los anuncios se mostrarán automáticamente cuando:

1. **Configures las variables de entorno en Vercel:**
   - Ve a tu proyecto en Vercel
   - Settings → Environment Variables
   - Agrega:
     ```
     VITE_ADSENSE_PUBLISHER_ID=ca-pub-7796615370362618
     VITE_ADSENSE_SLOT_SIDEBAR=TU_SLOT_ID
     VITE_ADSENSE_SLOT_BOTTOM=TU_SLOT_ID
     VITE_DEV_MODE=false
     ```

2. **Redeploy:**
   - Vercel desplegará automáticamente con los anuncios activos

---

## ⏱️ Tiempo de Activación

> [!NOTE]
> Los anuncios pueden tardar **24-48 horas** en aparecer después de:
> - Crear las unidades de anuncio
> - Desplegar a producción
> - Verificar tu sitio en AdSense

Durante este tiempo, verás espacios en blanco o mensajes de "Anuncio no disponible".

---

## 🔍 Verificar que Funciona

### En el Navegador

1. Abre tu sitio en producción
2. Abre DevTools (F12)
3. Ve a la pestaña **Console**
4. Busca mensajes de AdSense (no debe haber errores)

### En AdSense Dashboard

1. Ve a **Informes** en AdSense
2. Verifica que aparezcan impresiones
3. Puede tardar 24-48 horas en mostrar datos

---

## ⚠️ Troubleshooting

### No veo anuncios en producción

**Posibles causas:**
1. Las unidades de anuncio son nuevas (espera 24-48h)
2. Tu sitio aún no está verificado en AdSense
3. Las variables de entorno no están configuradas en Vercel
4. AdBlocker está activo en tu navegador

**Solución:**
- Verifica las variables de entorno en Vercel
- Desactiva AdBlocker temporalmente
- Espera 24-48 horas
- Revisa la consola del navegador por errores

### Error: "AdSense code not found"

**Solución:**
- Verifica que el script esté en `index.html`
- Asegúrate de que el Publisher ID sea correcto
- Redeploy la aplicación

### Los anuncios se ven mal

**Solución:**
- Usa unidades de anuncio **Responsive**
- Verifica el CSS del contenedor
- Asegúrate de que el componente `AdSenseUnit` tenga espacio suficiente

---

## 📊 Optimización

### Mejores Prácticas

1. **Ubicación:**
   - Sidebar: Buena visibilidad sin ser intrusivo
   - Bottom: Después del contenido principal

2. **Tamaño:**
   - Usa anuncios responsive
   - Evita tamaños fijos

3. **Cantidad:**
   - No sobrecargues con anuncios
   - 2-3 unidades por página es óptimo

4. **Rendimiento:**
   - Los anuncios se cargan de forma asíncrona
   - No afectan la velocidad de carga

---

## 📧 Soporte

Si tienes problemas:
1. Revisa la **Consola de AdSense** para errores
2. Verifica la **Consola del navegador** (F12)
3. Consulta la [Ayuda de AdSense](https://support.google.com/adsense)

---

**¡Listo!** Una vez que crees las unidades de anuncio y las configures en Vercel, los anuncios empezarán a mostrarse en tu sitio.
