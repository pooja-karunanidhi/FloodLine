import React from 'react';
import { HISTORICAL_FLOOD_EVENTS } from '../data/initialData';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, History, ShieldAlert } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  // 48-Hour Historical Telemetry Trend
  const hourlyTrendData = [
    { time: 'Day 1 - 00:00', rain: 12, water: 1.8, risk: 24 },
    { time: 'Day 1 - 06:00', rain: 28, water: 2.2, risk: 36 },
    { time: 'Day 1 - 12:00', rain: 45, water: 2.7, risk: 48 },
    { time: 'Day 1 - 18:00', rain: 58, water: 3.2, risk: 62 },
    { time: 'Day 2 - 00:00', rain: 72, water: 3.6, risk: 71 },
    { time: 'Day 2 - 06:00', rain: 80, water: 3.9, risk: 78 },
    { time: 'Day 2 - 12:00 (Now)', rain: 86, water: 4.2, risk: 87 },
  ];

  // Shelter Occupancy Distribution
  const shelterDistributionData = [
    { name: 'Model High School', occupied: 370, available: 130 },
    { name: 'Municipal Stadium', occupied: 740, available: 460 },
    { name: 'St. Jude Civic Hall', occupied: 120, available: 330 },
    { name: 'Central Gymnasium', occupied: 342, available: 8 },
    { name: 'Northern Polytechnic', occupied: 280, available: 370 },
    { name: 'Riverside Pavilion', occupied: 295, available: 5 },
  ];

  const historicalAlertLog = [
    { date: 'Sep 18, 10:38 AM', zone: 'Zone 4 Central Basin', risk: '87 / CRITICAL', alert: 'Level 3 Emergency Order', response: 'Siren & Mobile Broadcast Triggered', status: 'Active (Ongoing)' },
    { date: 'Sep 18, 10:24 AM', zone: 'Zone 5 Industrial Delta', risk: '79 / HIGH', alert: 'Level 2 Warning Order', response: 'Industrial Underpass Barricaded', status: 'Dispatched' },
    { date: 'Sep 18, 09:55 AM', zone: 'Zone 2 Riverside Lowlands', risk: '76 / HIGH', alert: 'Level 2 Riverbank Closure', response: 'Detour engaged to South Bypass', status: 'Resolved' },
    { date: 'Sep 18, 08:30 AM', zone: 'Zone 3 Eastern Canal', risk: '62 / MODERATE', alert: 'Level 1 Heavy Rain Watch', response: 'Pumping Station B active', status: 'Acknowledged' },
    { date: 'Aug 24, 14:15 PM', zone: 'Zone 4 Central Basin', risk: '72 / HIGH', alert: 'Level 2 Flash Flood Alert', response: 'Storm culverts flushed', status: 'Closed' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-700">
              <BarChart3 className="w-4 h-4" />
              <span>HYDROLOGICAL RETROSPECTIVE & INCIDENT ANALYTICS</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Multi-Year Inundation Correlations & Response Telemetry
            </h2>
            <p className="text-xs text-slate-500">
              Correlating extreme precipitation events, peak river hydrographs, and municipality shelter turnaround times.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-slate-100 text-slate-700 border border-slate-200 font-medium">
            Database: 2015 - 2026 Archive
          </span>
        </div>

        {/* 48-Hour Dual-Axis Line & Area Chart */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3 font-mono">
            <span>48-Hour Flood Risk (Score 0-100) vs. Water Level (m) & Rainfall (mm)</span>
            <span className="text-sky-700 font-medium">Sampling Rate: 15 min</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
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
                <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                <Area type="monotone" dataKey="risk" stroke="#e11d48" strokeWidth={2.5} fillOpacity={1} fill="url(#riskGrad)" name="Risk Score (0-100)" />
                <Line type="monotone" dataKey="rain" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} name="Rainfall (mm)" />
                <Line type="monotone" dataKey="water" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="Water Level (m)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Major Floods Bar Chart & Shelter Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Historical Major Flood Events */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-600" />
              <span>Historical Monsoon Inundation Events</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Affected Population</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HISTORICAL_FLOOD_EVENTS} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
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
                <Bar dataKey="affectedPop" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Affected Population" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shelter Occupancy Capacity Stacked Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>Current Shelter Occupancy vs. Headroom</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Beds</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shelterDistributionData} layout="vertical" margin={{ top: 5, right: 15, left: 40, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} tickLine={false} />
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
                <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                <Bar dataKey="occupied" stackId="a" fill="#e11d48" name="Occupied Beds" />
                <Bar dataKey="available" stackId="a" fill="#10b981" name="Available Beds" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Alert Log Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>DISASTER MANAGEMENT LOG & TELEMETRY RECORD</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">Real-Time Audit Trail</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Sector</th>
                <th className="py-2.5 px-3 font-semibold">Risk Assessment</th>
                <th className="py-2.5 px-3 font-semibold">Dispatched Directive</th>
                <th className="py-2.5 px-3 font-semibold">Emergency Response Executed</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {historicalAlertLog.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">{row.date}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{row.zone}</td>
                  <td className="py-3 px-3 font-mono text-rose-700 font-bold">{row.risk}</td>
                  <td className="py-3 px-3 text-slate-800">{row.alert}</td>
                  <td className="py-3 px-3 text-slate-700">{row.response}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      row.status.includes('Active') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {row.status}
                    </span>
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
