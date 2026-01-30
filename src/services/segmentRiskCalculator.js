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
        // Skip municipalities without coordinates
        if (!data.coordinates || !Array.isArray(data.coordinates) || data.coordinates.length < 2) {
            continue;
        }

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
    const robberyRate = (municipalData.robo / population) * 100000;

    // Ponderación ajustada para reflejar gravedad de delitos:
    // - Homicidio: 50% (más grave)
    // - Secuestro: 30% (muy grave)
    // - Robo: 20% (común pero importante)
    // 
    // Multiplicadores ajustados para que los scores sean comparables:
    // - Homicidio: x2 (muy alto impacto)
    // - Secuestro: x10 (menos frecuente pero muy grave)
    // - Robo: x0.01 (muy frecuente, menor peso individual)
    const score = (homicideRate * 2.0) + (kidnappingRate * 10.0) + (robberyRate * 0.01);

    // Normalizar a escala 0-100
    return Math.min(100, Math.max(0, score));
};

/**
 * Calcula el nivel de riesgo de un segmento de ruta basándose en municipios cercanos
 * @param {Array} segmentCoordinates - Array de coordenadas del segmento [[lat, lon], ...]
 * @returns {Object} { level: 'low'|'medium'|'high', score: number, nearbyMunicipalities: Array }
 */
export const calculateSegmentRiskLevel = (segmentCoordinates) => {
    console.log('🚀 calculateSegmentRiskLevel CALLED with', segmentCoordinates?.length, 'coordinates');

    if (!segmentCoordinates || segmentCoordinates.length === 0) {
        console.log('❌ No coordinates provided');
        return { level: 'low', score: 0, nearbyMunicipalities: [] };
    }

    // Usar el punto medio del segmento para buscar municipios cercanos
    const midIndex = Math.floor(segmentCoordinates.length / 2);
    const midPoint = segmentCoordinates[midIndex];
    console.log('📍 Midpoint:', midPoint);

    // Encontrar municipios cercanos (dentro de 100km)
    const nearbyMunicipalities = findNearbyMunicipalities(midPoint, 100, 3);
    console.log('🏘️ Found', nearbyMunicipalities.length, 'nearby municipalities');

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

    // Clasificar nivel de riesgo (ajustado para ser menos alarmista)
    let level = 'low';
    if (finalScore >= 25) {  // Aumentado de 15 a 25 para reducir falsos positivos
        level = 'high';
    } else if (finalScore >= 12) {  // Aumentado de 8 a 12
        level = 'medium';
    }

    // DEBUG: Log para ver qué está pasando
    console.log('🔍 Segment Risk Calculation:', {
        nearbyCount: nearbyMunicipalities.length,
        finalScore: finalScore.toFixed(2),
        level,
        nearbyMunicipalities: nearbyMunicipalities.map(m => ({
            name: m.name,
            distance: m.distance.toFixed(1),
            riskLevel: m.data.risk_level
        }))
    });

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
    const nearbyResults = findNearbyMunicipalities(midPoint, 100, 1);
    const nearest = nearbyResults.length > 0 ? nearbyResults[0] : null;

    if (!nearest) return null;

    const municipalData = nearest.data;
    const population = municipalData.population || 1;

    // Calcular incidentes estimados para el tramo (proporcional a la población y distancia)
    const scaleFactor = 0.01; // Factor de escala para estimar incidentes en tramo vs. municipio completo

    const assaults = Math.round((municipalData.robo || 0) * scaleFactor);
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
            assaults: assaults,  // Removido Math.max(1, ...) para mostrar valor real
            disappearances: Math.max(0, disappearances),
            period: `Últimos 12 meses (Fuente: SESNSP)`,
            municipality: nearest.name,
            distance_to_municipality: `${Math.round(nearest.distance)} km`
        },
        riskLevel: riskData.level,
        nearbyMunicipalities: riskData.nearbyMunicipalities
    };
};
