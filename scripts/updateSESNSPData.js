#!/usr/bin/env node

/**
 * SESNSP Data Update Script
 * 
 * Este script procesa los datos CSV del SESNSP y actualiza la base de datos de la aplicación.
 * 
 * Uso:
 *   1. Descarga el CSV más reciente de https://datos.gob.mx
 *   2. Guárdalo como: scripts/data/sesnsp_raw.csv
 *   3. Ejecuta: npm run update-sesnsp
 */

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const CSV_PATH = path.join(__dirname, 'data', 'sesnsp_raw.csv');
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'municipal_risk_db.json');
const SERVICE_PATH = path.join(__dirname, '..', 'src', 'services', 'sesnspService.js');

// Mapeo de delitos SESNSP a campos de la BD
const CRIME_MAPPING = {
    'Secuestro': 'secuestro',
    'Robo de vehículo': 'robo_vehiculo',
    'Homicidio': 'homicidio_doloso', // Solo doloso
    'Robo': 'robo_transeúnte' // Solo a transeúnte
};

// Población aproximada de municipios principales (en habitantes)
const POPULATION_DATA = {
    'Ciudad de México': 9200000,
    'Guadalajara': 1495000,
    'Monterrey': 1135000,
    'Puebla': 1576000,
    'Tijuana': 1810000,
    'León': 1579000,
    'Juárez': 1512000,
    'Zapopan': 1332000,
    'Cancún': 888000,
    'Mérida': 892000,
    'Querétaro': 1000000,
    'Toluca': 873000
};

// Umbrales para clasificación de riesgo
const THRESHOLDS = {
    robo: { medium: 1000, high: 5000 },        // Robo genérico (incluye todos los tipos)
    homicide: { medium: 50, high: 200 },       // Homicidios dolosos + feminicidios
    secuestro: { medium: 5, high: 20 },        // Secuestros
    despojo: { medium: 100, high: 500 }        // Despojo de propiedad
};

/**
 * Calcula el nivel de riesgo basado en umbrales
 */
function calculateRiskLevel(value, thresholds) {
    if (value >= thresholds.high) return 'High';
    if (value >= thresholds.medium) return 'Medium';
    return 'Low';
}

/**
 * Calcula el nivel de riesgo general del municipio
 */
function calculateOverallRisk(stats) {
    const levels = [
        calculateRiskLevel(stats.robo || 0, THRESHOLDS.robo),
        calculateRiskLevel(stats.homicidio_doloso || 0, THRESHOLDS.homicide),
        calculateRiskLevel(stats.secuestro || 0, THRESHOLDS.secuestro),
        calculateRiskLevel(stats.despojo || 0, THRESHOLDS.despojo)
    ];

    if (levels.includes('High')) return 'High';
    if (levels.includes('Medium')) return 'Medium';
    return 'Low';
}

/**
 * Procesa el CSV y genera el JSON
 */
async function processCSV() {
    console.log('🔄 Procesando datos del SESNSP...\n');

    // Verificar que existe el CSV
    if (!fs.existsSync(CSV_PATH)) {
        console.error('❌ Error: No se encontró el archivo CSV');
        console.log('\n📥 Por favor:');
        console.log('   1. Ve a https://datos.gob.mx');
        console.log('   2. Busca "SESNSP incidencia delictiva municipal"');
        console.log('   3. Descarga el CSV más reciente');
        console.log(`   4. Guárdalo como: ${CSV_PATH}\n`);
        process.exit(1);
    }

    const municipalities = {};
    const rows = [];

    // Leer CSV (el archivo SÍ incluye headers, dejar que csv-parser los detecte)
    return new Promise((resolve, reject) => {
        fs.createReadStream(CSV_PATH)
            .pipe(csv()) // Sin headers manuales, detectar automáticamente
            .on('data', (row) => {
                rows.push(row);
            })
            .on('end', () => {
                console.log(`✅ Leídas ${rows.length} filas del CSV\n`);

                // Procesar datos
                rows.forEach(row => {
                    const municipio = row['Municipio'];
                    const delito = row['Tipo']; // Columna "Tipo" en el CSV

                    if (!municipio || !delito) return;

                    // Inicializar municipio si no existe
                    if (!municipalities[municipio]) {
                        municipalities[municipio] = {
                            secuestro: 0,
                            robo: 0,
                            homicidio_doloso: 0,
                            despojo: 0,
                            violencia_familiar: 0,
                            lesiones_dolosas: 0,
                            population: POPULATION_DATA[municipio] || 500000
                        };
                    }

                    // Sumar casos de los 12 meses (columnas Ene-Dic)
                    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

                    let total = 0;
                    months.forEach(month => {
                        const value = parseInt(row[month] || 0);
                        if (!isNaN(value)) total += value;
                    });

                    // Mapear delitos según la columna "Tipo" del CSV
                    const tipoLower = delito.toLowerCase();

                    if (tipoLower === 'secuestro') {
                        municipalities[municipio].secuestro += total;
                    } else if (tipoLower === 'homicidio') {
                        // Contar todos los homicidios como dolosos
                        municipalities[municipio].homicidio_doloso += total;
                    } else if (tipoLower === 'feminicidio') {
                        // Agregar feminicidios a homicidios dolosos
                        municipalities[municipio].homicidio_doloso += total;
                    } else if (tipoLower === 'robo') {
                        // El CSV no distingue subtipos, sumar todo como robo genérico
                        municipalities[municipio].robo += total;
                    } else if (tipoLower === 'despojo') {
                        municipalities[municipio].despojo += total;
                    }
                });

                // Calcular niveles de riesgo
                Object.keys(municipalities).forEach(mun => {
                    municipalities[mun].risk_level = calculateOverallRisk(municipalities[mun]);
                });

                console.log(`✅ Procesados ${Object.keys(municipalities).length} municipios\n`);

                // Generar JSON
                const output = {
                    municipalities,
                    metadata: {
                        lastUpdated: new Date().toISOString().slice(0, 7), // YYYY-MM
                        source: 'SESNSP - datos.gob.mx',
                        period: 'Últimos 12 meses',
                        generatedAt: new Date().toISOString()
                    }
                };

                // Guardar JSON
                fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
                console.log(`✅ Base de datos actualizada: ${OUTPUT_PATH}\n`);

                // Actualizar fecha en sesnspService.js
                updateServiceFile(output.metadata.lastUpdated);

                resolve(output);
            })
            .on('error', reject);
    });
}

/**
 * Actualiza la fecha en sesnspService.js
 */
function updateServiceFile(lastUpdated) {
    try {
        let content = fs.readFileSync(SERVICE_PATH, 'utf8');

        // Actualizar DATA_PERIOD
        const monthNames = {
            '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
            '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
            '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
        };

        const [year, month] = lastUpdated.split('-');
        const monthName = monthNames[month] || 'Diciembre';
        const newPeriod = `${monthName} ${year}`;

        content = content.replace(
            /export const DATA_PERIOD = "[^"]+";/,
            `export const DATA_PERIOD = "${newPeriod}";`
        );

        fs.writeFileSync(SERVICE_PATH, content);
        console.log(`✅ Actualizado sesnspService.js con fecha: ${newPeriod}\n`);
    } catch (error) {
        console.warn(`⚠️  No se pudo actualizar sesnspService.js: ${error.message}`);
    }
}

/**
 * Muestra estadísticas del procesamiento
 */
function showStats(data) {
    console.log('📊 Estadísticas:\n');

    const munis = Object.keys(data.municipalities);
    console.log(`   Total de municipios: ${munis.length}`);

    const highRisk = munis.filter(m => data.municipalities[m].risk_level === 'High').length;
    const mediumRisk = munis.filter(m => data.municipalities[m].risk_level === 'Medium').length;
    const lowRisk = munis.filter(m => data.municipalities[m].risk_level === 'Low').length;

    console.log(`   Riesgo Alto: ${highRisk}`);
    console.log(`   Riesgo Medio: ${mediumRisk}`);
    console.log(`   Riesgo Bajo: ${lowRisk}\n`);

    console.log(`   Última actualización: ${data.metadata.lastUpdated}`);
    console.log(`   Fuente: ${data.metadata.source}\n`);
}

// Ejecutar
processCSV()
    .then(data => {
        showStats(data);
        console.log('✅ ¡Proceso completado exitosamente!\n');
        console.log('💡 Próximos pasos:');
        console.log('   1. Verifica los datos: npm run verify-data');
        console.log('   2. Prueba la app: npm run dev');
        console.log('   3. Haz commit de los cambios\n');
    })
    .catch(error => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });
