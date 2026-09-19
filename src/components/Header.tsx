import React from 'react';
import {
  Waves,
  Radio,
  BellRing,
  Sparkles,
  Sliders,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenAssistant: () => void;
  onOpenDemoScenario: () => void;
  onTriggerEmergencyBroadcast: () => void;
  activeAlertCount: number;
  lastUpdated: string;
  isAudioAlertActive: boolean;
  onToggleAudioAlert: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenAssistant,
  onOpenDemoScenario,
  onTriggerEmergencyBroadcast,
  activeAlertCount,
  lastUpdated,
  isAudioAlertActive,
  onToggleAudioAlert,
}) => {
  const navTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'map', label: 'Live Map' },
    { id: 'predictions', label: 'Predictions' },
    { id: 'simulation', label: 'Flood Simulation' },
    { id: 'evacuation', label: 'Evacuation' },
    { id: 'shelters', label: 'Shelters' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'sensors', label: 'Sensors' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & System Status */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 shadow-md shadow-blue-500/20 border border-blue-400/30">
            <Waves className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <span>FLOOD INTELLIGENCE CENTER</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-mono font-medium">
                  v3.8 AI
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Monitoring ● ONLINE
              </span>
              <span>•</span>
              <span className="text-slate-500 font-mono text-[11px]">Sync: {lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Floating AI trigger */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Audio Siren Toggle */}
          <button
            onClick={onToggleAudioAlert}
            title={isAudioAlertActive ? 'Mute Alert Audio' : 'Unmute Alert Audio'}
            className={`p-2 rounded-lg border text-xs transition flex items-center gap-1.5 ${
              isAudioAlertActive
                ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {isAudioAlertActive ? (
              <>
                <Volume2 className="w-4 h-4 text-rose-600 animate-bounce" />
                <span className="hidden sm:inline font-mono font-medium">SIREN ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline font-mono">Muted</span>
              </>
            )}
          </button>

          {/* Demonstration Mode Shortcut Button */}
          <button
            onClick={onOpenDemoScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold tracking-wide transition shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>Scenario Demo (70→120mm)</span>
          </button>

          {/* Emergency Alert Broadcast Button */}
          <button
            onClick={onTriggerEmergencyBroadcast}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold tracking-wide transition shadow-sm"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Broadcast Alert ({activeAlertCount})</span>
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-bold tracking-wide shadow-sm transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-100" />
            <span>Flood AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1.5 overflow-x-auto py-1.5 scrollbar-none border-t border-slate-200">
          {navTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-sky-50 text-sky-800 border border-sky-200 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.id === 'alerts' && activeAlertCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
                {tab.id === 'simulation' && (
                  <Radio className="w-3 h-3 text-sky-600" />
                )}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
