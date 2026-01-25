import React, { useState } from 'react';
import StylizedMap from './components/Map/StylizedMap';
import CityStatsModal from './components/UI/CityStatsModal';
import CityAutocomplete from './components/UI/CityAutocomplete';
import AdSenseUnit from './components/UI/AdSenseUnit';
import ContactButton from './components/UI/ContactButton';
import ContactModal from './components/UI/ContactModal';
import { ShieldCheck, Search, AlertTriangle, Info } from 'lucide-react';
import { getSafetyRoute, CITY_COORDS } from './services/mockSafetyService';
import classNames from 'classnames';
import LoadingProgress from './components/UI/LoadingProgress';
import ErrorMessage from './components/UI/ErrorMessage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-900 text-white h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <pre className="text-xs bg-black p-4 rounded overflow-auto max-w-full">
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-white text-black rounded"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const [origin, setOrigin] = useState("Ciudad de México");
  const [destination, setDestination] = useState("Guadalajara");
  const [selectedCity, setSelectedCity] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Get list of city names for autocomplete
  const cityList = Object.keys(CITY_COORDS);

  const loadingSteps = [
    { label: 'Geocodificando ciudades...', description: 'Buscando coordenadas' },
    { label: 'Calculando ruta óptima...', description: 'Usando OSRM' },
    { label: 'Analizando riesgo de segmentos...', description: 'Consultando base de datos' },
    { label: 'Generando alertas de seguridad...', description: 'Finalizando' }
  ];

  const handleSearch = async () => {
    setLoading(true);
    setLoadingStep(0);
    setRouteData(null);
    setSelectedCity(null);
    setError(null);

    try {
      // Simulate loading steps for better UX
      const stepDelay = 500;

      setLoadingStep(0);
      await new Promise(resolve => setTimeout(resolve, stepDelay));

      setLoadingStep(1);
      await new Promise(resolve => setTimeout(resolve, stepDelay));

      setLoadingStep(2);
      const data = await getSafetyRoute(origin, destination);

      setLoadingStep(3);
      await new Promise(resolve => setTimeout(resolve, stepDelay));

      setRouteData(data);
    } catch (e) {
      console.error('Route search error:', e);
      setError({
        type: 'service_unavailable',
        message: 'No se pudo calcular la ruta. Por favor, intenta de nuevo.',
        suggestions: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="w-full h-screen relative bg-dark-bg text-white overflow-hidden">

        {/* Background Map layer */}
        <div className="absolute inset-0 z-0">
          <StylizedMap
            routeSegments={routeData?.segments || []}
            cityMarkers={routeData?.markers || []}
            onCitySelect={setSelectedCity}
          />
        </div>

        {/* Modal Layer */}
        <CityStatsModal
          city={selectedCity}
          onClose={() => setSelectedCity(null)}
        />

        {/* UI Overlay Layer */}
        <div className="absolute top-0 left-0 w-full p-4 z-10 pointer-events-none flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
          <div className="pointer-events-auto flex items-center gap-2">
            <div className="bg-safety-safe p-2 rounded-lg shadow-lg">
              <ShieldCheck className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-md">Ruta Segura</h1>
              <p className="text-xs text-gray-400">Viaja con tranquilidad</p>
            </div>
          </div>

          <div className="pointer-events-auto bg-dark-card/80 backdrop-blur-md px-4 py-2 rounded-full">
            <span className="text-xs font-mono text-safety-warning">BETA</span>
          </div>
        </div>

        {/* Floating Action / Search Container */}
        <div className="absolute bottom-6 left-4 right-4 z-20 pointer-events-auto md:left-6 md:right-auto md:w-96">
          <div className="bg-dark-card/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl transition-all duration-300 max-h-[80vh] overflow-y-auto">
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest text-xs mb-2">Planificar Viaje</h2>

              <div className="relative">
                <CityAutocomplete
                  value={origin}
                  onChange={setOrigin}
                  cities={cityList}
                  placeholder="Origen (ej. CDMX)"
                  className="w-full bg-black/50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-safety-safe transition-colors text-white placeholder-gray-500"
                />
              </div>
              <div className="relative">
                <CityAutocomplete
                  value={destination}
                  onChange={setDestination}
                  cities={cityList}
                  placeholder="Destino (ej. Guadalajara)"
                  className="w-full bg-black/50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-safety-safe transition-colors text-white placeholder-gray-500"
                />
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className={classNames(
                  "w-full font-bold py-3 rounded-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2",
                  loading ? "bg-gray-600 cursor-not-allowed text-gray-300" : "bg-safety-safe hover:bg-green-400 text-black"
                )}
              >
                {loading ? (
                  <>Searching...</>
                ) : (
                  <>
                    <Search className="w-4 h-4" /> Buscar Ruta Segura
                  </>
                )}
              </button>
            </div>

            {/* Stats Summary after Search */}
            {routeData && !loading && (
              <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-xs uppercase">Resumen</span>
                  <div className="flex items-center gap-1 text-safety-warning text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Riesgo Moderado</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/40 p-2 rounded">
                    <div className="text-xs text-gray-500">Distancia</div>
                    <div className="font-mono text-lg">{routeData.stats.distance}</div>
                  </div>
                  <div className="bg-black/40 p-2 rounded">
                    <div className="text-xs text-gray-500">Score</div>
                    <div className="font-mono text-lg text-safety-safe">{routeData.stats.safetyScore}/100</div>
                  </div>
                </div>
              </div>
            )}

            {/* AdSpace Integration */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <AdSenseUnit
                slot={import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR}
                format="auto"
                className="h-24 w-full"
              />
            </div>
          </div>
        </div>

        {/* Contact Button */}
        <ContactButton onClick={() => setIsContactModalOpen(true)} />

        {/* Contact Modal */}
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />

      </div>
    </ErrorBoundary>
  )
}

export default App;


