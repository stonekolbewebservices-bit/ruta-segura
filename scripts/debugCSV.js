#!/usr/bin/env node

/**
 * Debug script to see CSV headers
 */

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, 'data', 'sesnsp_raw.csv');

let firstRow = null;

fs.createReadStream(CSV_PATH)
    .pipe(csv())
    .on('data', (row) => {
        if (!firstRow) {
            firstRow = row;
            console.log('Headers encontrados:');
            console.log(Object.keys(row));
            console.log('\nPrimera fila de datos:');
            console.log(row);
            process.exit(0);
        }
    })
    .on('error', (error) => {
        console.error('Error:', error);
        process.exit(1);
    });
