import React, { useState } from 'react';
import { X, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';

/**
 * Modal de contacto con formulario
 * Envía emails usando FormSubmit.co (servicio gratuito sin backend)
 */
const ContactModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle'); // idle, sending, success, error

    const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'Stonekolbewebservices@gmail.com';

    // Validación de campos
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'El mensaje es requerido';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setStatus('sending');

        try {
            // Usar FormSubmit.co - servicio gratuito sin necesidad de backend
            const response = await fetch(`https://formsubmit.co/${contactEmail}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                    _subject: `Nuevo mensaje de contacto - Ruta Segura`,
                    _template: 'table',
                    _captcha: 'false'
                })
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });

                // Cerrar modal después de 2 segundos
                setTimeout(() => {
                    onClose();
                    setStatus('idle');
                }, 2000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setStatus('error');
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-dark-card/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Contáctanos</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                        aria-label="Cerrar"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Success State */}
                {status === 'success' && (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4 flex items-center gap-3 animate-in slide-in-from-top-2">
                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                        <div>
                            <p className="text-green-400 font-semibold">¡Mensaje enviado!</p>
                            <p className="text-green-300 text-sm">Te responderemos pronto.</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {status === 'error' && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4 flex items-center gap-3 animate-in slide-in-from-top-2">
                        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                        <div>
                            <p className="text-red-400 font-semibold">Error al enviar</p>
                            <p className="text-red-300 text-sm">Por favor, intenta de nuevo.</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Field */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                            Nombre
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full bg-black/50 border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.name ? 'focus:ring-red-500' : 'focus:ring-blue-500'} transition-all`}
                            placeholder="Tu nombre"
                            disabled={status === 'sending' || status === 'success'}
                        />
                        {errors.name && (
                            <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full bg-black/50 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500' : 'focus:ring-blue-500'} transition-all`}
                            placeholder="tu@email.com"
                            disabled={status === 'sending' || status === 'success'}
                        />
                        {errors.email && (
                            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Message Field */}
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                            Mensaje
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows="4"
                            className={`w-full bg-black/50 border ${errors.message ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.message ? 'focus:ring-red-500' : 'focus:ring-blue-500'} transition-all resize-none`}
                            placeholder="¿En qué podemos ayudarte?"
                            disabled={status === 'sending' || status === 'success'}
                        />
                        {errors.message && (
                            <p className="text-red-400 text-xs mt-1">{errors.message}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={status === 'sending' || status === 'success'}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:cursor-not-allowed"
                    >
                        {status === 'sending' ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Enviando...
                            </>
                        ) : status === 'success' ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Enviado
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Enviar Mensaje
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Info */}
                <p className="text-gray-500 text-xs text-center mt-4">
                    Responderemos a tu mensaje lo antes posible
                </p>
            </div>
        </div>
    );
};

export default ContactModal;
