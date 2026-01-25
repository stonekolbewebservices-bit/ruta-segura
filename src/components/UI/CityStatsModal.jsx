import React from 'react';
import { X, AlertTriangle, Shield, Skull, Share2, BarChart3 } from 'lucide-react';
import classNames from 'classnames';

const StatRow = ({ icon: Icon, label, value, colorClass }) => (
    <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5">
        <div className="flex items-center gap-3">
            <div className={classNames("p-2 rounded-full bg-opacity-20", colorClass.replace('text-', 'bg-'))}>
                <Icon className={classNames("w-5 h-5", colorClass)} />
            </div>
            <span className="text-gray-300 text-sm">{label}</span>
        </div>
        <span className={classNames("font-bold text-lg", colorClass)}>{value}</span>
    </div>
);

const CityStatsModal = ({ city, onClose }) => {
    if (!city) return null;

    const getSeverityColor = (level) => {
        switch (level) {
            case 'High': return 'text-red-500';
            case 'Medium': return 'text-yellow-500';
            case 'Low': return 'text-green-500';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none p-4 sm:p-0">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 pointer-events-auto transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative pointer-events-auto bg-dark-card w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="relative h-32 bg-gradient-to-br from-gray-900 to-black p-6 flex flex-col justify-end">
                    <div className="absolute top-0 right-0 p-4">
                        <button onClick={onClose} className="p-2 bg-black/50 hover:bg-white/10 rounded-full transition-colors text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                    <h2 className="text-3xl font-bold text-white tracking-tight relative z-10">{city.name}</h2>
                    <div className="flex items-center gap-2 mt-1 relative z-10">
                        <div className="w-2 h-2 rounded-full bg-safety-warning animate-pulse"></div>
                        <span className="text-xs text-safety-warning font-mono uppercase tracking-wider">Analysis Active</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 overflow-y-auto bg-dark-bg">
                    <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-safety-safe pl-3">
                        {city.type === 'hazard'
                            ? "Zona identificada con alta incidencia delictiva. Se recomienda extremar precauciones y evitar paradas innecesarias."
                            : (city.stats.desc || city.desc || "Safety data indicates varying levels of risk. Travelers should remain cautious.")}
                    </p>

                    <div className="space-y-3 mt-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                            {city.type === 'hazard' ? 'Reporte de Incidentes' : 'Risk Assessment'}
                        </h3>

                        {city.type === 'hazard' ? (
                            <div className="space-y-4">
                                {/* Visual Bar Chart for Statistics */}
                                <div className="space-y-3">
                                    {/* Assaults Bar */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-gray-300">Asaltos (12 meses)</span>
                                            <span className="text-lg font-bold text-red-500">{city.stats.assaults}</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${Math.min((city.stats.assaults / 100) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Disappearances Bar */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-gray-300">Desapariciones</span>
                                            <span className="text-lg font-bold text-orange-500">{city.stats.disappearances}</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${Math.min((city.stats.disappearances / 20) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Municipality context */}
                                {city.stats.municipality && (
                                    <div className="text-xs text-gray-400 bg-blue-900/10 p-3 rounded-lg border border-blue-500/20">
                                        <p className="mb-1">📍 Municipio cercano: <span className="text-blue-400 font-semibold">{city.stats.municipality}</span></p>
                                        {city.stats.distance_to_municipality && (
                                            <p>📏 Distancia: {city.stats.distance_to_municipality}</p>
                                        )}
                                    </div>
                                )}

                                <p className="text-xs text-center text-gray-500 italic mt-2">
                                    {city.stats.period}
                                </p>

                                {/* Share Alert Button */}
                                <button
                                    onClick={() => {
                                        const shareText = `⚠️ Alerta de Seguridad: ${city.name}\n\nAsaltos: ${city.stats.assaults}\nDesapariciones: ${city.stats.disappearances}\n\nFuente: ${city.stats.period}\n\n#RutaSegura`;
                                        if (navigator.share) {
                                            navigator.share({
                                                title: 'Alerta de Seguridad - Ruta Segura',
                                                text: shareText
                                            }).catch(() => { });
                                        } else {
                                            navigator.clipboard.writeText(shareText);
                                            alert('Información copiada al portapapeles');
                                        }
                                    }}
                                    className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Compartir Alerta
                                </button>
                            </div>
                        ) : (
                            <>
                                <StatRow
                                    icon={AlertTriangle}
                                    label="Secuestro"
                                    value={city.stats.kidnapping}
                                    colorClass={getSeverityColor(city.stats.kidnapping)}
                                />
                                <StatRow
                                    icon={Shield}
                                    label="Robo"
                                    value={city.stats.theft}
                                    colorClass={getSeverityColor(city.stats.theft)}
                                />
                                <StatRow
                                    icon={Skull}
                                    label="Homicidio"
                                    value={city.stats.homicide}
                                    colorClass={getSeverityColor(city.stats.homicide)}
                                />
                            </>
                        )}
                    </div>

                    <div className="mt-6 p-4 bg-blue-900/20 rounded-xl border border-blue-500/20">
                        <h4 className="text-blue-400 text-sm font-bold mb-1">Traveler Tip</h4>
                        <p className="text-blue-200/70 text-xs">
                            Avoid traveling at night on highways connecting to this city. Use toll roads (Cuota) whenever possible.
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-black/80 border-t border-white/5">
                    <button onClick={onClose} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors">
                        Close Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CityStatsModal;
