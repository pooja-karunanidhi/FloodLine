import React, { useState, useEffect } from 'react';
import { ZoneData } from '../types';
import { Clock, Waves, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface TimeToFloodProps {
  zone: ZoneData;
}

export const TimeToFlood: React.FC<TimeToFloodProps> = ({ zone }) => {
  // Live seconds countdown ticker
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    zone.estimatedTimeToFloodMinutes ? zone.estimatedTimeToFloodMinutes * 60 : 0
  );

  useEffect(() => {
    setSecondsRemaining(zone.estimatedTimeToFloodMinutes ? zone.estimatedTimeToFloodMinutes * 60 : 0);
  }, [zone.estimatedTimeToFloodMinutes]);

  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Generate trajectory curve toward critical water level
  const currentWater = zone.waterLevel;
  const critWater = zone.criticalWaterLevel;
  const warnWater = zone.warningWaterLevel;

  const trajectoryData = [
    { time: '08:00', waterLevel: parseFloat((currentWater - 0.9).toFixed(2)), threshold: critWater },
    { time: '09:00', waterLevel: parseFloat((currentWater - 0.5).toFixed(2)), threshold: critWater },
    { time: '10:00', waterLevel: parseFloat((currentWater - 0.2).toFixed(2)), threshold: critWater },
    { time: 'Current', waterLevel: currentWater, threshold: critWater },
    { time: '+1h', waterLevel: parseFloat(Math.min(critWater + 0.3, currentWater + 0.45).toFixed(2)), threshold: critWater },
    { time: '+2h', waterLevel: parseFloat(Math.min(critWater + 0.6, currentWater + 0.95).toFixed(2)), threshold: critWater },
    { time: '+3h (Crit)', waterLevel: critWater, threshold: critWater },
    { time: '+4h', waterLevel: parseFloat((critWater + 0.35).toFixed(2)), threshold: critWater },
  ];

  const isSafe = zone.estimatedTimeToFloodMinutes === null || zone.riskScore < 50;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              TIME TO FLOOD ESTIMATION
            </h3>
            <p className="text-xs text-slate-500">
              Critical water level progression model for <span className="text-slate-900 font-semibold">{zone.code} ({zone.name})</span>
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
          Threshold: {critWater}m
        </span>
      </div>

      {/* Threshold Badges & Countdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 my-4">
        {/* Current Level */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Current Water Level
          </div>
          <div className="text-2xl font-extrabold font-mono text-blue-700 mt-1 flex items-baseline gap-1">
            {currentWater.toFixed(1)} <span className="text-sm font-normal text-slate-500">m</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <Waves className="w-3.5 h-3.5 text-blue-600" />
            Sensor Telemetry Live
          </div>
        </div>

        {/* Warning Level */}
        <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-200">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
            Warning Level
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-700 mt-1 flex items-baseline gap-1">
            {warnWater.toFixed(1)} <span className="text-sm font-normal text-slate-500">m</span>
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5 font-medium">
            Buffer: {(warnWater - currentWater).toFixed(1)}m remaining
          </div>
        </div>

        {/* Critical Level */}
        <div className="bg-rose-50/60 rounded-xl p-3.5 border border-rose-200">
          <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">
            Critical Level
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-700 mt-1 flex items-baseline gap-1">
            {critWater.toFixed(1)} <span className="text-sm font-normal text-slate-500">m</span>
          </div>
          <div className="text-[11px] text-rose-700 mt-0.5 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            Dyke Overtopping Risk
          </div>
        </div>

        {/* Estimated Countdown Timer */}
        <div className="bg-rose-50/80 rounded-xl p-3.5 border border-rose-200 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider flex items-center justify-between">
            <span>Estimated Critical Time</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-700 mt-1 tracking-wider">
            {isSafe ? (
              <span className="text-base text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> &gt; 24h (SAFE)
              </span>
            ) : (
              `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`
            )}
          </div>
          <div className="text-[11px] text-rose-600/90 font-medium">
            {isSafe ? 'No threshold breach projected' : 'Until water reaches dyke crest'}
          </div>
        </div>
      </div>

      {/* Trajectory Graph */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2 font-mono">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-1 bg-sky-600 rounded-full inline-block" />
            Water Level Trajectory
          </span>
          <span className="text-rose-600 font-semibold flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-500 inline-block border-t border-dashed" />
            Critical Threshold ({critWater}m)
          </span>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="waterLevelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" domain={[1.5, 6.0]} fontSize={11} tickLine={false} unit="m" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#0f172a',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <ReferenceLine y={critWater} stroke="#e11d48" strokeDasharray="3 3" label={{ value: 'Critical Stage (5.5m)', fill: '#e11d48', fontSize: 10, position: 'top' }} />
              <ReferenceLine y={warnWater} stroke="#d97706" strokeDasharray="2 2" label={{ value: 'Warning Stage (4.8m)', fill: '#d97706', fontSize: 10, position: 'bottom' }} />
              <Area
                type="monotone"
                dataKey="waterLevel"
                stroke="#0284c7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#waterLevelGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
