import React, { useState, useEffect } from 'react';
import {
  INITIAL_ZONES,
  INITIAL_SHELTERS,
  INITIAL_ROADS,
  INITIAL_SENSORS,
  INITIAL_ALERTS,
} from './data/initialData';
import {
  ZoneData,
  ShelterData,
  RoadSegment,
  SensorData,
  AlertNotification,
  EvacuationRoutePlan,
  SimulationResult,
} from './types';
import { planEvacuationRoute } from './utils/aiRiskEngine';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { LiveFloodMap } from './components/LiveFloodMap';
import { TimeToFlood } from './components/TimeToFlood';
import { ExplainableRisk } from './components/ExplainableRisk';
import { PredictionTimeline } from './components/PredictionTimeline';
import { FloodSimulator } from './components/FloodSimulator';
import { VulnerablePopulation } from './components/VulnerablePopulation';
import { ShelterManagement } from './components/ShelterManagement';
import { EvacuationOptimizer } from './components/EvacuationOptimizer';
import { AlertCenter } from './components/AlertCenter';
import { SensorNetwork } from './components/SensorNetwork';
import { AnalyticsView } from './components/AnalyticsView';
import { AIAssistantModal } from './components/AIAssistantModal';
import {
  AlertOctagon,
  Bot,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  // Navigation tab state matching Header.tsx
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  const [zones, setZones] = useState<ZoneData[]>(INITIAL_ZONES);
  // Default focus on Zone 4 (Critical)
  const [selectedZone, setSelectedZone] = useState<ZoneData>(INITIAL_ZONES[3]);
  const [shelters] = useState<ShelterData[]>(INITIAL_SHELTERS);
  const [roads] = useState<RoadSegment[]>(INITIAL_ROADS);
  const [sensors, setSensors] = useState<SensorData[]>(INITIAL_SENSORS);
  const [alerts, setAlerts] = useState<AlertNotification[]>(INITIAL_ALERTS);

  const [isEmergencyMode, setIsEmergencyMode] = useState<boolean>(true);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isAudioAlertActive, setIsAudioAlertActive] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // Calculate evacuation route for the selected zone
  const [currentRoute, setCurrentRoute] = useState<EvacuationRoutePlan>(() =>
    planEvacuationRoute(INITIAL_ZONES[3], INITIAL_SHELTERS, INITIAL_ROADS)
  );

  // Sync route whenever selectedZone changes
  useEffect(() => {
    const route = planEvacuationRoute(selectedZone, shelters, roads);
    setCurrentRoute(route);
  }, [selectedZone, shelters, roads]);

  // Telemetry Heartbeat simulation - updates sensor and sync time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLastSyncTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );

      setSensors((prev) =>
        prev.map((s) => {
          if (s.type === 'WATER_LEVEL') {
            const delta = (Math.random() - 0.48) * 0.02;
            const newVal = parseFloat((s.value + delta).toFixed(2));
            return { ...s, value: newVal, lastUpdated: '1s ago' };
          }
          return s;
        })
      );
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Shelter routing handler
  const handleSelectShelterForRoute = (shelter: ShelterData) => {
    const customRoute = planEvacuationRoute(selectedZone, shelters, roads, shelter.id);
    setCurrentRoute(customRoute);
    setCurrentTab('evacuation');
  };

  // Acknowledge alert
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  // Dispatch broadcast
  const handleDispatchBroadcast = (payload: {
    level: any;
    zoneName: string;
    message: string;
    channels: ('DASHBOARD' | 'SMS' | 'EMAIL' | 'PUSH' | 'SIREN')[];
  }) => {
    const newAlert: AlertNotification = {
      id: 'alt-' + Date.now(),
      level: payload.level,
      title: `Level ${payload.level} Flood Alert Directive`,
      zoneId: selectedZone.id,
      zoneName: payload.zoneName,
      message: payload.message,
      waterLevel: selectedZone.waterLevel,
      expectedFloodingMinutes: selectedZone.estimatedTimeToFloodMinutes || 45,
      recommendedAction: 'EVACUATE IMMEDIATELY via designated safe routes',
      nearestShelterName: 'Government Model High School (Zone 3)',
      timestamp: 'Just now',
      dispatchedChannels: payload.channels,
      acknowledged: false,
    };
    setAlerts([newAlert, ...alerts]);
  };

  const activeAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  const totalPopAtRisk = zones.reduce(
    (sum, z) => sum + (z.riskScore >= 70 ? z.population : 0),
    0
  );
  const availableSheltersCount = shelters.filter((s) => s.status === 'AVAILABLE').length;

  const timeToFloodString = selectedZone.estimatedTimeToFloodMinutes
    ? `${Math.floor(selectedZone.estimatedTimeToFloodMinutes / 60)}h ${selectedZone.estimatedTimeToFloodMinutes % 60}m`
    : '> 24h';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-900">
      {/* Top Level Emergency Directive Ticker */}
      {isEmergencyMode && (
        <aside
          aria-label="Emergency Announcement"
          className="bg-rose-600 text-white border-b border-rose-700 px-4 py-2 text-xs flex items-center justify-between shadow-sm relative z-40"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
            <span className="font-mono font-bold uppercase tracking-wider text-[11px] shrink-0 text-rose-100">
              🔴 LEVEL 3 EMERGENCY DIRECTIVE:
            </span>
            <span className="font-medium truncate text-white">
              Mandatory evacuation order in effect for <strong>{selectedZone.code} ({selectedZone.name})</strong>. Water level 5.2m (Critical: 5.5m). Safe corridor: North Arterial Viaduct.
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-3">
            <button
              onClick={() => setCurrentTab('evacuation')}
              className="px-2.5 py-1 rounded bg-rose-700 hover:bg-rose-800 text-white font-semibold text-[11px] flex items-center gap-1 border border-rose-500 transition shadow-2xs"
            >
              <span>View Corridor</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </aside>
      )}

      {/* Main Command Center Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenDemoScenario={() => {
          setCurrentTab('simulation');
        }}
        onTriggerEmergencyBroadcast={() => {
          setCurrentTab('alerts');
        }}
        activeAlertCount={activeAlertsCount}
        lastUpdated={lastSyncTime}
        isAudioAlertActive={isAudioAlertActive}
        onToggleAudioAlert={() => setIsAudioAlertActive(!isAudioAlertActive)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Core KPI Metrics Strip (Situational Overview) */}
        <section aria-label="Key Performance Indicators">
          <KPICards
            rainfall24h={selectedZone.rainfall24h}
            rainfallTrend="+14mm/hr"
            waterLevel={selectedZone.waterLevel}
            warningWaterLevel={selectedZone.warningWaterLevel}
            criticalWaterLevel={selectedZone.criticalWaterLevel}
            floodRiskScore={selectedZone.riskScore}
            floodRiskLevel={selectedZone.riskLevel}
            timeToFloodFormatted={timeToFloodString}
            criticalZoneName={`${selectedZone.code} - ${selectedZone.name}`}
            populationAtRisk={totalPopAtRisk}
            availableShelters={availableSheltersCount}
            nearbyShelters={shelters.length}
            onSelectZone={() => setCurrentTab('map')}
            onSelectShelters={() => setCurrentTab('shelters')}
            onSelectPrediction={() => setCurrentTab('predictions')}
          />
        </section>

        {/* Dashboard Tab / Map View */}
        {(currentTab === 'dashboard' || currentTab === 'map') && (
          <div className="space-y-6">
            {/* Top Toolbar: Sector Focus Selector */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">Active Sector Focus:</span>
                <select
                  value={selectedZone.id}
                  onChange={(e) => {
                    const z = zones.find((item) => item.id === e.target.value);
                    if (z) setSelectedZone(z);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.code} — {z.name} (Risk: {z.riskScore}/100 • {z.riskLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Telemetry: Sensor Grid Synchronized</span>
              </div>
            </div>

            {/* Map & Live Operational Panes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Map Canvas */}
              <div className="lg:col-span-8">
                <LiveFloodMap
                  zones={zones}
                  selectedZone={selectedZone}
                  onSelectZone={setSelectedZone}
                  shelters={shelters}
                  roads={roads}
                  sensors={sensors}
                  evacuationRoute={currentRoute}
                  onSelectShelter={handleSelectShelterForRoute}
                />
              </div>

              {/* Real-time Side Intelligence (Time to flood + Explainable Risk) */}
              <div className="lg:col-span-4 space-y-6">
                <TimeToFlood zone={selectedZone} />
                <ExplainableRisk zone={selectedZone} />
              </div>
            </div>

            {/* Bottom Row: Vulnerable Population Breakdown */}
            <div>
              <VulnerablePopulation zone={selectedZone} />
            </div>
          </div>
        )}

        {/* Multi-Horizon Predictions Tab */}
        {currentTab === 'predictions' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Predictive Flood Forecasting Engine
                </h2>
                <p className="text-xs text-slate-500">
                  Select a municipal zone to inspect 1h, 3h, 6h, 12h, and 24h predictive inundation models.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-700 font-semibold">Zone:</span>
                <select
                  value={selectedZone.id}
                  onChange={(e) => {
                    const z = zones.find((item) => item.id === e.target.value);
                    if (z) setSelectedZone(z);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.code} — {z.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <PredictionTimeline zone={selectedZone} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TimeToFlood zone={selectedZone} />
              <ExplainableRisk zone={selectedZone} />
            </div>
          </div>
        )}

        {/* Hydrological What-If Simulator Tab */}
        {currentTab === 'simulation' && (
          <FloodSimulator
            zones={zones}
            onApplySimulationToLive={(res: SimulationResult) => {
              setZones((prev) =>
                prev.map((z) => {
                  const ch = res.zoneChanges.find((c) => c.zoneId === z.id);
                  if (ch) {
                    return {
                      ...z,
                      riskScore: ch.afterRiskScore,
                      riskLevel: ch.afterLevel,
                      waterLevel: ch.projectedWaterLevel,
                    };
                  }
                  return z;
                })
              );
            }}
          />
        )}

        {/* Dynamic Evacuation Route Optimizer Tab */}
        {currentTab === 'evacuation' && (
          <EvacuationOptimizer
            zones={zones}
            selectedZone={selectedZone}
            onSelectZone={setSelectedZone}
            shelters={shelters}
            roads={roads}
            currentRoute={currentRoute}
            onRouteCalculated={setCurrentRoute}
          />
        )}

        {/* Smart Shelter Management Tab */}
        {currentTab === 'shelters' && (
          <ShelterManagement
            shelters={shelters}
            onSelectShelterForRoute={handleSelectShelterForRoute}
          />
        )}

        {/* Multi-Level Alerts & Broadcast Center Tab */}
        {currentTab === 'alerts' && (
          <AlertCenter
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onDispatchBroadcast={handleDispatchBroadcast}
          />
        )}

        {/* IoT Sensor Network Tab */}
        {currentTab === 'sensors' && (
          <SensorNetwork
            sensors={sensors}
            onSelectSensorZone={(zoneId) => {
              const z = zones.find((item) => item.id === zoneId);
              if (z) {
                setSelectedZone(z);
                setCurrentTab('map');
              }
            }}
          />
        )}

        {/* Historical Analytics Tab */}
        {currentTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Floating AI Emergency Assistant Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all duration-300 border border-slate-700"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-500" />
          </span>
          <Bot className="w-4 h-4 text-sky-300" />
          <span>Flood AI Assistant</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono border border-slate-700">
            Online
          </span>
        </button>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        selectedZone={selectedZone}
        shelters={shelters}
      />

      {/* Command Center Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            DISASTER MGMT OPERATIONAL GRID
          </span>
          <span>•</span>
          <span>Municipal Telemetry Node ID: #FLOOD-MUNI-994</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span>Telemetry Polling: <strong className="text-slate-800 font-bold">{lastSyncTime}</strong></span>
          <span>•</span>
          <span className="text-sky-700 font-semibold">FloodSense AI Engine v3.8</span>
        </div>
      </footer>
    </div>
  );
}
