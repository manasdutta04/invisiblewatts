export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          avatar_url?: string | null
        }
        Update: {
          full_name?: string
          avatar_url?: string | null
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          daily_kwh_target: number
          monthly_budget_dollars: number
          notifications: Json
          updated_at: string
        }
        Insert: {
          user_id: string
          daily_kwh_target?: number
          monthly_budget_dollars?: number
          notifications?: Json
        }
        Update: {
          daily_kwh_target?: number
          monthly_budget_dollars?: number
          notifications?: Json
          updated_at?: string
        }
      }
      devices: {
        Row: {
          id: string
          user_id: string
          name: string
          device_type: string
          status: string
          last_sync_at: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          name: string
          device_type: string
          status?: string
          last_sync_at?: string | null
        }
        Update: {
          name?: string
          status?: string
          last_sync_at?: string | null
        }
      }
      hourly_readings: {
        Row: {
          id: string
          user_id: string
          recorded_at: string
          hour_label: string
          kw_usage: number
          kw_target: number
        }
        Insert: {
          user_id: string
          recorded_at: string
          hour_label: string
          kw_usage: number
          kw_target?: number
        }
        Update: {
          kw_usage?: number
          kw_target?: number
        }
      }
      daily_readings: {
        Row: {
          id: string
          user_id: string
          date: string
          kwh_total: number
          cost_dollars: number
        }
        Insert: {
          user_id: string
          date: string
          kwh_total: number
          cost_dollars: number
        }
        Update: {
          kwh_total?: number
          cost_dollars?: number
        }
      }
      monthly_readings: {
        Row: {
          id: string
          user_id: string
          month_label: string
          sort_order: number
          kwh_total: number
          cost_dollars: number
        }
        Insert: {
          user_id: string
          month_label: string
          sort_order: number
          kwh_total: number
          cost_dollars: number
        }
        Update: {
          kwh_total?: number
          cost_dollars?: number
        }
      }
      category_breakdown: {
        Row: {
          id: string
          user_id: string
          category: string
          kwh_total: number
          percentage: number
          cost_dollars: number
          trend_direction: string
          trend_percent: number
        }
        Insert: {
          user_id: string
          category: string
          kwh_total: number
          percentage: number
          cost_dollars: number
          trend_direction?: string
          trend_percent?: number
        }
        Update: {
          kwh_total?: number
          percentage?: number
          cost_dollars?: number
          trend_direction?: string
          trend_percent?: number
        }
      }
      activity_events: {
        Row: {
          id: string
          user_id: string
          occurred_at: string
          event_name: string
          description: string
          event_type: string
          device_name: string
        }
        Insert: {
          user_id: string
          occurred_at?: string
          event_name: string
          description: string
          event_type: string
          device_name?: string
        }
        Update: never
      }
    }
  }
}

// Convenience row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"]
export type Device = Database["public"]["Tables"]["devices"]["Row"]
export type HourlyReading = Database["public"]["Tables"]["hourly_readings"]["Row"]
export type DailyReading = Database["public"]["Tables"]["daily_readings"]["Row"]
export type MonthlyReading = Database["public"]["Tables"]["monthly_readings"]["Row"]
export type CategoryBreakdown = Database["public"]["Tables"]["category_breakdown"]["Row"]
export type ActivityEvent = Database["public"]["Tables"]["activity_events"]["Row"]

// ─── Digital usage tracking (new) ────────────────────────────────────────────

export interface UsageEntry {
  id: string
  user_id: string
  date: string            // DATE as ISO string
  device_type: "phone" | "laptop" | "tablet"
  daily_hours: number
  activity_type: "streaming" | "browsing" | "gaming" | "calls" | "mixed"
  notes: string | null
  created_at: string
}

export interface AiAnalysis {
  id: string
  user_id: string
  created_at: string
  summary: string
  co2_estimate_grams: number | null
  recommendations: string[]
  entry_count: number
}

// Lightweight form type used before saving to DB
export interface UsageEntryInput {
  date: string
  device_type: "phone" | "laptop" | "tablet"
  daily_hours: number
  activity_type: "streaming" | "browsing" | "gaming" | "calls" | "mixed"
  notes?: string
}
