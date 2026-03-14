// ─── InvisibleWatts Content Script ───────────────────────────────────────────
// Detects active video playback and high-energy activity on the page.
// Communicates status back to the background service worker.

(function () {
  "use strict"

  let videoCheckInterval = null
  let lastVideoState = false

  // ─── Detect video playback ──────────────────────────────────────────────────
  function isVideoPlaying() {
    const videos = document.querySelectorAll("video")
    for (const v of videos) {
      if (!v.paused && !v.ended && v.readyState > 2 && v.currentTime > 0) {
        return true
      }
    }
    return false
  }

  function checkAndReport() {
    const playing = isVideoPlaying()
    if (playing !== lastVideoState) {
      lastVideoState = playing
      chrome.runtime.sendMessage({ type: "VIDEO_PLAYING", playing }).catch(() => {})
    }
  }

  // Start polling once DOM is ready
  function startMonitoring() {
    videoCheckInterval = setInterval(checkAndReport, 5000)
    checkAndReport()
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startMonitoring)
  } else {
    startMonitoring()
  }

  // ─── Carbon warning banner for high-impact sites ────────────────────────────
  const HIGH_IMPACT_DOMAINS = [
    "youtube.com", "netflix.com", "twitch.tv", "tiktok.com",
    "disneyplus.com", "primevideo.com", "hulu.com", "hbomax.com", "max.com",
  ]

  const HIGH_IMPACT_TIPS = {
    "youtube.com":    "Switch to 480p to cut energy use by up to 60%.",
    "netflix.com":    "Lower quality to save up to 50% energy. Settings → Playback.",
    "twitch.tv":      "Set video quality to 480p or 360p for a lighter footprint.",
    "tiktok.com":     "TikTok is one of the most carbon-intensive apps. Limit scrolling.",
    "disneyplus.com": "Lower video quality in account settings to reduce your footprint.",
    "primevideo.com": "Stream in SD instead of UHD to save up to 80% streaming energy.",
  }

  function getHostname() {
    try { return location.hostname.replace(/^www\./, "") } catch { return "" }
  }

  const BANNER_KEY = "iw_banner_dismissed"

  function shouldShowBanner() {
    const host = getHostname()
    if (!HIGH_IMPACT_DOMAINS.some((d) => host.endsWith(d))) return false
    // Don't show more than once per day per site
    const dismissed = JSON.parse(localStorage.getItem(BANNER_KEY) || "{}")
    const today = new Date().toISOString().slice(0, 10)
    return dismissed[host] !== today
  }

  function dismissBanner(host) {
    const today = new Date().toISOString().slice(0, 10)
    const dismissed = JSON.parse(localStorage.getItem(BANNER_KEY) || "{}")
    dismissed[host] = today
    localStorage.setItem(BANNER_KEY, JSON.stringify(dismissed))
  }

  function injectBanner() {
    if (!shouldShowBanner()) return
    const host = getHostname()
    const tip = HIGH_IMPACT_TIPS[host] || "This site has a high digital carbon footprint."

    const banner = document.createElement("div")
    banner.id = "iw-carbon-banner"
    banner.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 2147483647;
        max-width: 300px;
        background: rgba(15,15,18,0.97);
        border: 1px solid rgba(16,185,129,0.35);
        border-radius: 14px;
        padding: 14px 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.1);
        backdrop-filter: blur(12px);
        animation: iwSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
      " id="iw-banner-inner">
        <style>
          @keyframes iwSlideIn {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        </style>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="font-size:16px;">⚡</span>
          <span style="color:#10b981;font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">InvisibleWatts</span>
          <button id="iw-close" style="
            margin-left:auto;background:none;border:none;cursor:pointer;
            color:#6b7280;font-size:16px;line-height:1;padding:2px;
          ">×</button>
        </div>
        <p style="color:#f87171;font-size:12px;font-weight:600;margin:0 0 4px;">
          ⚠ High carbon activity
        </p>
        <p style="color:#d1d5db;font-size:12px;margin:0;line-height:1.5;">
          ${tip}
        </p>
      </div>
    `
    document.body.appendChild(banner)

    document.getElementById("iw-close").addEventListener("click", () => {
      dismissBanner(host)
      banner.remove()
    })

    // Auto-dismiss after 12 seconds
    setTimeout(() => {
      if (document.getElementById("iw-carbon-banner")) {
        banner.remove()
      }
    }, 12000)
  }

  // Delay banner injection to avoid interfering with page load
  setTimeout(injectBanner, 3500)
})()
