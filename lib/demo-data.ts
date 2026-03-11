import type {
  MonthlyReading,
  CategoryBreakdown,
  ActivityEvent,
} from "@/lib/supabase/types"

// ─── Hourly readings (24-hour load curve, peak at 16:00–20:00) ───────────────

export const DEMO_HOURLY_DATA = [
  { hour_label: "00:00", kw_usage: 1.8, kw_target: 2.5 },
  { hour_label: "01:00", kw_usage: 1.5, kw_target: 2.5 },
  { hour_label: "02:00", kw_usage: 1.3, kw_target: 2.5 },
  { hour_label: "03:00", kw_usage: 1.2, kw_target: 2.5 },
  { hour_label: "04:00", kw_usage: 1.3, kw_target: 2.5 },
  { hour_label: "05:00", kw_usage: 1.6, kw_target: 2.5 },
  { hour_label: "06:00", kw_usage: 2.1, kw_target: 2.5 },
  { hour_label: "07:00", kw_usage: 2.8, kw_target: 2.5 },
  { hour_label: "08:00", kw_usage: 3.1, kw_target: 2.5 },
  { hour_label: "09:00", kw_usage: 2.9, kw_target: 2.5 },
  { hour_label: "10:00", kw_usage: 2.7, kw_target: 2.5 },
  { hour_label: "11:00", kw_usage: 2.5, kw_target: 2.5 },
  { hour_label: "12:00", kw_usage: 3.8, kw_target: 2.5 },
  { hour_label: "13:00", kw_usage: 3.5, kw_target: 2.5 },
  { hour_label: "14:00", kw_usage: 3.2, kw_target: 2.5 },
  { hour_label: "15:00", kw_usage: 3.4, kw_target: 2.5 },
  { hour_label: "16:00", kw_usage: 4.4, kw_target: 2.5 },
  { hour_label: "17:00", kw_usage: 4.8, kw_target: 2.5 },
  { hour_label: "18:00", kw_usage: 4.2, kw_target: 2.5 },
  { hour_label: "19:00", kw_usage: 3.9, kw_target: 2.5 },
  { hour_label: "20:00", kw_usage: 3.5, kw_target: 2.5 },
  { hour_label: "21:00", kw_usage: 2.8, kw_target: 2.5 },
  { hour_label: "22:00", kw_usage: 2.2, kw_target: 2.5 },
  { hour_label: "23:00", kw_usage: 1.9, kw_target: 2.5 },
]

// ─── Weekly data (last 7 days, Mon–Sun) ──────────────────────────────────────

export const DEMO_WEEKLY_DATA = [
  { day: "Mon", kWh: 245 },
  { day: "Tue", kWh: 268 },
  { day: "Wed", kWh: 278 },
  { day: "Thu", kWh: 255 },
  { day: "Fri", kWh: 290 },
  { day: "Sat", kWh: 310 },
  { day: "Sun", kWh: 285 },
]

// ─── Derived dashboard metrics ────────────────────────────────────────────────

export const DEMO_METRICS = {
  currentKw: 1.9,
  todayKwh: 45.2,
  monthlyAvgKwh: 1143,
}

// ─── Monthly readings (8 months) ──────────────────────────────────────────────

export const DEMO_MONTHLY_DATA: MonthlyReading[] = [
  { id: "d1", user_id: "demo", month_label: "Jan", sort_order: 1, kwh_total: 1200, cost_dollars: 150 },
  { id: "d2", user_id: "demo", month_label: "Feb", sort_order: 2, kwh_total: 1100, cost_dollars: 137 },
  { id: "d3", user_id: "demo", month_label: "Mar", sort_order: 3, kwh_total: 950,  cost_dollars: 119 },
  { id: "d4", user_id: "demo", month_label: "Apr", sort_order: 4, kwh_total: 890,  cost_dollars: 111 },
  { id: "d5", user_id: "demo", month_label: "May", sort_order: 5, kwh_total: 1050, cost_dollars: 131 },
  { id: "d6", user_id: "demo", month_label: "Jun", sort_order: 6, kwh_total: 1280, cost_dollars: 160 },
  { id: "d7", user_id: "demo", month_label: "Jul", sort_order: 7, kwh_total: 1350, cost_dollars: 169 },
  { id: "d8", user_id: "demo", month_label: "Aug", sort_order: 8, kwh_total: 1320, cost_dollars: 165 },
]

// ─── Category breakdown ───────────────────────────────────────────────────────

export const DEMO_CATEGORY_DATA: CategoryBreakdown[] = [
  { id: "c1", user_id: "demo", category: "HVAC",          kwh_total: 560, percentage: 45, cost_dollars: 70, trend_direction: "up",   trend_percent: 5 },
  { id: "c2", user_id: "demo", category: "Water Heating", kwh_total: 250, percentage: 20, cost_dollars: 31, trend_direction: "down",  trend_percent: 2 },
  { id: "c3", user_id: "demo", category: "Lighting",      kwh_total: 190, percentage: 15, cost_dollars: 24, trend_direction: "flat",  trend_percent: 0 },
  { id: "c4", user_id: "demo", category: "Appliances",    kwh_total: 250, percentage: 20, cost_dollars: 31, trend_direction: "up",    trend_percent: 3 },
]

// ─── Time of use blocks (aggregated from hourly) ──────────────────────────────

export const DEMO_TIME_OF_USE = [
  { period: "00:00–06:00", usage: Math.round(1.8 + 1.5 + 1.3 + 1.2 + 1.3 + 1.6) },
  { period: "06:00–12:00", usage: Math.round(2.1 + 2.8 + 3.1 + 2.9 + 2.7 + 2.5) },
  { period: "12:00–18:00", usage: Math.round(3.8 + 3.5 + 3.2 + 3.4 + 4.4 + 4.8) },
  { period: "18:00–24:00", usage: Math.round(4.2 + 3.9 + 3.5 + 2.8 + 2.2 + 1.9) },
]

// ─── Activity events ──────────────────────────────────────────────────────────

const now = new Date()
const ago = (ms: number) => new Date(now.getTime() - ms).toISOString()

export const DEMO_ACTIVITY_EVENTS: ActivityEvent[] = [
  { id: "e1", user_id: "demo", occurred_at: ago(90 * 60 * 1000),             event_name: "Peak Usage Detected", description: "Usage exceeded 3 kW for 15 minutes",      event_type: "alert",   device_name: "HVAC System" },
  { id: "e2", user_id: "demo", occurred_at: ago(3 * 3600 * 1000),            event_name: "Device Connected",    description: "Smart meter successfully synchronized",    event_type: "success", device_name: "Smart Meter" },
  { id: "e3", user_id: "demo", occurred_at: ago(7 * 3600 * 1000),            event_name: "Energy Goal Met",     description: "Daily usage 8% below target",             event_type: "success", device_name: "System" },
  { id: "e4", user_id: "demo", occurred_at: ago(25 * 3600 * 1000),           event_name: "Unusual Pattern",     description: "Usage pattern differs from usual by 12%", event_type: "warning", device_name: "Water Heater" },
  { id: "e5", user_id: "demo", occurred_at: ago(29 * 3600 * 1000),           event_name: "Device Offline",      description: "Connection lost with smart plug",          event_type: "alert",   device_name: "Smart Plug #3" },
  { id: "e6", user_id: "demo", occurred_at: ago(31 * 3600 * 1000),           event_name: "Maintenance Alert",   description: "Scheduled maintenance completed",          event_type: "info",    device_name: "System" },
  { id: "e7", user_id: "demo", occurred_at: ago(3 * 24 * 3600 * 1000),       event_name: "Settings Updated",    description: "Energy targets adjusted",                 event_type: "info",    device_name: "System" },
  { id: "e8", user_id: "demo", occurred_at: ago(4 * 24 * 3600 * 1000),       event_name: "Report Generated",    description: "Monthly energy report available",         event_type: "success", device_name: "System" },
]
