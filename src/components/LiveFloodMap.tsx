import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  ZoneData,
  ShelterData,
  RoadSegment,
  SensorData,
  EvacuationRoutePlan,
} from '../types';
import { getRiskColor } from '../utils/aiRiskEngine';
import {
  Layers,
  MapPin,
  Home,
  AlertTriangle,
  Radio,
  Navigation,
  Crosshair,
  Info,
} from 'lucide-react';

interface LiveFloodMapProps {
  zones: ZoneData[];
  selectedZone: ZoneData;
  onSelectZone: (zone: ZoneData) => void;
  shelters: ShelterData[];
  roads: RoadSegment[];
  sensors: SensorData[];
  evacuationRoute: EvacuationRoutePlan;
  onSelectShelter: (shelter: ShelterData) => void;
}

export const LiveFloodMap: React.FC<LiveFloodMapProps> = ({
  zones,
  selectedZone,
  onSelectZone,
  shelters,
  roads,
  sensors,
  evacuationRoute,
  onSelectShelter,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Layer toggles
  const [showZones, setShowZones] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showFloodedRoads, setShowFloodedRoads] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showEvacuationRoute, setShowEvacuationRoute] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [13.078, 80.272],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Positron Light Tile Layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Custom Zoom Control top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Update Layers when state or toggles change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Draw River & Waterway Polyline (Main Metropolitan River)
    const riverCoords: [number, number][] = [
      [13.115, 80.252],
      [13.098, 80.260],
      [13.082, 80.272],
      [13.074, 80.280],
      [13.062, 80.292],
      [13.048, 80.305],
    ];

    const riverPolyline = L.polyline(riverCoords, {
      color: '#0284c7',
      weight: 8,
      opacity: 0.85,
      dashArray: '1, 0',
      lineCap: 'round',
    }).bindTooltip('<b>Adyar-Cooum Main River Conduit</b><br/>Discharge: 320 m³/s (Critical High)', {
      sticky: true,
      className: 'bg-white text-slate-800 text-xs px-2 py-1 rounded-lg shadow-md border border-slate-200',
    });
    layerGroup.addLayer(riverPolyline);

    // 2. Risk Zones Polygons
    if (showZones) {
      zones.forEach((zone) => {
        const theme = getRiskColor(zone.riskLevel);
        const isSelected = zone.id === selectedZone.id;

        const polygon = L.polygon(zone.polygon, {
          color: isSelected ? '#0f172a' : theme.hex,
          weight: isSelected ? 3.5 : 2,
          fillColor: theme.hex,
          fillOpacity: isSelected ? 0.4 : 0.22,
          dashArray: isSelected ? '4, 4' : undefined,
        });

        polygon.on('click', () => {
          onSelectZone(zone);
        });

        polygon.bindTooltip(
          `<div class="text-xs p-1 font-sans">
            <div class="font-bold flex items-center justify-between gap-2 text-slate-900">
              <span>${zone.code} - ${zone.name}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-mono text-white" style="background:${theme.hex}">${zone.riskLevel}</span>
            </div>
            <div class="text-slate-600 mt-1">Risk Score: <b class="text-slate-900">${zone.riskScore}/100</b></div>
            <div class="text-slate-600">Water Level: <b class="text-slate-900">${zone.waterLevel}m</b></div>
            <div class="text-slate-600">Population: <b class="text-slate-900">${zone.population.toLocaleString()}</b></div>
          </div>`,
          {
            sticky: true,
            className: 'bg-white text-slate-900 border border-slate-200 rounded-lg shadow-lg',
          }
        );

        layerGroup.addLayer(polygon);

        // Center Zone Label Marker
        const labelIcon = L.divIcon({
          className: 'custom-zone-label',
          html: `
            <div class="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold shadow-md cursor-pointer border flex items-center gap-1.5 ${
              isSelected ? 'bg-slate-900 text-white border-slate-900 scale-105' : 'bg-white text-slate-800 border-slate-300'
            }" style="border-left: 4px solid ${theme.hex};">
              <span>${zone.code}</span>
              <span class="text-[10px] font-bold" style="color: ${theme.hex};">${zone.riskScore}</span>
            </div>
          `,
          iconSize: [80, 26],
          iconAnchor: [40, 13],
        });

        const labelMarker = L.marker(zone.center, { icon: labelIcon });
        labelMarker.on('click', () => onSelectZone(zone));
        layerGroup.addLayer(labelMarker);
      });
    }

    // 3. Roads & Flooded Status
    if (showFloodedRoads) {
      roads.forEach((road) => {
        const isFlooded = road.status === 'FLOODED' || road.status === 'BLOCKED';
        const color = isFlooded ? '#ef4444' : road.status === 'WATERLOGGED' ? '#f59e0b' : '#10b981';

        const line = L.polyline([road.from, road.to], {
          color,
          weight: isFlooded ? 4.5 : 2.5,
          opacity: 0.9,
          dashArray: isFlooded ? '6, 6' : undefined,
        });

        line.bindTooltip(
          `<b>${road.name}</b><br/>Status: <span style="color:${color};font-weight:bold;">${road.status}</span><br/>Water Depth: ${road.waterDepthCm} cm`,
          { sticky: true, className: 'bg-white text-slate-800 text-xs border border-slate-200 shadow-md' }
        );

        layerGroup.addLayer(line);

        if (isFlooded) {
          const midLat = (road.from[0] + road.to[0]) / 2;
          const midLng = (road.from[1] + road.to[1]) / 2;

          const barricadeIcon = L.divIcon({
            className: 'barricade-icon',
            html: `<div class="w-6 h-6 rounded-full bg-rose-600 border-2 border-white text-white flex items-center justify-center text-[10px] font-bold shadow-md animate-pulse" title="Flooded Road: ${road.waterDepthCm}cm">✕</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const barricadeMarker = L.marker([midLat, midLng], { icon: barricadeIcon });
          barricadeMarker.bindTooltip(`<b>${road.name}</b><br/><span class="text-rose-600 font-bold">FLOOD DEPTH: ${road.waterDepthCm}cm</span><br/>Route Impassable`, {
            className: 'bg-white text-slate-900 text-xs border border-rose-200 shadow-lg',
          });
          layerGroup.addLayer(barricadeMarker);
        }
      });
    }

    // 4. Safe Shelters
    if (showShelters) {
      shelters.forEach((shelter) => {
        const isFull = shelter.status === 'FULL';
        const isNear = shelter.status === 'NEAR_CAPACITY';
        const badgeColor = isFull ? '#ef4444' : isNear ? '#d97706' : '#059669';

        const shelterIcon = L.divIcon({
          className: 'shelter-pin',
          html: `
            <div class="relative group cursor-pointer flex items-center justify-center w-7 h-7 rounded-lg shadow-md border-2 border-white text-white transition-transform hover:scale-125" style="background-color: ${badgeColor};">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white" style="background-color: ${badgeColor}"></span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([shelter.lat, shelter.lng], { icon: shelterIcon });
        marker.on('click', () => onSelectShelter(shelter));

        marker.bindTooltip(
          `<div class="p-1 font-sans text-xs">
            <div class="font-bold text-slate-900">${shelter.name}</div>
            <div class="text-slate-600">${shelter.type} • Distance: ${shelter.distanceKm} km</div>
            <div class="mt-1 flex items-center justify-between gap-3">
              <span class="text-slate-700">Capacity: ${shelter.occupied}/${shelter.capacity}</span>
              <span class="font-bold" style="color:${badgeColor}">${shelter.status}</span>
            </div>
            <div class="text-emerald-700 mt-0.5 font-semibold">Available Beds: ${shelter.available}</div>
          </div>`,
          { sticky: true, className: 'bg-white text-slate-900 border border-slate-200 rounded-lg shadow-lg' }
        );

        layerGroup.addLayer(marker);
      });
    }

    // 5. Environmental Sensors
    if (showSensors) {
      sensors.forEach((sensor) => {
        const isWater = sensor.type === 'WATER_LEVEL';
        const isRain = sensor.type === 'RAINFALL';
        const sensorColor = sensor.status === 'CRITICAL' ? '#ef4444' : sensor.status === 'WARNING' ? '#f59e0b' : '#0284c7';

        const sensorIcon = L.divIcon({
          className: 'sensor-marker',
          html: `
            <div class="w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md text-white text-[9px] font-mono font-bold" style="background-color: ${sensorColor};">
              ${isWater ? 'W' : isRain ? 'R' : 'S'}
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([sensor.lat, sensor.lng], { icon: sensorIcon });
        marker.bindTooltip(
          `<b>${sensor.code}</b>: ${sensor.name}<br/><b>${sensor.value} ${sensor.unit}</b> (${sensor.status})<br/>Battery: ${sensor.batteryLevel}%`,
          { sticky: true, className: 'bg-white text-slate-800 text-xs border border-slate-200 shadow-md' }
        );
        layerGroup.addLayer(marker);
      });
    }

    // 6. Active Dynamic Evacuation Route
    if (showEvacuationRoute && evacuationRoute) {
      const routePolyline = L.polyline(evacuationRoute.waypoints, {
        color: '#0284c7',
        weight: 6,
        opacity: 0.95,
        dashArray: '8, 8',
      });

      routePolyline.bindTooltip(
        `<b>DYNAMIC EVACUATION CORRIDOR</b><br/>To: ${evacuationRoute.destinationShelter.name}<br/>Distance: ${evacuationRoute.totalDistanceKm} km | Est: ${evacuationRoute.estimatedTravelMinutes} mins`,
        { sticky: true, className: 'bg-white text-sky-900 text-xs border border-sky-300 shadow-md' }
      );

      layerGroup.addLayer(routePolyline);

      // Start Origin Pulsing Marker
      const originIcon = L.divIcon({
        className: 'origin-marker',
        html: `
          <div class="w-7 h-7 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-white shadow-lg animate-ping opacity-75"></div>
          <div class="w-5 h-5 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white font-bold text-[10px] absolute top-1 left-1">A</div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const originMarker = L.marker(evacuationRoute.waypoints[0], { icon: originIcon });
      layerGroup.addLayer(originMarker);
    }
  }, [
    zones,
    selectedZone,
    shelters,
    roads,
    sensors,
    evacuationRoute,
    showZones,
    showShelters,
    showFloodedRoads,
    showSensors,
    showEvacuationRoute,
    onSelectZone,
    onSelectShelter,
  ]);

  // Center on selected zone
  const handleRecenter = () => {
    if (mapInstanceRef.current && selectedZone) {
      mapInstanceRef.current.flyTo(selectedZone.center, 14, { duration: 1.2 });
    }
  };

  const selectedTheme = getRiskColor(selectedZone.riskLevel);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-sm">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left Layer Control Chips */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/90 shadow-md">
        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-700 px-2 py-0.5">
          <Layers className="w-3.5 h-3.5 text-sky-600" />
          Layers:
        </span>
        <button
          onClick={() => setShowZones(!showZones)}
          className={`px-2 py-1 rounded-lg text-[10px] font-semibold tracking-wide transition ${
            showZones
              ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
              : 'bg-slate-100 text-slate-600 border border-transparent hover:text-slate-900'
          }`}
        >
          Risk Zones
        </button>
        <button
          onClick={() => setShowShelters(!showShelters)}
          className={`px-2 py-1 rounded-lg text-[10px] font-semibold tracking-wide transition ${
            showShelters
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
              : 'bg-slate-100 text-slate-600 border border-transparent hover:text-slate-900'
          }`}
        >
          Shelters ({shelters.length})
        </button>
        <button
          onClick={() => setShowFloodedRoads(!showFloodedRoads)}
          className={`px-2 py-1 rounded-lg text-[10px] font-semibold tracking-wide transition ${
            showFloodedRoads
              ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs'
              : 'bg-slate-100 text-slate-600 border border-transparent hover:text-slate-900'
          }`}
        >
          Flooded Roads
        </button>
        <button
          onClick={() => setShowSensors(!showSensors)}
          className={`px-2 py-1 rounded-lg text-[10px] font-semibold tracking-wide transition ${
            showSensors
              ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
              : 'bg-slate-100 text-slate-600 border border-transparent hover:text-slate-900'
          }`}
        >
          Sensors ({sensors.length})
        </button>
        <button
          onClick={() => setShowEvacuationRoute(!showEvacuationRoute)}
          className={`px-2 py-1 rounded-lg text-[10px] font-semibold tracking-wide transition ${
            showEvacuationRoute
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
              : 'bg-slate-100 text-slate-600 border border-transparent hover:text-slate-900'
          }`}
        >
          Evacuation Route
        </button>

        <button
          onClick={handleRecenter}
          title="Recenter Map"
          className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition ml-1"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-3.5 left-3.5 z-10 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/90 text-[10px] shadow-lg flex items-center gap-3">
        <span className="font-bold text-slate-700">STATUS:</span>
        <div className="flex items-center gap-1.5 text-rose-700 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Critical (86-100)</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-700 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>High (71-85)</span>
        </div>
        <div className="flex items-center gap-1.5 text-yellow-700 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span>Moderate (51-70)</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Safe / Low</span>
        </div>
      </div>

      {/* Selected Zone Live Telemetry Card Overlay (Bottom Right) */}
      <div className="absolute bottom-3.5 right-3.5 z-10 w-72 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 p-3.5 shadow-xl text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <div className="text-[10px] text-slate-500 font-mono">INSPECTING SECTOR</div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{selectedZone.code}</span>
              <span className="text-xs text-slate-500 font-normal truncate">({selectedZone.name})</span>
            </h4>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${selectedTheme.badgeBg} ${selectedTheme.badgeText} border ${selectedTheme.border}`}>
            {selectedZone.riskLevel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 my-2.5 text-xs">
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/70">
            <div className="text-[10px] text-slate-500 font-medium">Flood Risk Score</div>
            <div className="text-base font-bold font-mono flex items-baseline gap-1 mt-0.5">
              <span className={selectedTheme.badgeText}>{selectedZone.riskScore}</span>
              <span className="text-[10px] text-slate-400">/100</span>
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/70">
            <div className="text-[10px] text-slate-500 font-medium">Water Level</div>
            <div className="text-base font-bold font-mono text-blue-700 mt-0.5">
              {selectedZone.waterLevel} <span className="text-[10px] text-slate-500">m</span>
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/70">
            <div className="text-[10px] text-slate-500 font-medium">24h Rainfall</div>
            <div className="text-sm font-bold font-mono text-slate-800 mt-0.5">
              {selectedZone.rainfall24h} mm
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/70">
            <div className="text-[10px] text-slate-500 font-medium">Population</div>
            <div className="text-sm font-bold font-mono text-slate-800 mt-0.5">
              {selectedZone.population.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-amber-50/80 rounded-lg p-2 border border-amber-200/80 text-[11px]">
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-medium">Estimated Flooding:</span>
            <span className="font-bold text-amber-800 font-mono">
              {selectedZone.estimatedTimeToFloodMinutes !== null
                ? `${Math.floor(selectedZone.estimatedTimeToFloodMinutes / 60)}h ${selectedZone.estimatedTimeToFloodMinutes % 60}m`
                : 'No Imminent Flood'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
