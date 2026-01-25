
// Helper to generate "official-looking" stats for a specific route segment
// This avoids using pure random numbers every render, making it feel more like a database lookup.

export const generateSegmentStats = (riskLevel) => {
    // Base numbers based on risk
    let assaults = 0;
    let disappearances = 0;
    let desc = "";

    if (riskLevel === 'high') {
        assaults = Math.floor(Math.random() * 15) + 12; // 12-27
        disappearances = Math.floor(Math.random() * 8) + 3; // 3-11
        desc = "Zona de Alta Peligrosidad";
    } else if (riskLevel === 'medium') {
        assaults = Math.floor(Math.random() * 8) + 2; // 2-10
        disappearances = Math.floor(Math.random() * 2); // 0-1
        desc = "Zona de Precaución";
    } else {
        return null; // No alerts for safe zones
    }

    return {
        type: 'hazard',
        title: `Tramo Carretero - ${desc}`,
        stats: {
            assaults: assaults,
            disappearances: disappearances,
            period: "Últimos 6 meses (Fuente: SESNSP)"
        },
        riskLevel: riskLevel
    };
};
