
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          shop_id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          segments: Json | null
          tags: Json | null
          notes: string | null
          company: string | null
        }
        Insert: {
          id?: string
          shop_id: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          segments?: Json | null
          tags?: Json | null
          notes?: string | null
          company?: string | null
        }
        Update: {
          id?: string
          shop_id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          segments?: Json | null
          tags?: Json | null
          notes?: string | null
          company?: string | null
        }
      }
      customer_loyalty: {
        Row: {
          id: string
          customer_id: string
          current_points: number
          lifetime_points: number
          lifetime_value: number
          tier?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          current_points?: number
          lifetime_points?: number
          lifetime_value?: number
          tier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          current_points?: number
          lifetime_points?: number
          lifetime_value?: number
          tier?: string
          created_at?: string
          updated_at?: string
        }
      }
      loyalty_settings: {
        Row: {
          id: string
          shop_id: string
          is_enabled: boolean
          points_per_dollar: number
          points_expiration_days: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          is_enabled?: boolean
          points_per_dollar?: number
          points_expiration_days?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          is_enabled?: boolean
          points_per_dollar?: number
          points_expiration_days?: number
          created_at?: string
          updated_at?: string
        }
      }
      loyalty_tiers: {
        Row: {
          id: string
          shop_id: string
          name: string
          threshold: number
          multiplier: number
          color?: string
          benefits?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          name: string
          threshold: number
          multiplier?: number
          color?: string
          benefits?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          name?: string
          threshold?: number
          multiplier?: number
          color?: string
          benefits?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
