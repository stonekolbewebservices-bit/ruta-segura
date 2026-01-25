import db from '../data/municipal_risk_db.json';

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param {Array} coord1 - [lat, lon]
 * @param {Array} coord2 - [lat, lon]
 * @returns {number} Distancia en kilómetros
 */
const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Encuentra los municipios más cercanos a un punto geográfico
 * @param {Array} coordinates - [lat, lon]
 * @param {number} maxDistance - Distancia máxima en km (default: 100km)
 * @param {number} limit - Número máximo de municipios a retornar
 * @returns {Array} Array de municipios cercanos con sus distancias
 */
export const findNearbyMunicipalities = (coordinates, maxDistance = 100, limit = 3) => {
    const municipalities = [];

    for (const [name, data] of Object.entries(db.municipalities)) {
        const distance = calculateDistance(coordinates, data.coordinates);

        if (distance <= maxDistance) {
            municipalities.push({
                name,
                data,
                distance
            });
        }
    }

    // Ordenar por distancia y limitar resultados
    return municipalities
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
};

/**
 * Calcula un score de riesgo basado en estadísticas de criminalidad
 * @param {Object} municipalData - Datos del municipio
 * @returns {number} Score de 0-100 (mayor = más peligroso)
 */
const calculateRiskScore = (municipalData) => {
    const population = municipalData.population || 1;

    // Tasas por cada 100,000 habitantes
    const homicideRate = (municipalData.homicidio_doloso / population) * 100000;
    const kidnappingRate = (municipalData.secuestro / population) * 100000;
    const theftRate = (municipalData.robo_vehiculo / population) * 100000;

    // Pesos: homicidio (40%), secuestro (35%), robo (25%)
    const score = (homicideRate * 0.4) + (kidnappingRate * 3.5) + (theftRate * 0.025);

    // Normalizar a escala 0-100
    return Math.min(100, Math.max(0, score));
};

/**
 * Calcula el nivel de riesgo de un segmento de ruta basándose en municipios cercanos
 * @param {Array} segmentCoordinates - Array de coordenadas del segmento [[lat, lon], ...]
 * @returns {Object} { level: 'low'|'medium'|'high', score: number, nearbyMunicipalities: Array }
 */
export const calculateSegmentRiskLevel = (segmentCoordinates) => {
    if (!segmentCoordinates || segmentCoordinates.length === 0) {
        return { level: 'low', score: 0, nearbyMunicipalities: [] };
    }

    // Tomar punto medio del segmento
    const midIndex = Math.floor(segmentCoordinates.length / 2);
    const midPoint = segmentCoordinates[midIndex];

    // Encontrar municipios cercanos (dentro de 100km)
    const nearbyMunicipalities = findNearbyMunicipalities(midPoint, 100, 3);

    if (nearbyMunicipalities.length === 0) {
        // Si no hay municipios cercanos, asumir riesgo bajo
        return { level: 'low', score: 10, nearbyMunicipalities: [] };
    }

    // Calcular score ponderado por distancia
    let totalWeight = 0;
    let weightedScore = 0;

    nearbyMunicipalities.forEach(({ data, distance }) => {
        const score = calculateRiskScore(data);
        // Peso inversamente proporcional a la distancia (más cerca = más peso)
        const weight = 1 / (distance + 1); // +1 para evitar división por cero

        weightedScore += score * weight;
        totalWeight += weight;
    });

    const finalScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

    // Clasificar nivel de riesgo
    let level = 'low';
    if (finalScore >= 60) {
        level = 'high';
    } else if (finalScore >= 30) {
        level = 'medium';
    }

    return {
        level,
        score: Math.round(finalScore),
        nearbyMunicipalities: nearbyMunicipalities.map(m => ({
            name: m.name,
            distance: Math.round(m.distance),
            risk_level: m.data.risk_level
        }))
    };
};

/**
 * Genera estadísticas reales para un segmento basándose en municipios cercanos
 * @param {Array} segmentCoordinates - Coordenadas del segmento
 * @returns {Object} Estadísticas del segmento
 */
export const getSegmentRealStats = (segmentCoordinates) => {
    const riskData = calculateSegmentRiskLevel(segmentCoordinates);

    if (riskData.nearbyMunicipalities.length === 0) {
        return null;
    }

    // Obtener el municipio más cercano para estadísticas
    const midIndex = Math.floor(segmentCoordinates.length / 2);
    const midPoint = segmentCoordinates[midIndex];
    const nearest = findNearbyMunicipalities(midPoint, 100, 1)[0];

    if (!nearest) return null;

    const municipalData = nearest.data;
    const population = municipalData.population || 1;

    // Calcular incidentes estimados para el tramo (proporcional a la población y distancia)
    const scaleFactor = 0.01; // Factor de escala para estimar incidentes en tramo vs. municipio completo

    const assaults = Math.round((municipalData.robo_transeúnte || 0) * scaleFactor);
    const disappearances = Math.round((municipalData.secuestro || 0) * scaleFactor);

    let desc = '';
    if (riskData.level === 'high') {
        desc = `Zona de Alta Peligrosidad - Cercano a ${nearest.name}`;
    } else if (riskData.level === 'medium') {
        desc = `Zona de Precaución - Área de ${nearest.name}`;
    } else {
        desc = `Zona Segura - Región de ${nearest.name}`;
    }

    return {
        type: 'hazard',
        title: desc,
        stats: {
            assaults: Math.max(1, assaults),
            disappearances: Math.max(0, disappearances),
            period: `Últimos 12 meses (Fuente: SESNSP)`,
            municipality: nearest.name,
            distance_to_municipality: `${Math.round(nearest.distance)} km`
        },
        riskLevel: riskData.level,
        nearbyMunicipalities: riskData.nearbyMunicipalities
    };
};
