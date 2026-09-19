import React from 'react';
import { ZoneData } from '../types';
import {
  Baby,
  UserCheck,
  Accessibility,
  HeartPulse,
  GraduationCap,
  Building2,
  Users,
  Ambulance,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface VulnerablePopulationProps {
  zone: ZoneData;
}

export const VulnerablePopulation: React.FC<VulnerablePopulationProps> = ({ zone }) => {
  const v = zone.vulnerablePopulation;

  const total = zone.population;
  const highVulnerabilitySum =
    v.children + v.elderly + v.disabled + v.hospitalPatients;

  const demographicCards = [
    { label: 'Children (< 12 yrs)', count: v.children, percent: Math.round((v.children / total) * 100), icon: Baby, color: 'text-amber-600', bg: 'bg-amber-50/70', border: 'border-amber-200' },
    { label: 'Elderly (> 65 yrs)', count: v.elderly, percent: Math.round((v.elderly / total) * 100), icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-50/70', border: 'border-purple-200' },
    { label: 'Persons with Disabilities', count: v.disabled, percent: Math.round((v.disabled / total) * 100), icon: Accessibility, color: 'text-rose-600', bg: 'bg-rose-50/70', border: 'border-rose-200' },
    { label: 'Hospital Patients / Care', count: v.hospitalPatients, percent: Math.round((v.hospitalPatients / total) * 100), icon: HeartPulse, color: 'text-pink-600', bg: 'bg-pink-50/70', border: 'border-pink-200' },
    { label: 'Students / Enrollees', count: v.students, percent: Math.round((v.students / total) * 100), icon: GraduationCap, color: 'text-sky-600', bg: 'bg-sky-50/70', border: 'border-sky-200' },
    { label: 'General / Able Adults', count: v.general, percent: Math.round((v.general / total) * 100), icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50/70', border: 'border-emerald-200' },
  ];

  const chartData = [
    { name: 'Children', count: v.children, fill: '#d97706' },
    { name: 'Elderly', count: v.elderly, fill: '#9333ea' },
    { name: 'Disabled', count: v.disabled, fill: '#e11d48' },
    { name: 'Hospital', count: v.hospitalPatients, fill: '#db2777' },
    { name: 'Students', count: v.students, fill: '#0284c7' },
    { name: 'General', count: v.general, fill: '#059669' },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              VULNERABLE POPULATION TRIAGE MATRIX
            </h3>
            <p className="text-xs text-slate-500">
              Priority assistance breakdown for <span className="text-slate-900 font-semibold">{zone.code} ({zone.name})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block font-mono">PRIORITY ASSIST REQUIRED</span>
            <span className="text-base font-bold font-mono text-rose-600">
              {highVulnerabilitySum.toLocaleString()} people
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-1.5 text-xs text-rose-700 font-semibold shadow-xs">
            <Ambulance className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>4 Transit Vans Dispatched</span>
          </div>
        </div>
      </div>

      {/* Demographic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {demographicCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`rounded-xl p-3 border ${card.border} ${card.bg} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between text-xs">
                <Icon className={`w-4 h-4 ${card.color}`} />
                <span className="text-[10px] font-mono text-slate-500 font-medium">{card.percent}%</span>
              </div>
              <div className="my-2">
                <div className="text-xl font-bold font-mono text-slate-900">
                  {card.count.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-600 leading-tight mt-0.5 font-medium">
                  {card.label}
                </div>
              </div>
              <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-slate-400"
                  style={{ width: `${card.percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section: Distribution Bar & Priority Protocol */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
        {/* Bar Chart */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-800 mb-3 flex items-center justify-between">
            <span>Demographic Count at Risk ({zone.code})</span>
            <span className="text-[10px] text-slate-500 font-mono">Geospatial Census Triage</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
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
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Evacuation Protocol */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-800 mb-2 flex items-center justify-between">
            <span>Priority Evacuation Protocol</span>
            <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-mono font-bold">
              STAGE 1 DISPATCH
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-rose-50/80 border border-rose-200">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
              <div>
                <span className="font-semibold text-rose-900">Hospital Inpatients & Disabled:</span>
                <p className="text-[11px] text-slate-600 mt-0.5">190 inpatient transfers allocated to Municipal General and Saint Jude medical beds with mobile oxygen support.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
              <div>
                <span className="font-semibold text-amber-900">Geriatric & Young Children First:</span>
                <p className="text-[11px] text-slate-600 mt-0.5">1,280 seniors prioritized onto high-clearance buses via North Arterial Viaduct.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-sky-50/80 border border-sky-200">
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
              <div>
                <span className="font-semibold text-sky-900">General Population Evacuation:</span>
                <p className="text-[11px] text-slate-600 mt-0.5">Escorted convoy via Crescent Canal Connector towards Government Model High School.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
