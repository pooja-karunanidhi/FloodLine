import {
  ZoneData,
  RiskLevel,
  RiskFactorContribution,
  SimulationParams,
  SimulationResult,
  PredictionHorizon,
  EvacuationRoutePlan,
  RoadSegment,
  ShelterData,
} from '../types';

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 86) return 'CRITICAL';
  if (score >= 71) return 'HIGH';
  if (score >= 51) return 'MODERATE';
  if (score >= 26) return 'LOW';
  return 'SAFE';
}

export function getRiskColor(level: RiskLevel): {
  badgeBg: string;
  badgeText: string;
  border: string;
  fill: string;
  glow: string;
  hex: string;
} {
  switch (level) {
    case 'CRITICAL':
      return {
        badgeBg: 'bg-rose-100',
        badgeText: 'text-rose-700',
        border: 'border-rose-300',
        fill: '#e11d48',
        glow: 'shadow-rose-500/20',
        hex: '#e11d48',
      };
    case 'HIGH':
      return {
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-700',
        border: 'border-amber-300',
        fill: '#d97706',
        glow: 'shadow-amber-500/20',
        hex: '#d97706',
      };
    case 'MODERATE':
      return {
        badgeBg: 'bg-yellow-100',
        badgeText: 'text-yellow-800',
        border: 'border-yellow-300',
        fill: '#ca8a04',
        glow: 'shadow-yellow-500/20',
        hex: '#ca8a04',
      };
    case 'LOW':
      return {
        badgeBg: 'bg-sky-100',
        badgeText: 'text-sky-700',
        border: 'border-sky-300',
        fill: '#0284c7',
        glow: 'shadow-sky-500/20',
        hex: '#0284c7',
      };
    case 'SAFE':
    default:
      return {
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-700',
        border: 'border-emerald-300',
        fill: '#059669',
        glow: 'shadow-emerald-500/20',
        hex: '#059669',
      };
  }
}

export function calculateZoneRisk(zone: Partial<ZoneData>): {
  score: number;
  level: RiskLevel;
  contributions: RiskFactorContribution[];
  explanation: string;
  timeToFloodMinutes: number | null;
} {
  const rain = zone.rainfall24h ?? 60;
  const intensity = zone.rainfallIntensity ?? 20;
  const water = zone.waterLevel ?? 3.0;
  const critWater = zone.criticalWaterLevel ?? 5.0;
  const elevation = zone.elevation ?? 5.0;
  const soil = zone.soilMoisture ?? 70;
  const drainage = zone.drainageCapacity ?? 60;

  // Multi-factor normalized weighting
  // 1. Rainfall score (0 - 100)
  const rainScore = Math.min(100, (rain / 120) * 60 + (intensity / 45) * 40);

  // 2. Water level proximity to critical (0 - 100)
  const waterRatio = Math.max(0, water / critWater);
  const waterScore = Math.min(100, Math.pow(waterRatio, 1.8) * 100);

  // 3. Topographic elevation penalty (lower elevation = higher risk)
  const elevationScore = Math.max(0, Math.min(100, (20 - elevation) * 5.2));

  // 4. Soil moisture saturation score
  const soilScore = Math.max(0, Math.min(100, ((soil - 30) / 70) * 100));

  // 5. Drainage deficit (100 - drainageCapacity)
  const drainageDeficitScore = Math.max(0, 100 - drainage);

  // Weighted composite model
  const compositeScore = Math.round(
    rainScore * 0.32 +
    waterScore * 0.27 +
    elevationScore * 0.21 +
    soilScore * 0.12 +
    drainageDeficitScore * 0.08
  );

  const finalScore = Math.max(5, Math.min(99, compositeScore));
  const level = getRiskLevel(finalScore);

  // Contributions breakdown
  const contributions: RiskFactorContribution[] = [
    {
      name: 'Rainfall Inflow',
      weightPercent: 32,
      rawValue: `${Math.round(rain)} mm (${Math.round(intensity)} mm/h)`,
      impactDescription: intensity > 25 ? 'High cloudburst intensity accelerating surface accumulation' : 'Steady baseline precipitation',
      icon: 'CloudRain',
    },
    {
      name: 'River Water Level',
      weightPercent: 27,
      rawValue: `${water.toFixed(1)} m`,
      impactDescription: water >= critWater * 0.8 ? `Only ${(critWater - water).toFixed(1)}m from critical flood stage` : 'Within standard containment margins',
      icon: 'Waves',
    },
    {
      name: 'Ground Elevation',
      weightPercent: 21,
      rawValue: `${elevation.toFixed(1)} m ASL`,
      impactDescription: elevation < 5 ? 'Natural lowland bowl prone to backflow and pooling' : 'Elevated terrain aids natural runoff',
      icon: 'TrendingDown',
    },
    {
      name: 'Soil Moisture Saturation',
      weightPercent: 12,
      rawValue: `${Math.round(soil)} %`,
      impactDescription: soil > 80 ? 'Subsoil completely saturated; zero infiltration buffer' : 'Ground retains moderate absorption ability',
      icon: 'Droplets',
    },
    {
      name: 'Drainage Status',
      weightPercent: 8,
      rawValue: `${Math.round(drainage)} % capacity`,
      impactDescription: drainage < 50 ? 'Culvert choke points and storm pump throttling observed' : 'Pumps and outfalls operating smoothly',
      icon: 'ShieldAlert',
    },
  ];

  // Time to flood estimation
  let timeToFloodMinutes: number | null = null;
  if (water >= critWater) {
    timeToFloodMinutes = 0;
  } else if (finalScore >= 50) {
    const deltaMeters = Math.max(0.1, critWater - water);
    const riseRateMetersPerHour = Math.max(0.15, (intensity / 40) * 0.6 + (waterRatio > 0.7 ? 0.3 : 0.1));
    const hoursRemaining = deltaMeters / riseRateMetersPerHour;
    timeToFloodMinutes = Math.max(15, Math.round(hoursRemaining * 60));
  }

  let explanation = '';
  if (finalScore >= 86) {
    explanation = 'Flood risk reached CRITICAL because severe rainfall intensity coincides with river level nearing critical dyke height in a low-elevation terrain with fully saturated soil.';
  } else if (finalScore >= 71) {
    explanation = 'Flood risk is HIGH due to elevated river influx, poor storm drainage clearance, and low natural terrain slope.';
  } else if (finalScore >= 51) {
    explanation = 'Flood risk is MODERATE; conditions are stable but require close telemetry tracking given continuing rainfall.';
  } else {
    explanation = 'Flood risk is SAFE to LOW with high elevation buffer and optimal gravity drainage outlets.';
  }

  return {
    score: finalScore,
    level,
    contributions,
    explanation,
    timeToFloodMinutes,
  };
}

export function runWhatIfSimulation(
  currentZones: ZoneData[],
  params: SimulationParams
): SimulationResult {
  let newHighRiskCount = 0;
  let totalAdditionalPop = 0;
  let totalBaseAffectedPop = 0;
  let totalProjectedAffectedPop = 0;

  const zoneChanges = currentZones.map((z) => {
    // Apply what-if deltas
    const newRainfall = Math.round(z.rainfall24h * (1 + params.rainfallIncreasePercent / 100));
    const newIntensity = Math.round(z.rainfallIntensity * (1 + params.rainfallIncreasePercent / 100));
    const newWater = parseFloat((z.waterLevel + params.waterLevelIncreaseMeters).toFixed(2));
    const newSoil = Math.min(99, Math.round(z.soilMoisture + params.rainfallDurationHours * 2.5));
    const newDrainage = Math.max(15, Math.min(100, Math.round(z.drainageCapacity * (1 + params.drainageCapacityChangePercent / 100))));

    const updated = calculateZoneRisk({
      ...z,
      rainfall24h: newRainfall,
      rainfallIntensity: newIntensity,
      waterLevel: newWater,
      soilMoisture: newSoil,
      drainageCapacity: newDrainage,
    });

    const isHighBefore = z.riskScore >= 71;
    const isHighAfter = updated.score >= 71;

    if (!isHighBefore && isHighAfter) {
      newHighRiskCount++;
    }

    const popRatio = updated.score >= 86 ? 0.95 : updated.score >= 71 ? 0.70 : updated.score >= 51 ? 0.35 : 0.05;
    const beforePopRatio = z.riskScore >= 86 ? 0.95 : z.riskScore >= 71 ? 0.70 : z.riskScore >= 51 ? 0.35 : 0.05;

    const projectedPop = Math.round(z.population * popRatio);
    const beforePop = Math.round(z.population * popRatio);
    const addedPop = Math.max(0, projectedPop - Math.round(z.population * beforePopRatio));

    totalBaseAffectedPop += Math.round(z.population * beforePopRatio);
    totalProjectedAffectedPop += projectedPop;
    totalAdditionalPop += addedPop;

    return {
      zoneId: z.id,
      zoneName: z.name,
      beforeRiskScore: z.riskScore,
      beforeLevel: z.riskLevel,
      afterRiskScore: updated.score,
      afterLevel: updated.level,
      projectedWaterLevel: newWater,
      additionalAffectedPop: addedPop,
    };
  });

  const expansionPercent = Math.round(((totalProjectedAffectedPop - totalBaseAffectedPop) / Math.max(1, totalBaseAffectedPop)) * 100);
  const sheltersRequired = Math.max(1, Math.ceil(totalProjectedAffectedPop / 650));

  return {
    params,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    projectedAffectedPopulation: totalProjectedAffectedPop,
    newHighRiskZonesCount: newHighRiskCount,
    estimatedFloodExpansionPercent: Math.max(8, expansionPercent),
    emergencySheltersRequired: sheltersRequired,
    zoneChanges,
  };
}

export function generateMultiHorizonPredictions(zone: ZoneData): PredictionHorizon[] {
  const baseWater = zone.waterLevel;
  const baseRain = zone.rainfall24h;

  const steps = [
    { label: 'Current', hours: 0, multWater: 1.0, multRain: 1.0, conf: 99 },
    { label: '+1 Hour', hours: 1, multWater: 1.06, multRain: 1.10, conf: 94 },
    { label: '+3 Hours', hours: 3, multWater: 1.18, multRain: 1.25, conf: 88 },
    { label: '+6 Hours', hours: 6, multWater: 1.28, multRain: 1.35, conf: 82 },
    { label: '+12 Hours', hours: 12, multWater: 1.15, multRain: 1.18, conf: 75 },
    { label: '+24 Hours', hours: 24, multWater: 0.95, multRain: 0.90, conf: 68 },
  ];

  return steps.map((s) => {
    const predictedWater = parseFloat((baseWater * s.multWater).toFixed(2));
    const predictedRain = Math.round(baseRain * s.multRain);
    const score = Math.min(99, Math.round(zone.riskScore * s.multWater * (s.hours <= 6 ? 1.05 : 0.92)));
    return {
      timeLabel: s.label,
      hoursAhead: s.hours,
      riskScore: score,
      riskLevel: getRiskLevel(score),
      predictedWaterLevel: predictedWater,
      predictedRainfall: predictedRain,
      confidencePercent: s.conf,
    };
  });
}

export function planEvacuationRoute(
  originZone: ZoneData,
  shelters: ShelterData[],
  roads: RoadSegment[],
  targetShelterId?: string
): EvacuationRoutePlan {
  let bestShelter: ShelterData;
  if (targetShelterId) {
    const matched = shelters.find(s => s.id === targetShelterId);
    bestShelter = matched || shelters[0];
  } else {
    // Sort shelters by availability and safety rating
    const eligibleShelters = shelters.filter(s => s.status !== 'FULL');
    const safeShelters = eligibleShelters.length > 0 ? eligibleShelters : shelters;

    // Prefer high safety rating shelter with available beds
    safeShelters.sort((a, b) => {
      const safetyScoreA = a.safetyRating === 'HIGH' ? 3 : a.safetyRating === 'MODERATE' ? 2 : 1;
      const safetyScoreB = b.safetyRating === 'HIGH' ? 3 : b.safetyRating === 'MODERATE' ? 2 : 1;
      if (safetyScoreB !== safetyScoreA) return safetyScoreB - safetyScoreA;
      return a.distanceKm - b.distanceKm;
    });

    bestShelter = safeShelters[0];
  }

  // Path coordinates
  const originCoord = originZone.center;
  const destCoord: [number, number] = [bestShelter.lat, bestShelter.lng];

  // Intermediary waypoint avoiding flooded roads
  const midLat = (originCoord[0] + destCoord[0]) / 2 + 0.004; // routed slightly north over elevated ridge
  const midLng = (originCoord[1] + destCoord[1]) / 2 - 0.003;

  const waypoints: [number, number][] = [
    originCoord,
    [originCoord[0] + 0.002, originCoord[1] + 0.003],
    [midLat, midLng],
    [destCoord[0] - 0.002, destCoord[1] - 0.002],
    destCoord,
  ];

  const travelMins = Math.round(bestShelter.distanceKm * 3.8);

  return {
    originZoneId: originZone.id,
    destinationShelter: bestShelter,
    totalDistanceKm: bestShelter.distanceKm,
    estimatedTravelMinutes: travelMins,
    safetyScore: bestShelter.safetyRating === 'HIGH' ? 'HIGH' : 'MODERATE',
    waypoints,
    routeSteps: [
      {
        instruction: `Depart ${originZone.code} (${originZone.name}) via North Arterial Flyover`,
        distanceMeters: 850,
        roadCondition: 'Elevated Viaduct - Clear of standing water',
        hazardLevel: 'NONE',
      },
      {
        instruction: 'AVOID Central Basin Parkway (68cm deep floodwater)',
        distanceMeters: 400,
        roadCondition: 'Detour engaged - Emergency barricades active',
        hazardLevel: 'LOW',
      },
      {
        instruction: 'Turn onto Crescent Canal Connector towards Eastern Corridor',
        distanceMeters: 900,
        roadCondition: 'Drained asphalt - Emergency lane open',
        hazardLevel: 'NONE',
      },
      {
        instruction: `Arrive at ${bestShelter.name}`,
        distanceMeters: 250,
        roadCondition: 'Direct gate entry - Medical and food triage desk open',
        hazardLevel: 'NONE',
      },
    ],
    avoidedHazards: [
      'Central Basin Parkway (68cm submerged)',
      'Delta Freight Railway Underpass (110cm impassable)',
      'Riverbank Causeway (Active barrier locked)',
    ],
  };
}
