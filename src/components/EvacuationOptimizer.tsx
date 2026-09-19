import React, { useState } from 'react';
import { ZoneData, ShelterData, RoadSegment, EvacuationRoutePlan } from '../types';
import { planEvacuationRoute } from '../utils/aiRiskEngine';
import {
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Route,
  Compass,
} from 'lucide-react';

interface EvacuationOptimizerProps {
  zones: ZoneData[];
  selectedZone: ZoneData;
  onSelectZone: (zone: ZoneData) => void;
  shelters: ShelterData[];
  roads: RoadSegment[];
  currentRoute: EvacuationRoutePlan;
  onRouteCalculated: (route: EvacuationRoutePlan) => void;
}

export const EvacuationOptimizer: React.FC<EvacuationOptimizerProps> = ({
  zones,
  selectedZone,
  onSelectZone,
  shelters,
  roads,
  currentRoute,
  onRouteCalculated,
}) => {
  const [selectedOriginZoneId, setSelectedOriginZoneId] = useState(selectedZone.id);

  const handleOriginChange = (zoneId: string) => {
    setSelectedOriginZoneId(zoneId);
    const z = zones.find((item) => item.id === zoneId);
    if (z) {
      onSelectZone(z);
      const newPlan = planEvacuationRoute(z, shelters, roads);
      onRouteCalculated(newPlan);
    }
  };

  const currentOrigin = zones.find((z) => z.id === selectedOriginZoneId) || selectedZone;
  const targetShelter = currentRoute.destinationShelter;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-700">
            <Compass className="w-4 h-4" />
            <span>DYNAMIC EVACUATION ROUTE OPTIMIZER</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Safest Inundation-Free Path Algorithm
          </h2>
          <p className="text-xs text-slate-500">
            Calculates live detours avoiding submerged underpasses, elevated dyke spillways, and choked arterial intersections.
          </p>
        </div>

        {/* Origin Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium">Origin Sector:</span>
          <select
            value={selectedOriginZoneId}
            onChange={(e) => handleOriginChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.code} — {z.name} ({z.riskLevel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recommended Shelter & KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Destination Shelter */}
        <div className="bg-white border border-sky-200 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-sky-700 font-mono font-bold uppercase">
              Recommended Safe Shelter
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
              {targetShelter.name}
            </div>
            <div className="text-[11px] text-slate-500">
              Zone 3 • High ground
            </div>
          </div>
        </div>

        {/* Distance */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <Route className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase font-medium">
              Total Transit Distance
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {currentRoute.totalDistanceKm} km
            </div>
            <div className="text-[11px] text-slate-500">Via elevated viaduct</div>
          </div>
        </div>

        {/* Travel Time */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase font-medium">
              Estimated Travel Time
            </div>
            <div className="text-xl font-bold font-mono text-amber-700 mt-0.5">
              {currentRoute.estimatedTravelMinutes} min
            </div>
            <div className="text-[11px] text-slate-500">Emergency convoy speed</div>
          </div>
        </div>

        {/* Capacity Available */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase font-medium">
              Capacity Available
            </div>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
              {targetShelter.available} beds
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold">Route Safety: HIGH</div>
          </div>
        </div>
      </div>

      {/* Path Schematic & Step-by-Step Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Schematic Flow Column */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-sky-600" />
            <span>Hazard Avoidance Schematic</span>
          </h3>

          <div className="space-y-3 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {/* Origin */}
            <div className="relative flex items-center gap-3 pl-8">
              <span className="absolute left-2.5 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white" />
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 w-full text-xs">
                <div className="font-bold text-slate-900">ORIGIN: {currentOrigin.code} ({currentOrigin.name})</div>
                <div className="text-[11px] text-rose-600 font-semibold">Flood Inundation Level: {currentOrigin.waterLevel}m</div>
              </div>
            </div>

            {/* Road A Flooded Hazard */}
            <div className="relative flex items-center gap-3 pl-8">
              <span className="absolute left-2.5 w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white" />
              <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200 w-full text-xs">
                <div className="font-bold text-rose-800 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Central Basin Parkway (Road A)</span>
                </div>
                <div className="text-[11px] text-rose-700 font-semibold">
                  ❌ FLOODED (68cm standing water - IMPASSABLE)
                </div>
              </div>
            </div>

            {/* Detour Viaduct */}
            <div className="relative flex items-center gap-3 pl-8">
              <span className="absolute left-2.5 w-3.5 h-3.5 rounded-full bg-sky-500 border-2 border-white" />
              <div className="bg-slate-50 p-2.5 rounded-xl border border-sky-300 w-full text-xs">
                <div className="font-bold text-sky-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>North Arterial Flyover (Road B)</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  ✅ CLEAR (Elevated viaduct bypass)
                </div>
              </div>
            </div>

            {/* Connector */}
            <div className="relative flex items-center gap-3 pl-8">
              <span className="absolute left-2.5 w-3.5 h-3.5 rounded-full bg-sky-500 border-2 border-white" />
              <div className="bg-slate-50 p-2.5 rounded-xl border border-sky-300 w-full text-xs">
                <div className="font-bold text-sky-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Crescent Canal Connector (Road C)</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  ✅ CLEAR (Drained asphalt corridor)
                </div>
              </div>
            </div>

            {/* Final Shelter */}
            <div className="relative flex items-center gap-3 pl-8">
              <span className="absolute left-2.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-300 w-full text-xs">
                <div className="font-bold text-emerald-800">
                  DESTINATION: {targetShelter.name}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold">
                  SAFE REFUGE • {targetShelter.available} Beds Available
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Turn-by-Turn Steps & Road Telemetry Column */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Turn-by-Turn Evacuation Instructions
            </h3>

            <div className="space-y-2.5">
              {currentRoute.routeSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-start gap-3 text-xs"
                >
                  <span className="w-6 h-6 rounded-full bg-sky-100 border border-sky-300 text-sky-800 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="text-slate-900 font-semibold">{step.instruction}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {step.roadCondition} • <span className="font-mono text-sky-700 font-medium">{step.distanceMeters}m</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    step.hazardLevel === 'NONE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {step.hazardLevel === 'NONE' ? 'SAFE' : 'HAZARD'}
                  </span>
                </div>
              ))}
            </div>

            {/* Avoided Hazards Warning Box */}
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs">
              <div className="text-rose-800 font-bold flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Active Hazards Excluded from Calculated Corridor</span>
              </div>
              <ul className="list-disc list-inside text-slate-700 text-[11px] space-y-0.5">
                {currentRoute.avoidedHazards.map((hz, i) => (
                  <li key={i}>{hz}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
