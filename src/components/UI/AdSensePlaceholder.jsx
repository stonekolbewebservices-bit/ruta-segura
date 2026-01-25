import React from 'react';

const AdSensePlaceholder = ({ slot, format = 'auto', className = '' }) => {
    return (
        <div className={`relative bg-black/20 border border-white/5 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4 text-center ${className}`}>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Advertisement</div>
            <div className="w-full h-full min-h-[50px] bg-white/5 border-2 border-dashed border-white/10 rounded flex items-center justify-center">
                <span className="text-gray-600 text-xs font-mono">Google AdSense Space</span>
            </div>

            {/* Visual cue for "premium" feel even in ads */}
            <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500/20 rounded-full m-1"></div>
        </div>
    );
};

export default AdSensePlaceholder;
