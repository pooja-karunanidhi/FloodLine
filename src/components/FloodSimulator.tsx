import React, { useState } from 'react';
import { ZoneData, SimulationParams, SimulationResult } from '../types';
import { runWhatIfSimulation, getRiskColor } from '../utils/aiRiskEngine';
import {
  Sliders,
  Play,
  RotateCcw,
  Users,
  ShieldAlert,
  Home,
  TrendingUp,
  CheckCircle,
  AlertOctagon,
} from 'lucide-react';

interface FloodSimulatorProps {
  zones: ZoneData[];
  onApplySimulationToLive?: (result: SimulationResult) => void;
}

export const FloodSimulator: React.FC<FloodSimulatorProps> = ({
  zones,
  onApplySimulationToLive,
}) => {
  const [params, setParams] = useState<SimulationParams>({
    rainfallIncreasePercent: 30,
    waterLevelIncreaseMeters: 1.2,
    rainfallDurationHours: 3,
    drainageCapacityChangePercent: -20,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult>(() =>
    runWhatIfSimulation(zones, {
      rainfallIncreasePercent: 30,
      waterLevelIncreaseMeters: 1.2,
      rainfallDurationHours: 3,
      drainageCapacityChangePercent: -20,
    })
  );

  const handleRunSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const result = runWhatIfSimulation(zones, params);
      setSimulationResult(result);
      setIsRunning(false);
    }, 400);
  };

  const handleReset = () => {
    const defaultParams: SimulationParams = {
      rainfallIncreasePercent: 0,
      waterLevelIncreaseMeters: 0,
      rainfallDurationHours: 1,
      drainageCapacityChangePercent: 0,
    };
    setParams(defaultParams);
    setSimulationResult(runWhatIfSimulation(zones, defaultParams));
  };

  return (
    <div className="space-y-6">
      {/* Simulation Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-sky-700">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>WHAT-IF FLOOD SCENARIO LABORATORY</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Hydrological Stress Simulation
            </h2>
            <p className="text-xs text-slate-500">
              Perturb environmental variables to model cascading flood inundation and shelter demand across all municipal sectors.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={handleRunSimulation}
              disabled={isRunning}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-bold flex items-center gap-2 transition shadow-sm disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'CALCULATING DYNAMICS...' : 'RUN SIMULATION'}
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* Rainfall Increase */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-700 font-semibold">Rainfall Increase</span>
              <span className="font-mono font-bold text-sky-700 text-sm">
                +{params.rainfallIncreasePercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={params.rainfallIncreasePercent}
              onChange={(e) =>
                setParams({ ...params, rainfallIncreasePercent: Number(e.target.value) })
              }
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>0% Baseline</span>
              <span>+150% Deluge</span>
            </div>
          </div>

          {/* Water Level Increase */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-700 font-semibold">Water Level Delta</span>
              <span className="font-mono font-bold text-blue-700 text-sm">
                +{params.waterLevelIncreaseMeters.toFixed(1)}m
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2.5"
              step="0.1"
              value={params.waterLevelIncreaseMeters}
              onChange={(e) =>
                setParams({ ...params, waterLevelIncreaseMeters: Number(e.target.value) })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>+0.0m</span>
              <span>+2.5m Overflow</span>
            </div>
          </div>

          {/* Rainfall Duration */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-700 font-semibold">Rainfall Duration</span>
              <span className="font-mono font-bold text-amber-700 text-sm">
                {params.rainfallDurationHours} hours
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={params.rainfallDurationHours}
              onChange={(e) =>
                setParams({ ...params, rainfallDurationHours: Number(e.target.value) })
              }
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>1 Hour</span>
              <span>12 Hours</span>
            </div>
          </div>

          {/* Drainage Capacity Change */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-700 font-semibold">Drainage Capacity</span>
              <span className={`font-mono font-bold text-sm ${params.drainageCapacityChangePercent < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                {params.drainageCapacityChangePercent > 0 ? `+${params.drainageCapacityChangePercent}%` : `${params.drainageCapacityChangePercent}%`}
              </span>
            </div>
            <input
              type="range"
              min="-60"
              max="30"
              step="5"
              value={params.drainageCapacityChangePercent}
              onChange={(e) =>
                setParams({ ...params, drainageCapacityChangePercent: Number(e.target.value) })
              }
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>-60% Blocked</span>
              <span>+30% Cleared</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projected Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase font-mono font-medium">
              Projected Affected Population
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {simulationResult.projectedAffectedPopulation.toLocaleString()}
            </div>
            <div className="text-[10px] text-purple-700 font-medium">
              +{Math.round(simulationResult.projectedAffectedPopulation * 0.28).toLocaleString()} from baseline
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase font-mono font-medium">
              New High-Risk Zones
            </div>
            <div className="text-xl font-bold font-mono text-rose-700 mt-0.5">
              {simulationResult.newHighRiskZonesCount} Zones
            </div>
            <div className="text-[10px] text-slate-500">Elevated to High/Critical</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase font-mono font-medium">
              Flood Expansion
            </div>
            <div className="text-xl font-bold font-mono text-sky-700 mt-0.5">
              +{simulationResult.estimatedFloodExpansionPercent}%
            </div>
            <div className="text-[10px] text-slate-500">Geographic water spread</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase font-mono font-medium">
              Required Emergency Shelters
            </div>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
              {simulationResult.emergencySheltersRequired} Shelters
            </div>
            <div className="text-[10px] text-slate-500">To house evacuees</div>
          </div>
        </div>
      </div>

      {/* Before vs After Zone Transition Matrix */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>SECTOR RISK TRANSITION (BEFORE vs. AFTER)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono font-medium">
              {simulationResult.zoneChanges.length} Municipal Zones
            </span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Simulated at {simulationResult.timestamp}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {simulationResult.zoneChanges.map((change) => {
            const beforeTheme = getRiskColor(change.beforeLevel);
            const afterTheme = getRiskColor(change.afterLevel);

            return (
              <div
                key={change.zoneId}
                className="bg-slate-50 rounded-xl border border-slate-200/80 p-3.5 hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-xs">
                    {change.zoneName}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Water: {change.projectedWaterLevel}m
                  </span>
                </div>

                {/* Before / After Row */}
                <div className="flex items-center justify-between my-2.5 bg-white rounded-lg p-2.5 border border-slate-200">
                  {/* Before */}
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 font-medium">BEFORE</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-xs font-bold font-mono ${beforeTheme.badgeText}`}>
                        {change.beforeRiskScore}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono border ${beforeTheme.badgeBg} ${beforeTheme.badgeText} ${beforeTheme.border}`}>
                        {change.beforeLevel}
                      </span>
                    </div>
                  </div>

                  <span className="text-slate-400 text-sm font-bold">➔</span>

                  {/* After */}
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 font-medium">AFTER</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-xs font-bold font-mono ${afterTheme.badgeText}`}>
                        {change.afterRiskScore}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono border ${afterTheme.badgeBg} ${afterTheme.badgeText} ${afterTheme.border}`}>
                        {change.afterLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 flex items-center justify-between font-medium">
                  <span>Additional population impacted:</span>
                  <span className="font-mono font-bold text-rose-600">
                    +{change.additionalAffectedPop.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
