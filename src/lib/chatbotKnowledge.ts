// Comprehensive chatbot knowledge base for AeroSense
// Each entry: keywords (for matching) + answer (what to show) + topic (for grouping)

export interface KnowledgeEntry {
  keywords: string[];
  topic: string;
  answer: string;
  followUps?: string[];
}

export const KNOWLEDGE: KnowledgeEntry[] = [
  // ==================== INTRO / GREETINGS ====================
  {
    keywords: ["hi", "hello", "hey", "start", "help", "what can you do", "who are you"],
    topic: "Introduction",
    answer: "Hi! I'm AeroBot 🤖 — your AI assistant for airport environmental monitoring. I can explain noise levels, predictions, aircraft activity, health risks, carbon footprints, and every feature of AeroSense. Try asking: 'Why is noise high today?' or 'What does the AI predict?'",
    followUps: ["What airports do you monitor?", "Explain the heatmap", "What is safe noise?"],
  },
  {
    keywords: ["what is aerosense", "about aerosense", "tell me about", "project"],
    topic: "About",
    answer: "AeroSense is a Smart AI-Based Airport Environmental Monitoring Dashboard that tracks noise, air quality (CO₂), temperature and humidity across airports. It provides live heatmaps, AI predictions, a 3D digital twin, citizen complaint portals, health recommendations and carbon calculators — all in one platform.",
    followUps: ["What airports are monitored?", "Is it real-time?", "What tech is used?"],
  },

  // ==================== AIRPORTS (KARNATAKA) ====================
  {
    keywords: ["which airport", "airports", "karnataka", "blr", "hbx", "ixg", "bangalore", "bengaluru", "hubli", "hubballi", "belgaum", "belagavi"],
    topic: "Airports",
    answer: "AeroSense monitors three Karnataka airports: • Bengaluru (BLR / VOBL) — Kempegowda International, 720 daily movements, 2 parallel 4,000m runways, international hub • Hubballi (HBX / VOHB) — 38 daily movements, 1 runway, domestic • Belagavi (IXG / VOBM) — 46 daily movements, 1 runway, domestic. See /airports for the live side-by-side comparison.",
    followUps: ["Why is BLR noisier?", "What is an ICAO code?", "Open the heatmap"],
  },
  {
    keywords: ["blr noise", "bengaluru noise", "why blr louder", "busiest airport"],
    topic: "Airports",
    answer: "Bengaluru (BLR) handles ~720 aircraft movements per day — roughly 20× Hubballi and Belagavi combined. It has wide-body international traffic (A380, B777, B787, A350) which produces louder noise than regional aircraft. Plus 2 parallel runways mean near-simultaneous operations.",
    followUps: ["Compare airports", "What aircraft fly from BLR?"],
  },

  // ==================== NOISE LEVELS & THRESHOLDS ====================
  {
    keywords: ["safe noise", "danger noise", "what is safe", "noise level", "decibel", "db", "threshold", "limit"],
    topic: "Noise",
    answer: "Noise thresholds in AeroSense: 🟢 Safe (<70 dB) — comfortable for prolonged exposure. 🟡 Moderate (70–90 dB) — limit prolonged exposure. 🔴 Dangerous (>90 dB) — hearing protection required. WHO recommends <55 dB long-term for residential areas to avoid cardiovascular risk.",
    followUps: ["What is 85 dB like?", "Health risks?", "WHO guidelines?"],
  },
  {
    keywords: ["85 db", "85 decibel", "100 db", "90 db", "sound level", "how loud"],
    topic: "Noise",
    answer: "For reference: 50 dB = quiet office · 70 dB = vacuum cleaner · 85 dB = heavy traffic / prolonged exposure risk · 95 dB = motorcycle · 100 dB = jackhammer / immediate hearing risk with extended exposure · 120 dB = jet engine at takeoff / threshold of pain. Jet takeoffs near runways routinely exceed 100 dB.",
    followUps: ["How to protect ears?", "WHO exposure limits?"],
  },

  // ==================== WHY IS NOISE HIGH ====================
  {
    keywords: ["why noise high", "noise high today", "loud today", "why loud"],
    topic: "Diagnostics",
    answer: "High noise typically comes from: 1) Clustered departure slots (runway congestion) 2) Heavy wide-body aircraft like A380 or B777 3) Engine tests outside maintenance windows 4) Atmospheric conditions (fog amplifies, rain dampens sound). Check the Live Flights board to see which aircraft are contributing.",
    followUps: ["Show me the flights", "What's the weather?", "Predict next hour"],
  },

  // ==================== AI PREDICTION ====================
  {
    keywords: ["ai", "prediction", "predict", "forecast", "future", "next 10 minutes", "how does ai work", "machine learning"],
    topic: "AI",
    answer: "AeroSense AI predicts the next 10 minutes using: • Time-of-day patterns (morning/evening rush) • Live sensor trends (rolling baseline) • Runway congestion signals • Confidence scoring (0–100%). The current engine is rule-based + rolling z-score; the architecture is API-ready for a future LSTM/Prophet model.",
    followUps: ["What is confidence?", "Open predictions page", "Is it real AI?"],
  },
  {
    keywords: ["confidence", "how accurate", "accuracy", "model accuracy"],
    topic: "AI",
    answer: "Each prediction shows a confidence score (typically 75–95%) based on: 1) How stable recent sensor trends are 2) How well the current hour matches historical patterns 3) Variance in the prediction window. Higher confidence = tighter prediction band.",
    followUps: ["Show predictions", "What about false positives?"],
  },

  // ==================== ANOMALY DETECTION ====================
  {
    keywords: ["anomaly", "outlier", "z-score", "detection", "unusual"],
    topic: "AI",
    answer: "Anomaly Detection uses rolling z-score: each zone has a 60-minute rolling baseline, and any live reading >2.5 standard deviations above it is flagged. This catches unusual events like unscheduled engine tests, clustered departures, or malfunctioning sensors. Severity: Low / Medium / High based on the z-score.",
    followUps: ["Show anomalies", "What causes anomalies?", "How to reduce them?"],
  },

  // ==================== HEATMAP & MAPS ====================
  {
    keywords: ["heatmap", "map", "green zone", "red zone", "yellow zone", "leaflet"],
    topic: "Heatmap",
    answer: "The live heatmap shows acoustic zones on a Leaflet map with CartoDB dark tiles. Each zone displays as a colored circle: 🟢 green (safe <70 dB) 🟡 yellow (moderate 70–90 dB) 🔴 red (dangerous >90 dB). Circle radius scales with noise level. Hover any circle for zone name and live dB.",
    followUps: ["Show me the map", "Compare 3 airports", "How often does it update?"],
  },

  // ==================== 3D DIGITAL TWIN ====================
  {
    keywords: ["3d", "digital twin", "twin", "webgl", "three", "visualization"],
    topic: "3D Twin",
    answer: "The 3D Digital Twin is rendered with React Three Fiber. It shows: • Glowing sensor towers whose color reflects noise status • Expanding noise rings visualising sound propagation radius • Three animated aircraft flying realistic routes • Drag to orbit, scroll to zoom. Access it at /twin.",
    followUps: ["Open the 3D twin", "What does it show?", "How is it rendered?"],
  },

  // ==================== AIRCRAFT & FLIGHTS ====================
  {
    keywords: ["aircraft", "plane", "flight", "airline", "takeoff", "landing", "indigo", "air india", "vistara", "akasa", "spicejet", "emirates"],
    topic: "Aircraft",
    answer: "AeroSense simulates real Indian carriers: IndiGo (6E), Air India (AI), Vistara (UK), Akasa (QP), SpiceJet (SG), Emirates (EK), Lufthansa (LH), Singapore (SQ), Qatar (QR). Each aircraft has a realistic acoustic profile — A380 produces ~110 dB at takeoff vs A320's ~90 dB. Heavy widebodies are flagged as peak noise contributors.",
    followUps: ["Show flights", "Why are widebodies louder?", "Aircraft noise comparison"],
  },
  {
    keywords: ["aircraft noise", "which loudest", "loudest aircraft", "noise comparison"],
    topic: "Aircraft",
    answer: "Aircraft noise ranking (takeoff): A380: 110 dB · B777-300ER: 106 dB · A340-600: 104 dB · B787-8: 98 dB · A350-900: 96 dB · B737-800: 93 dB · A320neo: 90 dB · ATR-72/Q400: 82-86 dB. Newer generation aircraft (A320neo, A350, B787) are noticeably quieter.",
    followUps: ["Which airlines fly heavy?", "Carbon impact by aircraft?"],
  },

  // ==================== RUNWAY & OPERATIONS ====================
  {
    keywords: ["runway", "active runway", "wind", "rwy"],
    topic: "Operations",
    answer: "Aircraft always land INTO the wind. AeroSense auto-selects the active runway based on wind direction. For example, if wind is from the east, runway 09 (heading 090°) is active. BLR has 2 parallel runways (09L/27R and 09R/27L), while HBX and IXG have single runways.",
    followUps: ["What's the current wind?", "Show active runway"],
  },

  // ==================== TRAFFIC PHASES & TIME ====================
  {
    keywords: ["traffic phase", "morning rush", "evening rush", "curfew", "night", "busy time", "peak time"],
    topic: "Operations",
    answer: "Traffic phases in AeroSense: 🌙 Night Curfew (00–05): 6% operations — minimal flights. 🌅 Early Morning (05–07): 45%. ☀️ Morning Rush (07–10): 100% — busiest. 🌤 Midday (10–13): 80%. 🕐 Afternoon (13–17): 75%. 🌆 Evening Rush (17–20): 95%. 🌙 Night (20–23): 55%. This mirrors real Indian airport schedules.",
    followUps: ["Is it busy now?", "Night curfew rules?"],
  },

  // ==================== HEALTH & WELLNESS ====================
  {
    keywords: ["health", "ear", "hearing", "protect", "ppe", "exposure", "who", "world health organization"],
    topic: "Health",
    answer: "WHO guidelines: • <55 dB long-term: safe for residential areas. • 55–70 dB: caution for prolonged exposure. • 70–85 dB: avoid long exposure, ear protection recommended for ground staff. • 85–100 dB: hearing protection mandatory, exposure ≤15 min. • >100 dB: immediate hearing risk, exposure <1 min. AeroSense's Health Engine (at /health) shows live recommendations per zone.",
    followUps: ["Open Health Engine", "What PPE is needed?", "Health risks of noise?"],
  },
  {
    keywords: ["health risk", "cardiovascular", "stress", "sleep", "impact of noise"],
    topic: "Health",
    answer: "Chronic noise exposure above 55 dB is linked to: • Cardiovascular disease (hypertension, heart disease) • Sleep disturbance • Cognitive impairment in children • Stress hormone elevation • Reduced productivity. WHO ranks environmental noise as the 2nd largest environmental health risk in Europe after air pollution.",
    followUps: ["How to reduce exposure?", "WHO guidelines?"],
  },

  // ==================== CARBON & ENVIRONMENT ====================
  {
    keywords: ["carbon", "co2", "emission", "footprint", "pollution", "sustainability", "climate"],
    topic: "Environment",
    answer: "AeroSense tracks CO₂ per flight. Example: An A350-900 flying 2,500 km emits ~18.75 tonnes of CO₂, equivalent to 893 trees absorbing carbon for a year, or 4 cars driven annually. See the Analytics page (/analytics) for combined noise + carbon trends across airports.",
    followUps: ["Open Carbon Calculator", "Which aircraft is greenest?", "How to reduce emissions?"],
  },
  {
    keywords: ["air quality", "pollution", "pm2", "pm10", "air"],
    topic: "Environment",
    answer: "AeroSense monitors CO₂ (ppm), temperature and humidity alongside noise. Combined monitoring gives a complete environmental picture. For instance, high CO₂ near runways correlates with jet emissions; tracking both helps authorities identify pollution hotspots.",
    followUps: ["What's the avg CO₂?", "Open Analytics"],
  },

  // ==================== COMPLAINTS ====================
  {
    keywords: ["complaint", "report", "file", "resident", "citizen", "audio recording"],
    topic: "Citizen",
    answer: "Residents near airports can file complaints via /complaints: submit name, location, disturbance time, category (early morning takeoff, night operations, etc.), description, and optionally record or upload audio evidence. Authorities see analytics: status distribution, complaint trends, and a review queue.",
    followUps: ["Open Complaints", "How are complaints resolved?", "Audio evidence?"],
  },

  // ==================== EMERGENCY & ALERTS ====================
  {
    keywords: ["emergency", "alert", "siren", "sms", "telegram", "notification", "push"],
    topic: "Alerts",
    answer: "Smart Alerts dispatch across 4 channels: 📱 SMS · ✉️ Email · 🔔 Push · 💬 Telegram/WhatsApp. When noise exceeds 110 dB, Emergency Mode triggers: full-screen red siren flash, pulsing overlay, automatic authority notification, and recommendation to evacuate non-essential staff.",
    followUps: ["How to configure alerts?", "Show emergency mode"],
  },

  // ==================== WEATHER ====================
  {
    keywords: ["weather", "fog", "rain", "temperature", "humidity", "pressure", "wind speed"],
    topic: "Weather",
    answer: "Weather affects noise propagation: 🌫 Fog/inversion amplifies sound by 4–7 dB (traps it near ground). 🌧 Rain absorbs high-frequency noise (3–5 dB reduction). 💨 Wind direction shapes where noise travels. AeroSense factors atmospheric conditions into its noise analysis at /weather.",
    followUps: ["Show weather", "Why does fog amplify noise?"],
  },

  // ==================== TECH STACK ====================
  {
    keywords: ["tech", "technology", "stack", "react", "tailwind", "typescript", "built with", "how is it built"],
    topic: "Tech",
    answer: "Tech stack: React 19 + TypeScript + Vite 7 + Tailwind 4 for the UI. Three.js + React Three Fiber for the 3D twin. Leaflet + CartoDB for maps. Recharts for data viz. Web Speech API for voice. Lucide for icons. Framer Motion for animations. Single-file static build (~620 KB gzipped).",
    followUps: ["Is it open source?", "What's the bundle size?", "Where is the backend?"],
  },
  {
    keywords: ["backend", "database", "firebase", "mqtt", "where data comes from"],
    topic: "Tech",
    answer: "The current build uses a realistic simulation engine — no real backend. Flight positions, noise levels and sensor readings are computed in-browser using real-world rules (Indian airline callsigns, route pairs, altitude profiles, traffic curves). The architecture is API-ready: swap the simulation with Firebase or MQTT streams without touching UI.",
    followUps: ["How to connect real sensors?", "Is the data realistic?"],
  },

  // ==================== FEATURES HOW-TO ====================
  {
    keywords: ["how to", "how do i", "navigate", "where is", "find"],
    topic: "Navigation",
    answer: "Navigate via: • Sidebar (desktop) or hamburger (mobile) • ⌘K / Ctrl+K command palette for quick search • Direct URLs: /dashboard, /airports, /heatmap, /ai, /twin, /anomalies, /weather, /complaints, /analytics, /health, /playback, /rankings. The chatbot (me!) is always at the bottom-right.",
    followUps: ["Open command palette", "Show all pages"],
  },
  {
    keywords: ["dark mode", "dark theme", "theme", "light mode"],
    topic: "UX",
    answer: "Toggle dark mode with the Moon/Sun icon in the top-right header. Your preference persists across sessions. AeroSense auto-detects your system preference on first visit.",
    followUps: ["Toggle dark mode", "Other languages?"],
  },
  {
    keywords: ["language", "hindi", "spanish", "multi"],
    topic: "UX",
    answer: "AeroSense supports 3 languages: 🇬🇧 English · 🇮🇳 हिन्दी · 🇪🇸 Español. Switch via the language toggle in the header (EN/HI/ES buttons).",
    followUps: ["Other languages planned?", "Where is the toggle?"],
  },
  {
    keywords: ["voice", "speak", "audio", "speech", "read aloud"],
    topic: "Voice",
    answer: "Voice features use the Web Speech API: • 'Speak Status' button in Dashboard narrates current conditions. • Health Engine can read recommendations aloud. • The chatbot (me!) can speak its responses — toggle the 🔊 icon in the chat header.",
    followUps: ["Enable audio", "Speak the current status"],
  },

  // ==================== COMPARISONS & ANALYTICS ====================
  {
    keywords: ["compare", "comparison", "ranking", "best", "quietest", "loudest"],
    topic: "Analytics",
    answer: "The Rankings page (/rankings) shows: 🏆 Quietest zone · 🔊 Most affected zone · 🌿 Daily environmental score (0–100). The Airports Compare page (/airports) ranks BLR vs HBX vs IXG by avg dB, peak dB, danger zones and live flights side by side.",
    followUps: ["Open rankings", "Compare airports"],
  },
  {
    keywords: ["playback", "history", "historical", "replay", "past data"],
    topic: "Analytics",
    answer: "Historical Playback (/playback) lets you pick any date and replay noise activity hour by hour. Use Play/Pause/Reset controls. This is ideal for investigating past incidents or presenting trends.",
    followUps: ["Open playback", "What's the noisiest day?"],
  },

  // ==================== TROUBLESHOOTING ====================
  {
    keywords: ["not working", "bug", "error", "issue", "problem", "broken"],
    topic: "Help",
    answer: "If something seems broken: 1) Refresh the page — all data regenerates. 2) Check your browser console for errors. 3) Try a different page. 4) If a specific feature isn't responding, it may be paused during a simulation tick. This is a demo build — let me know what specifically isn't working!",
    followUps: ["Reset the simulation", "Report an issue"],
  },

  // ==================== CATCH-ALL / FALLBACK ====================
  {
    keywords: ["thank", "thanks", "thx"],
    topic: "Conversation",
    answer: "You're welcome! 👋 Let me know if you'd like to explore any feature deeper, or try the live demo at /dashboard.",
    followUps: ["Open dashboard", "What else can you do?"],
  },
  {
    keywords: ["bye", "goodbye", "see you"],
    topic: "Conversation",
    answer: "Goodbye! Feel free to reopen the chat anytime. Safe flights! ✈️",
  },
];

// Topics for suggested categories
export const TOPICS = [
  { id: "Introduction", label: "Getting started", icon: "👋" },
  { id: "Airports", label: "Airports", icon: "✈️" },
  { id: "Noise", label: "Noise levels", icon: "🔊" },
  { id: "AI", label: "AI & predictions", icon: "🧠" },
  { id: "Heatmap", label: "Heatmap", icon: "🗺" },
  { id: "3D Twin", label: "3D twin", icon: "🧊" },
  { id: "Aircraft", label: "Aircraft", icon: "🛫" },
  { id: "Health", label: "Health", icon: "❤️" },
  { id: "Environment", label: "Carbon", icon: "🌿" },
  { id: "Citizen", label: "Complaints", icon: "📢" },
  { id: "Tech", label: "Tech stack", icon: "⚙️" },
];

export function entriesByTopic(topic: string) {
  return KNOWLEDGE.filter((k) => k.topic === topic);
}
