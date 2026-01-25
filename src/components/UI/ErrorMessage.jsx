import React from 'react';
import { AlertCircle, WifiOff, MapPin, RefreshCw, X } from 'lucide-react';
import classNames from 'classnames';

const ErrorMessage = ({ type, message, suggestions = [], onRetry, onClose }) => {
    const getErrorConfig = (errorType) => {
        switch (errorType) {
            case 'city_not_found':
                return {
                    icon: MapPin,
                    color: 'bg-yellow-500',
                    borderColor: 'border-yellow-500/50',
                    title: 'Ciudad no encontrada'
                };
            case 'network_error':
                return {
                    icon: WifiOff,
                    color: 'bg-red-500',
                    borderColor: 'border-red-500/50',
                    title: 'Error de conexión'
                };
            case 'service_unavailable':
                return {
                    icon: AlertCircle,
                    color: 'bg-orange-500',
                    borderColor: 'border-orange-500/50',
                    title: 'Servicio no disponible'
                };
            default:
                return {
                    icon: AlertCircle,
                    color: 'bg-gray-500',
                    borderColor: 'border-gray-500/50',
                    title: 'Error'
                };
        }
    };

    const config = getErrorConfig(type);
    const Icon = config.icon;

    return (
        <div className="bg-dark-card/95 backdrop-blur-xl rounded-xl border-2 shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300"
            style={{ borderColor: config.borderColor.split('/')[0].replace('border-', '') + '40' }}
        >
            {/* Header */}
            <div className={classNames("p-4 flex items-center justify-between", config.color)}>
                <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-white" />
                    <h3 className="font-bold text-white">{config.title}</h3>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-4 bg-dark-bg space-y-3">
                <p className="text-gray-300 text-sm">{message}</p>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                            Sugerencias:
                        </p>
                        <div className="space-y-1">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20 transition-colors"
                                >
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Retry button */}
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="w-full mt-3 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reintentar
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorMessage;
