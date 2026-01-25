export const normalizeText = (text) => {
    if (!text) return "";
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
const levenshteinDistance = (str1, str2) => {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
};

/**
 * Calculate similarity score between two strings (0-1)
 * 1 = identical, 0 = completely different
 */
const similarityScore = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
};

/**
 * Find similar cities using fuzzy matching
 * @param {string} input - User input
 * @param {Array<string>} cities - List of city names
 * @param {number} threshold - Minimum similarity score (0-1)
 * @param {number} maxResults - Maximum number of results
 * @returns {Array<{city: string, score: number}>} Sorted by similarity
 */
export const findSimilarCities = (input, cities, threshold = 0.6, maxResults = 5) => {
    if (!input || !cities || cities.length === 0) return [];

    const normalizedInput = normalizeText(input);
    const matches = [];

    for (const city of cities) {
        const normalizedCity = normalizeText(city);

        // Exact match gets highest priority
        if (normalizedCity === normalizedInput) {
            matches.push({ city, score: 1.0, type: 'exact' });
            continue;
        }

        // Starts with match gets high priority
        if (normalizedCity.startsWith(normalizedInput)) {
            matches.push({ city, score: 0.95, type: 'prefix' });
            continue;
        }

        // Contains match gets medium priority
        if (normalizedCity.includes(normalizedInput)) {
            matches.push({ city, score: 0.85, type: 'contains' });
            continue;
        }

        // Fuzzy match for typos
        const score = similarityScore(normalizedInput, normalizedCity);
        if (score >= threshold) {
            matches.push({ city, score, type: 'fuzzy' });
        }
    }

    // Sort by score (descending) and return top results
    return matches
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);
};

/**
 * Common city name synonyms and variations
 */
const CITY_SYNONYMS = {
    'mexico': ['Ciudad de México', 'CDMX', 'DF'],
    'ciudad de mexico': ['CDMX', 'DF', 'México'],
    'cdmx': ['Ciudad de México', 'DF', 'México'],
    'df': ['Ciudad de México', 'CDMX', 'México'],
    'guadalajara': ['GDL'],
    'gdl': ['Guadalajara'],
    'monterrey': ['MTY'],
    'mty': ['Monterrey'],
    'queretaro': ['QRO'],
    'qro': ['Querétaro'],
    'san luis potosi': ['SLP'],
    'slp': ['San Luis Potosí'],
    'puerto vallarta': ['Vallarta'],
    'vallarta': ['Puerto Vallarta'],
    'ciudad juarez': ['Juárez'],
    'juarez': ['Ciudad Juárez'],
    'tuxtla gutierrez': ['Tuxtla'],
    'tuxtla': ['Tuxtla Gutiérrez'],
    'san pedro garza garcia': ['San Pedro'],
    'san pedro': ['San Pedro Garza García'],
    'ciudad obregon': ['Obregón'],
    'obregon': ['Ciudad Obregón'],
    'xalapa': ['Jalapa'],
    'jalapa': ['Xalapa'],
    'los cabos': ['Cabo San Lucas', 'San José del Cabo'],
    'cabo': ['Cabo San Lucas', 'Los Cabos']
};

/**
 * Get synonyms for a city name
 * @param {string} cityName - City name to find synonyms for
 * @returns {Array<string>} List of synonyms
 */
export const getCitySynonyms = (cityName) => {
    const normalized = normalizeText(cityName);
    return CITY_SYNONYMS[normalized] || [];
};

/**
 * Expand city name with synonyms
 * @param {string} cityName - City name
 * @param {Array<string>} allCities - All available cities
 * @returns {Array<string>} Original name plus synonyms that exist in allCities
 */
export const expandCityName = (cityName, allCities) => {
    const results = [cityName];
    const synonyms = getCitySynonyms(cityName);

    for (const synonym of synonyms) {
        if (allCities.includes(synonym)) {
            results.push(synonym);
        }
    }

    return results;
};

/**
 * Format city name for display (proper capitalization)
 * @param {string} cityName - City name to format
 * @returns {string} Formatted city name
 */
export const formatCityName = (cityName) => {
    if (!cityName) return "";

    // Special cases
    const specialCases = {
        'cdmx': 'CDMX',
        'df': 'DF',
        'gdl': 'GDL',
        'mty': 'MTY',
        'qro': 'QRO',
        'slp': 'SLP'
    };

    const normalized = normalizeText(cityName);
    if (specialCases[normalized]) {
        return specialCases[normalized];
    }

    // Title case for regular names
    return cityName
        .split(' ')
        .map(word => {
            if (word.toLowerCase() === 'de' || word.toLowerCase() === 'del' || word.toLowerCase() === 'la' || word.toLowerCase() === 'las' || word.toLowerCase() === 'los') {
                return word.toLowerCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
};
