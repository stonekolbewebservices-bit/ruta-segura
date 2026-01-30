/**
 * SESNSP (Secretariado Ejecutivo del Sistema Nacional de Seguridad Pública) Service
 * 
 * Este servicio proporciona datos de criminalidad oficial de México.
 * Fuente de datos: https://datos.gob.mx (SESNSP - Datos Abiertos)
 * 
 * Los datos se actualizan mensualmente. Para actualizar, consulta:
 * docs/SESNSP_DATA_GUIDE.md
 */

import db from '../data/municipal_risk_db.json';

// Data period - Update this when you update the SESNSP data
export const DATA_PERIOD = "Enero 2026";
export const DATA_DESCRIPTION = "Datos de los últimos 12 meses";


// Normalize city names for lookup (e.g., "CDMX" -> "Ciudad de México")
const normalizeName = (name) => {
    const lower = name.toLowerCase().trim();

    // Common aliases
    const aliases = {
        "cdmx": "CDMX_AGGREGATE",
        "ciudad de mexico": "CDMX_AGGREGATE",
        "ciudad de méxico": "CDMX_AGGREGATE",
        "df": "CDMX_AGGREGATE",
        "cancun": "Cancún",
        "merida": "Mérida",
        "queretaro": "Querétaro",
        "leon": "León",
        "monterrey": "Monterrey",
        "guadalajara": "Guadalajara",
        "puebla": "Puebla",
        "tijuana": "Tijuana",
        "ciudad obregon": "Cajeme",
        "ciudad obregón": "Cajeme"
    };

    if (aliases[lower]) return aliases[lower];

    // Try to find exact match in database
    return Object.keys(db.municipalities).find(k => k.toLowerCase() === lower) || name;
};

/**
 * Categorías de delitos según SESNSP:
 * - Secuestro (Kidnapping)
 * - Robo de vehículo (Vehicle Theft)
 * - Homicidio doloso (Intentional Homicide)
 * - Robo a transeúnte (Street Robbery)
 * - Violencia familiar (Domestic Violence)
 * - Lesiones dolosas (Intentional Injuries)
 */

/**
 * Calcula el nivel de riesgo basado en estadísticas
 * @param {number} value - Valor del delito
 * @param {object} thresholds - Umbrales {low, medium, high}
 * @returns {string} - "Low", "Medium", o "High"
 */
const calculateRiskLevel = (value, thresholds) => {
    if (value >= thresholds.high) return "High";
    if (value >= thresholds.medium) return "Medium";
    return "Low";
};

/**
 * Obtiene estadísticas detalladas de criminalidad para una ciudad
 * @param {string} cityName - Nombre de la ciudad
 * @returns {object} - Estadísticas de criminalidad
 */
export const getSESNSPCityStats = (cityName) => {
    const key = normalizeName(cityName);

    // Special handling for CDMX - aggregate all boroughs
    if (key === "CDMX_AGGREGATE") {
        const cdmxBoroughs = [
            'Azcapotzalco', 'Coyoacán', 'Cuajimalpa de Morelos', 'Gustavo A. Madero',
            'Iztacalco', 'Iztapalapa', 'La Magdalena Contreras', 'Milpa Alta',
            'Álvaro Obregón', 'Tláhuac', 'Tlalpan', 'Xochimilco', 'Benito Juárez',
            'Cuauhtémoc', 'Miguel Hidalgo', 'Venustiano Carranza'
        ];

        // Aggregate data from all boroughs
        let totalSecuestro = 0;
        let totalRobo = 0;
        let totalHomicidio = 0;
        let totalDespojo = 0;
        let boroughsFound = 0;

        cdmxBoroughs.forEach(borough => {
            const boroughData = db.municipalities[borough];
            if (boroughData) {
                totalSecuestro += boroughData.secuestro || 0;
                totalRobo += boroughData.robo || 0;
                totalHomicidio += boroughData.homicidio_doloso || 0;
                totalDespojo += boroughData.despojo || 0;
                boroughsFound++;
            }
        });

        if (boroughsFound === 0) {
            return {
                found: false,
                cityName: cityName,
                desc: "Datos no disponibles para este municipio.",
                stats: {
                    kidnapping: "N/A",
                    robbery: "N/A",
                    homicide: "N/A",
                    despojo: "N/A"
                },
                risk_level: "Unknown",
                lastUpdated: "N/A"
            };
        }

        // Calculate aggregated risk levels
        const thresholds = {
            robo: { low: 0, medium: 1000, high: 5000 },
            homicide: { low: 0, medium: 50, high: 200 },
            secuestro: { low: 0, medium: 5, high: 20 },
            despojo: { low: 0, medium: 100, high: 500 }
        };

        const calculateRiskLevel = (value, thresholds) => {
            if (value >= thresholds.high) return 'High';
            if (value >= thresholds.medium) return 'Medium';
            return 'Low';
        };

        return {
            found: true,
            cityName: "Ciudad de México",
            stats: {
                kidnapping: totalSecuestro,
                robbery: totalRobo,
                homicide: totalHomicidio,
                despojo: totalDespojo,
                robberyLevel: calculateRiskLevel(totalRobo, thresholds.robo),
                homicideLevel: calculateRiskLevel(totalHomicidio, thresholds.homicide),
                kidnappingLevel: calculateRiskLevel(totalSecuestro, thresholds.secuestro),
                despojoLevel: calculateRiskLevel(totalDespojo, thresholds.despojo),
                raw: {
                    secuestro: totalSecuestro,
                    robo: totalRobo,
                    homicidio_doloso: totalHomicidio,
                    despojo: totalDespojo,
                    violencia_familiar: 0,
                    lesiones_dolosas: 0
                }
            },
            risk_level: calculateRiskLevel(totalHomicidio, thresholds.homicide),
            population: 9200000, // CDMX population
            desc: `Población: 9.2M habitantes (${boroughsFound} alcaldías). Fuente: SESNSP 2024.`,
            lastUpdated: DATA_PERIOD,
            dataPeriod: DATA_DESCRIPTION
        };
    }

    const data = db.municipalities[key];

    if (!data) {
        return {
            found: false,
            cityName: cityName,
            desc: "Datos no disponibles para este municipio.",
            stats: {
                kidnapping: "N/A",
                vehicleTheft: "N/A",
                homicide: "N/A",
                streetRobbery: "N/A"
            },
            risk_level: "Unknown",
            lastUpdated: "N/A"
        };
    }

    // Umbrales para clasificación de riesgo
    // Estos valores son heurísticos basados en promedios nacionales
    const thresholds = {
        robo: { low: 0, medium: 1000, high: 5000 },        // Robo genérico
        homicide: { low: 0, medium: 50, high: 200 },       // Homicidios dolosos
        secuestro: { low: 0, medium: 5, high: 20 },        // Secuestros
        despojo: { low: 0, medium: 100, high: 500 }        // Despojo
    };

    const roboLevel = calculateRiskLevel(data.robo || 0, thresholds.robo);
    const homicideLevel = calculateRiskLevel(data.homicidio_doloso || 0, thresholds.homicide);
    const secuestroLevel = calculateRiskLevel(data.secuestro || 0, thresholds.secuestro);
    const despojoLevel = calculateRiskLevel(data.despojo || 0, thresholds.despojo);

    return {
        found: true,
        cityName: key,
        stats: {
            // Números absolutos para todos los delitos
            kidnapping: data.secuestro || 0,
            robbery: data.robo || 0,
            homicide: data.homicidio_doloso || 0,
            despojo: data.despojo || 0,
            // Niveles cualitativos
            robberyLevel: roboLevel,
            homicideLevel: homicideLevel,
            kidnappingLevel: secuestroLevel,
            despojoLevel: despojoLevel,
            // Datos crudos para análisis detallado
            raw: {
                secuestro: data.secuestro || 0,
                robo: data.robo || 0,
                homicidio_doloso: data.homicidio_doloso || 0,
                despojo: data.despojo || 0,
                violencia_familiar: data.violencia_familiar || 0,
                lesiones_dolosas: data.lesiones_dolosas || 0
            }
        },
        risk_level: data.risk_level,
        population: data.population,
        desc: `Población: ${(data.population / 1000000).toFixed(1)}M habitantes. Fuente: SESNSP 2024.`,
        lastUpdated: DATA_PERIOD,
        dataPeriod: DATA_DESCRIPTION
    };
};

/**
 * Calcula el score de seguridad de una ruta basado en origen y destino
 * Score: 0-100 (100 = más seguro)
 * @param {string} origin - Ciudad de origen
 * @param {string} dest - Ciudad de destino
 * @returns {number} - Score de seguridad (0-100)
 */
export const calculateRouteSafetyScore = (origin, dest) => {
    const originStats = getSESNSPCityStats(origin);
    const destStats = getSESNSPCityStats(dest);

    let score = 90; // Comenzar con score alto (asumiendo seguro)

    // Penalizar según nivel de riesgo de origen
    if (originStats.risk_level === "High") score -= 20;
    else if (originStats.risk_level === "Medium") score -= 10;

    // Penalizar según nivel de riesgo de destino
    if (destStats.risk_level === "High") score -= 20;
    else if (destStats.risk_level === "Medium") score -= 10;

    // Penalización adicional por secuestros (delito grave)
    if (originStats.found && originStats.stats.raw) {
        if (originStats.stats.raw.secuestro > 10) score -= 5;
        if (originStats.stats.raw.secuestro > 50) score -= 10;
    }

    if (destStats.found && destStats.stats.raw) {
        if (destStats.stats.raw.secuestro > 10) score -= 5;
        if (destStats.stats.raw.secuestro > 50) score -= 10;
    }

    return Math.max(0, Math.min(100, score));
};

/**
 * Obtiene recomendaciones de seguridad basadas en estadísticas
 * @param {string} cityName - Nombre de la ciudad
 * @returns {array} - Array de recomendaciones
 */
export const getSafetyRecommendations = (cityName) => {
    const stats = getSESNSPCityStats(cityName);
    const recommendations = [];

    if (!stats.found) {
        return ["No hay datos disponibles para esta ubicación."];
    }

    if (stats.risk_level === "High") {
        recommendations.push("⚠️ Zona de alto riesgo. Extreme precauciones.");
    }

    if (stats.stats.raw && stats.stats.raw.secuestro > 10) {
        recommendations.push("🚨 Alto índice de secuestros. Evite viajar solo y en horarios nocturnos.");
    }

    if (stats.stats.robberyLevel === "High") {
        recommendations.push("🚗 Alto índice de robos. Use estacionamientos vigilados.");
    }

    if (stats.stats.homicideLevel === "High") {
        recommendations.push("⚠️ Alto índice de homicidios. Manténgase en zonas concurridas.");
    }

    if (stats.stats.despojoLevel === "High") {
        recommendations.push("🏠 Alto índice de despojo. Extreme precauciones con propiedades.");
    }

    if (recommendations.length === 0) {
        recommendations.push("✅ Zona relativamente segura. Mantenga precauciones normales.");
    }

    return recommendations;
};

// Mantener compatibilidad con código existente
export const getRealCityStats = getSESNSPCityStats;
export const calculateRealRouteSafety = calculateRouteSafetyScore;
