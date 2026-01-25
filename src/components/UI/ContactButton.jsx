import React from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * Botón flotante de contacto
 * Posicionado en la esquina inferior derecha
 */
const ContactButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
            aria-label="Abrir formulario de contacto"
        >
            <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />

            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 group-hover:animate-ping"></span>

            {/* Tooltip */}
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                ¿Necesitas ayuda?
            </span>
        </button>
    );
};

export default ContactButton;
