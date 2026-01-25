
// Service to fetch coordinates from OpenStreetMap (Nominatim)
// Policy: https://operations.osmfoundation.org/policies/nominatim/
// Must include a valid User-Agent.

// Cache for geocoded cities to reduce API calls
const GEOCODE_CACHE_KEY = 'ruta_segura_geocode_cache';
const CACHE_EXPIRY_DAYS = 30;

// Common abbreviations for Mexican cities
const CITY_ABBREVIATIONS = {
    'cdmx': 'Ciudad de México',
    'df': 'Ciudad de México',
    'mexico': 'Ciudad de México',
    'gdl': 'Guadalajara',
    'mty': 'Monterrey',
    'qro': 'Querétaro',
    'slp': 'San Luis Potosí',
    'merida': 'Mérida',
    'cancun': 'Cancún',
    'tijuana': 'Tijuana',
    'puebla': 'Puebla'
};

/**
 * Get cached coordinates for a city
 */
const getCachedCoordinates = (cityName) => {
    try {
        const cache = JSON.parse(localStorage.getItem(GEOCODE_CACHE_KEY) || '{}');
        const normalizedName = cityName.toLowerCase().trim();
        const cached = cache[normalizedName];

        if (cached) {
            const age = Date.now() - cached.timestamp;
            const maxAge = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

            if (age < maxAge) {
                console.log(`✓ Cache hit for ${cityName}`);
                return cached.coordinates;
            }
        }
    } catch (error) {
        console.warn('Cache read error:', error);
    }
    return null;
};

/**
 * Save coordinates to cache
 */
const setCachedCoordinates = (cityName, coordinates) => {
    try {
        const cache = JSON.parse(localStorage.getItem(GEOCODE_CACHE_KEY) || '{}');
        const normalizedName = cityName.toLowerCase().trim();

        cache[normalizedName] = {
            coordinates,
            timestamp: Date.now()
        };

        localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
        console.log(`✓ Cached coordinates for ${cityName}`);
    } catch (error) {
        console.warn('Cache write error:', error);
    }
};

/**
 * Validate that coordinates are within Mexico's approximate bounds
 */
const isWithinMexico = (lat, lon) => {
    // Mexico's approximate bounding box
    const MEXICO_BOUNDS = {
        minLat: 14.5,
        maxLat: 32.7,
        minLon: -118.4,
        maxLon: -86.7
    };

    return (
        lat >= MEXICO_BOUNDS.minLat &&
        lat <= MEXICO_BOUNDS.maxLat &&
        lon >= MEXICO_BOUNDS.minLon &&
        lon <= MEXICO_BOUNDS.maxLon
    );
};

/**
 * Expand city name with common abbreviations
 */
const expandCityName = (cityName) => {
    const normalized = cityName.toLowerCase().trim();
    return CITY_ABBREVIATIONS[normalized] || cityName;
};

/**
 * Fetch coordinates from Nominatim with retry logic
 */
const fetchWithRetry = async (url, options, maxRetries = 2) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                // Exponential backoff: 1s, 2s, 4s...
                const delay = Math.pow(2, attempt - 1) * 1000;
                console.log(`Retry attempt ${attempt} after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                return await response.json();
            }

            // Rate limit (429) - wait longer
            if (response.status === 429) {
                console.warn('Rate limited by Nominatim');
                await new Promise(resolve => setTimeout(resolve, 3000));
                continue;
            }

            lastError = new Error(`HTTP ${response.status}`);
        } catch (error) {
            lastError = error;
            if (error.name === 'AbortError') {
                console.warn('Request timeout');
            }
        }
    }

    throw lastError;
};

/**
 * Main geocoding function with all enhancements
 */
export const resolveCityCoordinates = async (cityName) => {
    try {
        // 1. Check cache first
        const cached = getCachedCoordinates(cityName);
        if (cached) return cached;

        // 2. Expand abbreviations
        const expandedName = expandCityName(cityName);

        // 3. Try geocoding
        const query = encodeURIComponent(`${expandedName}, Mexico`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=3&countrycodes=mx`;

        const data = await fetchWithRetry(url, {
            headers: {
                'User-Agent': 'RutaSeguraApp/1.0 (Educational Project)'
            }
        });

        if (data && data.length > 0) {
            // Find best match (prefer exact matches or cities over other types)
            let bestMatch = data[0];

            for (const result of data) {
                const isCity = ['city', 'town', 'village', 'municipality'].includes(result.type);
                if (isCity) {
                    bestMatch = result;
                    break;
                }
            }

            const lat = parseFloat(bestMatch.lat);
            const lon = parseFloat(bestMatch.lon);

            // 4. Validate coordinates are in Mexico
            if (!isWithinMexico(lat, lon)) {
                console.warn(`Coordinates for ${cityName} are outside Mexico bounds`);
                return null;
            }

            const coordinates = [lat, lon];

            // 5. Cache the result
            setCachedCoordinates(cityName, coordinates);

            return coordinates;
        }

        console.warn(`No results found for ${cityName}`);
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
};

/**
 * Clear geocoding cache (useful for debugging)
 */
export const clearGeocodeCache = () => {
    try {
        localStorage.removeItem(GEOCODE_CACHE_KEY);
        console.log('✓ Geocode cache cleared');
    } catch (error) {
        console.warn('Failed to clear cache:', error);
    }
};
