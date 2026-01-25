# Guía Paso a Paso: Subir Código a GitHub

## 📋 Pasos a Seguir

### 1️⃣ Crear un Repositorio en GitHub

1. Ve a https://github.com
2. Inicia sesión con tu cuenta
3. Click en el botón **"+"** (arriba a la derecha) → **"New repository"**
4. Configuración del repositorio:
   - **Repository name**: `ruta-segura` (o el nombre que prefieras)
   - **Description**: "Aplicación para planificar viajes seguros en México"
   - **Public** o **Private** (tu elección)
   - ❌ **NO** marques "Add a README file" (ya tienes uno)
   - ❌ **NO** marques "Add .gitignore" (ya tienes uno)
5. Click en **"Create repository"**

GitHub te mostrará una página con instrucciones. **Guarda esa página abierta** - la necesitaremos.

---

### 2️⃣ Comandos para Subir el Código

Ahora ejecuta estos comandos en orden. Te los proporcionaré uno por uno.

#### Paso A: Inicializar Git
```bash
cd C:\Users\isai_\.gemini\antigravity\scratch\ruta-segura
git init
```

#### Paso B: Configurar Git (si es tu primera vez)
```bash
git config --global user.name "TU_NOMBRE"
git config --global user.email "TU_EMAIL@ejemplo.com"
```
**Nota:** Usa el mismo email de tu cuenta de GitHub.

#### Paso C: Agregar todos los archivos
```bash
git add .
```

#### Paso D: Crear el primer commit
```bash
git commit -m "Initial commit - Ruta Segura con SESNSP, AdSense y Contacto"
```

#### Paso E: Renombrar rama a main
```bash
git branch -M main
```

#### Paso F: Conectar con GitHub
```bash
git remote add origin https://github.com/TU_USUARIO/ruta-segura.git
```
**⚠️ IMPORTANTE:** Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.

#### Paso G: Subir el código
```bash
git push -u origin main
```

**Nota:** Te pedirá autenticación. Opciones:
- **Opción 1:** Usar GitHub Desktop (más fácil)
- **Opción 2:** Usar Personal Access Token (más técnico)

---

### 3️⃣ Autenticación con GitHub

#### Opción A: GitHub Desktop (Recomendado - Más Fácil)

1. Descarga GitHub Desktop: https://desktop.github.com
2. Instala y abre GitHub Desktop
3. Inicia sesión con tu cuenta de GitHub
4. File → Add Local Repository
5. Selecciona la carpeta: `C:\Users\isai_\.gemini\antigravity\scratch\ruta-segura`
6. Click en "Publish repository"
7. ¡Listo! Tu código está en GitHub

#### Opción B: Personal Access Token (Línea de Comandos)

Si prefieres usar la terminal:

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Nombre: "Ruta Segura Deploy"
4. Permisos: Marca **"repo"** (todos los sub-items)
5. Click "Generate token"
6. **COPIA EL TOKEN** (solo se muestra una vez)
7. Cuando `git push` pida contraseña, pega el token

---

### 4️⃣ Verificar que Funcionó

1. Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/ruta-segura`
2. Deberías ver todos tus archivos
3. Verifica que estén:
   - ✅ `src/` (carpeta con código)
   - ✅ `package.json`
   - ✅ `README.md`
   - ✅ `vercel.json`
   - ❌ `node_modules/` (NO debe estar - está en .gitignore)
   - ❌ `.env` (NO debe estar - está en .gitignore)

---

## 🚀 Siguiente Paso: Deploy en Vercel

Una vez que tu código esté en GitHub:

1. Ve a https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Autoriza Vercel
4. Click "New Project"
5. Importa tu repositorio `ruta-segura`
6. Vercel detectará automáticamente que es un proyecto Vite
7. Configura variables de entorno (ver abajo)
8. Click "Deploy"

### Variables de Entorno en Vercel:

```
VITE_CONTACT_EMAIL=Stonekolbewebservices@gmail.com
VITE_DEV_MODE=false
VITE_EMAIL_SERVICE=formsubmit
VITE_SHOW_ADS_IN_DEV=false
```

(AdSense se puede agregar después)

---

## ❓ Problemas Comunes

### "fatal: not a git repository"
- Asegúrate de estar en la carpeta correcta: `cd C:\Users\isai_\.gemini\antigravity\scratch\ruta-segura`

### "remote origin already exists"
- Ejecuta: `git remote remove origin`
- Luego vuelve a ejecutar: `git remote add origin https://github.com/TU_USUARIO/ruta-segura.git`

### "Authentication failed"
- Usa GitHub Desktop (opción más fácil)
- O genera un Personal Access Token

### "Permission denied"
- Verifica que el nombre de usuario en la URL sea correcto
- Asegúrate de tener permisos en el repositorio

---

## 📞 ¿Necesitas Ayuda?

Si encuentras algún error, copia el mensaje de error completo y te ayudo a resolverlo.

---

**¡Estás a solo unos comandos de tener tu app en la nube! 🚀**
