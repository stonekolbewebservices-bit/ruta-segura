import db from '../data/municipal_risk_db.json';

// Normalize city names for lookup (e.g., "CDMX" -> "Ciudad de México")
const normalizeName = (name) => {
    const lower = name.toLowerCase().trim();
    if (lower === "cdmx" || lower === "ciudad de mexico") return "Ciudad de México";
    if (lower === "cancun") return "Cancún";
    if (lower === "merida") return "Mérida";
    // Add more aliases if needed
    return Object.keys(db.municipalities).find(k => k.toLowerCase() === lower) || name;
};

export const getRealCityStats = (cityName) => {
    const key = normalizeName(cityName);
    const data = db.municipalities[key];

    if (!data) {
        return {
            found: false,
            desc: "Datos no disponibles para este municipio.",
            stats: { kidnapping: "N/A", theft: "N/A", homicide: "N/A" },
            risk_level: "Unknown"
        };
    }

    // Convert raw numbers to "Low/Medium/High" for UI consistency
    // Simple heuristic for demo purposes
    let theftLabel = "Low";
    if (data.robo_vehiculo > 500) theftLabel = "Medium";
    if (data.robo_vehiculo > 2000) theftLabel = "High";

    let homicideLabel = "Low";
    if (data.homicidio_doloso > 100) homicideLabel = "Medium";
    if (data.homicidio_doloso > 400) homicideLabel = "High";

    return {
        found: true,
        cityName: key,
        stats: {
            kidnapping: data.secuestro.toString(), // Raw number for kidnapping is scary/impactful
            theft: theftLabel, // Use qualitative for common crimes
            homicide: homicideLabel,
            raw: data
        },
        risk_level: data.risk_level,
        desc: `Población: ${(data.population / 1000000).toFixed(1)}M. Fuente: SESNSP 2024.`
    };
};

// Calculate a route score based on Origin/Dest/Midpoint risks
// This replaces the random score generator
export const calculateRealRouteSafety = (origin, dest) => {
    const originStats = getRealCityStats(origin);
    const destStats = getRealCityStats(dest);

    let score = 90; // Start assumed safe

    // Penalize for High Risk endpoints
    if (originStats.risk_level === "High") score -= 20;
    if (originStats.risk_level === "Medium") score -= 10;

    if (destStats.risk_level === "High") score -= 20;
    if (destStats.risk_level === "Medium") score -= 10;

    return Math.max(0, Math.min(100, score));
};
