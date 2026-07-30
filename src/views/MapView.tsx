import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Plus, MapPin, Trash2, Search, Loader2, Link as LinkIcon, Menu, X, List, Utensils, Camera, TreePine, ShoppingBag, Bed, Info, Filter, Maximize, Navigation, Waves, FerrisWheel, Palmtree, Ticket, Umbrella, BedDouble, UtensilsCrossed, Building2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { cn, generateId } from '../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  url?: string;
  type?: string; // id of the marker type
}

export const MARKER_TYPES = [
  { id: 'default', label: 'Ubicación', icon: MapPin, color: 'bg-slate-600', shadow: 'shadow-slate-600/50', textColor: 'text-slate-600', borderColor: 'border-slate-200' },
  { id: 'city', label: 'Ciudad', icon: Building2, color: 'bg-pink-500', shadow: 'shadow-pink-500/50', textColor: 'text-pink-500', borderColor: 'border-pink-200' },
  { id: 'food', label: 'Comida', icon: UtensilsCrossed, color: 'bg-amber-500', shadow: 'shadow-amber-500/50', textColor: 'text-amber-500', borderColor: 'border-amber-200' },
  { id: 'nature', label: 'Naturaleza', icon: Palmtree, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/50', textColor: 'text-emerald-500', borderColor: 'border-emerald-200' },
  { id: 'park', label: 'Parque', icon: Ticket, color: 'bg-rose-500', shadow: 'shadow-rose-500/50', textColor: 'text-rose-500', borderColor: 'border-rose-200' },
  { id: 'beach', label: 'Playa', icon: Waves, color: 'bg-blue-500', shadow: 'shadow-blue-500/50', textColor: 'text-blue-500', borderColor: 'border-blue-200' },
  { id: 'hotel', label: 'Alojamiento', icon: BedDouble, color: 'bg-violet-500', shadow: 'shadow-violet-500/50', textColor: 'text-violet-500', borderColor: 'border-violet-200' },
];

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { renderToString } from 'react-dom/server';

// Icon Cache to prevent re-running renderToString and recreating L.divIcon objects on every render
const iconCache = new Map<string, L.DivIcon>();

const createCustomIcon = (isSelected: boolean, typeId?: string) => {
  const key = `${typeId || 'default'}_${isSelected ? 'selected' : 'normal'}`;
  if (iconCache.has(key)) {
    return iconCache.get(key)!;
  }

  const typeInfo = MARKER_TYPES.find(t => t.id === typeId) || MARKER_TYPES[0];
  const IconComponent = typeInfo.icon;
  const iconHtml = renderToString(<IconComponent className="text-white w-4 h-4" strokeWidth={2.5} />);

  const icon = L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="relative cursor-pointer group flex flex-col items-center justify-center h-full w-full">
            <div class="relative w-8 h-8 ${isSelected ? `${typeInfo.color} shadow-[0_0_15px_var(--tw-shadow-color)] ${typeInfo.color.replace('bg-', 'shadow-')} border-white scale-125 z-50` : `${typeInfo.color} ${typeInfo.shadow} border-white scale-100 z-10`} rounded-full flex items-center justify-center shadow-md border-2 transition-transform duration-300 group-hover:scale-110">
              ${iconHtml}
            </div>
          </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  iconCache.set(key, icon);
  return icon;
};

const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  
  return L.divIcon({
    className: 'custom-leaflet-cluster',
    html: `<div class="relative cursor-pointer group flex flex-col items-center justify-center h-full w-full">
            <div class="relative w-10 h-10 bg-slate-800 shadow-lg shadow-slate-800/40 border-white border-2 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 z-50 ring-4 ring-slate-800/10">
              <span class="text-white font-extrabold text-sm">${count}</span>
            </div>
          </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

function MapEvents({ onMapClick, onMapDrag }: { onMapClick: () => void, onMapDrag: () => void }) {
  useMapEvents({
    click: () => onMapClick(),
    dragstart: () => onMapDrag()
  });
  return null;
}

function MapFlyTo({ 
  selectedLocationId, 
  validLocations, 
  isPanelOpen, 
  recenterSignal, 
  activeTab, 
  isExpanded,
  isFilterTypeSelectorOpen,
  isAddTypeSelectorOpen,
  isManualMode
}: { 
  selectedLocationId: string | null, 
  validLocations: Location[], 
  isPanelOpen: boolean, 
  recenterSignal: number, 
  activeTab: string, 
  isExpanded: boolean,
  isFilterTypeSelectorOpen: boolean,
  isAddTypeSelectorOpen: boolean,
  isManualMode: boolean
}) {
  const map = useMap();
  const [initialized, setInitialized] = useState(false);
  const prevSignalRef = useRef(recenterSignal);
  const prevSelectedLocRef = useRef(selectedLocationId);
  const prevTopSpaceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!initialized) {
      if (validLocations.length > 0) {
        const bounds = L.latLngBounds(validLocations.map(l => [l.lat, l.lng]));
        map.fitBounds(bounds, { padding: [50, 50], animate: false });
      } else {
        map.setView([28.291565, -16.629129], 10, { animate: false });
      }
      setInitialized(true);
    } else if (selectedLocationId) {
      const loc = validLocations.find(l => l.id === selectedLocationId);
      if (!loc) return;

      let targetLatLng = L.latLng(loc.lat, loc.lng);
      let topSpace = 0;

      if (typeof window !== 'undefined') {
        const isDesktop = window.innerWidth >= 768;
        const leftSpace = (isPanelOpen && isDesktop) ? 384 : 0;
        
        if (isPanelOpen && !isDesktop) {
          let estimatedContentHeight = 74;
          if (activeTab === 'list') {
            if (isFilterTypeSelectorOpen) estimatedContentHeight += 62;
            if (isExpanded) {
              const itemCount = Math.max(1, validLocations.length);
              const listHeight = Math.min(window.innerHeight * 0.5, itemCount * 52 + 24);
              estimatedContentHeight += listHeight;
            }
          } else if (activeTab === 'add') {
            if (isAddTypeSelectorOpen) estimatedContentHeight += 62;
            if (isManualMode) estimatedContentHeight += 54;
          }
          topSpace = estimatedContentHeight + 52;
        }

        const bottomSpace = isDesktop ? 168 : 274;
        
        const availableWidth = window.innerWidth - leftSpace;
        const centerOfAvailableX = leftSpace + (availableWidth / 2);
        const xOffset = (window.innerWidth / 2) - centerOfAvailableX;
        
        const availableHeight = window.innerHeight - topSpace - bottomSpace;
        const centerOfAvailableY = topSpace + (availableHeight / 2);
        const yOffset = (window.innerHeight / 2) - centerOfAvailableY;
        
        const targetPoint = map.project(targetLatLng, 15);
        targetPoint.x += xOffset;
        targetPoint.y += yOffset;
        targetLatLng = map.unproject(targetPoint, 15);
      }

      const isSignalTriggered = prevSignalRef.current !== recenterSignal;
      prevSignalRef.current = recenterSignal;

      const locChanged = prevSelectedLocRef.current !== selectedLocationId;
      prevSelectedLocRef.current = selectedLocationId;

      const topSpaceChanged = prevTopSpaceRef.current !== null && Math.abs(prevTopSpaceRef.current - topSpace) > 5;
      prevTopSpaceRef.current = topSpace;

      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      const distance = currentCenter.distanceTo(targetLatLng);

      // Solo volar si cambió la ubicación, si cambió realmente la altura del panel, si el usuario recentró explícitamente, o si la distancia es > 15 metros
      if (locChanged || topSpaceChanged || isSignalTriggered || (distance > 15 || currentZoom !== 15)) {
        map.flyTo(targetLatLng, 15, { duration: 0.5 });
      }
    }
  }, [selectedLocationId, validLocations, isPanelOpen, initialized, recenterSignal, activeTab, isExpanded, isFilterTypeSelectorOpen, isAddTypeSelectorOpen, isManualMode]);
  return null;
}

export default function MapView() {
  const [locations, setLocations] = useLocalStorage<Location[]>('tenerife_locations', []);
  const [newLocationName, setNewLocationName] = useState('');
  
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [isManualMode, setIsManualMode] = useState(false);
  const [recenterSignal, setRecenterSignal] = useState(0);
  const [manualUrl, setManualUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedType, setSelectedType] = useState('default');
  const [filterType, setFilterType] = useState('all');
  const [isAddTypeSelectorOpen, setIsAddTypeSelectorOpen] = useState(false);
  const [isFilterTypeSelectorOpen, setIsFilterTypeSelectorOpen] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (map) {
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [map]);

  const saveLocation = (newLocation: Location) => {
    let updatedLocations = locations;
    if (newLocation.type === 'hotel') {
      updatedLocations = locations.filter(loc => loc.type !== 'hotel');
    }
    setLocations([newLocation, ...updatedLocations]);
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationName.trim() ) return;

    if (isManualMode) {
      if (!manualUrl.trim()) {
        setError('Añade un enlace de Google Maps.');
        return;
      }
      
      let lat: number | null = null;
      let lng: number | null = null;
      
      const match3d = manualUrl.match(/!3d(-?\d+(?:\.\d+)?)/);
      const match4d = manualUrl.match(/!4d(-?\d+(?:\.\d+)?)/);
      
      if (match3d && match4d) {
        lat = parseFloat(match3d[1]);
        lng = parseFloat(match4d[1]);
      } else {
        const latLngMatch = manualUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || manualUrl.match(/search\/(-?\d+\.\d+),(-?\d+\.\d+)/) || manualUrl.match(/place\/[^/]+\/(-?\d+\.\d+),(-?\d+\.\d+)/) || manualUrl.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (latLngMatch) {
          lat = parseFloat(latLngMatch[1]);
          lng = parseFloat(latLngMatch[2]);
        } else {
          const simpleMatch = manualUrl.match(/^(-?\d+\.\d+)[\s,]+(-?\d+\.\d+)$/);
          if (simpleMatch) {
            lat = parseFloat(simpleMatch[1]);
            lng = parseFloat(simpleMatch[2]);
          }
        }
      }

      if (lat === null || lng === null) {
        setError('No se pudieron extraer las coordenadas. Usa un enlace largo que contenga la arroba (@) o !3d y !4d.');
        return;
      }

      const newLocation: Location = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
        name: newLocationName.trim(),
        lat,
        lng,
        url: manualUrl.trim(),
        type: selectedType
      };
      saveLocation(newLocation);
      setNewLocationName('');
      setManualUrl('');
      setSelectedType('default');
      setSelectedLocationId(newLocation.id);
      setActiveTab('list');
      setIsManualMode(false);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      // Use Nominatim for free geocoding
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newLocationName + ' Tenerife')}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const newLocation: Location = {
          id: generateId(),
          name: newLocationName.trim(),
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          type: selectedType
        };
        saveLocation(newLocation);
        setNewLocationName('');
        setSelectedType('default');
        setSelectedLocationId(newLocation.id);
        setActiveTab('list');
      } else {
        setError('No se pudo ubicar el nombre en el mapa. Intenta con un nombre más conocido de Tenerife.');
      }
    } catch (err) {
      setError('Error al buscar la ubicación.');
    } finally {
      setIsSearching(false);
    }
  };

  const removeLocation = (id: string) => {
    setLocations(locations.filter(loc => loc.id !== id));
    if (selectedLocationId === id) setSelectedLocationId(null);
  };

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesQuery = loc.name.toLowerCase().includes(filterQuery.toLowerCase());
      const locType = loc.type || 'default';
      const matchesType = filterType === 'all' || locType === filterType;
      return matchesQuery && matchesType;
    });
  }, [locations, filterQuery, filterType]);

  const validLocations = useMemo(() => {
    return filteredLocations.filter(loc => typeof loc.lat === 'number' && typeof loc.lng === 'number' && !isNaN(loc.lat) && !isNaN(loc.lng));
  }, [filteredLocations]);
  const selectedLocation = validLocations.find(loc => loc.id === selectedLocationId);

  return (
    <div className="absolute inset-0 z-0 animate-in fade-in duration-500">
      {/* Fullscreen Map Container */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          ref={setMap}
          center={[28.291565, -16.629129]}
          zoom={10}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
            keepBuffer={2}
          />
          <MapFlyTo 
            selectedLocationId={selectedLocationId}
            validLocations={validLocations}
            isPanelOpen={isPanelOpen}
            recenterSignal={recenterSignal}
            activeTab={activeTab}
            isExpanded={isExpanded}
            isFilterTypeSelectorOpen={isFilterTypeSelectorOpen}
            isAddTypeSelectorOpen={isAddTypeSelectorOpen}
            isManualMode={isManualMode}
          />
          <MapEvents 
            onMapClick={() => { setIsExpanded(false); setSelectedLocationId(null); }} 
            onMapDrag={() => { setIsExpanded(false); setSelectedLocationId(null); }}
          />
          
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={40}
            showCoverageOnHover={false}
            iconCreateFunction={createClusterCustomIcon}
          >
            {validLocations.map(loc => (
              <Marker 
                key={loc.id} 
                position={[loc.lat, loc.lng]}
                icon={createCustomIcon(selectedLocationId === loc.id, loc.type)}
                eventHandlers={{
                  click: () => {
                    setSelectedLocationId(loc.id);
                    setIsExpanded(false);
                  },
                }}
              />
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      {/* Floating UI Container */}
      <div className="relative z-10 pointer-events-none w-full h-full p-4 md:p-6 pb-[110px] md:pb-6 flex flex-col items-start gap-4 overflow-hidden">
        
        {/* Toggle Button (when panel is closed) */}
        {!isPanelOpen && (
          <div className="flex flex-col gap-3 pointer-events-auto">
            <button 
              onClick={() => { setIsPanelOpen(true); setIsExpanded(false); }}
              className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50 text-slate-700 hover:text-orange-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Sliding Panel */}
        <div 
          id="top-panel"
          className={cn(
          "flex flex-col gap-4 w-full md:w-96 max-h-[85%] transition-all duration-300 ease-in-out pointer-events-auto",
          isPanelOpen ? "translate-x-0 opacity-100" : "-translate-x-[110%] opacity-0 absolute"
        )}>
          
          <section className="bg-white/95 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/50 flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between p-2 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => {
                    if (activeTab === 'list') {
                      setRecenterSignal(prev => prev + 1);
                    } else {
                      setActiveTab('list');
                    }
                  }}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2",
                    activeTab === 'list' ? "bg-orange-50 text-orange-600" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <List className="w-4 h-4" /> Lugares
                </button>
                <button
                  onClick={() => setActiveTab('add')}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2",
                    activeTab === 'add' ? "bg-orange-50 text-orange-600" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <Plus className="w-4 h-4" /> Añadir
                </button>
              </div>
              <button 
                onClick={() => setIsPanelOpen(false)}
                className="p-2 ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Content: Add Location */}
            {activeTab === 'add' && (
              <div className="p-4 flex-1 min-h-0 overflow-y-auto flex flex-col scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <form onSubmit={handleAddLocation} className="flex flex-col">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        value={newLocationName}
                        onChange={(e) => setNewLocationName(e.target.value)}
                        placeholder="Nombre del lugar..."
                        className="w-full h-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-10 pr-2 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-900"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddTypeSelectorOpen(!isAddTypeSelectorOpen)}
                      className="w-[42px] shrink-0 h-[42px] bg-slate-50/50 border border-slate-200 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-colors"
                      title="Elegir icono"
                    >
                      {(() => {
                        const typeInfo = MARKER_TYPES.find(t => t.id === selectedType) || MARKER_TYPES[0];
                        const Icon = typeInfo.icon;
                        return <Icon className={cn("w-5 h-5", selectedType === 'default' ? 'text-slate-400' : typeInfo.textColor)} />;
                      })()}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsManualMode(!isManualMode)}
                      className={cn("w-[42px] shrink-0 h-[42px] rounded-2xl flex items-center justify-center transition-colors border", isManualMode ? "bg-slate-800 text-white border-slate-800" : "bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-100")}
                      title="Enlace manual"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button 
                      type="submit"
                      disabled={isSearching || !newLocationName.trim() || (isManualMode && !manualUrl.trim())}
                      className={cn(
                        "w-[42px] shrink-0 h-[42px] text-white rounded-2xl flex items-center justify-center transition-all shadow-md disabled:opacity-50",
                        isManualMode ? "bg-blue-500 shadow-blue-200 hover:bg-blue-600" : "bg-orange-500 shadow-orange-200 hover:bg-orange-600"
                      )}
                      title="Guardar"
                    >
                      {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {isAddTypeSelectorOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3">
                          <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-2 grid grid-cols-4 gap-2 w-full">
                            {MARKER_TYPES.map(type => (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => { setSelectedType(type.id); setIsAddTypeSelectorOpen(false); }}
                                className={cn(
                                  "w-10 h-10 mx-auto rounded-xl flex items-center justify-center border transition-colors",
                                  selectedType === type.id ? `${type.color} text-white border-transparent shadow-sm` : `bg-white ${type.textColor} border-slate-200 hover:bg-slate-50`
                                )}
                                title={type.label}
                              >
                                <type.icon className="w-5 h-5" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {isManualMode && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3">
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                              type="url"
                              value={manualUrl}
                              onChange={(e) => setManualUrl(e.target.value)}
                              placeholder="Enlace de Google Maps..."
                              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900"
                              required
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {error && <p className="text-xs text-red-500 font-medium px-2 text-center">{error}</p>}
                </form>
              </div>
            )}

            {/* Tab Content: Location List */}
            {activeTab === 'list' && (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="p-4 flex flex-col shrink-0">
                  <div className="flex gap-2">
                    <div className="relative flex-1 shrink-0">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        value={filterQuery}
                        onChange={(e) => {
                          setFilterQuery(e.target.value);
                          if (!isExpanded) setIsExpanded(true);
                        }}
                        onFocus={() => {
                          if (!isExpanded) setIsExpanded(true);
                        }}
                        placeholder="Filtrar ubicaciones..."
                        className="w-full h-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-900"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFilterTypeSelectorOpen(!isFilterTypeSelectorOpen)}
                      className={cn("w-[42px] h-[42px] shrink-0 rounded-2xl flex items-center justify-center transition-colors border", isFilterTypeSelectorOpen ? "bg-slate-800 text-white border-slate-800" : "bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-100")}
                      title="Filtrar"
                    >
                      {filterType === 'all' ? <Filter className="w-5 h-5" /> : (() => {
                        const typeInfo = MARKER_TYPES.find(t => t.id === filterType) || MARKER_TYPES[0];
                        const Icon = typeInfo.icon;
                        return <Icon className={cn("w-5 h-5", isFilterTypeSelectorOpen ? "text-white" : typeInfo.textColor)} />;
                      })()}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className={cn("w-[42px] h-[42px] shrink-0 rounded-2xl flex items-center justify-center transition-colors border", isExpanded ? "bg-slate-800 text-white border-slate-800 shadow-slate-200" : "bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-100")}
                      title={isExpanded ? "Ocultar lista" : "Mostrar lista"}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {isFilterTypeSelectorOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden shrink-0"
                      >
                        <div className="pt-3">
                          <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-2 grid grid-cols-4 gap-2 w-full">
                            <button 
                              type="button" 
                              onClick={() => { setFilterType('all'); setIsFilterTypeSelectorOpen(false); }}
                              className={cn("w-10 h-10 mx-auto rounded-xl flex items-center justify-center border transition-colors", filterType === 'all' ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100")}
                              title="Todos"
                            >
                              <Filter className="w-5 h-5" />
                            </button>
                            {MARKER_TYPES.map(type => (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => { setFilterType(type.id); setIsFilterTypeSelectorOpen(false); }}
                                className={cn(
                                  "w-10 h-10 mx-auto rounded-xl flex items-center justify-center border transition-colors",
                                  filterType === type.id ? `${type.color} text-white border-transparent shadow-sm` : `bg-white ${type.textColor} border-slate-200 hover:bg-slate-50`
                                )}
                                title={type.label}
                              >
                                <type.icon className="w-5 h-5" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="max-h-[50vh] overflow-y-auto space-y-2 px-4 pb-4 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {filteredLocations.length === 0 ? (
                          <p className="text-sm font-medium text-slate-400 text-center py-8">
                            {locations.length === 0 ? "No hay ubicaciones guardadas." : "No hay resultados."}
                          </p>
                        ) : (
                          filteredLocations.map(loc => {
                            const typeInfo = MARKER_TYPES.find(t => t.id === loc.type) || MARKER_TYPES[0];
                            const IconComponent = typeInfo.icon;
                            
                            return (
                            <div 
                              key={loc.id} 
                              onClick={() => {
                                setSelectedLocationId(loc.id);
                                setIsExpanded(false);
                              }}
                              className={cn(
                                "flex items-center justify-between p-2.5 rounded-xl group border cursor-pointer transition-colors",
                                selectedLocationId === loc.id 
                                  ? "bg-slate-900 border-slate-900" 
                                  : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
                              )}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                  selectedLocationId === loc.id 
                                    ? "bg-slate-800 text-white" 
                                    : `bg-slate-50 ${typeInfo.textColor} group-hover:scale-110`
                                )}>
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <p className={cn(
                                  "text-sm truncate",
                                  selectedLocationId === loc.id ? "font-bold text-white" : "font-medium text-slate-700 group-hover:text-slate-900"
                                )}>{loc.name}</p>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeLocation(loc.id);
                                }}
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                  selectedLocationId === loc.id ? "text-slate-400 hover:text-red-400 hover:bg-slate-800" : "text-slate-300 hover:text-red-500 hover:bg-red-50"
                                )}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )})
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>

        {/* Map Controls */}
        <div className={cn(
          "absolute right-4 md:right-6 pointer-events-auto flex flex-row gap-2 transition-all duration-300 z-40",
          selectedLocation ? "bottom-[calc(130px+160px)] md:bottom-[calc(24px+160px)]" : "bottom-[130px] md:bottom-6"
        )}>
          {locations.some(l => l.type === 'hotel') && (
            <button 
              onClick={() => {
                const hotel = locations.find(l => l.type === 'hotel');
                if (hotel && map) {
                  map.flyTo([hotel.lat, hotel.lng], 15, { duration: 1 });
                  setSelectedLocationId(hotel.id);
                  setIsExpanded(false);
                }
              }}
              className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-violet-600 hover:bg-violet-50 border border-slate-100 transition-colors hover:scale-105 active:scale-95"
              title="Ir al Hotel"
            >
              <BedDouble className="w-6 h-6" />
            </button>
          )}
          <button 
            onClick={() => {
              if (validLocations.length > 0 && map) {
                const bounds = L.latLngBounds(validLocations.map(l => [l.lat, l.lng]));
                map.fitBounds(bounds, { padding: [50, 50], duration: 1 });
              }
            }}
            className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 border border-slate-100 transition-colors hover:scale-105 active:scale-95"
            title="Centrar Mapa"
          >
            <Maximize className="w-6 h-6" />
          </button>
        </div>

        {/* Selected Location Card (Bottom Sheet style) */}
        <AnimatePresence>
          {selectedLocationId && selectedLocation && (
            <motion.div
              id="bottom-card"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 150, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              className="absolute bottom-[130px] md:bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[400px] pointer-events-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-4 flex flex-col gap-4 z-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                    MARKER_TYPES.find(t => t.id === selectedLocation.type)?.color || "bg-blue-500",
                    "text-white"
                  )}>
                    {(() => {
                      const typeInfo = MARKER_TYPES.find(t => t.id === selectedLocation.type) || MARKER_TYPES[0];
                      const IconComponent = typeInfo.icon;
                      return <IconComponent className="w-6 h-6" />;
                    })()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-slate-900 truncate text-lg">{selectedLocation.name}</h3>
                    <p className="text-sm text-slate-500 font-medium">
                      {(MARKER_TYPES.find(t => t.id === selectedLocation.type) || MARKER_TYPES[0]).label}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLocationId(null)}
                  className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2">
                <a
                  href={selectedLocation.url || `https://www.google.com/maps/search/?api=1&query=${selectedLocation.lat},${selectedLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-3 px-4 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-md no-underline"
                >
                  <Navigation className="w-4 h-4" /> Google Maps
                </a>
                <button
                  onClick={() => removeLocation(selectedLocation.id)}
                  className="flex-none flex items-center justify-center w-12 bg-red-50 text-red-600 py-3 rounded-2xl hover:bg-red-100 hover:text-red-700 transition-colors border-none cursor-pointer"
                  title="Eliminar lugar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
