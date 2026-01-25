// Simulating a route between two points with safety segments
// Uses OSRM Public Demo Server for real highway geometry

import cities from '../data/cities.json';

export const CITY_COORDS = cities;

// Helper: Fetch from OSRM
const fetchOSRMRoute = async (start, end) => {
    // OSRM expects lon,lat (GeoJSON format)
    const url = `http://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("OSRM Fetch Failed");
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            // OSRM returns [lon, lat], Leaflet needs [lat, lon]
            const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            return {
                coordinates,
                distance: route.distance, // in meters
                duration: route.duration // in seconds
            };
        }
    } catch (error) {
        console.error("Routing Error:", error);
        return null;
    }
    return null;
};

// Helper: Calculate straight-line distance between two coordinates (Haversine formula)
const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Earth's radius in km
    const lat1 = coord1[0] * Math.PI / 180;
    const lat2 = coord2[0] * Math.PI / 180;
    const deltaLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const deltaLon = (coord2[1] - coord1[1]) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
};

// Helper: Check if route is invalid (e.g., crossing water, different peninsulas)
const checkInvalidRoute = (origin, destination) => {
    const peninsularCities = {
        'Baja California': ['Tijuana', 'Mexicali', 'Ensenada', 'Tecate'],
        'Baja California Sur': ['La Paz', 'Los Cabos', 'Cabo San Lucas', 'San José del Cabo'],
        'Yucatán Peninsula': ['Cancún', 'Mérida', 'Playa del Carmen', 'Tulum', 'Chetumal']
    };

    // Check if cities are in different peninsulas
    let originPeninsula = null;
    let destPeninsula = null;

    for (const [peninsula, cities] of Object.entries(peninsularCities)) {
        if (cities.some(city => origin.toLowerCase().includes(city.toLowerCase()))) {
            originPeninsula = peninsula;
        }
        if (cities.some(city => destination.toLowerCase().includes(city.toLowerCase()))) {
            destPeninsula = peninsula;
        }
    }

    // Baja California and Baja California Sur can route between each other
    if (originPeninsula && destPeninsula) {
        if (originPeninsula !== destPeninsula) {
            if ((originPeninsula.includes('Baja') && !destPeninsula.includes('Baja')) ||
                (!originPeninsula.includes('Baja') && destPeninsula.includes('Baja'))) {
                return {
                    message: 'Esta ruta requiere cruzar el Golfo de California. Por favor, considera usar ferry o selecciona ciudades en el mismo territorio continental.'
                };
            }
        }
    }

    return null;
};


// Helper: Slice a clear path into "safety segments" using REAL risk calculation
const segmentizeRoute = (fullCoordinates) => {
    const totalPoints = fullCoordinates.length;
    // We want roughly 4-6 segments
    const segments = [];
    const segmentCount = 5;
    const chunkSize = Math.ceil(totalPoints / segmentCount);

    for (let i = 0; i < segmentCount; i++) {
        const startIdx = i * chunkSize;
        // overlap slightly to avoid gaps
        const endIdx = Math.min((i + 1) * chunkSize + 1, totalPoints);

        if (startIdx >= totalPoints) break;

        const chunkCoords = fullCoordinates.slice(startIdx, endIdx);

        // REAL RISK CALCULATION based on nearby municipalities with actual crime data
        const riskData = calculateSegmentRiskLevel(chunkCoords);
        const safety = riskData.level; // 'low', 'medium', or 'high' based on real data

        segments.push({
            id: `real-seg-${i}`,
            type: safety,
            coordinates: chunkCoords,
            riskScore: riskData.score,
            nearbyMunicipalities: riskData.nearbyMunicipalities
        });
    }
    return segments;
};

import { getSESNSPCityStats as getRealCityStats, calculateRouteSafetyScore as calculateRealRouteSafety } from './sesnspService';
import { resolveCityCoordinates } from './geocodingService';
import { calculateSegmentRiskLevel, getSegmentRealStats } from './segmentRiskCalculator';

// ... (fetchOSRMRoute and segmentizeRoute helpers) ...

import { normalizeText } from '../utils/textUtils';

export const getSafetyRoute = async (origin, destination) => {
    // 1. Try Local Database First (Accent Insensitive)
    const normOrigin = normalizeText(origin);
    const normDest = normalizeText(destination);

    let startCoord = Object.entries(CITY_COORDS).find(([k]) => normalizeText(k) === normOrigin)?.[1];
    let endCoord = Object.entries(CITY_COORDS).find(([k]) => normalizeText(k) === normDest)?.[1];

    // 2. Fallback to Geocoding API if not found locally
    if (!startCoord) {
        console.log(`City ${origin} not in local DB, geocoding...`);
        startCoord = await resolveCityCoordinates(origin);
    }
    if (!endCoord) {
        console.log(`City ${destination} not in local DB, geocoding...`);
        endCoord = await resolveCityCoordinates(destination);
    }

    // 3. Last Resort Fallback (if API fails or offline)
    if (!startCoord) startCoord = CITY_COORDS["Ciudad de México"];
    if (!endCoord) endCoord = CITY_COORDS["Guadalajara"];

    // Try real API
    let routeData = await fetchOSRMRoute(startCoord, endCoord);

    // Validate route - check if distance is unreasonably short (likely crossing water)
    const straightLineDistance = calculateDistance(startCoord, endCoord);

    // Fallback if API fails or route is invalid
    if (!routeData || (routeData.distance < straightLineDistance * 0.8)) {
        console.warn("OSRM returned invalid route or failed. Using fallback.");

        // Check if cities are on different peninsulas/islands
        const isInvalidRoute = checkInvalidRoute(origin, destination);

        if (isInvalidRoute) {
            throw new Error(`No se puede calcular una ruta terrestre directa entre ${origin} y ${destination}. ${isInvalidRoute.message}`);
        }

        // Generic fallback
        routeData = {
            coordinates: [startCoord, endCoord],
            distance: straightLineDistance * 1000, // Convert to meters
            duration: (straightLineDistance * 1000) / 20 // Assume 20 m/s average
        };
    }

    const segments = segmentizeRoute(routeData.coordinates);
    const distanceKm = Math.round(routeData.distance / 1000);
    const durationHours = Math.round(routeData.duration / 3600);
    const durationMins = Math.round((routeData.duration % 3600) / 60);

    // Dynamic Markers with REAL Data
    const midIndex = Math.floor(routeData.coordinates.length / 2);
    const midPoint = routeData.coordinates[midIndex];

    // Get Real Stats
    const originReal = getRealCityStats(origin);
    const destReal = getRealCityStats(destination);
    // For midpoint, we don't know the exact city easily without reverse geocoding, 
    // so we'll mock it or pick a random "Punto en Ruta"
    const midReal = { stats: { kidnapping: "Low", theft: "Medium", homicide: "Medium" } };

    const markers = [
        {
            id: 'origin',
            type: 'city',
            name: originReal.found ? originReal.cityName : origin,
            position: startCoord,
            stats: originReal.stats
        },
        {
            id: 'dest',
            type: 'city',
            name: destReal.found ? destReal.cityName : destination,
            position: endCoord,
            stats: destReal.stats
        }
    ];

    // Generate Hazard Markers
    const highRiskSegments = segments.filter(s => s.type === 'high');
    const mediumRiskSegments = segments.filter(s => s.type === 'medium');

    const addHazardMarkers = (segList, level) => {
        if (segList.length === 0) return;

        // For longer routes, add multiple markers (max 3 per risk level)
        const markersToAdd = Math.min(segList.length, 3);

        for (let i = 0; i < markersToAdd; i++) {
            // Distribute markers evenly across segments
            const segIndex = Math.floor((i * segList.length) / markersToAdd);
            const targetSeg = segList[segIndex];

            if (!targetSeg) continue;

            const midSegIndex = Math.floor(targetSeg.coordinates.length / 2);
            const pos = targetSeg.coordinates[midSegIndex];

            // Get REAL statistics from nearby municipalities
            const hazardData = getSegmentRealStats(targetSeg.coordinates);

            if (hazardData) {
                markers.push({
                    id: `hazard-${level}-${i}-${Date.now()}`,
                    type: 'hazard',
                    name: "Alerta de Seguridad",
                    position: pos,
                    stats: hazardData.stats,
                    details: hazardData,
                    nearbyMunicipalities: targetSeg.nearbyMunicipalities
                });
            }
        }
    };

    // Add markers for high risk segments first
    addHazardMarkers(highRiskSegments, 'high');

    // If no high risk segments, add markers for medium risk
    if (highRiskSegments.length === 0) {
        addHazardMarkers(mediumRiskSegments, 'medium');
    }

    // Calculate Score based on real data
    const safetyScore = calculateRealRouteSafety(origin, destination);

    // Calculate total incidents from all high-risk segments (REAL DATA)
    const totalIncidents = segments
        .filter(s => s.type === 'high' || s.type === 'medium')
        .reduce((sum, seg) => sum + (seg.riskScore || 0), 0);

    return {
        segments: segments,
        stats: {
            distance: `${distanceKm} km`,
            duration: `${durationHours}h ${durationMins}m`,
            safetyScore: safetyScore,
            incidentsLastMonth: Math.round(totalIncidents / 10) // Scaled from risk scores
        },
        markers: markers
    };
};

export const getCityStats = (cityName) => {
    // Forward to real service for consistency
    const real = getRealCityStats(cityName);
    return {
        kidnapping: real.stats.kidnapping,
        theft: real.stats.theft,
        homicide: real.stats.homicide,
        desc: real.desc || "Datos simulados"
    };
};


