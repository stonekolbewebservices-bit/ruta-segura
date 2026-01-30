#!/usr/bin/env node

/**
 * Script to add coordinates to municipalities in the database
 * Uses the cities.json file as a reference for coordinates
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'src', 'data', 'municipal_risk_db.json');
const CITIES_PATH = path.join(__dirname, '..', 'src', 'data', 'cities.json');

console.log('🔄 Agregando coordenadas a municipios...\n');

// Leer archivos
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const cities = JSON.parse(fs.readFileSync(CITIES_PATH, 'utf8'));

let updated = 0;
let notFound = 0;

// Agregar coordenadas a cada municipio
for (const [munName, munData] of Object.entries(db.municipalities)) {
    const lowerName = munName.toLowerCase();

    // Buscar coordenadas en cities.json
    let coords = null;

    // Búsqueda exacta
    for (const [cityName, cityCoords] of Object.entries(cities)) {
        if (cityName.toLowerCase() === lowerName) {
            coords = cityCoords;
            break;
        }
    }

    // Búsqueda parcial si no se encontró exacta
    if (!coords) {
        for (const [cityName, cityCoords] of Object.entries(cities)) {
            const cityLower = cityName.toLowerCase();
            if (lowerName.includes(cityLower) || cityLower.includes(lowerName)) {
                coords = cityCoords;
                break;
            }
        }
    }

    if (coords) {
        munData.coordinates = coords;
        updated++;
    } else {
        // Usar coordenadas por defecto en el centro de México
        munData.coordinates = [23.6345, -102.5528];
        notFound++;
    }
}

// Guardar archivo actualizado
fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

console.log(`✅ Coordenadas agregadas:`);
console.log(`   Municipios con coordenadas: ${updated}`);
console.log(`   Municipios con coordenadas por defecto: ${notFound}`);
console.log(`\n✅ Base de datos actualizada: ${DB_PATH}\n`);
console.log('💡 Ahora reinicia la app para ver el cálculo de riesgo funcionando.\n');
