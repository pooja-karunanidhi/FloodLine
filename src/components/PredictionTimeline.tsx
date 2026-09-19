import React from 'react';
import { ZoneData } from '../types';
import { generateMultiHorizonPredictions, getRiskColor } from '../utils/aiRiskEngine';
import { TrendingUp, Clock, Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface PredictionTimelineProps {
  zone: ZoneData;
}

export const PredictionTimeline: React.FC<PredictionTimelineProps> = ({ zone }) => {
  const predictions = generateMultiHorizonPredictions(zone);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              AI MULTI-HORIZON FLOOD PREDICTION
            </h3>
            <p className="text-xs text-slate-500">
              Random Forest + XGBoost hybrid time-series forecast for <span className="text-slate-900 font-semibold">{zone.code}</span>
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
          Model: LSTM Ensemble v3
        </span>
      </div>

      {/* Prediction Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 my-4">
        {predictions.map((p, idx) => {
          const theme = getRiskColor(p.riskLevel);
          return (
            <div
              key={idx}
              className={`rounded-xl p-3 border transition ${
                p.riskLevel === 'CRITICAL'
                  ? 'border-rose-300 bg-rose-50/50 shadow-xs'
                  : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 font-medium">
                <span>{p.timeLabel}</span>
                <Clock className="w-3 h-3 text-slate-400" />
              </div>
              <div className="my-1.5 flex items-baseline justify-between">
                <span className={`text-xl font-bold font-mono ${theme.badgeText}`}>
                  {p.riskScore}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono border ${theme.badgeBg} ${theme.badgeText} ${theme.border}`}>
                  {p.riskLevel}
                </span>
              </div>
              <div className="text-[10px] text-slate-600 space-y-0.5 border-t border-slate-200 pt-1 font-medium">
                <div>Water: <span className="text-blue-700 font-mono font-bold">{p.predictedWaterLevel}m</span></div>
                <div>Rain: <span className="text-slate-900 font-mono">{p.predictedRainfall}mm</span></div>
                <div className="text-[9px] text-slate-500 font-normal">Conf: {p.confidencePercent}%</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend Chart */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2 font-mono">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
            Predicted Flood Risk Score Progression (0 - 100)
          </span>
          <span className="text-[11px] text-slate-500">Confidence Band ±8%</span>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={predictions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" domain={[0, 100]} fontSize={11} tickLine={false} />
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
              <ReferenceLine y={85} stroke="#e11d48" strokeDasharray="3 3" label={{ value: 'Critical Stage (86)', fill: '#e11d48', fontSize: 10, position: 'top' }} />
              <ReferenceLine y={70} stroke="#d97706" strokeDasharray="2 2" label={{ value: 'High Stage (71)', fill: '#d97706', fontSize: 10, position: 'bottom' }} />
              <Line
                type="monotone"
                dataKey="riskScore"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#e11d48' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
