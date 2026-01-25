import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';
import { getSegmentRealStats } from '../../services/segmentRiskCalculator';

// Helper component to auto-fit bounds
const BoundsFitter = ({ segments }) => {
  const map = useMap();

  useEffect(() => {
    if (segments && segments.length > 0) {
      const allCoords = segments.flatMap(s => s.coordinates);
      if (allCoords.length > 0) {
        map.fitBounds(allCoords, { padding: [50, 50] });
      }
    }
  }, [segments, map]);

  return null;
};

const safetyColors = {
  low: '#00ff66',
  medium: '#ffcc00',
  high: '#ff0033'
};

const StylizedMap = ({ routeSegments = [], cityMarkers = [], onCitySelect }) => {
  // Default position: Center of Mexico roughly
  const defaultPosition = [23.6345, -102.5528];
  const [clickedSegment, setClickedSegment] = useState(null);

  // Custom Icons
  const createIcon = (color) => {
    // MapPin SVG
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

    return divIcon({
      className: 'custom-pin',
      html: `<div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg ${color} backdrop-blur-md">${svg}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  };

  const createHazardIcon = (riskLevel) => {
    const color = riskLevel === 'high' ? 'bg-red-600' : 'bg-yellow-500';
    // AlertTriangle SVG
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-white"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;

    return divIcon({
      className: 'custom-pin',
      html: `<div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg ${color} animate-pulse">${svg}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  };

  // Handle segment click - show hazard info for medium/high risk segments
  const handleSegmentClick = (segment) => {
    if (segment.type === 'medium' || segment.type === 'high') {
      const hazardData = getSegmentRealStats(segment.coordinates);

      if (hazardData) {
        // Get midpoint of segment for marker position
        const midIndex = Math.floor(segment.coordinates.length / 2);
        const position = segment.coordinates[midIndex];

        // Create a temporary hazard marker
        const hazardMarker = {
          id: `temp-hazard-${segment.id}`,
          type: 'hazard',
          name: hazardData.title,
          position: position,
          stats: hazardData.stats,
          details: hazardData,
          nearbyMunicipalities: segment.nearbyMunicipalities,
          isTemporary: true
        };

        // Trigger the city select callback to show modal
        if (onCitySelect) {
          onCitySelect(hazardMarker);
        }

        setClickedSegment(segment.id);
      }
    }
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={defaultPosition}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full outline-none"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Render Route Segments - Now clickable for medium/high risk */}
        {routeSegments.map((segment) => {
          const isClickable = segment.type === 'medium' || segment.type === 'high';
          const isClicked = clickedSegment === segment.id;

          return (
            <Polyline
              key={segment.id}
              positions={segment.coordinates}
              pathOptions={{
                color: safetyColors[segment.type] || '#fff',
                weight: isClicked ? 8 : 6,
                opacity: isClickable ? 0.9 : 0.7,
                lineCap: 'round',
                className: isClickable ? 'cursor-pointer' : ''
              }}
              eventHandlers={isClickable ? {
                click: () => handleSegmentClick(segment),
                mouseover: (e) => {
                  e.target.setStyle({ weight: 8, opacity: 1 });
                },
                mouseout: (e) => {
                  if (clickedSegment !== segment.id) {
                    e.target.setStyle({ weight: 6, opacity: 0.9 });
                  }
                }
              } : {}}
            >
              {!isClickable && (
                <Popup>
                  <div className="text-gray-900">
                    <strong className="uppercase">{segment.type} Risk Zone</strong>
                    <p className="text-xs m-0">Esta zona es segura para viajar.</p>
                  </div>
                </Popup>
              )}
              {isClickable && (
                <Popup>
                  <div className="text-gray-900">
                    <strong className="uppercase text-orange-600">{segment.type === 'high' ? 'Alto' : 'Moderado'} Riesgo</strong>
                    <p className="text-xs m-0 mt-1">
                      <strong>Haz clic en el segmento</strong> para ver estadísticas detalladas de seguridad.
                    </p>
                    {segment.nearbyMunicipalities && segment.nearbyMunicipalities.length > 0 && (
                      <p className="text-xs m-0 mt-2 text-gray-600">
                        📍 Cerca de: {segment.nearbyMunicipalities[0].name}
                      </p>
                    )}
                  </div>
                </Popup>
              )}
            </Polyline>
          );
        })}

        {/* Render City Markers */}
        {cityMarkers.map((city) => (
          <Marker
            key={city.id}
            position={city.position}
            icon={city.type === 'hazard' ? createHazardIcon(city.details?.riskLevel || 'high') : createIcon('bg-safety-safe')}
            eventHandlers={{
              click: () => {
                if (onCitySelect) onCitySelect(city);
              },
            }}
          />
        ))}

        {routeSegments.length > 0 && <BoundsFitter segments={routeSegments} />}
      </MapContainer>

      {/* Overlay Gradient for aesthetics */}
      <div className="pointer-events-none absolute inset-0 z-[1000] bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-20"></div>
    </div>
  );
};

export default StylizedMap;
