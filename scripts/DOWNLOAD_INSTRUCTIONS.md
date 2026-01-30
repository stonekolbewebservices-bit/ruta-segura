# Instrucciones para Descargar Datos del SESNSP

## 📥 Paso a Paso

### 1. Ir al Portal de Datos Abiertos

Ve a: **https://datos.gob.mx**

### 2. Buscar los Datos

En el buscador, escribe:
```
SESNSP incidencia delictiva municipal
```

O busca directamente:
```
Incidencia Delictiva del Fuero Común (cifras mensuales)
```

### 3. Encontrar el Dataset Correcto

Busca el dataset que diga:
- **"Incidencia Delictiva Municipal"**
- **Fuente:** SESNSP (Secretariado Ejecutivo del Sistema Nacional de Seguridad Pública)
- **Formato:** CSV

### 4. Descargar el Archivo

1. Click en el dataset
2. Busca la sección de **"Recursos"** o **"Descargas"**
3. Descarga el archivo CSV más reciente (ejemplo: `IDM_NM_dic2025.csv`)
   - **IDM** = Incidencia Delictiva Municipal
   - **NM** = Nivel Municipal
   - **dic2025** = Diciembre 2025 (mes más reciente)

### 5. Guardar el Archivo

Guarda el archivo descargado como:
```
scripts/data/sesnsp_raw.csv
```

**Importante:** El nombre debe ser exactamente `sesnsp_raw.csv`

### 6. Verificar el Archivo

Abre el CSV y verifica que tenga estas columnas:
- Año
- Entidad
- Municipio
- Tipo de delito
- Subtipo de delito
- Enero, Febrero, Marzo... Diciembre (meses)

---

## 🔗 Enlaces Directos

**Portal Principal:**
https://datos.gob.mx

**Búsqueda Directa:**
https://datos.gob.mx/busca/dataset?q=sesnsp+incidencia+delictiva

**Dataset Específico (puede cambiar):**
https://datos.gob.mx/busca/dataset/incidencia-delictiva-municipal

---

## ⚠️ Notas Importantes

- El SESNSP publica datos nuevos **cada mes**
- Los datos suelen tener un retraso de 1-2 meses
- El archivo CSV puede ser grande (varios MB)
- Asegúrate de descargar el archivo **más reciente**

---

## 🆘 ¿Problemas para Descargar?

### El enlace no funciona
- El portal puede cambiar de estructura
- Busca manualmente en datos.gob.mx
- Busca "SESNSP" o "incidencia delictiva"

### No encuentro el archivo CSV
- Algunos datasets tienen múltiples formatos
- Busca específicamente el formato **CSV**
- Evita archivos Excel (.xlsx) o PDF

### El archivo es muy grande
- Es normal, puede ser de 50-100 MB
- Asegúrate de tener espacio suficiente
- La descarga puede tardar varios minutos

---

## ✅ Siguiente Paso

Una vez descargado el CSV, ejecuta:

```bash
npm run update-sesnsp
```

Esto procesará automáticamente los datos y actualizará la aplicación.
