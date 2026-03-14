// ─── InvisibleWatts Analytics Page ───────────────────────────────────────────

const DASHBOARD_URL = "https://invisiblewatts.vercel.app"
const DAILY_LIMIT_G = 500

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function fmtCo2(g) {
  if (!g) return "0 g"
  if (g >= 1000) return `${(g / 1000).toFixed(2)} kg`
  return `${Math.round(g)} g`
}

function fmtMinutes(mins) {
  if (!mins) return "0 m"
  if (mins >= 60) return `${(mins / 60).toFixed(1)} h`
  return `${Math.round(mins)} m`
}

function barColor(co2) {
  const pct = co2 / DAILY_LIMIT_G
  if (pct < 0.4) return "#10b981"
  if (pct < 0.7) return "#f59e0b"
  return "#ef4444"
}

function getDayRange(n = 7) {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

// ─── Week Total Metrics ───────────────────────────────────────────────────────

function renderTotals(daily) {
  const days = getDayRange(7)
  let totalCo2 = 0, totalMb = 0, totalMin = 0
  for (const dk of days) {
    const d = daily[dk]
    if (!d) continue
    totalCo2 += d.co2     || 0
    totalMb  += d.mb      || 0
    totalMin += d.minutes || 0
  }

  document.getElementById("total-co2").textContent  = fmtCo2(totalCo2)
  document.getElementById("total-time").textContent = fmtMinutes(totalMin)

  if (totalMb >= 1024) {
    document.getElementById("total-data").textContent     = (totalMb / 1024).toFixed(2)
    document.getElementById("total-data-sub").textContent = "GB total"
  } else {
    document.getElementById("total-data").textContent     = Math.round(totalMb).toString()
    document.getElementById("total-data-sub").textContent = "MB total"
  }
}

// ─── SVG Week Bar Chart ───────────────────────────────────────────────────────

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function renderWeekChart(daily) {
  const days   = getDayRange(7)
  const values = days.map(dk => (daily[dk] || {}).co2 || 0)
  const container = document.getElementById("week-chart")

  if (values.every(v => v === 0)) {
    container.innerHTML = `<div class="empty-chart">No data yet. Start browsing to see your footprint.</div>`
    return
  }

  const W       = 540
  const H       = 148
  const LEFT    = 8
  const BAR_W   = 56
  const GAP     = 20
  const CHART_H = 100
  const LABEL_Y = CHART_H + 14 // day label row top
  const maxVal  = Math.max(...values, DAILY_LIMIT_G * 0.2)

  let defs = "<defs>"
  let bars = ""

  values.forEach((val, i) => {
    const x      = LEFT + i * (BAR_W + GAP)
    const cx     = x + BAR_W / 2
    const color  = barColor(val)
    const dayObj = new Date(days[i] + "T12:00:00")
    const day    = DAY_ABBR[dayObj.getDay()]
    const isToday = days[i] === todayKey()

    if (val > 0) {
      const barH = Math.max(6, (val / maxVal) * CHART_H)
      const barY = CHART_H - barH

      defs += `
        <linearGradient id="bg${i}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="1"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.5"/>
        </linearGradient>`

      bars += `
        <rect x="${x}" y="${barY}" width="${BAR_W}" height="${barH}"
              rx="5" fill="url(#bg${i})"/>
        <text x="${cx}" y="${barY - 5}" text-anchor="middle"
              font-size="9" fill="${color}" font-weight="700"
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
          ${Math.round(val)}g
        </text>`
    } else {
      bars += `
        <rect x="${x}" y="${CHART_H - 3}" width="${BAR_W}" height="3"
              rx="1.5" fill="rgba(255,255,255,0.04)"/>`
    }

    bars += `
      <text x="${cx}" y="${LABEL_Y + 16}" text-anchor="middle"
            font-size="10" fill="${isToday ? "#f9fafb" : "#6b7280"}"
            font-weight="${isToday ? "700" : "400"}"
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
        ${day}
      </text>
      ${isToday ? `<circle cx="${cx}" cy="${LABEL_Y + 23}" r="2.5" fill="#10b981"/>` : ""}`
  })

  defs += "</defs>"

  // Daily limit reference line (only when some bars exceed it)
  const limitY = CHART_H - (DAILY_LIMIT_G / maxVal) * CHART_H
  const totalWidth = LEFT + 7 * (BAR_W + GAP) - GAP
  const limitLine = limitY > 2 && limitY < CHART_H - 2 ? `
    <line x1="${LEFT}" y1="${limitY}" x2="${totalWidth}" y2="${limitY}"
          stroke="#ef4444" stroke-width="1" stroke-dasharray="4 3" opacity="0.3"/>
    <text x="${totalWidth + 4}" y="${limitY + 3}" font-size="8" fill="#ef4444" opacity="0.45"
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">limit</text>
  ` : ""

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      ${defs}
      ${limitLine}
      ${bars}
    </svg>`
}

// ─── Category Tag Styles ──────────────────────────────────────────────────────

const CAT_COLORS = {
  streaming:    { fg: "#f87171", bg: "rgba(239,68,68,0.12)" },
  social:       { fg: "#f472b6", bg: "rgba(236,72,153,0.12)" },
  gaming:       { fg: "#fb923c", bg: "rgba(249,115,22,0.12)" },
  productivity: { fg: "#a78bfa", bg: "rgba(139,92,246,0.12)" },
  browsing:     { fg: "#60a5fa", bg: "rgba(59,130,246,0.12)" },
}

function catStyle(cat) {
  return CAT_COLORS[cat] || CAT_COLORS.browsing
}

// ─── Build site row HTML ──────────────────────────────────────────────────────

function siteRowHtml(site, maxCo2) {
  const host = site.hostname.replace(/^www\./, "")
  const pct  = maxCo2 > 0 ? Math.min((site.co2 / maxCo2) * 100, 100) : 0
  const cs   = catStyle(site.category)
  const fill = barColor(site.co2)

  return `
    <div class="site-row">
      <img class="site-favicon js-favicon"
           src="https://www.google.com/s2/favicons?sz=32&domain=${host}"
           width="16" height="16" alt="" />
      <span class="site-row-name">${site.label || host}</span>
      <span class="site-cat-tag" style="color:${cs.fg};background:${cs.bg}">
        ${site.category || "browsing"}
      </span>
      <div class="site-bar-wrap">
        <div class="site-bar-fill" style="width:${pct}%;background:${fill}"></div>
      </div>
      <span class="site-row-co2">${fmtCo2(site.co2)}</span>
      <span class="site-row-time">${fmtMinutes(site.minutes)}</span>
    </div>`
}

// Attach onerror via JS (inline onerror attributes are blocked by MV3 CSP)
function attachFaviconHandlers(container) {
  container.querySelectorAll(".js-favicon").forEach(img => {
    img.onerror = () => { img.style.display = "none" }
  })
}

// ─── Top Sites (7-day, aggregated) ───────────────────────────────────────────

function renderTopSites(sites) {
  const container = document.getElementById("sites-list")

  // Aggregate by hostname across all stored dates
  const byHost = {}
  for (const entry of Object.values(sites)) {
    const h = entry.hostname
    if (!byHost[h]) {
      byHost[h] = {
        hostname: h,
        label: entry.label,
        category: entry.category,
        co2: 0, kwh: 0, mb: 0, minutes: 0,
      }
    }
    byHost[h].co2     += entry.co2     || 0
    byHost[h].kwh     += entry.kwh     || 0
    byHost[h].mb      += entry.mb      || 0
    byHost[h].minutes += entry.minutes || 0
  }

  const sorted = Object.values(byHost).sort((a, b) => b.co2 - a.co2).slice(0, 10)
  if (!sorted.length) {
    container.innerHTML = `<div class="empty-state">No site data yet.</div>`
    return
  }

  const maxCo2 = sorted[0].co2
  container.innerHTML = sorted.map(s => siteRowHtml(s, maxCo2)).join("")
  attachFaviconHandlers(container)
}

// ─── Today's Sites ────────────────────────────────────────────────────────────

function renderTodaySites(sites) {
  const container = document.getElementById("today-sites")
  const key       = todayKey()

  // Set today's readable date
  document.getElementById("today-date").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  })

  const todayEntries = Object.values(sites)
    .filter(s => s.date === key)
    .sort((a, b) => b.co2 - a.co2)

  if (!todayEntries.length) {
    container.innerHTML = `<div class="empty-state">No activity tracked today.</div>`
    return
  }

  const maxCo2 = todayEntries[0].co2
  container.innerHTML = todayEntries.map(s => siteRowHtml(s, maxCo2)).join("")
  attachFaviconHandlers(container)
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

chrome.storage.local.get(["daily", "sites"], (stored) => {
  const daily = stored.daily || {}
  const sites = stored.sites || {}

  renderTotals(daily)
  renderWeekChart(daily)
  renderTopSites(sites)
  renderTodaySites(sites)
})

// ─── Button Handlers ──────────────────────────────────────────────────────────

document.getElementById("go-back").addEventListener("click", () => {
  window.close()
})

document.getElementById("open-dashboard").addEventListener("click", () => {
  chrome.tabs.create({ url: DASHBOARD_URL })
  window.close()
})
