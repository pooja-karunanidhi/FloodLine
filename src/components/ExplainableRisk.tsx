import React from 'react';
import { ZoneData } from '../types';
import {
  Sparkles,
  CloudRain,
  Waves,
  TrendingDown,
  Droplets,
  ShieldAlert,
  HelpCircle,
  BrainCircuit,
} from 'lucide-react';
import { getRiskColor } from '../utils/aiRiskEngine';

interface ExplainableRiskProps {
  zone: ZoneData;
}

export const ExplainableRisk: React.FC<ExplainableRiskProps> = ({ zone }) => {
  const theme = getRiskColor(zone.riskLevel);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CloudRain':
        return <CloudRain className="w-4 h-4 text-sky-600" />;
      case 'Waves':
        return <Waves className="w-4 h-4 text-blue-600" />;
      case 'TrendingDown':
        return <TrendingDown className="w-4 h-4 text-amber-600" />;
      case 'Droplets':
        return <Droplets className="w-4 h-4 text-indigo-600" />;
      case 'ShieldAlert':
      default:
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>EXPLAINABLE AI RISK ANALYSIS</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-medium">
                XAI Attribution
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Why is <span className="text-slate-900 font-semibold">{zone.code}</span> classified as{' '}
              <span className={`font-bold ${theme.badgeText}`}>{zone.riskLevel}</span>?
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block font-mono">Composite Score</span>
          <span className={`text-xl font-black font-mono ${theme.badgeText}`}>
            {zone.riskScore} <span className="text-xs text-slate-400">/100</span>
          </span>
        </div>
      </div>

      {/* Feature Contributions Breakdown */}
      <div className="mt-4 space-y-2.5">
        {zone.contributions.map((factor, index) => (
          <div
            key={index}
            className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 hover:border-slate-300 transition"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                {getIcon(factor.icon)}
                <span>{factor.name}</span>
                <span className="text-[10px] text-slate-500 font-mono font-normal">({factor.rawValue})</span>
              </div>
              <span className="font-mono font-bold text-sky-700">
                +{factor.weightPercent}%
              </span>
            </div>

            {/* Contribution Bar */}
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-sky-500 to-indigo-600"
                style={{ width: `${factor.weightPercent * 2.5}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-600 mt-1.5">
              {factor.impactDescription}
            </p>
          </div>
        ))}
      </div>

      {/* Natural Language Synthesis Box */}
      <div className="mt-4 p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 text-xs">
        <div className="flex items-center gap-1.5 text-sky-800 font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>AI Explainability Summary</span>
        </div>
        <blockquote className="text-slate-700 italic border-l-2 border-sky-500 pl-2.5 py-0.5 text-xs leading-relaxed">
          "{zone.explanation}"
        </blockquote>
      </div>
    </div>
  );
};
