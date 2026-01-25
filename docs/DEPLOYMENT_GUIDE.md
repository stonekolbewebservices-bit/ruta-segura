# Guía de Deployment - Ruta Segura

Esta guía te ayudará a desplegar tu aplicación Ruta Segura en producción.

## 📋 Pre-requisitos

Antes de desplegar, asegúrate de:

1. ✅ Haber probado la aplicación localmente
2. ✅ Tener tu Publisher ID de Google AdSense (opcional, puede agregarse después)
3. ✅ Verificar que el email de contacto esté configurado en `.env`

---

## 🚀 Opciones de Deployment

### Opción 1: Vercel (Recomendado - Más Fácil)

**Ventajas:**
- ✅ Deployment automático desde Git
- ✅ HTTPS gratuito
- ✅ CDN global
- ✅ Variables de entorno fáciles de configurar
- ✅ Dominio gratuito (.vercel.app)

#### Pasos:

1. **Crear cuenta en Vercel**
   - Ve a https://vercel.com
   - Regístrate con GitHub, GitLab o Bitbucket

2. **Subir tu código a GitHub** (si no lo has hecho)
   ```bash
   cd C:\Users\isai_\.gemini\antigravity\scratch\ruta-segura
   git init
   git add .
   git commit -m "Initial commit - Ruta Segura"
   ```
   
   Luego crea un repositorio en GitHub y súbelo:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/ruta-segura.git
   git push -u origin main
   ```

3. **Importar proyecto en Vercel**
   - Click en "New Project"
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Vite

4. **Configurar Variables de Entorno**
   - En la configuración del proyecto, ve a "Environment Variables"
   - Agrega:
     ```
     VITE_ADSENSE_PUBLISHER_ID=ca-pub-TU_ID_AQUI
     VITE_ADSENSE_SLOT_SIDEBAR=TU_SLOT_ID
     VITE_ADSENSE_SLOT_BOTTOM=TU_SLOT_ID
     VITE_CONTACT_EMAIL=Stonekolbewebservices@gmail.com
     VITE_DEV_MODE=false
     VITE_SHOW_ADS_IN_DEV=false
     VITE_EMAIL_SERVICE=formsubmit
     ```

5. **Deploy**
   - Click "Deploy"
   - Espera 1-2 minutos
   - ¡Listo! Tu app estará en `https://tu-proyecto.vercel.app`

6. **Actualizaciones automáticas**
   - Cada vez que hagas `git push`, Vercel desplegará automáticamente

---

### Opción 2: Netlify

**Ventajas:**
- ✅ Similar a Vercel
- ✅ Formularios integrados (alternativa a FormSubmit)
- ✅ HTTPS gratuito
- ✅ CDN global

#### Pasos:

1. **Crear cuenta en Netlify**
   - Ve a https://netlify.com
   - Regístrate con GitHub

2. **Subir código a GitHub** (igual que Vercel)

3. **Importar proyecto**
   - Click "New site from Git"
   - Conecta tu repositorio
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

4. **Variables de entorno**
   - Site settings → Environment variables
   - Agrega las mismas variables que en Vercel

5. **Deploy**
   - Click "Deploy site"
   - Tu app estará en `https://tu-proyecto.netlify.app`

---

### Opción 3: GitHub Pages (Gratuito)

**Ventajas:**
- ✅ Completamente gratuito
- ✅ Integrado con GitHub
- ✅ Fácil de configurar

**Desventajas:**
- ⚠️ No soporta variables de entorno del servidor
- ⚠️ Requiere configuración adicional para SPAs

#### Pasos:

1. **Instalar gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Actualizar package.json**
   Agrega:
   ```json
   {
     "homepage": "https://TU_USUARIO.github.io/ruta-segura",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Actualizar vite.config.js**
   ```javascript
   export default defineConfig({
     plugins: [react()],
     base: '/ruta-segura/'
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Configurar GitHub Pages**
   - Ve a tu repositorio en GitHub
   - Settings → Pages
   - Source: `gh-pages` branch
   - Tu app estará en `https://TU_USUARIO.github.io/ruta-segura`

**Nota:** Para variables de entorno, tendrás que hardcodearlas en el build o usar un servicio de configuración remota.

---

### Opción 4: Servidor Propio (VPS)

Si tienes un servidor (DigitalOcean, AWS, etc.):

#### Pasos:

1. **Build de producción**
   ```bash
   npm run build
   ```

2. **Subir carpeta `dist` a tu servidor**
   ```bash
   scp -r dist/* usuario@tu-servidor:/var/www/ruta-segura
   ```

3. **Configurar Nginx**
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;
       root /var/www/ruta-segura;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **SSL con Let's Encrypt**
   ```bash
   sudo certbot --nginx -d tu-dominio.com
   ```

---

## 🔧 Configuración Post-Deployment

### 1. Google AdSense

Una vez desplegado:

1. **Verifica tu sitio en AdSense**
   - Agrega tu dominio en la consola de AdSense
   - Espera la aprobación (puede tomar días/semanas)

2. **Actualiza el Publisher ID**
   - En Vercel/Netlify: Actualiza las variables de entorno
   - En GitHub Pages: Actualiza `.env` y reconstruye
   - En servidor propio: Actualiza `.env` y reconstruye

3. **Crea unidades de anuncio**
   - En el dashboard de AdSense
   - Copia los IDs de las unidades
   - Actualiza `VITE_ADSENSE_SLOT_SIDEBAR` y `VITE_ADSENSE_SLOT_BOTTOM`

### 2. FormSubmit.co

**Primera vez:**
1. Envía un mensaje de prueba desde tu sitio en producción
2. Revisa el email en `Stonekolbewebservices@gmail.com`
3. Confirma el email de verificación de FormSubmit
4. Los siguientes mensajes llegarán automáticamente

**Opcional - Configuración avanzada:**
Puedes agregar parámetros adicionales en `ContactModal.jsx`:
```javascript
_captcha: 'false',        // Sin captcha
_template: 'table',       // Formato de tabla
_next: 'https://tu-sitio.com/gracias'  // Página de redirección
```

### 3. Dominio Personalizado

#### En Vercel:
1. Settings → Domains
2. Agrega tu dominio
3. Configura DNS según las instrucciones

#### En Netlify:
1. Domain settings → Add custom domain
2. Configura DNS

---

## 📊 Monitoreo y Analytics

### Google Analytics (Opcional)

1. **Crear propiedad en Google Analytics**
   - Ve a https://analytics.google.com
   - Crea una nueva propiedad

2. **Agregar script a index.html**
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

---

## 🔒 Seguridad

### Headers de Seguridad

En Vercel, crea `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 📝 Checklist de Deployment

- [ ] Código subido a GitHub
- [ ] Variables de entorno configuradas
- [ ] Build de producción exitoso (`npm run build`)
- [ ] Sitio desplegado y accesible
- [ ] HTTPS funcionando
- [ ] Formulario de contacto probado
- [ ] Email de confirmación de FormSubmit verificado
- [ ] AdSense configurado (cuando esté aprobado)
- [ ] Dominio personalizado configurado (opcional)
- [ ] Analytics configurado (opcional)

---

## 🆘 Troubleshooting

### Error: "Failed to load module"
- Verifica que `base` en `vite.config.js` esté correcto
- Para Vercel/Netlify: `base: '/'`
- Para GitHub Pages: `base: '/nombre-repo/'`

### AdSense no muestra anuncios
- Verifica que el Publisher ID sea correcto
- Espera 24-48 horas después del deployment
- Revisa la consola del navegador por errores
- Asegúrate de que `VITE_DEV_MODE=false`

### Formulario de contacto no envía
- Verifica que el email esté correcto en `.env`
- Confirma el email de verificación de FormSubmit
- Revisa la carpeta de spam
- Verifica la consola del navegador por errores CORS

### Rutas no funcionan (404)
- Configura redirects para SPA
- En Vercel: automático
- En Netlify: crea `public/_redirects`:
  ```
  /*    /index.html   200
  ```

---

## 🎯 Recomendación Final

**Para comenzar:** Usa **Vercel** - es la opción más fácil y rápida.

1. Sube tu código a GitHub
2. Conecta con Vercel
3. Configura variables de entorno
4. Deploy en 2 minutos

**Costo:** $0 (plan gratuito es más que suficiente)

---

## 📞 Soporte

Si encuentras problemas:
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com
- FormSubmit: https://formsubmit.co/help

¡Buena suerte con tu deployment! 🚀
