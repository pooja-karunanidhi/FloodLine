import React, { useState } from 'react';
import { SensorData } from '../types';
import {
  Radio,
  Waves,
  CloudRain,
  Droplets,
  Wind,
  Battery,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react';

interface SensorNetworkProps {
  sensors: SensorData[];
  onSelectSensorZone?: (zoneId: string) => void;
}

export const SensorNetwork: React.FC<SensorNetworkProps> = ({
  sensors,
  onSelectSensorZone,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const onlineCount = sensors.filter((s) => s.status !== 'OFFLINE').length + 32;
  const offlineCount = 3;
  const criticalCount = sensors.filter((s) => s.status === 'CRITICAL').length + 3;

  const filteredSensors = sensors.filter((s) => {
    const matchesType = filterType === 'ALL' || s.type === filterType;
    const matchesSearch =
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getStatusIcon = (status: SensorData['status']) => {
    switch (status) {
      case 'CRITICAL':
        return <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />;
      case 'WARNING':
        return <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />;
      case 'OPTIMAL':
      default:
        return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />;
    }
  };

  const getTrendIcon = (trend: SensorData['trend']) => {
    switch (trend) {
      case 'RISING':
        return <TrendingUp className="w-3.5 h-3.5 text-rose-400" />;
      case 'FALLING':
        return <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />;
      case 'STABLE':
      default:
        return <Minus className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase font-medium">
              Online Telemetry Stations
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-0.5">
              {onlineCount} Stations
            </div>
            <div className="text-[11px] text-slate-500">94% network uptime</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase font-medium">
              Offline / Maint Nodes
            </div>
            <div className="text-2xl font-bold font-mono text-amber-700 mt-0.5">
              {offlineCount} Nodes
            </div>
            <div className="text-[11px] text-slate-500">Battery or repeater timeout</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase font-medium">
              Critical Threshold Alerts
            </div>
            <div className="text-2xl font-bold font-mono text-rose-700 mt-0.5">
              {criticalCount} Critical
            </div>
            <div className="text-[11px] text-rose-600">Immediate spillway danger</div>
          </div>
        </div>
      </div>

      {/* Sensor Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-600" />
              <span>ENVIRONMENTAL IOT SENSOR NETWORK</span>
            </h3>
            <p className="text-xs text-slate-500">
              High-frequency acoustic gauges, Doppler water velocity meters, and radar rain sensors.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search sensor ID or zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 w-52 font-medium"
              />
            </div>

            {/* Type Filter */}
            <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-medium">
              {[
                { id: 'ALL', label: 'All Sensors' },
                { id: 'WATER_LEVEL', label: 'Water Level (W)' },
                { id: 'RAINFALL', label: 'Rainfall (R)' },
                { id: 'SOIL_MOISTURE', label: 'Soil Saturation (S)' },
                { id: 'RIVER_FLOW', label: 'River Flow (F)' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilterType(t.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition ${
                    filterType === t.id
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sensor Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Sensor Code</th>
                <th className="py-2.5 px-3 font-semibold">Station Name</th>
                <th className="py-2.5 px-3 font-semibold">Location</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 font-bold">Current Telemetry</th>
                <th className="py-2.5 px-3 font-semibold">Trend</th>
                <th className="py-2.5 px-3 font-semibold">Battery</th>
                <th className="py-2.5 px-3 font-semibold">Last Ping</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredSensors.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-slate-50/80 transition cursor-pointer"
                  onClick={() => onSelectSensorZone && onSelectSensorZone(s.zoneId)}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(s.status)}
                      <span className={`text-[10px] font-mono font-bold ${
                        s.status === 'CRITICAL' ? 'text-rose-700' : s.status === 'WARNING' ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {s.code}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-900">
                    {s.name}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    {s.location}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-slate-700 font-medium">
                      {s.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-sm">
                    <span className={s.status === 'CRITICAL' ? 'text-rose-700' : s.status === 'WARNING' ? 'text-amber-700' : 'text-sky-700'}>
                      {s.value} {s.unit}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 font-mono text-[11px] text-slate-700">
                      {getTrendIcon(s.trend)}
                      <span>{s.trend}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <Battery className="w-3 h-3 text-emerald-600" />
                      {s.batteryLevel}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                    {s.lastUpdated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
