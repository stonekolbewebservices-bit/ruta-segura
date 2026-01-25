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

// Normalize city names for lookup (e.g., "CDMX" -> "Ciudad de México")
const normalizeName = (name) => {
    const lower = name.toLowerCase().trim();

    // Common aliases
    const aliases = {
        "cdmx": "Ciudad de México",
        "ciudad de mexico": "Ciudad de México",
        "cancun": "Cancún",
        "merida": "Mérida",
        "queretaro": "Querétaro",
        "leon": "León",
        "monterrey": "Monterrey",
        "guadalajara": "Guadalajara",
        "puebla": "Puebla",
        "tijuana": "Tijuana"
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
        vehicleTheft: { low: 0, medium: 500, high: 2000 },
        homicide: { low: 0, medium: 100, high: 400 },
        streetRobbery: { low: 0, medium: 300, high: 1000 }
    };

    const vehicleTheftLevel = calculateRiskLevel(data.robo_vehiculo, thresholds.vehicleTheft);
    const homicideLevel = calculateRiskLevel(data.homicidio_doloso, thresholds.homicide);
    const streetRobberyLevel = calculateRiskLevel(
        data.robo_transeúnte || 0,
        thresholds.streetRobbery
    );

    return {
        found: true,
        cityName: key,
        stats: {
            // Números absolutos para delitos graves
            kidnapping: data.secuestro,
            // Niveles cualitativos para delitos comunes
            vehicleTheft: vehicleTheftLevel,
            homicide: homicideLevel,
            streetRobbery: streetRobberyLevel,
            // Datos crudos para análisis detallado
            raw: {
                secuestro: data.secuestro,
                robo_vehiculo: data.robo_vehiculo,
                homicidio_doloso: data.homicidio_doloso,
                robo_transeúnte: data.robo_transeúnte || 0,
                violencia_familiar: data.violencia_familiar || 0,
                lesiones_dolosas: data.lesiones_dolosas || 0
            }
        },
        risk_level: data.risk_level,
        population: data.population,
        desc: `Población: ${(data.population / 1000000).toFixed(1)}M habitantes. Fuente: SESNSP 2024.`,
        lastUpdated: "2024-12" // Actualizar cuando se actualicen los datos
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

    if (stats.stats.vehicleTheft === "High") {
        recommendations.push("🚗 Alto índice de robo de vehículos. Use estacionamientos vigilados.");
    }

    if (stats.stats.homicide === "High") {
        recommendations.push("⚠️ Alto índice de homicidios. Manténgase en zonas concurridas.");
    }

    if (stats.stats.streetRobbery === "High") {
        recommendations.push("👥 Alto índice de robos a transeúntes. No exhiba objetos de valor.");
    }

    if (recommendations.length === 0) {
        recommendations.push("✅ Zona relativamente segura. Mantenga precauciones normales.");
    }

    return recommendations;
};

// Mantener compatibilidad con código existente
export const getRealCityStats = getSESNSPCityStats;
export const calculateRealRouteSafety = calculateRouteSafetyScore;
