import React from 'react';
import {
  CloudRain,
  Waves,
  AlertTriangle,
  Clock,
  Users,
  Home,
  TrendingUp,
} from 'lucide-react';
import { RiskLevel } from '../types';
import { getRiskColor } from '../utils/aiRiskEngine';

interface KPICardsProps {
  rainfall24h: number;
  rainfallTrend: string;
  waterLevel: number;
  warningWaterLevel: number;
  criticalWaterLevel: number;
  floodRiskScore: number;
  floodRiskLevel: RiskLevel;
  timeToFloodFormatted: string;
  criticalZoneName: string;
  populationAtRisk: number;
  availableShelters: number;
  nearbyShelters: number;
  onSelectZone: () => void;
  onSelectShelters: () => void;
  onSelectPrediction: () => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  rainfall24h,
  rainfallTrend,
  waterLevel,
  warningWaterLevel,
  criticalWaterLevel,
  floodRiskScore,
  floodRiskLevel,
  timeToFloodFormatted,
  criticalZoneName,
  populationAtRisk,
  availableShelters,
  nearbyShelters,
  onSelectZone,
  onSelectShelters,
  onSelectPrediction,
}) => {
  const riskTheme = getRiskColor(floodRiskLevel);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {/* Card 1 — Rainfall */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 hover:border-slate-300 shadow-xs hover:shadow-md transition flex flex-col justify-between h-full">
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-sky-700 font-semibold">
            <CloudRain className="w-4 h-4 text-sky-600" />
            Rainfall
          </span>
          <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-100">24H</span>
        </div>
        <div className="my-2">
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {rainfall24h} <span className="text-sm font-normal text-slate-500">mm</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Last 24 Hours Total</div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold">
          <TrendingUp className="w-3 h-3" />
          <span>{rainfallTrend}</span>
        </div>
      </div>

      {/* Card 2 — Water Level */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 hover:border-slate-300 shadow-xs hover:shadow-md transition flex flex-col justify-between h-full">
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-blue-700 font-semibold">
            <Waves className="w-4 h-4 text-blue-600" />
            Water Level
          </span>
          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 font-mono px-1.5 py-0.5 rounded font-medium">
            Warn {warningWaterLevel}m
          </span>
        </div>
        <div className="my-2">
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {waterLevel.toFixed(1)} <span className="text-sm font-normal text-slate-500">m</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
            Critical Level: <span className="text-rose-600 font-semibold">{criticalWaterLevel.toFixed(1)} m</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold">
          <TrendingUp className="w-3 h-3" />
          <span>Rising (+0.18m/hr)</span>
        </div>
      </div>

      {/* Card 3 — Flood Risk */}
      <div
        onClick={onSelectZone}
        className={`rounded-xl p-3.5 transition cursor-pointer hover:shadow-md flex flex-col justify-between h-full ${
          floodRiskLevel === 'CRITICAL'
            ? 'border-2 border-rose-300 bg-rose-50/40 shadow-xs'
            : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
            Flood Risk
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskTheme.badgeBg} ${riskTheme.border}`}>
            {floodRiskLevel}
          </span>
        </div>
        <div className="my-2">
          <div className="text-2xl font-bold tracking-tight font-mono flex items-baseline gap-1">
            <span className={riskTheme.badgeText}>{floodRiskScore}</span>
            <span className="text-sm font-normal text-slate-400">/ 100</span>
          </div>
          {/* Progress gauge */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-200/60">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${floodRiskScore}%`,
                backgroundColor: riskTheme.hex,
              }}
            />
          </div>
        </div>
        <div className="text-[11px] text-slate-600 truncate font-medium">
          Focus: {criticalZoneName}
        </div>
      </div>

      {/* Card 4 — Time to Flood */}
      <div
        onClick={onSelectPrediction}
        className="bg-white border border-slate-200/90 rounded-xl p-3.5 hover:border-slate-300 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between h-full"
      >
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
            <Clock className="w-4 h-4 text-amber-600" />
            Time to Flood
          </span>
          <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[70px]">
            {criticalZoneName.split(' - ')[0]}
          </span>
        </div>
        <div className="my-2">
          <div className="text-2xl font-bold tracking-tight text-amber-600 font-mono">
            {timeToFloodFormatted}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">To Dyke Breach</div>
        </div>
        <div className="text-[11px] text-rose-600 font-semibold truncate">
          Breach Threshold Alarm
        </div>
      </div>

      {/* Card 5 — People at Risk */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 hover:border-slate-300 shadow-xs hover:shadow-md transition flex flex-col justify-between h-full">
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-purple-700 font-semibold">
            <Users className="w-4 h-4 text-purple-600" />
            At-Risk Pop
          </span>
          <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 font-mono px-1.5 py-0.5 rounded font-medium">
            HIGH RISK
          </span>
        </div>
        <div className="my-2">
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {populationAtRisk.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">High-risk sectors</div>
        </div>
        <div className="text-[11px] text-slate-600 font-medium">
          3,420 priority triage
        </div>
      </div>

      {/* Card 6 — Safe Shelters */}
      <div
        onClick={onSelectShelters}
        className="bg-white border border-slate-200/90 rounded-xl p-3.5 hover:border-slate-300 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between h-full"
      >
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <Home className="w-4 h-4 text-emerald-600" />
            Safe Shelters
          </span>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-mono px-1.5 py-0.5 rounded font-medium">
            ACTIVE
          </span>
        </div>
        <div className="my-2">
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {availableShelters} <span className="text-sm font-normal text-slate-500">total</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{nearbyShelters} nearby accessible</div>
        </div>
        <div className="text-[11px] text-emerald-600 font-semibold">
          1,845 beds available
        </div>
      </div>
    </div>
  );
};
