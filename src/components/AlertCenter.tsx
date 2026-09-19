import React, { useState } from 'react';
import { AlertNotification, AlertLevel } from '../types';
import {
  BellRing,
  AlertTriangle,
  Send,
  Smartphone,
  Mail,
  Volume2,
  CheckCircle,
  Radio,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface AlertCenterProps {
  alerts: AlertNotification[];
  onAcknowledgeAlert: (alertId: string) => void;
  onDispatchBroadcast: (payload: {
    level: AlertLevel;
    zoneName: string;
    message: string;
    channels: ('DASHBOARD' | 'SMS' | 'EMAIL' | 'PUSH' | 'SIREN')[];
  }) => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({
  alerts,
  onAcknowledgeAlert,
  onDispatchBroadcast,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<AlertLevel>(3);
  const [targetZone, setTargetZone] = useState('Zone 4 (Central Basin)');
  const [customMessage, setCustomMessage] = useState(
    'MANDATORY EVACUATION: Immediate life-safety warning. Water level nearing dyke breach. Move via North Arterial Viaduct to Government Model High School.'
  );

  const [selectedChannels, setSelectedChannels] = useState<
    ('DASHBOARD' | 'SMS' | 'EMAIL' | 'PUSH' | 'SIREN')[]
  >(['DASHBOARD', 'SMS', 'PUSH', 'SIREN']);

  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const toggleChannel = (
    channel: 'DASHBOARD' | 'SMS' | 'EMAIL' | 'PUSH' | 'SIREN'
  ) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter((c) => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleSendBroadcast = () => {
    setIsDispatching(true);
    setTimeout(() => {
      onDispatchBroadcast({
        level: selectedLevel,
        zoneName: targetZone,
        message: customMessage,
        channels: selectedChannels,
      });
      setIsDispatching(false);
      setDispatchSuccess(true);
      setTimeout(() => setDispatchSuccess(false), 4000);
    }, 600);
  };

  const getAlertBadge = (level: AlertLevel) => {
    switch (level) {
      case 3:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 font-mono">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            LEVEL 3 — FLOOD EMERGENCY
          </span>
        );
      case 2:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            LEVEL 2 — FLOOD WARNING
          </span>
        );
      case 1:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-800 border border-yellow-200 font-mono">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            LEVEL 1 — FLOOD WATCH
          </span>
        );
      case 0:
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            LEVEL 0 — NORMAL
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Broadcast Composer */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-600">
              <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>SMART AUTOMATED MULTI-CHANNEL ALERT ENGINE</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Public Emergency Broadcast Transmitter
            </h2>
            <p className="text-xs text-slate-500">
              Autonomous threshold-triggered alarms with cooldown throttling and multi-modal dispatch (SMS, Siren, Push).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono border border-slate-200 font-medium">
              Cooldown: 15m Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Alert Severity Level
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(Number(e.target.value) as AlertLevel)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value={3}>🔴 Level 3 — Flood Emergency</option>
                  <option value={2}>🟠 Level 2 — Flood Warning</option>
                  <option value={1}>🟡 Level 1 — Flood Watch</option>
                  <option value={0}>🟢 Level 0 — Normal (All Clear)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Target Municipal Sector
                </label>
                <select
                  value={targetZone}
                  onChange={(e) => setTargetZone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="Zone 4 (Central Basin)">Zone 4 (Central Basin)</option>
                  <option value="Zone 2 (Riverside Lowlands)">Zone 2 (Riverside Lowlands)</option>
                  <option value="Zone 5 (Industrial Delta)">Zone 5 (Industrial Delta)</option>
                  <option value="Zone 3 (Eastern Canal)">Zone 3 (Eastern Canal)</option>
                  <option value="All Sectors (Metropolitan Broadcast)">All Sectors (Metropolitan Broadcast)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Emergency Instructions & Siren Directive
              </label>
              <textarea
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 font-sans"
              />
            </div>

            {/* Channels Select */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Dispatch Broadcast Networks
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'DASHBOARD', label: 'Command Dashboard', icon: Radio },
                  { id: 'SMS', label: 'Cellular SMS Broadcast', icon: Smartphone },
                  { id: 'EMAIL', label: 'Agency Email Wire', icon: Mail },
                  { id: 'PUSH', label: 'Public App Push', icon: BellRing },
                  { id: 'SIREN', label: 'Acoustic Siren Grid', icon: Volume2 },
                ].map((ch) => {
                  const Icon = ch.icon;
                  const isSelected = selectedChannels.includes(ch.id as any);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => toggleChannel(ch.id as any)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                        isSelected
                          ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSendBroadcast}
              disabled={isDispatching}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isDispatching ? 'TRANSMITTING ACROSS NETWORKS...' : 'DISPATCH EMERGENCY BROADCAST NOW'}</span>
            </button>

            {dispatchSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Emergency notification successfully transmitted to 24,500 registered endpoints and civil authorities.</span>
              </div>
            )}
          </div>

          {/* Alert Level Hierarchy Guide */}
          <div className="lg:col-span-5 bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Protocol Threshold Guidelines
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 border-l-4 border-l-emerald-500 shadow-2xs">
                  <div className="font-bold text-emerald-700">LEVEL 0 — NORMAL</div>
                  <div className="text-[11px] text-slate-500">Water levels below warning. Routine automated sensor polling.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 border-l-4 border-l-yellow-500 shadow-2xs">
                  <div className="font-bold text-yellow-700">LEVEL 1 — FLOOD WATCH</div>
                  <div className="text-[11px] text-slate-500">Heavy rainfall forecast &gt;50mm. Drain clearance crews on alert.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 border-l-4 border-l-amber-500 shadow-2xs">
                  <div className="font-bold text-amber-700">LEVEL 2 — FLOOD WARNING</div>
                  <div className="text-[11px] text-slate-500">Water approaching 4.5m containment dyke. Pre-evacuate hospitals.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 border-l-4 border-l-rose-500 shadow-2xs">
                  <div className="font-bold text-rose-700">LEVEL 3 — FLOOD EMERGENCY</div>
                  <div className="text-[11px] text-slate-500">Spillway breach imminent or in progress. Mandatory civilian sirens.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts Feed */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-rose-600" />
            <span>ACTIVE EMERGENCY BULLETINS ({alerts.length})</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">Live Dispatches</span>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl p-4 border transition ${
                alert.level === 3
                  ? 'border-rose-200 bg-rose-50/40 shadow-xs'
                  : alert.level === 2
                  ? 'border-amber-200 bg-amber-50/40'
                  : 'border-slate-200 bg-slate-50/80'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getAlertBadge(alert.level)}
                  <span className="text-xs font-bold text-slate-900">
                    {alert.zoneName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{alert.timestamp}</span>
                </div>
              </div>

              <p className="text-xs text-slate-800 mt-2 font-medium leading-relaxed">
                {alert.message}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-200 text-xs">
                <div className="text-slate-700">
                  <span className="text-slate-500">Action: </span>
                  <span className="font-semibold text-rose-700">{alert.recommendedAction}</span>
                </div>
                <div className="text-slate-700">
                  <span className="text-slate-500">Target Shelter: </span>
                  <span className="font-semibold text-emerald-700">{alert.nearestShelterName}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 text-[11px] text-slate-500 border-t border-slate-200">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>Channels:</span>
                  {alert.dispatchedChannels.map((c, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-mono font-medium">
                      {c}
                    </span>
                  ))}
                </div>

                {!alert.acknowledged ? (
                  <button
                    onClick={() => onAcknowledgeAlert(alert.id)}
                    className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-300 transition text-xs shadow-2xs"
                  >
                    Acknowledge Notice
                  </button>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 text-xs">
                    <CheckCircle className="w-3.5 h-3.5" /> Acknowledged
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
