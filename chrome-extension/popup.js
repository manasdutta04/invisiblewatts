// ─── InvisibleWatts Popup Script ──────────────────────────────────────────────

// The URL of your deployed InvisibleWatts web app
const DASHBOARD_URL = "https://invisiblewatts.vercel.app"

// Daily CO₂ limit used for the ring's 100% fill (grams)
const DAILY_LIMIT_G = 500

// India average domestic electricity tariff (₹/kWh)
const INR_PER_KWH = 7

// Ring circumference: 2 * π * 50
const CIRCUMFERENCE = 314.16

// ─── DOM references ───────────────────────────────────────────────────────────
const ringProgress = document.getElementById("ring-progress")
const ringValue    = document.getElementById("ring-value")
const trendBadge   = document.getElementById("trend-badge")
const trendLabel   = document.getElementById("trend-label")
const trendDot     = document.getElementById("trend-dot")

const statKwh      = document.getElementById("stat-kwh")
const statData     = document.getElementById("stat-data")
const statDataUnit = document.getElementById("stat-data-unit")
const statTime     = document.getElementById("stat-time")
const statCost     = document.getElementById("stat-cost")

const siteFavicon  = document.getElementById("site-favicon")
const siteName     = document.getElementById("site-name")
const siteCatTag   = document.getElementById("site-category-tag")
const siteCo2      = document.getElementById("site-co2")
const siteKwh      = document.getElementById("site-kwh")
const siteCost     = document.getElementById("site-cost")
const siteTime     = document.getElementById("site-time")

const tipText      = document.getElementById("tip-text")
const dashBtn      = document.getElementById("open-dashboard")
const analyticsBtn = document.getElementById("open-analytics")

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n, decimals = 1) {
  if (n == null || isNaN(n)) return "0"
  return n.toFixed(decimals)
}

function fmtCo2(g) {
  if (g == null || isNaN(g)) return "0 g"
  if (g >= 1000) return `${(g / 1000).toFixed(2)} kg`
  return `${Math.round(g)} g`
}

function fmtData(mb) {
  if (mb >= 1024) {
    statDataUnit.textContent = "GB"
    return (mb / 1024).toFixed(2)
  }
  statDataUnit.textContent = "MB"
  return Math.round(mb).toString()
}

function fmtMinutes(mins) {
  if (mins >= 60) return `${(mins / 60).toFixed(1)} h`
  return `${Math.round(mins)} min`
}

function getColor(pct) {
  if (pct < 40) return "#10b981"
  if (pct < 70) return "#f59e0b"
  return "#ef4444"
}

// ─── Ring animation ───────────────────────────────────────────────────────────

function animateRing(co2Grams) {
  const pct = Math.min((co2Grams / DAILY_LIMIT_G) * 100, 100)
  const offset = CIRCUMFERENCE - (CIRCUMFERENCE * pct) / 100
  const color = getColor(pct)

  // Let CSS transition handle the animation
  ringProgress.style.strokeDashoffset = offset
  ringProgress.style.stroke = color

  // Glow intensity tracks value
  const glowIntensity = 8 + pct * 0.3
  document.querySelector(".meter-svg").style.filter =
    `drop-shadow(0 0 ${glowIntensity}px ${color}40)`

  // Ring value text
  ringValue.textContent = fmtCo2(co2Grams)
  ringValue.style.fill = co2Grams > 0 ? "white" : "#6b7280"
}

// ─── Trend indicator ──────────────────────────────────────────────────────────

function updateTrend(trend) {
  if (!trend || trend.length < 2) {
    trendLabel.textContent = "Tracking…"
    return
  }
  const today = trend[trend.length - 1].co2
  const yesterday = trend[trend.length - 2].co2
  if (yesterday === 0) {
    trendLabel.textContent = "First day tracked"
    return
  }
  const delta = ((today - yesterday) / yesterday) * 100
  if (Math.abs(delta) < 5) {
    trendDot.style.background = "#f59e0b"
    trendLabel.textContent = "Similar to yesterday"
    return
  }
  if (delta < 0) {
    trendDot.style.background = "#10b981"
    trendLabel.textContent = `${Math.abs(Math.round(delta))}% less than yesterday`
  } else {
    trendDot.style.background = "#ef4444"
    trendLabel.textContent = `${Math.round(delta)}% more than yesterday`
  }
}

// ─── Site section ─────────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  streaming:    { bg: "rgba(239,68,68,0.1)",   fg: "#f87171",  bord: "rgba(239,68,68,0.2)" },
  social:       { bg: "rgba(236,72,153,0.1)",  fg: "#f472b6",  bord: "rgba(236,72,153,0.2)" },
  gaming:       { bg: "rgba(249,115,22,0.1)",  fg: "#fb923c",  bord: "rgba(249,115,22,0.2)" },
  productivity: { bg: "rgba(139,92,246,0.1)",  fg: "#a78bfa",  bord: "rgba(139,92,246,0.2)" },
  browsing:     { bg: "rgba(59,130,246,0.1)",  fg: "#60a5fa",  bord: "rgba(59,130,246,0.2)" },
}

function updateSite(stats) {
  if (!stats || !stats.hostname) {
    siteName.textContent = "No active website"
    siteCatTag.textContent = "—"
    siteCo2.textContent = "—"
    siteKwh.textContent = "—"
    siteCost.textContent = "—"
    siteTime.textContent = "—"
    siteFavicon.style.display = "none"
    return
  }

  const host = stats.hostname.replace(/^www\./, "")
  siteName.textContent = stats.label || host

  // Favicon via Google's service
  siteFavicon.src = `https://www.google.com/s2/favicons?sz=32&domain=${host}`
  siteFavicon.style.display = "block"
  siteFavicon.onerror = () => { siteFavicon.style.display = "none" }

  // Category tag
  const catStyle = CATEGORY_COLORS[stats.category] || CATEGORY_COLORS.browsing
  siteCatTag.textContent = stats.category || "browsing"
  siteCatTag.style.color = catStyle.fg
  siteCatTag.style.background = catStyle.bg
  siteCatTag.style.borderColor = catStyle.bord

  // Stats
  siteCo2.textContent = fmtCo2(stats.co2)
  siteKwh.textContent = `${fmt(stats.kwh, 4)} kWh`
  siteCost.textContent = stats.kwh != null ? `₹${(stats.kwh * INR_PER_KWH).toFixed(4)}` : "—"
  siteTime.textContent = fmtMinutes(stats.minutes || 0)
}

// ─── Tip ──────────────────────────────────────────────────────────────────────

function updateTip(stats) {
  if (stats?.tip) {
    tipText.textContent = stats.tip
    return
  }
  const fallbacks = [
    "Closing unused tabs saves up to 500 mg CO₂ per hour.",
    "Dark mode on OLED screens reduces energy use by up to 30%.",
    "Disabling autoplay videos can cut social media energy by 70%.",
    "Streaming in SD instead of 4K saves ~80% streaming energy.",
  ]
  tipText.textContent = fallbacks[Math.floor(Math.random() * fallbacks.length)]
}

// ─── Main render ──────────────────────────────────────────────────────────────

function render(data) {
  const today = data?.today || {}
  const co2 = today.co2 || 0

  animateRing(co2)
  updateTrend(data?.trend)

  // Daily totals
  const kwh = today.kwh || 0
  const mb  = today.mb  || 0
  const min = today.minutes || 0

  statKwh.textContent = kwh.toFixed(4)
  statData.textContent = fmtData(mb)
  statTime.textContent = Math.round(min)
  statCost.textContent = `₹${(kwh * INR_PER_KWH).toFixed(4)}`

  updateSite(data?.currentStats)
  updateTip(data?.currentStats)
}

// ─── Load data from background ────────────────────────────────────────────────

chrome.runtime.sendMessage({ type: "GET_STATS" }, (response) => {
  if (chrome.runtime.lastError) {
    // Background may not be ready yet on first install
    render(null)
    return
  }
  render(response)
})

// ─── Dashboard button ─────────────────────────────────────────────────────────

dashBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: DASHBOARD_URL })
  window.close()
})

// ─── Analytics button ─────────────────────────────────────────────────────────

analyticsBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("analytics.html") })
  window.close()
})
