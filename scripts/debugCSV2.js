import fs from 'fs';
import csv from 'csv-parser';

const CSV_PATH = './scripts/data/sesnsp_raw.csv';

console.log('🔍 Depurando lectura del CSV...\n');

let rowCount = 0;
const results = [];

fs.createReadStream(CSV_PATH)
    .pipe(csv())
    .on('headers', (headers) => {
        console.log('📋 Encabezados detectados:', headers);
        console.log('📋 Total de columnas:', headers.length);
        console.log('');
    })
    .on('data', (row) => {
        rowCount++;
        if (rowCount <= 5) {
            console.log(`\n📄 Fila ${rowCount}:`);
            console.log('  Municipio:', row.Municipio);
            console.log('  Tipo:', row.Tipo);
            console.log('  Ene:', row.Ene);
            console.log('  Feb:', row.Feb);
            console.log('  Todas las claves:', Object.keys(row));
        }
        results.push(row);
    })
    .on('end', () => {
        console.log(`\n✅ Total de filas leídas: ${rowCount}`);

        // Buscar un municipio específico con datos
        const aguascalientes = results.filter(r => r.Municipio === 'Aguascalientes');
        console.log(`\n🔍 Filas de Aguascalientes: ${aguascalientes.length}`);

        if (aguascalientes.length > 0) {
            console.log('\n📊 Primeras 3 filas de Aguascalientes:');
            aguascalientes.slice(0, 3).forEach((row, i) => {
                console.log(`\n  ${i + 1}. Tipo: ${row.Tipo}`);
                console.log(`     Ene: ${row.Ene}, Feb: ${row.Feb}, Mar: ${row.Mar}`);
            });
        }
    });
