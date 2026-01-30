# Scripts de Actualización de Datos SESNSP

Este directorio contiene scripts para actualizar los datos de criminalidad desde el SESNSP.

## 📥 Cómo Actualizar los Datos

### Paso 1: Descargar el CSV

1. Ve a **https://datos.gob.mx**
2. Busca: **"SESNSP incidencia delictiva municipal"**
3. Descarga el archivo CSV más reciente (ej: `IDM_NM_dic2025.csv`)
4. Guárdalo como: `scripts/data/sesnsp_raw.csv`

### Paso 2: Procesar los Datos

```bash
npm run update-sesnsp
```

Este comando:
- ✅ Lee el CSV descargado
- ✅ Agrega los datos por municipio
- ✅ Calcula niveles de riesgo automáticamente
- ✅ Actualiza `src/data/municipal_risk_db.json`
- ✅ Actualiza la fecha en `sesnspService.js`

### Paso 3: Validar los Datos

```bash
npm run verify-data
```

Este comando verifica que:
- ✅ Los datos tienen el formato correcto
- ✅ No hay valores faltantes o inválidos
- ✅ Los niveles de riesgo son consistentes

### Paso 4: Probar la Aplicación

```bash
npm run dev
```

Abre la aplicación y verifica que:
- ✅ Las estadísticas se muestran correctamente
- ✅ La fecha de actualización es correcta
- ✅ Los niveles de riesgo son razonables

---

## 📊 Estructura de Datos

### CSV de Entrada (SESNSP)

El CSV del SESNSP tiene esta estructura:

```csv
Año,Clave_Ent,Entidad,Municipio,Bien jurídico afectado,Tipo de delito,Subtipo de delito,Modalidad,Enero,Febrero,...,Diciembre
2025,9,Ciudad de México,Iztapalapa,La vida y la Integridad corporal,Homicidio,Doloso,Con arma de fuego,45,42,...,38
```

### JSON de Salida

El script genera este formato:

```json
{
  "municipalities": {
    "Ciudad de México": {
      "secuestro": 125,
      "robo_vehiculo": 3450,
      "homicidio_doloso": 892,
      "robo_transeúnte": 5234,
      "violencia_familiar": 8901,
      "lesiones_dolosas": 4567,
      "risk_level": "High",
      "population": 9200000
    }
  },
  "metadata": {
    "lastUpdated": "2025-12",
    "source": "SESNSP - datos.gob.mx",
    "period": "Últimos 12 meses",
    "generatedAt": "2025-12-15T10:30:00.000Z"
  }
}
```

---

## 🔧 Configuración

### Mapeo de Delitos

El script mapea estos delitos del SESNSP:

| Delito SESNSP | Campo JSON | Descripción |
|---------------|------------|-------------|
| Secuestro | `secuestro` | Casos de secuestro |
| Robo de vehículo | `robo_vehiculo` | Robo de autos |
| Homicidio (Doloso) | `homicidio_doloso` | Homicidios intencionales |
| Robo (A transeúnte) | `robo_transeúnte` | Robos en la calle |
| Violencia familiar | `violencia_familiar` | Violencia doméstica |
| Lesiones (Dolosas) | `lesiones_dolosas` | Lesiones intencionales |

### Umbrales de Riesgo

**Robo de Vehículo:**
- Low: < 500 casos/año
- Medium: 500-2000
- High: > 2000

**Homicidio Doloso:**
- Low: < 100 casos/año
- Medium: 100-400
- High: > 400

**Robo a Transeúnte:**
- Low: < 300 casos/año
- Medium: 300-1000
- High: > 1000

**Risk Level General:**
- High: Si cualquier delito está en High
- Medium: Si algún delito está en Medium
- Low: Todos los delitos en Low

---

## 🐛 Solución de Problemas

### Error: "No se encontró el archivo CSV"

**Solución:**
1. Verifica que descargaste el CSV
2. Asegúrate de que está en `scripts/data/sesnsp_raw.csv`
3. Verifica que el nombre del archivo sea exactamente `sesnsp_raw.csv`

### Error: "El CSV no tiene el formato esperado"

**Solución:**
1. Verifica que descargaste el archivo correcto del SESNSP
2. Asegúrate de que es el CSV de "incidencia delictiva municipal"
3. No modifiques el CSV antes de procesarlo

### Advertencia: "Valor sospechoso"

**Solución:**
1. Revisa los datos manualmente
2. Si los valores son correctos, ignora la advertencia
3. Si hay un error, descarga el CSV nuevamente

### Los datos no se actualizan en la app

**Solución:**
1. Reinicia el servidor de desarrollo: `npm run dev`
2. Limpia el caché del navegador: Ctrl+Shift+R
3. Verifica que `municipal_risk_db.json` se actualizó

---

## 📅 Frecuencia de Actualización

**Recomendado:** Mensualmente

El SESNSP publica datos nuevos cada mes. Para mantener la app actualizada:

1. Configura un recordatorio mensual
2. Descarga el CSV más reciente
3. Ejecuta `npm run update-sesnsp`
4. Verifica con `npm run verify-data`
5. Haz commit de los cambios
6. Deploy a producción

---

## 🔗 Enlaces Útiles

- **Portal de Datos Abiertos:** https://datos.gob.mx
- **SESNSP Oficial:** https://www.gob.mx/sesnsp
- **Documentación de Datos:** https://datos.gob.mx/busca/dataset/incidencia-delictiva-municipal

---

## 📝 Notas

- Los datos de población son aproximados y se pueden actualizar en `updateSESNSPData.js`
- Los umbrales de riesgo son heurísticos y se pueden ajustar según necesidad
- El script suma los casos de los 12 meses del año
- Solo se procesan delitos específicos (secuestro, robo, homicidio)

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o contacta al equipo de desarrollo.
