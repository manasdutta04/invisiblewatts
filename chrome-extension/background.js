// ─── InvisibleWatts Background Service Worker ────────────────────────────────
// Tracks tab activity and accumulates daily CO₂ / energy / data estimates.

// ─── Emission rates per known domain ─────────────────────────────────────────
// Units: g CO₂ per minute, MB per minute
const SITE_PROFILES = {
  // Video streaming (heavy)
  "youtube.com":     { co2: 0.52, mb: 320, category: "streaming", label: "YouTube" },
  "youtu.be":        { co2: 0.52, mb: 320, category: "streaming", label: "YouTube" },
  "netflix.com":     { co2: 0.58, mb: 380, category: "streaming", label: "Netflix" },
  "twitch.tv":       { co2: 0.55, mb: 350, category: "streaming", label: "Twitch" },
  "vimeo.com":       { co2: 0.42, mb: 280, category: "streaming", label: "Vimeo" },
  "disneyplus.com":  { co2: 0.55, mb: 360, category: "streaming", label: "Disney+" },
  "primevideo.com":  { co2: 0.50, mb: 330, category: "streaming", label: "Prime Video" },
  "hulu.com":        { co2: 0.50, mb: 330, category: "streaming", label: "Hulu" },
  "hbomax.com":      { co2: 0.50, mb: 330, category: "streaming", label: "Max" },
  "max.com":         { co2: 0.50, mb: 330, category: "streaming", label: "Max" },
  "peacocktv.com":   { co2: 0.45, mb: 300, category: "streaming", label: "Peacock" },
  "crunchyroll.com": { co2: 0.45, mb: 280, category: "streaming", label: "Crunchyroll" },

  // Social media
  "tiktok.com":      { co2: 0.48, mb: 280, category: "social", label: "TikTok" },
  "instagram.com":   { co2: 0.26, mb: 40,  category: "social", label: "Instagram" },
  "facebook.com":    { co2: 0.22, mb: 30,  category: "social", label: "Facebook" },
  "twitter.com":     { co2: 0.18, mb: 20,  category: "social", label: "Twitter/X" },
  "x.com":           { co2: 0.18, mb: 20,  category: "social", label: "Twitter/X" },
  "reddit.com":      { co2: 0.14, mb: 15,  category: "social", label: "Reddit" },
  "linkedin.com":    { co2: 0.12, mb: 12,  category: "social", label: "LinkedIn" },
  "pinterest.com":   { co2: 0.20, mb: 25,  category: "social", label: "Pinterest" },
  "snapchat.com":    { co2: 0.30, mb: 80,  category: "social", label: "Snapchat" },

  // Gaming
  "twitch.tv":       { co2: 0.55, mb: 350, category: "gaming", label: "Twitch" },
  "store.steampowered.com": { co2: 0.14, mb: 10, category: "gaming", label: "Steam" },

  // Productivity / low-impact
  "mail.google.com": { co2: 0.07, mb: 4,  category: "productivity", label: "Gmail" },
  "docs.google.com": { co2: 0.06, mb: 3,  category: "productivity", label: "Google Docs" },
  "sheets.google.com":{ co2: 0.06, mb: 3, category: "productivity", label: "Google Sheets" },
  "drive.google.com":{ co2: 0.06, mb: 3,  category: "productivity", label: "Google Drive" },
  "notion.so":       { co2: 0.07, mb: 4,  category: "productivity", label: "Notion" },
  "slack.com":       { co2: 0.09, mb: 5,  category: "productivity", label: "Slack" },
  "github.com":      { co2: 0.08, mb: 4,  category: "productivity", label: "GitHub" },
  "figma.com":       { co2: 0.12, mb: 8,  category: "productivity", label: "Figma" },
  "linear.app":      { co2: 0.07, mb: 4,  category: "productivity", label: "Linear" },
  "vercel.com":      { co2: 0.07, mb: 4,  category: "productivity", label: "Vercel" },

  // News / browsing
  "google.com":      { co2: 0.05, mb: 2,  category: "browsing", label: "Google" },
  "wikipedia.org":   { co2: 0.04, mb: 2,  category: "browsing", label: "Wikipedia" },
  "medium.com":      { co2: 0.08, mb: 5,  category: "browsing", label: "Medium" },
  "substack.com":    { co2: 0.07, mb: 4,  category: "browsing", label: "Substack" },
  "nytimes.com":     { co2: 0.12, mb: 10, category: "browsing", label: "NY Times" },
  "bbc.co.uk":       { co2: 0.10, mb: 8,  category: "browsing", label: "BBC" },
  "bbc.com":         { co2: 0.10, mb: 8,  category: "browsing", label: "BBC" },
  "cnn.com":         { co2: 0.14, mb: 12, category: "browsing", label: "CNN" },

  // Shopping
  "amazon.com":      { co2: 0.14, mb: 10, category: "browsing", label: "Amazon" },
  "ebay.com":        { co2: 0.10, mb: 8,  category: "browsing", label: "eBay" },
}

const DEFAULT_PROFILE = { co2: 0.10, mb: 6, category: "browsing" }

// ─── AI tips per category ─────────────────────────────────────────────────────
const CATEGORY_TIPS = {
  streaming: [
    "Lower YouTube/Netflix resolution to 480p to cut CO₂ by up to 60%.",
    "Streaming audio instead of video uses 10× less energy.",
    "Downloaded content uses ~80% less energy than streaming.",
    "Watching in dark mode reduces screen energy by up to 15%.",
  ],
  social: [
    "Disable auto-play videos in your social media settings.",
    "Switching from photos to text-only feeds cuts data use by 90%.",
    "Auto-playing videos account for up to 70% of social media energy.",
    "Use the mobile web version instead of app for lower data use.",
  ],
  gaming: [
    "Cloud gaming can use 4× more energy than local gaming.",
    "Enable power-saving mode in your browser during gaming sessions.",
    "Turning off background tabs while gaming saves 10–20% energy.",
  ],
  productivity: [
    "Working on documents offline uses near-zero server energy.",
    "Closing unused browser tabs reduces memory and energy use.",
    "Switching to dark mode reduces OLED screen energy by up to 30%.",
    "Use local apps instead of web for repetitive tasks.",
  ],
  browsing: [
    "Enabling an ad blocker reduces page-load data by 20–30%.",
    "Staying on one tab vs. many reduces background network use.",
    "Text-heavy pages use 10× less energy than image/video pages.",
    "Adding sites you visit often to favourites reduces search energy.",
  ],
}

const GENERAL_TIPS = [
  "Closing unused tabs can save up to 500 mg CO₂ per hour.",
  "Dark mode on OLED screens reduces energy use by up to 30%.",
  "Disabling Wi-Fi when not needed saves standby energy.",
  "Enabling battery saver mode reduces device emissions by 15–20%.",
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSiteProfile(hostname) {
  if (!hostname) return DEFAULT_PROFILE
  // Try exact match first, then strip www., then try partial match
  const cleaned = hostname.replace(/^www\./, "")
  if (SITE_PROFILES[cleaned]) return SITE_PROFILES[cleaned]
  if (SITE_PROFILES[hostname]) return SITE_PROFILES[hostname]
  // Partial match (e.g. "mail.google.com" → "google.com")
  for (const domain of Object.keys(SITE_PROFILES)) {
    if (cleaned.endsWith(domain)) return SITE_PROFILES[domain]
  }
  return DEFAULT_PROFILE
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function getTip(category) {
  const pool = CATEGORY_TIPS[category] || GENERAL_TIPS
  return pool[Math.floor(Math.random() * pool.length)]
}

// ─── Session state (in‑memory, reset each service-worker lifecycle) ───────────
let activeTabId = null
let activeHostname = null
let sessionStart = null  // timestamp when current tab session began
let videoPlaying = false // injected by content.js

// ─── Persist a time segment for a site ───────────────────────────────────────
async function flushSession() {
  if (!activeHostname || !sessionStart) return
  const now = Date.now()
  const minutes = (now - sessionStart) / 60000
  if (minutes < 0.05) return // ignore sub-3-second blips

  const profile = getSiteProfile(activeHostname)
  // If video is playing on this site boost the estimate
  const mult = videoPlaying && profile.category !== "streaming" ? 1.8 : 1.0
  const co2 = profile.co2 * minutes * mult
  const mb = profile.mb * minutes * mult
  const kwh = co2 / 475

  const key = todayKey()
  const stored = await chrome.storage.local.get(["daily", "sites"])
  const daily = stored.daily || {}
  const sites = stored.sites || {}

  // Accumulate daily totals
  if (!daily[key]) daily[key] = { co2: 0, kwh: 0, mb: 0, minutes: 0 }
  daily[key].co2     += co2
  daily[key].kwh     += kwh
  daily[key].mb      += mb
  daily[key].minutes += minutes

  // Accumulate per-site totals (today only)
  const siteKey = `${key}|${activeHostname}`
  if (!sites[siteKey]) sites[siteKey] = {
    hostname: activeHostname,
    label: profile.label || activeHostname,
    category: profile.category,
    co2: 0, kwh: 0, mb: 0, minutes: 0,
    date: key,
  }
  sites[siteKey].co2     += co2
  sites[siteKey].kwh     += kwh
  sites[siteKey].mb      += mb
  sites[siteKey].minutes += minutes

  // Prune old daily entries beyond 30 days
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  for (const d of Object.keys(daily)) {
    if (d < cutoff.toISOString().slice(0, 10)) delete daily[d]
  }
  // Prune old site entries beyond 7 days
  const siteCutoff = new Date()
  siteCutoff.setDate(siteCutoff.getDate() - 7)
  for (const sk of Object.keys(sites)) {
    if (sites[sk].date < siteCutoff.toISOString().slice(0, 10)) delete sites[sk]
  }

  await chrome.storage.local.set({ daily, sites })
  sessionStart = now // reset start to now for the same tab
}

// ─── Start tracking a new active tab ─────────────────────────────────────────
async function startTracking(tab) {
  // Flush previous session first
  await flushSession()
  videoPlaying = false

  try {
    const url = new URL(tab.url || "")
    if (!["http:", "https:"].includes(url.protocol)) {
      activeHostname = null
      sessionStart = null
      return
    }
    activeHostname = url.hostname
    sessionStart = Date.now()
    activeTabId = tab.id

    // Persist current site info for popup
    const profile = getSiteProfile(activeHostname)
    await chrome.storage.local.set({
      currentSite: {
        hostname: activeHostname,
        label: profile.label || activeHostname,
        category: profile.category,
        tip: getTip(profile.category),
      },
    })
  } catch {
    activeHostname = null
    sessionStart = null
  }
}

// ─── Event listeners ──────────────────────────────────────────────────────────

// Tab switched
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId)
    await startTracking(tab)
  } catch {/* tab may not exist */}
})

// Tab URL changed (SPA navigation or redirect)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId !== activeTabId) return
  if (changeInfo.status === "complete") {
    await startTracking(tab)
  }
})

// Tab closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabId === activeTabId) {
    await flushSession()
    activeHostname = null
    sessionStart = null
    activeTabId = null
  }
})

// Window focus lost (user switched app)
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await flushSession()
    sessionStart = null // paused
  } else {
    if (activeHostname) sessionStart = Date.now() // resume
  }
})

// Idle state changes
chrome.idle.onStateChanged.addListener(async (state) => {
  if (state === "idle" || state === "locked") {
    await flushSession()
    sessionStart = null
  } else if (state === "active") {
    if (activeHostname) sessionStart = Date.now()
  }
})
chrome.idle.setDetectionInterval(60)

// Periodic flush every 30 seconds so data isn't lost if popup is never opened
setInterval(async () => {
  if (activeHostname && sessionStart) {
    await flushSession()
    // sessionStart is reset inside flushSession
  }
}, 30000)

// ─── Messages from content.js and popup.js ────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "VIDEO_PLAYING") {
    videoPlaying = msg.playing
    return
  }

  if (msg.type === "GET_STATS") {
    const key = todayKey()
    chrome.storage.local.get(["daily", "sites", "currentSite"]).then((stored) => {
      const daily = stored.daily || {}
      const sites = stored.sites || {}
      const today = daily[key] || { co2: 0, kwh: 0, mb: 0, minutes: 0 }

      // Current site stats (today only)
      const currentSite = stored.currentSite || null
      let currentStats = null
      if (currentSite) {
        const siteKey = `${key}|${currentSite.hostname}`
        currentStats = sites[siteKey] || {
          hostname: currentSite.hostname,
          label: currentSite.label,
          category: currentSite.category,
          co2: 0, kwh: 0, mb: 0, minutes: 0,
        }
        currentStats.tip = currentSite.tip
      }

      // Last 7 days trend
      const trend = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dk = d.toISOString().slice(0, 10)
        trend.push({ date: dk.slice(5), co2: Math.round((daily[dk]?.co2 || 0)) })
      }

      sendResponse({ today, currentStats, trend })
    })
    return true // async response
  }
})

// ─── Initialise on install ────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({ daily: {}, sites: {}, currentSite: null })
  // Set idle detection
  chrome.idle.setDetectionInterval(60)
})
