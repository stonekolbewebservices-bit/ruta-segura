import React, { useEffect } from 'react';

/**
 * Google AdSense Unit Component
 * 
 * Este componente renderiza una unidad de anuncio de Google AdSense.
 * Requiere que el script de AdSense esté cargado en index.html
 * 
 * @param {string} slot - ID de la unidad de anuncio (data-ad-slot)
 * @param {string} format - Formato del anuncio (auto, fluid, rectangle, etc.)
 * @param {string} layout - Layout para anuncios in-feed o in-article
 * @param {string} className - Clases CSS adicionales
 * @param {string} style - Estilos inline
 */
const AdSenseUnit = ({
    slot,
    format = 'auto',
    layout = '',
    className = '',
    style = {}
}) => {
    const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;
    const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';
    const showAdsInDev = import.meta.env.VITE_SHOW_ADS_IN_DEV === 'true';

    useEffect(() => {
        // Solo cargar anuncios en producción o si está habilitado en desarrollo
        if (!isDevMode || showAdsInDev) {
            try {
                // Push ad to AdSense queue
                if (window.adsbygoogle && publisherId) {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                }
            } catch (error) {
                console.error('AdSense error:', error);
            }
        }
    }, [isDevMode, showAdsInDev, publisherId]);

    // Mostrar placeholder en desarrollo si no hay Publisher ID
    if (!publisherId || (isDevMode && !showAdsInDev)) {
        return (
            <div className={`relative bg-black/20 border border-white/5 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4 text-center ${className}`}>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                    Advertisement
                </div>
                <div className="w-full h-full min-h-[50px] bg-white/5 border-2 border-dashed border-white/10 rounded flex items-center justify-center">
                    <div className="text-center">
                        <span className="text-gray-600 text-xs font-mono block">Google AdSense Space</span>
                        {!publisherId && (
                            <span className="text-gray-700 text-[10px] mt-1 block">
                                Configure VITE_ADSENSE_PUBLISHER_ID en .env
                            </span>
                        )}
                    </div>
                </div>
                {/* Visual cue for "premium" feel even in ads */}
                <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500/20 rounded-full m-1"></div>
            </div>
        );
    }

    // Renderizar anuncio real de AdSense
    return (
        <div className={`adsense-container ${className}`} style={style}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block', ...style }}
                data-ad-client={publisherId}
                data-ad-slot={slot}
                data-ad-format={format}
                data-ad-layout={layout}
                data-full-width-responsive="true"
            ></ins>
        </div>
    );
};

export default AdSenseUnit;
