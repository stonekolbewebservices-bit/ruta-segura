import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import classNames from 'classnames';

const HazardTooltip = ({ riskLevel, municipality, distance, visible, position }) => {
    if (!visible) return null;

    const getRiskConfig = (level) => {
        switch (level) {
            case 'high':
                return {
                    color: 'bg-red-500',
                    textColor: 'text-red-200',
                    borderColor: 'border-red-500/50',
                    label: 'Alto Riesgo'
                };
            case 'medium':
                return {
                    color: 'bg-yellow-500',
                    textColor: 'text-yellow-200',
                    borderColor: 'border-yellow-500/50',
                    label: 'Riesgo Moderado'
                };
            default:
                return {
                    color: 'bg-green-500',
                    textColor: 'text-green-200',
                    borderColor: 'border-green-500/50',
                    label: 'Bajo Riesgo'
                };
        }
    };

    const config = getRiskConfig(riskLevel);

    return (
        <div
            className="absolute z-[1000] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
            style={{
                left: `${position?.x || 0}px`,
                top: `${position?.y || 0}px`,
                transform: 'translate(-50%, -120%)'
            }}
        >
            <div className={classNames(
                "bg-dark-card/95 backdrop-blur-xl rounded-lg shadow-2xl border-2 p-3 min-w-[200px]",
                config.borderColor
            )}>
                <div className="flex items-center gap-2 mb-2">
                    <div className={classNames("p-1.5 rounded-full", config.color)}>
                        <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <span className={classNames("font-bold text-sm", config.textColor)}>
                        {config.label}
                    </span>
                </div>

                {municipality && (
                    <div className="text-xs text-gray-300 space-y-1">
                        <div className="flex items-start gap-1">
                            <span className="text-gray-500">📍</span>
                            <span>{municipality}</span>
                        </div>
                        {distance && (
                            <div className="flex items-start gap-1">
                                <span className="text-gray-500">📏</span>
                                <span>{distance} km</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1 text-xs text-gray-400">
                    <Info className="w-3 h-3" />
                    <span>Clic para más detalles</span>
                </div>
            </div>

            {/* Arrow pointer */}
            <div
                className={classNames(
                    "absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent",
                    config.borderColor.replace('border-', 'border-t-')
                )}
                style={{ bottom: '-8px' }}
            />
        </div>
    );
};

export default HazardTooltip;
