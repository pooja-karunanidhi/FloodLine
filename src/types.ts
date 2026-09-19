export type RiskLevel = 'SAFE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type AlertLevel = 0 | 1 | 2 | 3; // 0: Normal, 1: Watch, 2: Warning, 3: Emergency

export interface RiskFactorContribution {
  name: string;
  weightPercent: number; // e.g. +32%
  rawValue: string;
  impactDescription: string;
  icon: string;
}

export interface ZoneData {
  id: string;
  name: string;
  code: string;
  polygon: [number, number][]; // Leaflet lat/lng coordinates
  center: [number, number];
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  waterLevel: number; // meters
  warningWaterLevel: number; // meters
  criticalWaterLevel: number; // meters
  rainfall24h: number; // mm
  rainfallIntensity: number; // mm/h
  soilMoisture: number; // %
  elevation: number; // meters above sea level
  drainageCapacity: number; // %
  riverFlow: number; // m3/s
  population: number;
  vulnerablePopulation: {
    children: number;
    elderly: number;
    disabled: number;
    hospitalPatients: number;
    students: number;
    general: number;
  };
  estimatedTimeToFloodMinutes: number | null; // null if safe
  explanation: string;
  contributions: RiskFactorContribution[];
}

export interface SensorData {
  id: string;
  code: string;
  name: string;
  type: 'WATER_LEVEL' | 'RAINFALL' | 'SOIL_MOISTURE' | 'RIVER_FLOW';
  zoneId: string;
  location: string;
  lat: number;
  lng: number;
  value: number;
  unit: string;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  batteryLevel: number;
  lastUpdated: string;
  trend: 'RISING' | 'STABLE' | 'FALLING';
}

export interface ShelterData {
  id: string;
  name: string;
  type: 'School' | 'Community Center' | 'Stadium' | 'Hospital' | 'Civic Hall';
  zoneId: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  occupied: number;
  available: number;
  foodSuppliesPercent: number;
  waterSuppliesPercent: number;
  medicalStaffAvailable: boolean;
  backupPowerAvailable: boolean;
  wheelchairAccessible: boolean;
  distanceKm: number;
  safetyRating: 'HIGH' | 'MODERATE' | 'LOW';
  status: 'AVAILABLE' | 'NEAR_CAPACITY' | 'FULL';
  recommendedAlternativeId?: string;
}

export interface RoadSegment {
  id: string;
  name: string;
  from: [number, number];
  to: [number, number];
  zoneId: string;
  status: 'CLEAR' | 'WATERLOGGED' | 'FLOODED' | 'BLOCKED';
  waterDepthCm: number;
  trafficLevel: 'LOW' | 'MODERATE' | 'HEAVY';
  isEvacuationRoute: boolean;
}

export interface AlertNotification {
  id: string;
  level: AlertLevel;
  title: string;
  zoneId: string;
  zoneName: string;
  message: string;
  waterLevel: number;
  expectedFloodingMinutes?: number;
  recommendedAction: string;
  nearestShelterName: string;
  timestamp: string;
  dispatchedChannels: ('DASHBOARD' | 'SMS' | 'EMAIL' | 'PUSH' | 'SIREN')[];
  acknowledged: boolean;
}

export interface SimulationParams {
  rainfallIncreasePercent: number; // e.g. +30%
  waterLevelIncreaseMeters: number; // e.g. +1.2m
  rainfallDurationHours: number; // e.g. 3 hours
  drainageCapacityChangePercent: number; // e.g. -20%
}

export interface SimulationResult {
  params: SimulationParams;
  timestamp: string;
  projectedAffectedPopulation: number;
  newHighRiskZonesCount: number;
  estimatedFloodExpansionPercent: number;
  emergencySheltersRequired: number;
  zoneChanges: {
    zoneId: string;
    zoneName: string;
    beforeRiskScore: number;
    beforeLevel: RiskLevel;
    afterRiskScore: number;
    afterLevel: RiskLevel;
    projectedWaterLevel: number;
    additionalAffectedPop: number;
  }[];
}

export interface PredictionHorizon {
  timeLabel: string;
  hoursAhead: number;
  riskScore: number;
  riskLevel: RiskLevel;
  predictedWaterLevel: number;
  predictedRainfall: number;
  confidencePercent: number;
}

export interface EvacuationRoutePlan {
  originZoneId: string;
  destinationShelter: ShelterData;
  totalDistanceKm: number;
  estimatedTravelMinutes: number;
  safetyScore: 'HIGH' | 'MODERATE' | 'CAUTION';
  waypoints: [number, number][];
  routeSteps: {
    instruction: string;
    distanceMeters: number;
    roadCondition: string;
    hazardLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
  avoidedHazards: string[];
}
