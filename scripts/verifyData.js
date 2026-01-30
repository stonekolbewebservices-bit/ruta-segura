#!/usr/bin/env node

/**
 * SESNSP Data Validation Script
 * 
 * Verifica que los datos procesados sean válidos y consistentes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'src', 'data', 'municipal_risk_db.json');

function validateData() {
    console.log('🔍 Validando datos de SESNSP...\n');

    // Verificar que existe el archivo
    if (!fs.existsSync(DB_PATH)) {
        console.error('❌ Error: No se encontró municipal_risk_db.json');
        console.log('   Ejecuta primero: npm run update-sesnsp\n');
        process.exit(1);
    }

    // Leer datos
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

    let errors = 0;
    let warnings = 0;

    // Validar estructura
    if (!data.municipalities) {
        console.error('❌ Error: Falta la propiedad "municipalities"');
        errors++;
    }

    if (!data.metadata) {
        console.error('❌ Error: Falta la propiedad "metadata"');
        errors++;
    }

    // Validar municipios
    const munis = Object.keys(data.municipalities || {});
    console.log(`📊 Municipios encontrados: ${munis.length}\n`);

    if (munis.length === 0) {
        console.error('❌ Error: No hay municipios en la base de datos');
        errors++;
    }

    // Validar cada municipio
    munis.forEach(mun => {
        const stats = data.municipalities[mun];

        // Verificar campos requeridos
        const required = ['secuestro', 'robo_vehiculo', 'homicidio_doloso', 'risk_level'];
        required.forEach(field => {
            if (stats[field] === undefined) {
                console.warn(`⚠️  ${mun}: Falta campo "${field}"`);
                warnings++;
            }
        });

        // Verificar valores numéricos
        ['secuestro', 'robo_vehiculo', 'homicidio_doloso', 'robo_transeúnte'].forEach(field => {
            if (stats[field] !== undefined && (stats[field] < 0 || stats[field] > 100000)) {
                console.warn(`⚠️  ${mun}: Valor sospechoso en "${field}": ${stats[field]}`);
                warnings++;
            }
        });

        // Verificar risk_level
        if (stats.risk_level && !['Low', 'Medium', 'High'].includes(stats.risk_level)) {
            console.error(`❌ ${mun}: risk_level inválido: "${stats.risk_level}"`);
            errors++;
        }
    });

    // Validar metadata
    if (data.metadata) {
        if (!data.metadata.lastUpdated) {
            console.warn('⚠️  Falta metadata.lastUpdated');
            warnings++;
        }
        if (!data.metadata.source) {
            console.warn('⚠️  Falta metadata.source');
            warnings++;
        }
    }

    // Resumen
    console.log('\n📋 Resumen de Validación:\n');
    console.log(`   ✅ Municipios válidos: ${munis.length}`);
    console.log(`   ⚠️  Advertencias: ${warnings}`);
    console.log(`   ❌ Errores: ${errors}\n`);

    if (errors > 0) {
        console.error('❌ Validación fallida. Corrige los errores antes de continuar.\n');
        process.exit(1);
    } else if (warnings > 0) {
        console.log('⚠️  Validación completada con advertencias.\n');
    } else {
        console.log('✅ ¡Validación exitosa! Los datos están listos para usar.\n');
    }

    // Mostrar muestra de datos
    console.log('📊 Muestra de datos (primeros 5 municipios):\n');
    munis.slice(0, 5).forEach(mun => {
        const stats = data.municipalities[mun];
        console.log(`   ${mun}:`);
        console.log(`      Secuestro: ${stats.secuestro}`);
        console.log(`      Robo vehículo: ${stats.robo_vehiculo}`);
        console.log(`      Homicidio: ${stats.homicidio_doloso}`);
        console.log(`      Riesgo: ${stats.risk_level}\n`);
    });
}

validateData();
