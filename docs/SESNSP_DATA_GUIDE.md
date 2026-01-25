# Guía de Actualización de Datos SESNSP

Esta guía explica cómo actualizar los datos de criminalidad desde las fuentes oficiales del SESNSP (Secretariado Ejecutivo del Sistema Nacional de Seguridad Pública).

## Fuente Oficial de Datos

**Portal de Datos Abiertos**: https://datos.gob.mx

**Datasets relevantes**:
- Incidencia delictiva municipal
- Víctimas de delitos
- Datos estatales de criminalidad

## Frecuencia de Actualización

Los datos del SESNSP se actualizan **mensualmente**. Se recomienda actualizar la base de datos de la aplicación:
- **Mínimo**: Cada 3 meses
- **Recomendado**: Mensualmente
- **Óptimo**: Automáticamente con un script programado

## Proceso Manual de Actualización

### Paso 1: Descargar Datos

1. Visita https://datos.gob.mx
2. Busca "SESNSP incidencia delictiva municipal"
3. Descarga los archivos CSV más recientes:
   - `IDM_NM_*.csv` (Incidencia Delictiva Municipal - Nueva Metodología)
   - Filtrar por año actual

### Paso 2: Preparar los Datos

Los archivos CSV contienen columnas como:
- `Año`
- `Clave_Ent` (Código de entidad)
- `Entidad` (Estado)
- `Municipio`
- `Bien jurídico afectado`
- `Tipo de delito`
- `Subtipo de delito`
- `Modalidad`
- `Enero`, `Febrero`, ..., `Diciembre` (casos por mes)

### Paso 3: Procesar y Convertir

Necesitas agregar los datos por municipio y tipo de delito. Ejemplo en Python:

```python
import pandas as pd
import json

# Leer CSV
df = pd.read_csv('IDM_NM_2024.csv', encoding='latin-1')

# Filtrar delitos relevantes
delitos_interes = {
    'Secuestro': 'secuestro',
    'Robo de vehículo': 'robo_vehiculo',
    'Homicidio doloso': 'homicidio_doloso',
    'Robo a transeúnte': 'robo_transeúnte',
    'Violencia familiar': 'violencia_familiar',
    'Lesiones dolosas': 'lesiones_dolosas'
}

# Agrupar por municipio
municipios = {}

for municipio in df['Municipio'].unique():
    df_mun = df[df['Municipio'] == municipio]
    
    stats = {}
    for delito_nombre, delito_key in delitos_interes.items():
        # Sumar casos del año (todas las columnas de meses)
        meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        
        df_delito = df_mun[df_mun['Tipo de delito'].str.contains(delito_nombre, na=False)]
        total = df_delito[meses].sum().sum()
        stats[delito_key] = int(total)
    
    # Calcular nivel de riesgo
    risk_level = "Low"
    if stats.get('homicidio_doloso', 0) > 400 or stats.get('secuestro', 0) > 50:
        risk_level = "High"
    elif stats.get('homicidio_doloso', 0) > 100 or stats.get('secuestro', 0) > 10:
        risk_level = "Medium"
    
    municipios[municipio] = {
        **stats,
        'risk_level': risk_level,
        'population': 0  # Agregar desde fuente de población
    }

# Guardar como JSON
output = {'municipalities': municipios}
with open('municipal_risk_db.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)
```

### Paso 4: Agregar Datos de Población

Los datos de población se pueden obtener de:
- INEGI: https://www.inegi.org.mx/
- Censo de Población y Vivienda

### Paso 5: Actualizar el Archivo JSON

Reemplaza el archivo:
```
src/data/municipal_risk_db.json
```

Con el nuevo JSON generado.

### Paso 6: Actualizar Fecha en el Servicio

Edita `src/services/sesnspService.js` y actualiza:

```javascript
lastUpdated: "2024-12" // Cambiar a año-mes actual
```

## Proceso Automatizado (Opcional)

### Script de Node.js

Puedes crear un script que automatice este proceso:

```javascript
// scripts/updateSESNSPData.js
const axios = require('axios');
const csv = require('csv-parser');
const fs = require('fs');

async function downloadAndProcessSESNSPData() {
    // 1. Descargar CSV desde datos.gob.mx
    // 2. Procesar con csv-parser
    // 3. Agregar datos por municipio
    // 4. Calcular niveles de riesgo
    // 5. Guardar JSON
    
    console.log('Datos actualizados exitosamente');
}

downloadAndProcessSESNSPData();
```

### Programar Actualización Automática

**Windows Task Scheduler**:
```powershell
# Crear tarea programada para ejecutar el script mensualmente
schtasks /create /tn "SESNSP Data Update" /tr "node C:\path\to\updateSESNSPData.js" /sc monthly /d 1
```

**Cron (Linux/Mac)**:
```bash
# Ejecutar el primer día de cada mes
0 0 1 * * node /path/to/updateSESNSPData.js
```

## Validación de Datos

Después de actualizar, verifica:

1. **Formato correcto**: El JSON debe tener la estructura esperada
2. **Datos completos**: Todos los municipios principales deben estar presentes
3. **Valores razonables**: Los números no deben ser negativos o excesivamente altos
4. **Niveles de riesgo**: Deben ser "Low", "Medium", o "High"

### Script de Validación

```javascript
const db = require('../src/data/municipal_risk_db.json');

function validateData() {
    const municipalities = db.municipalities;
    let errors = 0;
    
    for (const [name, data] of Object.entries(municipalities)) {
        // Verificar campos requeridos
        if (!data.risk_level || !['Low', 'Medium', 'High'].includes(data.risk_level)) {
            console.error(`❌ ${name}: risk_level inválido`);
            errors++;
        }
        
        // Verificar que los números sean válidos
        if (data.secuestro < 0 || data.homicidio_doloso < 0) {
            console.error(`❌ ${name}: valores negativos`);
            errors++;
        }
    }
    
    if (errors === 0) {
        console.log('✅ Validación exitosa');
    } else {
        console.log(`❌ ${errors} errores encontrados`);
    }
}

validateData();
```

## Recursos Adicionales

- **Portal SESNSP**: https://www.gob.mx/sesnsp
- **Datos Abiertos**: https://datos.gob.mx
- **Metodología SESNSP**: https://www.gob.mx/sesnsp/acciones-y-programas/incidencia-delictiva-87005
- **INEGI Población**: https://www.inegi.org.mx/temas/estructura/

## Soporte

Para preguntas sobre los datos oficiales:
- Email: datosabiertos@sesnsp.gob.mx
- Portal de ayuda: https://datos.gob.mx/ayuda

---

**Última actualización de esta guía**: Enero 2026
