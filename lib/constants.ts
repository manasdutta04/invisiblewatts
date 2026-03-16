// Data consumption rate per activity type (GB/hr)
export const DATA_GB_PER_HOUR: Record<string, number> = {
  streaming: 3.0,
  gaming: 0.1,
  social: 0.5,
  calls: 1.0,
  browsing: 0.1,
  productivity: 0.05,
  mixed: 0.5,
}

// Conversion constants
export const KWH_PER_GB = 0.06          // 1 GB ≈ 0.06 kWh
export const GRID_G_PER_KWH = 475       // India grid: 475 g CO₂/kWh
