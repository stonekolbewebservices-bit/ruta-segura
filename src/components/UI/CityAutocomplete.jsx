import React, { useState, useEffect, useRef } from 'react';
import { MapPin, TrendingUp } from 'lucide-react';
import { normalizeText, findSimilarCities } from '../../utils/textUtils';

const CityAutocomplete = ({ value, onChange, placeholder, cities = [], className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredCities, setFilteredCities] = useState([]);
    const wrapperRef = useRef(null);

    useEffect(() => {
        // Filter cities based on input with fuzzy matching
        if (value && value.length >= 2) {
            // First try exact and prefix matches
            const search = normalizeText(value);
            const exactMatches = cities.filter(city =>
                normalizeText(city).includes(search)
            );

            // If we have enough exact matches, use those
            if (exactMatches.length >= 5) {
                setFilteredCities(exactMatches.slice(0, 10));
            } else {
                // Otherwise, use fuzzy matching for better suggestions
                const fuzzyMatches = findSimilarCities(value, cities, 0.5, 10);
                setFilteredCities(fuzzyMatches.map(m => m.city));
            }
        } else if (value && value.length === 1) {
            // For single character, only show cities that start with it
            const search = normalizeText(value);
            const matches = cities.filter(city =>
                normalizeText(city).startsWith(search)
            ).slice(0, 10);
            setFilteredCities(matches);
        } else {
            setFilteredCities([]);
        }
    }, [value, cities]);

    // Handle outside click to close dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSelect = (city) => {
        onChange(city);
        setIsOpen(false);
    };

    // Highlight matching parts of the city name
    const highlightMatch = (cityName) => {
        if (!value) return cityName;

        const searchTerm = normalizeText(value);
        const normalizedCity = normalizeText(cityName);
        const index = normalizedCity.indexOf(searchTerm);

        if (index === -1) return cityName;

        const before = cityName.substring(0, index);
        const match = cityName.substring(index, index + value.length);
        const after = cityName.substring(index + value.length);

        return (
            <>
                {before}
                <span className="text-safety-safe font-bold">{match}</span>
                {after}
            </>
        );
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                className={className}
                autoComplete="off"
            />

            {/* Dropdown Suggestions */}
            {isOpen && filteredCities.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-dark-card border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50 backdrop-blur-xl">
                    {filteredCities.map((city, index) => (
                        <button
                            key={index}
                            className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2 border-b border-white/5 last:border-0"
                            onClick={() => handleSelect(city)}
                        >
                            <MapPin className="w-3 h-3 text-safety-safe flex-shrink-0" />
                            <span className="flex-1">{highlightMatch(city)}</span>
                            {index < 3 && (
                                <TrendingUp className="w-3 h-3 text-gray-500" title="Sugerencia popular" />
                            )}
                        </button>
                    ))}

                    {/* No results message */}
                    {value && value.length >= 2 && filteredCities.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">
                            No se encontraron ciudades similares
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CityAutocomplete;
