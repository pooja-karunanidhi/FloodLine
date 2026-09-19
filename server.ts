import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory state for mock scenario / live broadcast
let systemScenario = 'ELEVATED_STORM';
let alertBroadcasts: Array<{
  id: string;
  type: string;
  targetZone: string;
  message: string;
  timestamp: string;
}> = [];

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FloodSense AI Intelligence Platform',
    timestamp: new Date().toISOString(),
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// GET /api/flood/status
app.get('/api/flood/status', (req, res) => {
  res.json({
    systemStatus: 'ONLINE',
    scenario: systemScenario,
    overallCityRiskScore: 78,
    overallRiskLevel: 'HIGH',
    rainfall24h: 86,
    maxWaterLevel: 4.2,
    warningWaterLevel: 4.8,
    criticalWaterLevel: 5.5,
    estimatedTimeToFloodMinutes: 138,
    totalPopulationAtRisk: 18850,
    availableSheltersCount: 18,
    freeShelterBeds: 1845,
    activeAlertsCount: 4,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
});

// POST /api/simulation/run
app.post('/api/simulation/run', (req, res) => {
  const { rainfallIncreasePercent = 30, waterLevelIncreaseMeters = 1.2, rainfallDurationHours = 3, drainageCapacityChangePercent = -20 } = req.body || {};
  
  // Calculate simulation result
  const baseRisk = 78;
  const deltaRisk = Math.min(99, Math.round(baseRisk + rainfallIncreasePercent * 0.35 + waterLevelIncreaseMeters * 8));
  const newHighRiskZones = rainfallIncreasePercent > 20 || waterLevelIncreaseMeters >= 1.0 ? 3 : 1;
  const projectedPop = Math.round(18850 * (1 + (rainfallIncreasePercent + 30) / 100));

  res.json({
    success: true,
    simulationId: 'sim-' + Date.now(),
    params: {
      rainfallIncreasePercent,
      waterLevelIncreaseMeters,
      rainfallDurationHours,
      drainageCapacityChangePercent,
    },
    projectedRiskScore: deltaRisk,
    newHighRiskZonesCount: newHighRiskZones,
    projectedAffectedPopulation: projectedPop,
    estimatedFloodExpansionPercent: Math.round(28 + (waterLevelIncreaseMeters * 10)),
    emergencySheltersRequired: Math.ceil(projectedPop / 700),
    timestamp: new Date().toLocaleTimeString(),
  });
});

// POST /api/alerts
app.post('/api/alerts', (req, res) => {
  const { level, zoneId, zoneName, message, channels = ['DASHBOARD', 'SMS'] } = req.body || {};
  const newAlert = {
    id: 'alt-' + Date.now(),
    level: level ?? 3,
    title: level === 3 ? `RED EMERGENCY: ${zoneName || 'Zone 4'}` : `WARNING: ${zoneName || 'Zone 2'}`,
    zoneId: zoneId || 'zone-4',
    zoneName: zoneName || 'Central Basin',
    message: message || 'Mandatory immediate evacuation order issued by Disaster Management Authority.',
    waterLevel: 4.2,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dispatchedChannels: channels,
    acknowledged: false,
  };
  res.json({ success: true, alert: newAlert });
});

// POST /api/assistant/chat (Gemini AI Emergency Advisor with grounding in current live city status)
app.post('/api/assistant/chat', async (req, res) => {
  const { prompt, context } = req.body || {};
  const userQuery = (prompt || '').trim();

  if (!userQuery) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const ai = getGeminiClient();

  // If Gemini is available, query Gemini 3.8 Flash
  if (ai) {
    try {
      const systemInstruction = `You are "FloodSense AI Emergency Assistant", an expert AI decision-support intelligence bot inside a municipal Smart City Disaster Command Center.
Current City Status context:
- Zone 4 (Central Basin): Risk 87/100 (CRITICAL). Water Level: 4.2m (Warning: 4.8m, Critical: 5.5m). Rainfall: 86mm. Estimated Time to Flood: 2h 18m. Population at risk: 12,450.
- Zone 2 (Riverside Lowlands): Risk 76/100 (HIGH). Water Level: 3.9m.
- Zone 5 (Industrial Delta): Risk 79/100 (HIGH). Water Level: 4.0m. Soil Moisture: 91%.
- Zone 3 (Eastern Canal): Risk 62/100 (MODERATE). Water Level: 3.1m.
- Zone 1 (Metro North): Risk 38/100 (LOW). Safe higher ground.
- Zone 6 (Southern Foothills): Risk 19/100 (SAFE). Elevated ridge.
- Safe Recommended Shelter for Zone 4: Government Model High School (Zone 3 - 2.4 km, High Safety, 130 beds free, food & water stock 84%).
- Avoid: Central Basin Parkway (68cm submerged) & Delta Freight Underpass (110cm impassable).
- Use: North Arterial Viaduct Flyover (Clear).

Guidelines:
1. Provide direct, objective, life-safety guidance.
2. Structure your answer with clear bullet points.
3. Quote specific telemetry (meters, time to flood, distances) when relevant.
4. Keep the tone calm, urgent when necessary, and authoritative. Maximum 150 words.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `User Question: "${userQuery}"\nContext: ${JSON.stringify(context || {})}` }],
          },
        ],
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 500,
        },
      });

      const responseText = response.text || 'FloodSense AI evaluated your request. Please exercise caution and follow municipal evacuation routes.';
      return res.json({
        reply: responseText,
        source: 'gemini-3.8-flash',
      });
    } catch (apiError) {
      console.warn('Gemini API call failed, falling back to local heuristic response:', apiError);
    }
  }

  // Local intelligent heuristic fallback if Gemini key is not configured or offline
  const lower = userQuery.toLowerCase();
  let localReply = '';

  if (lower.includes('zone 4') || lower.includes('central basin')) {
    localReply = `⚠ **Zone 4 Status: CRITICAL (Risk 87/100)**\n\n• **Water Level:** 4.2m (Rising rapidly, critical threshold 5.5m)\n• **Rainfall:** 86mm in last 24h\n• **Estimated Time to Flood:** 2 hours 18 minutes\n• **Population at Risk:** 12,450 residents\n• **Recommended Action:** Evacuate low-lying sectors immediately via North Arterial Flyover.\n• **Nearest Safe Shelter:** Government Model High School (2.4 km away, 130 available spaces).`;
  } else if (lower.includes('shelter') || lower.includes('where')) {
    localReply = `🏠 **Recommended Safe Shelters:**\n\n1. **Government Model High School (Zone 3)** — 2.4 km away, HIGH safety rating, 130 beds available, medical team on-site.\n2. **Municipal Stadium Relief Center (Zone 1)** — 4.1 km away, 460 beds available, power backup active.\n3. **Saint Jude Civic Hall (Zone 6)** — 5.6 km away, 330 beds free on elevated ridge.\n\n*Note: Central Basin Gymnasium is at 98% capacity; do not divert there.*`;
  } else if (lower.includes('road') || lower.includes('route') || lower.includes('flooded')) {
    localReply = `🚧 **Road & Evacuation Status:**\n\n• ❌ **Central Basin Parkway:** FLOODED (68cm deep water — impassable for civilian vehicles)\n• ❌ **Delta Freight Underpass:** FLOODED (110cm depth — barricaded)\n• ❌ **Riverbank Causeway:** BLOCKED by emergency barrier\n• ✅ **North Arterial Flyover:** CLEAR (Elevated viaduct route)\n• ✅ **Crescent Canal Connector:** CLEAR with emergency lane open.`;
  } else if (lower.includes('how many') || lower.includes('people') || lower.includes('population') || lower.includes('vulnerable')) {
    localReply = `👥 **Vulnerable Population Analysis:**\n\n• **Total Population at High Risk:** 18,850 across Zones 4, 5, and 2.\n• **In Zone 4 alone:** 12,450 people, including 2,140 children, 1,280 elderly individuals, and 320 persons with disabilities.\n• **Priority Transit Teams:** 4 emergency dispatch vans deployed for geriatric and mobility-impaired residents.`;
  } else if (lower.includes('what should i do') || lower.includes('safety') || lower.includes('guidelines') || lower.includes('flood')) {
    localReply = `🛡 **Emergency Flood Safety Protocol:**\n\n1. **Move to Higher Elevation:** If in Zone 4, 2, or 5, evacuate before the 2h 18m critical threshold.\n2. **Do Not Drive Through Water:** 15cm of rushing water can knock down an adult; 30cm can float a vehicle.\n3. **Disconnect Utilities:** Switch off main power circuit breakers before leaving if safe to do so.\n4. **Bring Essential Go-Bag:** Medications, waterproof ID pouch, battery-powered radio, and potable water.\n5. **Report Trapped Citizens:** Use Emergency Alert Button or dial 112 / Disaster Helpline.`;
  } else {
    localReply = `🌊 **FloodSense AI Intelligence Summary:**\n\n• **Overall Threat:** Level 3 Flood Emergency active for Zone 4 (Central Basin).\n• **Critical Time Window:** Estimated 2 hours 18 minutes before 5.5m dyke breach threshold.\n• **Active Evacuation Corridor:** North Arterial Viaduct to Government Model High School.\n• Ask me about specific zones, shelters, road passability, or simulation projections!`;
  }

  return res.json({
    reply: localReply,
    source: 'local-intelligence-engine',
  });
});

// Vite middleware for dev / static for production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FloodSense AI Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
