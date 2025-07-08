export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounting_streams: {
        Row: {
          account_code: string
          account_name: string
          account_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          parent_account_id: string | null
          reporting_category: string | null
          requires_segregation: boolean | null
          shop_id: string
          stream_type: string
          tax_treatment: string | null
          updated_at: string
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          parent_account_id?: string | null
          reporting_category?: string | null
          requires_segregation?: boolean | null
          shop_id: string
          stream_type: string
          tax_treatment?: string | null
          updated_at?: string
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          parent_account_id?: string | null
          reporting_category?: string | null
          requires_segregation?: boolean | null
          shop_id?: string
          stream_type?: string
          tax_treatment?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_streams_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "accounting_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      annual_filings: {
        Row: {
          actual_cost: number | null
          auto_reminder: boolean | null
          confirmation_number: string | null
          cost_estimate: number | null
          created_at: string
          created_by: string
          due_date: string
          extended_due_date: string | null
          filed_date: string | null
          filing_authority: string
          filing_name: string
          filing_number: string | null
          filing_type: string
          filing_year: number
          id: string
          notes: string | null
          penalties_for_late_filing: string | null
          preparer_contact: string | null
          preparer_name: string | null
          priority_level: string | null
          reminder_schedule: Json | null
          shop_id: string
          status: string | null
          supporting_documents: string[] | null
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          auto_reminder?: boolean | null
          confirmation_number?: string | null
          cost_estimate?: number | null
          created_at?: string
          created_by: string
          due_date: string
          extended_due_date?: string | null
          filed_date?: string | null
          filing_authority: string
          filing_name: string
          filing_number?: string | null
          filing_type: string
          filing_year: number
          id?: string
          notes?: string | null
          penalties_for_late_filing?: string | null
          preparer_contact?: string | null
          preparer_name?: string | null
          priority_level?: string | null
          reminder_schedule?: Json | null
          shop_id: string
          status?: string | null
          supporting_documents?: string[] | null
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          auto_reminder?: boolean | null
          confirmation_number?: string | null
          cost_estimate?: number | null
          created_at?: string
          created_by?: string
          due_date?: string
          extended_due_date?: string | null
          filed_date?: string | null
          filing_authority?: string
          filing_name?: string
          filing_number?: string | null
          filing_type?: string
          filing_year?: number
          id?: string
          notes?: string | null
          penalties_for_late_filing?: string | null
          preparer_contact?: string | null
          preparer_name?: string | null
          priority_level?: string | null
          reminder_schedule?: Json | null
          shop_id?: string
          status?: string | null
          supporting_documents?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      appearance_settings: {
        Row: {
          accent_color: string | null
          created_at: string | null
          font_family: string | null
          id: string
          primary_color: string | null
          secondary_color: string | null
          shop_id: string | null
          theme_mode: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          created_at?: string | null
          font_family?: string | null
          id?: string
          primary_color?: string | null
          secondary_color?: string | null
          shop_id?: string | null
          theme_mode?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          created_at?: string | null
          font_family?: string | null
          id?: string
          primary_color?: string | null
          secondary_color?: string | null
          shop_id?: string | null
          theme_mode?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appearance_settings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          advisor_id: string | null
          created_at: string
          customer_id: string | null
          date: string
          duration: number
          id: string
          notes: string | null
          status: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          advisor_id?: string | null
          created_at?: string
          customer_id?: string | null
          date: string
          duration: number
          id?: string
          notes?: string | null
          status: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          advisor_id?: string | null
          created_at?: string
          customer_id?: string | null
          date?: string
          duration?: number
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: []
      }
      asset_tracking: {
        Row: {
          asset_name: string
          asset_tag: string | null
          asset_type: string
          condition_status: string | null
          created_at: string | null
          created_by: string
          current_value: number | null
          depreciation_method: string | null
          disposal_date: string | null
          disposal_method: string | null
          grant_funded: boolean | null
          grant_id: string | null
          id: string
          location: string | null
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          shop_id: string
          updated_at: string | null
          useful_life_years: number | null
        }
        Insert: {
          asset_name: string
          asset_tag?: string | null
          asset_type: string
          condition_status?: string | null
          created_at?: string | null
          created_by: string
          current_value?: number | null
          depreciation_method?: string | null
          disposal_date?: string | null
          disposal_method?: string | null
          grant_funded?: boolean | null
          grant_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          shop_id: string
          updated_at?: string | null
          useful_life_years?: number | null
        }
        Update: {
          asset_name?: string
          asset_tag?: string | null
          asset_type?: string
          condition_status?: string | null
          created_at?: string | null
          created_by?: string
          current_value?: number | null
          depreciation_method?: string | null
          disposal_date?: string | null
          disposal_method?: string | null
          grant_funded?: boolean | null
          grant_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          shop_id?: string
          updated_at?: string | null
          useful_life_years?: number | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource: string
          resource_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource: string
          resource_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource?: string
          resource_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      board_meetings: {
        Row: {
          absent_members: string[] | null
          action_items: Json | null
          agenda_items: Json | null
          attendees: string[] | null
          created_at: string
          created_by: string
          id: string
          is_virtual: boolean | null
          location: string | null
          meeting_date: string
          meeting_minutes: string | null
          meeting_packet_sent: boolean | null
          meeting_type: string
          minutes_approved: boolean | null
          minutes_approved_date: string | null
          next_meeting_date: string | null
          quorum_met: boolean | null
          shop_id: string
          updated_at: string
          votes_taken: Json | null
        }
        Insert: {
          absent_members?: string[] | null
          action_items?: Json | null
          agenda_items?: Json | null
          attendees?: string[] | null
          created_at?: string
          created_by: string
          id?: string
          is_virtual?: boolean | null
          location?: string | null
          meeting_date: string
          meeting_minutes?: string | null
          meeting_packet_sent?: boolean | null
          meeting_type: string
          minutes_approved?: boolean | null
          minutes_approved_date?: string | null
          next_meeting_date?: string | null
          quorum_met?: boolean | null
          shop_id: string
          updated_at?: string
          votes_taken?: Json | null
        }
        Update: {
          absent_members?: string[] | null
          action_items?: Json | null
          agenda_items?: Json | null
          attendees?: string[] | null
          created_at?: string
          created_by?: string
          id?: string
          is_virtual?: boolean | null
          location?: string | null
          meeting_date?: string
          meeting_minutes?: string | null
          meeting_packet_sent?: boolean | null
          meeting_type?: string
          minutes_approved?: boolean | null
          minutes_approved_date?: string | null
          next_meeting_date?: string | null
          quorum_met?: boolean | null
          shop_id?: string
          updated_at?: string
          votes_taken?: Json | null
        }
        Relationships: []
      }
      board_members: {
        Row: {
          background_check_date: string | null
          background_summary: string | null
          board_packet_preference: string | null
          committee_memberships: string[] | null
          compensation_amount: number | null
          compensation_type: string | null
          conflicts_of_interest: string | null
          created_at: string
          created_by: string
          customer_id: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          end_date: string | null
          expertise_areas: string[] | null
          first_name: string
          id: string
          is_active: boolean | null
          is_voting_member: boolean | null
          last_name: string
          orientation_completed: boolean | null
          orientation_date: string | null
          phone: string | null
          position: string
          position_type: string | null
          shop_id: string
          start_date: string
          term_length: number | null
          updated_at: string
        }
        Insert: {
          background_check_date?: string | null
          background_summary?: string | null
          board_packet_preference?: string | null
          committee_memberships?: string[] | null
          compensation_amount?: number | null
          compensation_type?: string | null
          conflicts_of_interest?: string | null
          created_at?: string
          created_by: string
          customer_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          end_date?: string | null
          expertise_areas?: string[] | null
          first_name: string
          id?: string
          is_active?: boolean | null
          is_voting_member?: boolean | null
          last_name: string
          orientation_completed?: boolean | null
          orientation_date?: string | null
          phone?: string | null
          position: string
          position_type?: string | null
          shop_id: string
          start_date: string
          term_length?: number | null
          updated_at?: string
        }
        Update: {
          background_check_date?: string | null
          background_summary?: string | null
          board_packet_preference?: string | null
          committee_memberships?: string[] | null
          compensation_amount?: number | null
          compensation_type?: string | null
          conflicts_of_interest?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          end_date?: string | null
          expertise_areas?: string[] | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          is_voting_member?: boolean | null
          last_name?: string
          orientation_completed?: boolean | null
          orientation_date?: string | null
          phone?: string | null
          position?: string
          position_type?: string | null
          shop_id?: string
          start_date?: string
          term_length?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_members_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      branding_settings: {
        Row: {
          accent_color: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          shop_id: string
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          shop_id: string
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          shop_id?: string
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branding_settings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: true
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_categories: {
        Row: {
          budget_limit: number | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_category_id: string | null
          shop_id: string
          updated_at: string | null
        }
        Insert: {
          budget_limit?: number | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_category_id?: string | null
          shop_id: string
          updated_at?: string | null
        }
        Update: {
          budget_limit?: number | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_category_id?: string | null
          shop_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      budget_entries: {
        Row: {
          actual_amount: number
          budget_type: string
          category_id: string | null
          created_at: string | null
          created_by: string
          fiscal_year: number
          grant_id: string | null
          id: string
          is_locked: boolean | null
          month: number | null
          notes: string | null
          planned_amount: number
          program_id: string | null
          quarter: number | null
          shop_id: string
          updated_at: string | null
        }
        Insert: {
          actual_amount?: number
          budget_type: string
          category_id?: string | null
          created_at?: string | null
          created_by: string
          fiscal_year: number
          grant_id?: string | null
          id?: string
          is_locked?: boolean | null
          month?: number | null
          notes?: string | null
          planned_amount?: number
          program_id?: string | null
          quarter?: number | null
          shop_id: string
          updated_at?: string | null
        }
        Update: {
          actual_amount?: number
          budget_type?: string
          category_id?: string | null
          created_at?: string | null
          created_by?: string
          fiscal_year?: number
          grant_id?: string | null
          id?: string
          is_locked?: boolean | null
          month?: number | null
          notes?: string | null
          planned_amount?: number
          program_id?: string | null
          quarter?: number | null
          shop_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      business_industries: {
        Row: {
          created_at: string | null
          id: string
          label: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      business_types: {
        Row: {
          created_at: string | null
          id: string
          label: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          description: string | null
          end_time: string
          event_type: string
          id: string
          location: string | null
          priority: string
          start_time: string
          status: string
          technician_id: string | null
          title: string
          updated_at: string | null
          work_order_id: string | null
        }
        Insert: {
          all_day?: boolean | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          end_time: string
          event_type: string
          id?: string
          location?: string | null
          priority?: string
          start_time: string
          status?: string
          technician_id?: string | null
          title: string
          updated_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          all_day?: boolean | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          end_time?: string
          event_type?: string
          id?: string
          location?: string | null
          priority?: string
          start_time?: string
          status?: string
          technician_id?: string | null
          title?: string
          updated_at?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_preferences: {
        Row: {
          color_settings: Json | null
          created_at: string | null
          default_view: string
          displayed_calendars: Json | null
          first_day_of_week: number | null
          id: string
          updated_at: string | null
          user_id: string | null
          work_hours_end: string | null
          work_hours_start: string | null
        }
        Insert: {
          color_settings?: Json | null
          created_at?: string | null
          default_view?: string
          displayed_calendars?: Json | null
          first_day_of_week?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
          work_hours_end?: string | null
          work_hours_start?: string | null
        }
        Update: {
          color_settings?: Json | null
          created_at?: string | null
          default_view?: string
          displayed_calendars?: Json | null
          first_day_of_week?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
          work_hours_end?: string | null
          work_hours_start?: string | null
        }
        Relationships: []
      }
      campaign_segment_performance: {
        Row: {
          campaign_id: string
          clicks_count: number
          conversions_count: number
          created_at: string
          id: string
          metrics: Json | null
          opens_count: number
          recipients_count: number
          revenue: number | null
          segment_id: string | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          clicks_count?: number
          conversions_count?: number
          created_at?: string
          id?: string
          metrics?: Json | null
          opens_count?: number
          recipients_count?: number
          revenue?: number | null
          segment_id?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          clicks_count?: number
          conversions_count?: number
          created_at?: string
          id?: string
          metrics?: Json | null
          opens_count?: number
          recipients_count?: number
          revenue?: number | null
          segment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_segment_performance_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_segment_performance_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "marketing_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "shopping_carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_message_reactions: {
        Row: {
          created_at: string
          id: string
          message_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_message_read_receipts: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_message_read_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          edited_at: string | null
          file_url: string | null
          flag_reason: string | null
          id: string
          is_edited: boolean | null
          is_flagged: boolean | null
          is_read: boolean | null
          message_type: string | null
          metadata: Json | null
          original_content: string | null
          reply_to_id: string | null
          room_id: string
          sender_id: string
          sender_name: string
          thread_count: number | null
          thread_parent_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          edited_at?: string | null
          file_url?: string | null
          flag_reason?: string | null
          id?: string
          is_edited?: boolean | null
          is_flagged?: boolean | null
          is_read?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          original_content?: string | null
          reply_to_id?: string | null
          room_id: string
          sender_id: string
          sender_name: string
          thread_count?: number | null
          thread_parent_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          edited_at?: string | null
          file_url?: string | null
          flag_reason?: string | null
          id?: string
          is_edited?: boolean | null
          is_flagged?: boolean | null
          is_read?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          original_content?: string | null
          reply_to_id?: string | null
          room_id?: string
          sender_id?: string
          sender_name?: string
          thread_count?: number | null
          thread_parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_thread_parent_id_fkey"
            columns: ["thread_parent_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          id: string
          joined_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          id: string
          is_archived: boolean | null
          is_pinned: boolean | null
          metadata: Json | null
          name: string
          retention_period: number | null
          retention_type: string | null
          type: string
          updated_at: string
          work_order_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          metadata?: Json | null
          name: string
          retention_period?: number | null
          retention_type?: string | null
          type: string
          updated_at?: string
          work_order_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          metadata?: Json | null
          name?: string
          retention_period?: number | null
          retention_type?: string | null
          type?: string
          updated_at?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_typing_indicators: {
        Row: {
          id: string
          room_id: string
          started_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          id?: string
          room_id: string
          started_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          id?: string
          room_id?: string
          started_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_typing_indicators_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_templates: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          name: string
          shop_id: string
          subject: string | null
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          name: string
          shop_id: string
          subject?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          name?: string
          shop_id?: string
          subject?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_templates_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          created_at: string | null
          id: string
          settings_key: string
          settings_value: Json
          shop_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          settings_key: string
          settings_value?: Json
          shop_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          settings_key?: string
          settings_value?: Json
          shop_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_requirements: {
        Row: {
          applicable_to: string
          attachments: Json | null
          auto_renew: boolean | null
          completion_status: string | null
          cost_to_comply: number | null
          created_at: string
          created_by: string
          description: string | null
          documentation_required: string[] | null
          due_date: string | null
          frequency: string
          id: string
          last_compliance_date: string | null
          next_due_date: string | null
          notes: string | null
          penalties_for_non_compliance: string | null
          priority_level: string | null
          requirement_name: string
          requirement_type: string
          responsible_person: string | null
          shop_id: string
          updated_at: string
        }
        Insert: {
          applicable_to: string
          attachments?: Json | null
          auto_renew?: boolean | null
          completion_status?: string | null
          cost_to_comply?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          documentation_required?: string[] | null
          due_date?: string | null
          frequency: string
          id?: string
          last_compliance_date?: string | null
          next_due_date?: string | null
          notes?: string | null
          penalties_for_non_compliance?: string | null
          priority_level?: string | null
          requirement_name: string
          requirement_type: string
          responsible_person?: string | null
          shop_id: string
          updated_at?: string
        }
        Update: {
          applicable_to?: string
          attachments?: Json | null
          auto_renew?: boolean | null
          completion_status?: string | null
          cost_to_comply?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          documentation_required?: string[] | null
          due_date?: string | null
          frequency?: string
          id?: string
          last_compliance_date?: string | null
          next_due_date?: string | null
          notes?: string | null
          penalties_for_non_compliance?: string | null
          priority_level?: string | null
          requirement_name?: string
          requirement_type?: string
          responsible_person?: string | null
          shop_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversion_audit: {
        Row: {
          conversion_notes: string | null
          converted_by: string | null
          created_at: string
          id: string
          source_id: string
          source_type: string
          target_id: string
          target_type: string
        }
        Insert: {
          conversion_notes?: string | null
          converted_by?: string | null
          created_at?: string
          id?: string
          source_id: string
          source_type: string
          target_id: string
          target_type: string
        }
        Update: {
          conversion_notes?: string | null
          converted_by?: string | null
          created_at?: string
          id?: string
          source_id?: string
          source_type?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      customer_activities: {
        Row: {
          action: string
          customer_id: string
          flag_reason: string | null
          flagged: boolean | null
          id: string
          timestamp: string
          user_id: string
          user_name: string
        }
        Insert: {
          action: string
          customer_id: string
          flag_reason?: string | null
          flagged?: boolean | null
          id?: string
          timestamp?: string
          user_id: string
          user_name: string
        }
        Update: {
          action?: string
          customer_id?: string
          flag_reason?: string | null
          flagged?: boolean | null
          id?: string
          timestamp?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          address_type: string
          city: string
          country: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          phone: string | null
          postal_code: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          address_type: string
          city: string
          country?: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          phone?: string | null
          postal_code: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          address_type?: string
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          phone?: string | null
          postal_code?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_communications: {
        Row: {
          content: string
          created_at: string
          customer_id: string
          date: string
          direction: string
          id: string
          staff_member_id: string
          staff_member_name: string
          status: string
          subject: string | null
          template_id: string | null
          template_name: string | null
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          customer_id: string
          date?: string
          direction: string
          id?: string
          staff_member_id: string
          staff_member_name: string
          status: string
          subject?: string | null
          template_id?: string | null
          template_name?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          customer_id?: string
          date?: string
          direction?: string
          id?: string
          staff_member_id?: string
          staff_member_name?: string
          status?: string
          subject?: string | null
          template_id?: string | null
          template_name?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_communications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_documents: {
        Row: {
          category: string | null
          created_at: string
          customer_id: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          is_shared: boolean
          original_name: string
          tags: string[] | null
          title: string
          updated_at: string
          uploaded_by: string
          uploaded_by_name: string
          version: number
          version_notes: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          customer_id: string
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          is_shared?: boolean
          original_name: string
          tags?: string[] | null
          title: string
          updated_at?: string
          uploaded_by: string
          uploaded_by_name: string
          version?: number
          version_notes?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          customer_id?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          is_shared?: boolean
          original_name?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          uploaded_by?: string
          uploaded_by_name?: string
          version?: number
          version_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_form_comments: {
        Row: {
          comment: string
          created_at: string
          form_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          form_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          form_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_form_comments_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "customer_provided_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_interactions: {
        Row: {
          created_at: string
          customer_id: string
          customer_name: string
          date: string
          description: string
          follow_up_completed: boolean | null
          follow_up_date: string | null
          id: string
          notes: string | null
          related_work_order_id: string | null
          staff_member_id: string
          staff_member_name: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          customer_name: string
          date?: string
          description: string
          follow_up_completed?: boolean | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          related_work_order_id?: string | null
          staff_member_id: string
          staff_member_name: string
          status: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          customer_name?: string
          date?: string
          description?: string
          follow_up_completed?: boolean | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          related_work_order_id?: string | null
          staff_member_id?: string
          staff_member_name?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_interactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_interactions_related_work_order_id_fkey"
            columns: ["related_work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_loyalty: {
        Row: {
          created_at: string
          current_points: number | null
          customer_id: string | null
          id: string
          lifetime_points: number | null
          lifetime_value: number | null
          tier: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_points?: number | null
          customer_id?: string | null
          id?: string
          lifetime_points?: number | null
          lifetime_value?: number | null
          tier?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_points?: number | null
          customer_id?: string | null
          id?: string
          lifetime_points?: number | null
          lifetime_value?: number | null
          tier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_loyalty_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string
          customer_id: string
          id: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          created_by: string
          customer_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string
          customer_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_provided_forms: {
        Row: {
          customer_id: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          metadata: Json | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          tags: string[] | null
          title: string
          upload_date: string
        }
        Insert: {
          customer_id: string
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          metadata?: Json | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tags?: string[] | null
          title: string
          upload_date?: string
        }
        Update: {
          customer_id?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          metadata?: Json | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          upload_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_provided_forms_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          notes: string | null
          referral_date: string
          referred_id: string
          referrer_id: string
          status: string
          updated_at: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          referral_date?: string
          referred_id: string
          referrer_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          referral_date?: string
          referred_id?: string
          referrer_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_segment_assignments: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          is_automatic: boolean | null
          segment_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          is_automatic?: boolean | null
          segment_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          is_automatic?: boolean | null
          segment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_segment_assignments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_segment_assignments_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "customer_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_segments: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_shop_relationships: {
        Row: {
          booking_enabled: boolean
          customer_id: string
          id: string
          joined_at: string
          shop_id: string
          status: string
        }
        Insert: {
          booking_enabled?: boolean
          customer_id: string
          id?: string
          joined_at?: string
          shop_id: string
          status?: string
        }
        Update: {
          booking_enabled?: boolean
          customer_id?: string
          id?: string
          joined_at?: string
          shop_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_shop_relationships_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_shop_relationships_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_touchpoints: {
        Row: {
          action: string
          campaign_id: string | null
          channel: string
          created_at: string
          customer_id: string
          id: string
          metadata: Json | null
          occurred_at: string
          touchpoint_type: string
        }
        Insert: {
          action: string
          campaign_id?: string | null
          channel: string
          created_at?: string
          customer_id: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          touchpoint_type: string
        }
        Update: {
          action?: string
          campaign_id?: string | null
          channel?: string
          created_at?: string
          customer_id?: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          touchpoint_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_touchpoints_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_touchpoints_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          auth_user_id: string | null
          auto_billing: boolean | null
          business_email: string | null
          business_industry: string | null
          business_phone: string | null
          business_type: string | null
          city: string | null
          communication_preference: string | null
          company: string | null
          country: string | null
          created_at: string
          credit_terms: string | null
          email: string | null
          first_name: string
          fleet_company: string | null
          fleet_contact: string | null
          fleet_manager: string | null
          household_id: string | null
          id: string
          is_fleet: boolean | null
          last_name: string
          notes: string | null
          other_business_industry: string | null
          other_referral_details: string | null
          phone: string | null
          postal_code: string | null
          preferred_payment_method: string | null
          preferred_service_type: string | null
          preferred_technician_id: string | null
          referral_person_id: string | null
          referral_source: string | null
          segments: Json | null
          shop_id: string
          state: string | null
          tags: Json | null
          tax_id: string | null
          terms_agreed: boolean | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          auth_user_id?: string | null
          auto_billing?: boolean | null
          business_email?: string | null
          business_industry?: string | null
          business_phone?: string | null
          business_type?: string | null
          city?: string | null
          communication_preference?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          credit_terms?: string | null
          email?: string | null
          first_name: string
          fleet_company?: string | null
          fleet_contact?: string | null
          fleet_manager?: string | null
          household_id?: string | null
          id?: string
          is_fleet?: boolean | null
          last_name: string
          notes?: string | null
          other_business_industry?: string | null
          other_referral_details?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_payment_method?: string | null
          preferred_service_type?: string | null
          preferred_technician_id?: string | null
          referral_person_id?: string | null
          referral_source?: string | null
          segments?: Json | null
          shop_id: string
          state?: string | null
          tags?: Json | null
          tax_id?: string | null
          terms_agreed?: boolean | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          auth_user_id?: string | null
          auto_billing?: boolean | null
          business_email?: string | null
          business_industry?: string | null
          business_phone?: string | null
          business_type?: string | null
          city?: string | null
          communication_preference?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          credit_terms?: string | null
          email?: string | null
          first_name?: string
          fleet_company?: string | null
          fleet_contact?: string | null
          fleet_manager?: string | null
          household_id?: string | null
          id?: string
          is_fleet?: boolean | null
          last_name?: string
          notes?: string | null
          other_business_industry?: string | null
          other_referral_details?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_payment_method?: string | null
          preferred_service_type?: string | null
          preferred_technician_id?: string | null
          referral_person_id?: string | null
          referral_source?: string | null
          segments?: Json | null
          shop_id?: string
          state?: string | null
          tags?: Json | null
          tax_id?: string | null
          terms_agreed?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          shop_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          shop_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          shop_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_audit_log: {
        Row: {
          action_type: string
          discount_id: string
          discount_table: string
          id: string
          new_values: Json | null
          old_values: Json | null
          performed_at: string
          performed_by: string
          reason: string | null
        }
        Insert: {
          action_type: string
          discount_id: string
          discount_table: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_at?: string
          performed_by: string
          reason?: string | null
        }
        Update: {
          action_type?: string
          discount_id?: string
          discount_table?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_at?: string
          performed_by?: string
          reason?: string | null
        }
        Relationships: []
      }
      discount_types: {
        Row: {
          applies_to: string
          created_at: string
          created_by: string
          default_value: number
          description: string | null
          discount_type: string
          id: string
          is_active: boolean
          max_discount_amount: number | null
          name: string
          requires_approval: boolean
          updated_at: string
        }
        Insert: {
          applies_to: string
          created_at?: string
          created_by: string
          default_value?: number
          description?: string | null
          discount_type: string
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          name: string
          requires_approval?: boolean
          updated_at?: string
        }
        Update: {
          applies_to?: string
          created_at?: string
          created_by?: string
          default_value?: number
          description?: string | null
          discount_type?: string
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          name?: string
          requires_approval?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      diy_bay_rate_history: {
        Row: {
          bay_id: string | null
          changed_at: string | null
          changed_by: string | null
          daily_rate: number | null
          hourly_rate: number
          id: string
          monthly_rate: number | null
          weekly_rate: number | null
        }
        Insert: {
          bay_id?: string | null
          changed_at?: string | null
          changed_by?: string | null
          daily_rate?: number | null
          hourly_rate: number
          id?: string
          monthly_rate?: number | null
          weekly_rate?: number | null
        }
        Update: {
          bay_id?: string | null
          changed_at?: string | null
          changed_by?: string | null
          daily_rate?: number | null
          hourly_rate?: number
          id?: string
          monthly_rate?: number | null
          weekly_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diy_bay_rate_history_bay_id_fkey"
            columns: ["bay_id"]
            isOneToOne: false
            referencedRelation: "diy_bay_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      diy_bay_rate_settings: {
        Row: {
          daily_discount_percent: number | null
          daily_hours: number | null
          hourly_base_rate: number | null
          id: string
          monthly_multiplier: number | null
          shop_id: string | null
          updated_at: string | null
          updated_by: string | null
          weekly_multiplier: number | null
        }
        Insert: {
          daily_discount_percent?: number | null
          daily_hours?: number | null
          hourly_base_rate?: number | null
          id?: string
          monthly_multiplier?: number | null
          shop_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          weekly_multiplier?: number | null
        }
        Update: {
          daily_discount_percent?: number | null
          daily_hours?: number | null
          hourly_base_rate?: number | null
          id?: string
          monthly_multiplier?: number | null
          shop_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          weekly_multiplier?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diy_bay_rate_settings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: true
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      diy_bay_rates: {
        Row: {
          bay_location: string | null
          bay_name: string
          created_at: string | null
          daily_rate: number | null
          display_order: number | null
          hourly_rate: number
          id: string
          is_active: boolean | null
          monthly_rate: number | null
          shop_id: string | null
          updated_at: string | null
          weekly_rate: number | null
        }
        Insert: {
          bay_location?: string | null
          bay_name: string
          created_at?: string | null
          daily_rate?: number | null
          display_order?: number | null
          hourly_rate: number
          id?: string
          is_active?: boolean | null
          monthly_rate?: number | null
          shop_id?: string | null
          updated_at?: string | null
          weekly_rate?: number | null
        }
        Update: {
          bay_location?: string | null
          bay_name?: string
          created_at?: string | null
          daily_rate?: number | null
          display_order?: number | null
          hourly_rate?: number
          id?: string
          is_active?: boolean | null
          monthly_rate?: number | null
          shop_id?: string | null
          updated_at?: string | null
          weekly_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diy_bay_rates_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      document_access_logs: {
        Row: {
          access_type: string
          accessed_by: string
          accessed_by_name: string
          created_at: string
          document_id: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_by: string
          accessed_by_name: string
          created_at?: string
          document_id: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_by?: string
          accessed_by_name?: string
          created_at?: string
          document_id?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_access_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          usage_count: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          usage_count?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          usage_count?: number
        }
        Relationships: []
      }
      document_versions: {
        Row: {
          created_at: string
          created_by: string
          created_by_name: string
          document_id: string
          file_path: string | null
          file_size: number | null
          id: string
          version_notes: string | null
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by: string
          created_by_name: string
          document_id: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          version_notes?: string | null
          version_number: number
        }
        Update: {
          created_at?: string
          created_by?: string
          created_by_name?: string
          document_id?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          version_notes?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string
          created_by_name: string
          customer_id: string | null
          description: string | null
          document_type: string
          file_path: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_archived: boolean
          is_public: boolean
          metadata: Json | null
          mime_type: string | null
          tags: string[] | null
          title: string
          updated_at: string
          updated_by: string | null
          updated_by_name: string | null
          work_order_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by: string
          created_by_name: string
          customer_id?: string | null
          description?: string | null
          document_type: string
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_archived?: boolean
          is_public?: boolean
          metadata?: Json | null
          mime_type?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          updated_by?: string | null
          updated_by_name?: string | null
          work_order_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string
          created_by_name?: string
          customer_id?: string | null
          description?: string | null
          document_type?: string
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_archived?: boolean
          is_public?: boolean
          metadata?: Json | null
          mime_type?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          updated_by_name?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "document_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          acknowledgment_date: string | null
          acknowledgment_sent: boolean | null
          amount: number
          campaign_id: string | null
          campaign_name: string | null
          created_at: string
          created_by: string
          designation: string | null
          donation_type: string
          donor_email: string | null
          donor_id: string | null
          donor_name: string
          donor_phone: string | null
          id: string
          is_recurring: boolean | null
          metadata: Json | null
          notes: string | null
          payment_method: string | null
          receipt_number: string | null
          recurrence_frequency: string | null
          shop_id: string
          tax_deductible: boolean | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          acknowledgment_date?: string | null
          acknowledgment_sent?: boolean | null
          amount: number
          campaign_id?: string | null
          campaign_name?: string | null
          created_at?: string
          created_by: string
          designation?: string | null
          donation_type?: string
          donor_email?: string | null
          donor_id?: string | null
          donor_name: string
          donor_phone?: string | null
          id?: string
          is_recurring?: boolean | null
          metadata?: Json | null
          notes?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          recurrence_frequency?: string | null
          shop_id: string
          tax_deductible?: boolean | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          acknowledgment_date?: string | null
          acknowledgment_sent?: boolean | null
          amount?: number
          campaign_id?: string | null
          campaign_name?: string | null
          created_at?: string
          created_by?: string
          designation?: string | null
          donation_type?: string
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string
          donor_phone?: string | null
          id?: string
          is_recurring?: boolean | null
          metadata?: Json | null
          notes?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          recurrence_frequency?: string | null
          shop_id?: string
          tax_deductible?: boolean | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_acknowledgments: {
        Row: {
          acknowledgment_date: string | null
          acknowledgment_type: string
          created_at: string
          created_by: string
          donation_id: string | null
          donor_id: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          generated_content: string | null
          goods_services_description: string | null
          goods_services_value: number | null
          id: string
          mail_sent: boolean | null
          mail_sent_at: string | null
          pdf_file_path: string | null
          personalization_data: Json | null
          receipt_number: string
          shop_id: string
          tax_deductible_amount: number | null
          tax_year: number | null
          template_used: string | null
          updated_at: string
        }
        Insert: {
          acknowledgment_date?: string | null
          acknowledgment_type: string
          created_at?: string
          created_by: string
          donation_id?: string | null
          donor_id?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          generated_content?: string | null
          goods_services_description?: string | null
          goods_services_value?: number | null
          id?: string
          mail_sent?: boolean | null
          mail_sent_at?: string | null
          pdf_file_path?: string | null
          personalization_data?: Json | null
          receipt_number: string
          shop_id: string
          tax_deductible_amount?: number | null
          tax_year?: number | null
          template_used?: string | null
          updated_at?: string
        }
        Update: {
          acknowledgment_date?: string | null
          acknowledgment_type?: string
          created_at?: string
          created_by?: string
          donation_id?: string | null
          donor_id?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          generated_content?: string | null
          goods_services_description?: string | null
          goods_services_value?: number | null
          id?: string
          mail_sent?: boolean | null
          mail_sent_at?: string | null
          pdf_file_path?: string | null
          personalization_data?: Json | null
          receipt_number?: string
          shop_id?: string
          tax_deductible_amount?: number | null
          tax_year?: number | null
          template_used?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donor_acknowledgments_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donor_acknowledgments_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_ab_test_results: {
        Row: {
          campaign_id: string
          clicks_count: number
          confidence_level: number | null
          conversions_count: number
          created_at: string
          id: string
          is_winner: boolean | null
          metrics: Json | null
          opens_count: number
          recipients_count: number
          revenue: number | null
          updated_at: string
          variant_id: string
          variant_name: string
        }
        Insert: {
          campaign_id: string
          clicks_count?: number
          confidence_level?: number | null
          conversions_count?: number
          created_at?: string
          id?: string
          is_winner?: boolean | null
          metrics?: Json | null
          opens_count?: number
          recipients_count?: number
          revenue?: number | null
          updated_at?: string
          variant_id: string
          variant_name: string
        }
        Update: {
          campaign_id?: string
          clicks_count?: number
          confidence_level?: number | null
          conversions_count?: number
          created_at?: string
          id?: string
          is_winner?: boolean | null
          metrics?: Json | null
          opens_count?: number
          recipients_count?: number
          revenue?: number | null
          updated_at?: string
          variant_id?: string
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_ab_test_results_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaign_analytics: {
        Row: {
          bounced: number | null
          bounced_rate: number | null
          campaign_id: string | null
          click_rate: number | null
          click_to_open_rate: number | null
          clicked: number | null
          complained: number | null
          created_at: string | null
          delivered: number | null
          id: string
          name: string
          open_rate: number | null
          opened: number | null
          sent: number | null
          timeline: Json | null
          unsubscribe_rate: number | null
          unsubscribed: number | null
          updated_at: string | null
        }
        Insert: {
          bounced?: number | null
          bounced_rate?: number | null
          campaign_id?: string | null
          click_rate?: number | null
          click_to_open_rate?: number | null
          clicked?: number | null
          complained?: number | null
          created_at?: string | null
          delivered?: number | null
          id?: string
          name: string
          open_rate?: number | null
          opened?: number | null
          sent?: number | null
          timeline?: Json | null
          unsubscribe_rate?: number | null
          unsubscribed?: number | null
          updated_at?: string | null
        }
        Update: {
          bounced?: number | null
          bounced_rate?: number | null
          campaign_id?: string | null
          click_rate?: number | null
          click_to_open_rate?: number | null
          clicked?: number | null
          complained?: number | null
          created_at?: string | null
          delivered?: number | null
          id?: string
          name?: string
          open_rate?: number | null
          opened?: number | null
          sent?: number | null
          timeline?: Json | null
          unsubscribe_rate?: number | null
          unsubscribed?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaign_recipients: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          created_at: string
          id: string
          opened_at: string | null
          personalization: Json | null
          recipient_email: string
          recipient_name: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          created_at?: string
          id?: string
          opened_at?: string | null
          personalization?: Json | null
          recipient_email: string
          recipient_name?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          created_at?: string
          id?: string
          opened_at?: string | null
          personalization?: Json | null
          recipient_email?: string
          recipient_name?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          ab_test: Json | null
          clicked: number | null
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          opened: number | null
          personalizations: Json | null
          recipient_ids: Json | null
          scheduled_date: string | null
          segment_ids: Json | null
          sent_date: string | null
          status: string
          subject: string
          template_id: string | null
          total_recipients: number | null
          updated_at: string | null
        }
        Insert: {
          ab_test?: Json | null
          clicked?: number | null
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          opened?: number | null
          personalizations?: Json | null
          recipient_ids?: Json | null
          scheduled_date?: string | null
          segment_ids?: Json | null
          sent_date?: string | null
          status?: string
          subject: string
          template_id?: string | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Update: {
          ab_test?: Json | null
          clicked?: number | null
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          opened?: number | null
          personalizations?: Json | null
          recipient_ids?: Json | null
          scheduled_date?: string | null
          segment_ids?: Json | null
          sent_date?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_events: {
        Row: {
          campaign_id: string | null
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          recipient_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          recipient_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          recipient_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_provider_settings: {
        Row: {
          api_key: string | null
          created_at: string | null
          from_email: string | null
          id: string
          is_enabled: boolean | null
          provider: string
          shop_id: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_username: string | null
          updated_at: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string | null
          from_email?: string | null
          id?: string
          is_enabled?: boolean | null
          provider: string
          shop_id?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          updated_at?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string | null
          from_email?: string | null
          id?: string
          is_enabled?: boolean | null
          provider?: string
          shop_id?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_provider_settings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: true
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequence_analytics: {
        Row: {
          active_enrollments: number
          average_time_to_complete: number | null
          completed_enrollments: number
          conversion_rate: number | null
          id: string
          sequence_id: string
          total_enrollments: number
          updated_at: string
        }
        Insert: {
          active_enrollments?: number
          average_time_to_complete?: number | null
          completed_enrollments?: number
          conversion_rate?: number | null
          id?: string
          sequence_id: string
          total_enrollments?: number
          updated_at?: string
        }
        Update: {
          active_enrollments?: number
          average_time_to_complete?: number | null
          completed_enrollments?: number
          conversion_rate?: number | null
          id?: string
          sequence_id?: string
          total_enrollments?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_analytics_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequence_enrollments: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step_id: string | null
          customer_id: string
          id: string
          metadata: Json | null
          next_send_time: string | null
          sequence_id: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step_id?: string | null
          customer_id: string
          id?: string
          metadata?: Json | null
          next_send_time?: string | null
          sequence_id: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step_id?: string | null
          customer_id?: string
          id?: string
          metadata?: Json | null
          next_send_time?: string | null
          sequence_id?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_enrollments_current_step_id_fkey"
            columns: ["current_step_id"]
            isOneToOne: false
            referencedRelation: "email_sequence_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sequence_enrollments_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequence_steps: {
        Row: {
          condition_operator: string | null
          condition_type: string | null
          condition_value: string | null
          created_at: string
          delay_hours: number
          delay_type: string
          id: string
          is_active: boolean
          name: string
          position: number
          sequence_id: string
          template_id: string
          updated_at: string
        }
        Insert: {
          condition_operator?: string | null
          condition_type?: string | null
          condition_value?: string | null
          created_at?: string
          delay_hours?: number
          delay_type?: string
          id?: string
          is_active?: boolean
          name: string
          position: number
          sequence_id: string
          template_id: string
          updated_at?: string
        }
        Update: {
          condition_operator?: string | null
          condition_type?: string | null
          condition_value?: string | null
          created_at?: string
          delay_hours?: number
          delay_type?: string
          id?: string
          is_active?: boolean
          name?: string
          position?: number
          sequence_id?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequences: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          shop_id: string | null
          trigger_event: string | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          shop_id?: string | null
          trigger_event?: string | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          shop_id?: string | null
          trigger_event?: string | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_system_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          category: string
          content: string
          created_at: string | null
          description: string | null
          id: string
          is_archived: boolean | null
          name: string
          subject: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          name: string
          subject: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean | null
          name?: string
          subject?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      email_tracking: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          clicked_url: string | null
          created_at: string
          id: string
          opened_at: string | null
          recipient_id: string | null
          sent_at: string | null
          tracking_id: string
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          clicked_url?: string | null
          created_at?: string
          id?: string
          opened_at?: string | null
          recipient_id?: string | null
          sent_at?: string | null
          tracking_id: string
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          clicked_url?: string | null
          created_at?: string
          id?: string
          opened_at?: string | null
          recipient_id?: string | null
          sent_at?: string | null
          tracking_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_tracking_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      employment_types: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          category: string
          created_at: string | null
          customer: string
          id: string
          install_date: string
          last_maintenance_date: string
          location: string
          maintenance_frequency: string
          maintenance_history: Json | null
          maintenance_schedules: Json | null
          manufacturer: string
          model: string
          name: string
          next_maintenance_date: string
          notes: string | null
          purchase_date: string
          serial_number: string
          status: string
          updated_at: string | null
          warranty_expiry_date: string
          warranty_status: string
          work_order_history: Json | null
        }
        Insert: {
          category: string
          created_at?: string | null
          customer: string
          id: string
          install_date: string
          last_maintenance_date: string
          location: string
          maintenance_frequency: string
          maintenance_history?: Json | null
          maintenance_schedules?: Json | null
          manufacturer: string
          model: string
          name: string
          next_maintenance_date: string
          notes?: string | null
          purchase_date: string
          serial_number: string
          status: string
          updated_at?: string | null
          warranty_expiry_date: string
          warranty_status: string
          work_order_history?: Json | null
        }
        Update: {
          category?: string
          created_at?: string | null
          customer?: string
          id?: string
          install_date?: string
          last_maintenance_date?: string
          location?: string
          maintenance_frequency?: string
          maintenance_history?: Json | null
          maintenance_schedules?: Json | null
          manufacturer?: string
          model?: string
          name?: string
          next_maintenance_date?: string
          notes?: string | null
          purchase_date?: string
          serial_number?: string
          status?: string
          updated_at?: string | null
          warranty_expiry_date?: string
          warranty_status?: string
          work_order_history?: Json | null
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          response_status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          response_status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          response_status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reminders: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          is_sent: boolean | null
          reminder_time: unknown
          reminder_type: string
          sent_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_sent?: boolean | null
          reminder_time: unknown
          reminder_type: string
          sent_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_sent?: boolean | null
          reminder_time?: unknown
          reminder_type?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_forms: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          shop_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          shop_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          shop_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_forms_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_questions: {
        Row: {
          created_at: string | null
          display_order: number
          form_id: string | null
          id: string
          is_required: boolean | null
          options: Json | null
          question: string
          question_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order: number
          form_id?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          question: string
          question_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          form_id?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          question?: string
          question_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_questions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "feedback_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_responses: {
        Row: {
          created_at: string | null
          customer_id: string | null
          form_id: string | null
          id: string
          nps_score: number | null
          overall_rating: number | null
          response_data: Json
          submitted_at: string | null
          work_order_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          form_id?: string | null
          id?: string
          nps_score?: number | null
          overall_rating?: number | null
          response_data: Json
          submitted_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          form_id?: string | null
          id?: string
          nps_score?: number | null
          overall_rating?: number | null
          response_data?: Json
          submitted_at?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_responses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "feedback_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_responses_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_reports: {
        Row: {
          end_date: string | null
          file_url: string | null
          fiscal_year: number | null
          generated_at: string | null
          generated_by: string
          id: string
          is_published: boolean | null
          notes: string | null
          published_at: string | null
          report_data: Json
          report_name: string
          report_type: string
          shop_id: string
          start_date: string | null
        }
        Insert: {
          end_date?: string | null
          file_url?: string | null
          fiscal_year?: number | null
          generated_at?: string | null
          generated_by: string
          id?: string
          is_published?: boolean | null
          notes?: string | null
          published_at?: string | null
          report_data?: Json
          report_name: string
          report_type: string
          shop_id: string
          start_date?: string | null
        }
        Update: {
          end_date?: string | null
          file_url?: string | null
          fiscal_year?: number | null
          generated_at?: string | null
          generated_by?: string
          id?: string
          is_published?: boolean | null
          notes?: string | null
          published_at?: string | null
          report_data?: Json
          report_name?: string
          report_type?: string
          shop_id?: string
          start_date?: string | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          category_id: string | null
          created_at: string | null
          created_by: string
          description: string
          grant_id: string | null
          id: string
          is_recurring: boolean | null
          payment_method: string | null
          program_id: string | null
          receipt_url: string | null
          recurring_frequency: string | null
          reference_number: string | null
          shop_id: string
          status: string | null
          transaction_date: string
          transaction_number: string
          transaction_type: string
          updated_at: string | null
          vendor_name: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by: string
          description: string
          grant_id?: string | null
          id?: string
          is_recurring?: boolean | null
          payment_method?: string | null
          program_id?: string | null
          receipt_url?: string | null
          recurring_frequency?: string | null
          reference_number?: string | null
          shop_id: string
          status?: string | null
          transaction_date: string
          transaction_number: string
          transaction_type: string
          updated_at?: string | null
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string
          grant_id?: string | null
          id?: string
          is_recurring?: boolean | null
          payment_method?: string | null
          program_id?: string | null
          receipt_url?: string | null
          recurring_frequency?: string | null
          reference_number?: string | null
          shop_id?: string
          status?: string | null
          transaction_date?: string
          transaction_number?: string
          transaction_type?: string
          updated_at?: string | null
          vendor_name?: string | null
        }
        Relationships: []
      }
      flagged_activities: {
        Row: {
          activity_id: string
          activity_type: string
          flag_reason: string
          flagged_by: string
          flagged_date: string
          id: string
          resolution_notes: string | null
          resolved: boolean
          resolved_by: string | null
          resolved_date: string | null
          technician_id: string
        }
        Insert: {
          activity_id: string
          activity_type: string
          flag_reason: string
          flagged_by: string
          flagged_date?: string
          id?: string
          resolution_notes?: string | null
          resolved?: boolean
          resolved_by?: string | null
          resolved_date?: string | null
          technician_id: string
        }
        Update: {
          activity_id?: string
          activity_type?: string
          flag_reason?: string
          flagged_by?: string
          flagged_date?: string
          id?: string
          resolution_notes?: string | null
          resolved?: boolean
          resolved_by?: string | null
          resolved_date?: string | null
          technician_id?: string
        }
        Relationships: []
      }
      follow_ups: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          customer_id: string
          due_date: string
          id: string
          notes: string | null
          status: string
          type: string
          updated_at: string
          vehicle_id: string | null
          work_order_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          customer_id: string
          due_date: string
          id?: string
          notes?: string | null
          status: string
          type: string
          updated_at?: string
          vehicle_id?: string | null
          work_order_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          customer_id?: string
          due_date?: string
          id?: string
          notes?: string | null
          status?: string
          type?: string
          updated_at?: string
          vehicle_id?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      form_categories: {
        Row: {
          count: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_conditional_rules: {
        Row: {
          condition_field_id: string
          condition_operator: string
          condition_type: string
          condition_value: string
          created_at: string | null
          form_field_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          condition_field_id: string
          condition_operator: string
          condition_type: string
          condition_value: string
          created_at?: string | null
          form_field_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          condition_field_id?: string
          condition_operator?: string
          condition_type?: string
          condition_value?: string
          created_at?: string | null
          form_field_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_conditional_rules_condition_field_id_fkey"
            columns: ["condition_field_id"]
            isOneToOne: false
            referencedRelation: "form_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_conditional_rules_form_field_id_fkey"
            columns: ["form_field_id"]
            isOneToOne: false
            referencedRelation: "form_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      form_drafts: {
        Row: {
          created_at: string | null
          customer_id: string | null
          draft_data: Json
          expires_at: string | null
          id: string
          template_id: string
          updated_at: string | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          draft_data: Json
          expires_at?: string | null
          id?: string
          template_id: string
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          draft_data?: Json
          expires_at?: string | null
          id?: string
          template_id?: string
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_drafts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_field_options: {
        Row: {
          created_at: string | null
          display_order: number
          field_id: string
          id: string
          label: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_order: number
          field_id: string
          id?: string
          label: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          field_id?: string
          id?: string
          label?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_field_options_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "form_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      form_fields: {
        Row: {
          created_at: string | null
          default_value: string | null
          display_order: number
          field_type: Database["public"]["Enums"]["form_field_type"]
          help_text: string | null
          id: string
          is_required: boolean | null
          label: string
          options: Json | null
          placeholder: string | null
          section_id: string
          updated_at: string | null
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string | null
          default_value?: string | null
          display_order: number
          field_type: Database["public"]["Enums"]["form_field_type"]
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          label: string
          options?: Json | null
          placeholder?: string | null
          section_id: string
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string | null
          default_value?: string | null
          display_order?: number
          field_type?: Database["public"]["Enums"]["form_field_type"]
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          label?: string
          options?: Json | null
          placeholder?: string | null
          section_id?: string
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "form_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      form_sections: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number
          id: string
          template_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order: number
          id?: string
          template_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          template_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_sections_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submission_metadata: {
        Row: {
          browser_info: Json | null
          completed_time: number | null
          created_at: string | null
          id: string
          ip_address: string | null
          submission_id: string
        }
        Insert: {
          browser_info?: Json | null
          completed_time?: number | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          submission_id: string
        }
        Update: {
          browser_info?: Json | null
          completed_time?: number | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submission_metadata_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          submitted_by: string | null
          submitted_data: Json
          template_id: string
          vehicle_id: string | null
          work_order_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          submitted_by?: string | null
          submitted_data: Json
          template_id: string
          vehicle_id?: string | null
          work_order_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          submitted_by?: string | null
          submitted_data?: Json
          template_id?: string
          vehicle_id?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_template_permissions: {
        Row: {
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string | null
          id: string
          role_id: string | null
          template_id: string
          updated_at: string | null
        }
        Insert: {
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          role_id?: string | null
          template_id: string
          updated_at?: string | null
        }
        Update: {
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          role_id?: string | null
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_template_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_template_permissions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_template_stats: {
        Row: {
          avg_completion_time: number | null
          completion_rate: number | null
          created_at: string | null
          id: string
          last_used: string | null
          template_id: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          avg_completion_time?: number | null
          completion_rate?: number | null
          created_at?: string | null
          id?: string
          last_used?: string | null
          template_id: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          avg_completion_time?: number | null
          completion_rate?: number | null
          created_at?: string | null
          id?: string
          last_used?: string | null
          template_id?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "form_template_stats_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_template_tags: {
        Row: {
          created_at: string | null
          id: string
          tag: string
          template_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          tag: string
          template_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          tag?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_template_tags_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_template_versions: {
        Row: {
          content: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_current: boolean | null
          template_id: string
          version_number: number
        }
        Insert: {
          content: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_current?: boolean | null
          template_id: string
          version_number: number
        }
        Update: {
          content?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_current?: boolean | null
          template_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "form_template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_published: boolean | null
          name: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      funding_sources: {
        Row: {
          amount_awarded: number | null
          amount_received: number | null
          application_deadline: string | null
          award_date: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          created_by: string
          documents_required: string[] | null
          end_date: string | null
          id: string
          next_report_due: string | null
          notes: string | null
          program_area: string | null
          purpose: string | null
          reporting_deadline: string | null
          reporting_requirements: string | null
          restrictions: string | null
          shop_id: string
          source_name: string
          source_type: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_awarded?: number | null
          amount_received?: number | null
          application_deadline?: string | null
          award_date?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by: string
          documents_required?: string[] | null
          end_date?: string | null
          id?: string
          next_report_due?: string | null
          notes?: string | null
          program_area?: string | null
          purpose?: string | null
          reporting_deadline?: string | null
          reporting_requirements?: string | null
          restrictions?: string | null
          shop_id: string
          source_name: string
          source_type: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_awarded?: number | null
          amount_received?: number | null
          application_deadline?: string | null
          award_date?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string
          documents_required?: string[] | null
          end_date?: string | null
          id?: string
          next_report_due?: string | null
          notes?: string | null
          program_area?: string | null
          purpose?: string | null
          reporting_deadline?: string | null
          reporting_requirements?: string | null
          restrictions?: string | null
          shop_id?: string
          source_name?: string
          source_type?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      governance_policies: {
        Row: {
          acknowledgment_tracking: Json | null
          approval_date: string | null
          approved_by: string | null
          board_resolution_number: string | null
          created_at: string
          created_by: string
          effective_date: string
          id: string
          is_current: boolean | null
          policy_content: string | null
          policy_name: string
          policy_type: string
          requires_annual_acknowledgment: boolean | null
          review_due_date: string | null
          shop_id: string
          updated_at: string
          version_number: string | null
        }
        Insert: {
          acknowledgment_tracking?: Json | null
          approval_date?: string | null
          approved_by?: string | null
          board_resolution_number?: string | null
          created_at?: string
          created_by: string
          effective_date: string
          id?: string
          is_current?: boolean | null
          policy_content?: string | null
          policy_name: string
          policy_type: string
          requires_annual_acknowledgment?: boolean | null
          review_due_date?: string | null
          shop_id: string
          updated_at?: string
          version_number?: string | null
        }
        Update: {
          acknowledgment_tracking?: Json | null
          approval_date?: string | null
          approved_by?: string | null
          board_resolution_number?: string | null
          created_at?: string
          created_by?: string
          effective_date?: string
          id?: string
          is_current?: boolean | null
          policy_content?: string | null
          policy_name?: string
          policy_type?: string
          requires_annual_acknowledgment?: boolean | null
          review_due_date?: string | null
          shop_id?: string
          updated_at?: string
          version_number?: string | null
        }
        Relationships: []
      }
      grant_reports: {
        Row: {
          attachments: Json | null
          created_at: string | null
          due_date: string
          financial_data: Json | null
          grant_id: string | null
          id: string
          report_content: Json | null
          report_type: string
          reporting_period_end: string
          reporting_period_start: string
          reviewer_notes: string | null
          status: string | null
          submitted_by: string | null
          submitted_date: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          due_date: string
          financial_data?: Json | null
          grant_id?: string | null
          id?: string
          report_content?: Json | null
          report_type: string
          reporting_period_end: string
          reporting_period_start: string
          reviewer_notes?: string | null
          status?: string | null
          submitted_by?: string | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          due_date?: string
          financial_data?: Json | null
          grant_id?: string | null
          id?: string
          report_content?: Json | null
          report_type?: string
          reporting_period_end?: string
          reporting_period_start?: string
          reviewer_notes?: string | null
          status?: string | null
          submitted_by?: string | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grant_reports_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
        ]
      }
      grants: {
        Row: {
          amount_awarded: number | null
          amount_requested: number | null
          application_deadline: string | null
          application_documents: Json | null
          application_submitted_date: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string
          decision_date: string | null
          funding_organization: string
          grant_name: string
          grant_type: string
          id: string
          match_amount: number | null
          match_required: boolean | null
          notes: string | null
          program_area: string | null
          project_end_date: string | null
          project_start_date: string | null
          reporting_frequency: string | null
          restrictions: Json | null
          shop_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount_awarded?: number | null
          amount_requested?: number | null
          application_deadline?: string | null
          application_documents?: Json | null
          application_submitted_date?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by: string
          decision_date?: string | null
          funding_organization: string
          grant_name: string
          grant_type: string
          id?: string
          match_amount?: number | null
          match_required?: boolean | null
          notes?: string | null
          program_area?: string | null
          project_end_date?: string | null
          project_start_date?: string | null
          reporting_frequency?: string | null
          restrictions?: Json | null
          shop_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_awarded?: number | null
          amount_requested?: number | null
          application_deadline?: string | null
          application_documents?: Json | null
          application_submitted_date?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string
          decision_date?: string | null
          funding_organization?: string
          grant_name?: string
          grant_type?: string
          id?: string
          match_amount?: number | null
          match_required?: boolean | null
          notes?: string | null
          program_area?: string | null
          project_end_date?: string | null
          project_start_date?: string | null
          reporting_frequency?: string | null
          restrictions?: Json | null
          shop_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      household_members: {
        Row: {
          created_at: string
          customer_id: string | null
          household_id: string | null
          id: string
          relationship_type: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          household_id?: string | null
          id?: string
          relationship_type?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          household_id?: string | null
          id?: string
          relationship_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "household_members_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hybrid_activities: {
        Row: {
          activity_name: string
          activity_type: string
          beneficiaries_count: number | null
          compliance_notes: string | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          expenses_for_profit: number | null
          expenses_non_profit: number | null
          for_profit_percentage: number | null
          id: string
          impact_metrics: Json | null
          non_profit_percentage: number | null
          participants_count: number | null
          revenue_for_profit: number | null
          revenue_non_profit: number | null
          shop_id: string
          start_date: string
          status: string
          updated_at: string
          volunteer_hours: number | null
        }
        Insert: {
          activity_name: string
          activity_type: string
          beneficiaries_count?: number | null
          compliance_notes?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          expenses_for_profit?: number | null
          expenses_non_profit?: number | null
          for_profit_percentage?: number | null
          id?: string
          impact_metrics?: Json | null
          non_profit_percentage?: number | null
          participants_count?: number | null
          revenue_for_profit?: number | null
          revenue_non_profit?: number | null
          shop_id: string
          start_date: string
          status?: string
          updated_at?: string
          volunteer_hours?: number | null
        }
        Update: {
          activity_name?: string
          activity_type?: string
          beneficiaries_count?: number | null
          compliance_notes?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          expenses_for_profit?: number | null
          expenses_non_profit?: number | null
          for_profit_percentage?: number | null
          id?: string
          impact_metrics?: Json | null
          non_profit_percentage?: number | null
          participants_count?: number | null
          revenue_for_profit?: number | null
          revenue_non_profit?: number | null
          shop_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          volunteer_hours?: number | null
        }
        Relationships: []
      }
      impact_measurements: {
        Row: {
          baseline_date: string | null
          baseline_value: number | null
          category: string
          created_at: string
          created_by: string
          current_value: number | null
          data_source: string | null
          id: string
          is_active: boolean | null
          last_measured_date: string | null
          measurement_name: string
          measurement_period: string | null
          measurement_type: string
          next_measurement_date: string | null
          notes: string | null
          related_activity_id: string | null
          shop_id: string
          target_value: number | null
          unit_of_measure: string | null
          updated_at: string
          verification_method: string | null
        }
        Insert: {
          baseline_date?: string | null
          baseline_value?: number | null
          category: string
          created_at?: string
          created_by: string
          current_value?: number | null
          data_source?: string | null
          id?: string
          is_active?: boolean | null
          last_measured_date?: string | null
          measurement_name: string
          measurement_period?: string | null
          measurement_type: string
          next_measurement_date?: string | null
          notes?: string | null
          related_activity_id?: string | null
          shop_id: string
          target_value?: number | null
          unit_of_measure?: string | null
          updated_at?: string
          verification_method?: string | null
        }
        Update: {
          baseline_date?: string | null
          baseline_value?: number | null
          category?: string
          created_at?: string
          created_by?: string
          current_value?: number | null
          data_source?: string | null
          id?: string
          is_active?: boolean | null
          last_measured_date?: string | null
          measurement_name?: string
          measurement_period?: string | null
          measurement_type?: string
          next_measurement_date?: string | null
          notes?: string | null
          related_activity_id?: string | null
          shop_id?: string
          target_value?: number | null
          unit_of_measure?: string | null
          updated_at?: string
          verification_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_measurements_related_activity_id_fkey"
            columns: ["related_activity_id"]
            isOneToOne: false
            referencedRelation: "hybrid_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_metrics: {
        Row: {
          category: string
          collection_method: string | null
          created_at: string | null
          created_by: string
          current_value: number | null
          data_source: string | null
          id: string
          is_active: boolean | null
          measurement_unit: string | null
          metric_name: string
          metric_type: string
          reporting_frequency: string | null
          shop_id: string
          target_value: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          collection_method?: string | null
          created_at?: string | null
          created_by: string
          current_value?: number | null
          data_source?: string | null
          id?: string
          is_active?: boolean | null
          measurement_unit?: string | null
          metric_name: string
          metric_type: string
          reporting_frequency?: string | null
          shop_id: string
          target_value?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          collection_method?: string | null
          created_at?: string | null
          created_by?: string
          current_value?: number | null
          data_source?: string | null
          id?: string
          is_active?: boolean | null
          measurement_unit?: string | null
          metric_name?: string
          metric_type?: string
          reporting_frequency?: string | null
          shop_id?: string
          target_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      impact_records: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          grant_id: string | null
          id: string
          metric_id: string | null
          program_id: string | null
          recorded_date: string
          recorded_value: number
          supporting_data: Json | null
          work_order_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          grant_id?: string | null
          id?: string
          metric_id?: string | null
          program_id?: string | null
          recorded_date: string
          recorded_value: number
          supporting_data?: Json | null
          work_order_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          grant_id?: string | null
          id?: string
          metric_id?: string | null
          program_id?: string | null
          recorded_date?: string
          recorded_value?: number
          supporting_data?: Json | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_records_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_records_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "impact_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_settings: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          integration_type: string
          is_enabled: boolean | null
          shop_id: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          integration_type: string
          is_enabled?: boolean | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          integration_type?: string
          is_enabled?: boolean | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_settings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          barcode: string | null
          category: string | null
          color: string | null
          core_charge: number | null
          cost_per_unit: number | null
          created_at: string | null
          date_bought: string | null
          date_last: string | null
          description: string | null
          dimensions: string | null
          environmental_fee: number | null
          hazmat_fee: number | null
          id: string
          location: string | null
          manufacturer: string | null
          margin_markup: number | null
          material: string | null
          max_stock_level: number | null
          measurement_unit: string | null
          min_stock_level: number | null
          model_year: string | null
          name: string
          notes: string | null
          oem_part_number: string | null
          on_hold: number | null
          on_order: number | null
          part_number: string | null
          quantity: number | null
          reorder_point: number | null
          sell_price_per_unit: number | null
          sku: string
          status: string | null
          subcategory: string | null
          supplier: string | null
          tax_exempt: boolean | null
          tax_rate: number | null
          unit_price: number | null
          universal_part: boolean | null
          updated_at: string | null
          vehicle_compatibility: string | null
          warranty_period: string | null
          weight: number | null
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          color?: string | null
          core_charge?: number | null
          cost_per_unit?: number | null
          created_at?: string | null
          date_bought?: string | null
          date_last?: string | null
          description?: string | null
          dimensions?: string | null
          environmental_fee?: number | null
          hazmat_fee?: number | null
          id?: string
          location?: string | null
          manufacturer?: string | null
          margin_markup?: number | null
          material?: string | null
          max_stock_level?: number | null
          measurement_unit?: string | null
          min_stock_level?: number | null
          model_year?: string | null
          name: string
          notes?: string | null
          oem_part_number?: string | null
          on_hold?: number | null
          on_order?: number | null
          part_number?: string | null
          quantity?: number | null
          reorder_point?: number | null
          sell_price_per_unit?: number | null
          sku: string
          status?: string | null
          subcategory?: string | null
          supplier?: string | null
          tax_exempt?: boolean | null
          tax_rate?: number | null
          unit_price?: number | null
          universal_part?: boolean | null
          updated_at?: string | null
          vehicle_compatibility?: string | null
          warranty_period?: string | null
          weight?: number | null
        }
        Update: {
          barcode?: string | null
          category?: string | null
          color?: string | null
          core_charge?: number | null
          cost_per_unit?: number | null
          created_at?: string | null
          date_bought?: string | null
          date_last?: string | null
          description?: string | null
          dimensions?: string | null
          environmental_fee?: number | null
          hazmat_fee?: number | null
          id?: string
          location?: string | null
          manufacturer?: string | null
          margin_markup?: number | null
          material?: string | null
          max_stock_level?: number | null
          measurement_unit?: string | null
          min_stock_level?: number | null
          model_year?: string | null
          name?: string
          notes?: string | null
          oem_part_number?: string | null
          on_hold?: number | null
          on_order?: number | null
          part_number?: string | null
          quantity?: number | null
          reorder_point?: number | null
          sell_price_per_unit?: number | null
          sku?: string
          status?: string | null
          subcategory?: string | null
          supplier?: string | null
          tax_exempt?: boolean | null
          tax_rate?: number | null
          unit_price?: number | null
          universal_part?: boolean | null
          updated_at?: string | null
          vehicle_compatibility?: string | null
          warranty_period?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      inventory_adjustments: {
        Row: {
          adjusted_by: string | null
          adjustment_type: string
          created_at: string | null
          id: string
          inventory_item_id: string | null
          notes: string | null
          quantity: number
          updated_at: string | null
          work_order_id: string | null
        }
        Insert: {
          adjusted_by?: string | null
          adjustment_type: string
          created_at?: string | null
          id?: string
          inventory_item_id?: string | null
          notes?: string | null
          quantity: number
          updated_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          adjusted_by?: string | null
          adjustment_type?: string
          created_at?: string | null
          id?: string
          inventory_item_id?: string | null
          notes?: string | null
          quantity?: number
          updated_at?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_adjustments_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_adjustments_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_auto_reorder: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          item_id: string | null
          quantity: number
          threshold: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          item_id?: string | null
          quantity?: number
          threshold?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          item_id?: string | null
          quantity?: number
          threshold?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_auto_reorder_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          location: string | null
          name: string
          quantity: number
          reorder_point: number
          shop_id: string | null
          sku: string
          status: string
          supplier: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          quantity?: number
          reorder_point?: number
          shop_id?: string | null
          sku: string
          status?: string
          supplier: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          quantity?: number
          reorder_point?: number
          shop_id?: string | null
          sku?: string
          status?: string
          supplier?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_locations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_orders: {
        Row: {
          created_at: string
          expected_arrival: string
          id: string
          item_id: string | null
          notes: string | null
          order_date: string
          quantity_ordered: number
          quantity_received: number
          status: string
          supplier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expected_arrival: string
          id?: string
          item_id?: string | null
          notes?: string | null
          order_date?: string
          quantity_ordered: number
          quantity_received?: number
          status?: string
          supplier: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expected_arrival?: string
          id?: string
          item_id?: string | null
          notes?: string | null
          order_date?: string
          quantity_ordered?: number
          quantity_received?: number
          status?: string
          supplier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_orders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_purchase_order_items: {
        Row: {
          created_at: string
          id: string
          inventory_item_id: string
          purchase_order_id: string
          quantity: number
          quantity_received: number | null
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_item_id: string
          purchase_order_id: string
          quantity: number
          quantity_received?: number | null
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inventory_item_id?: string
          purchase_order_id?: string
          quantity?: number
          quantity_received?: number | null
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_purchase_order_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "inventory_purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          received_date: string | null
          status: string
          total_amount: number | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          received_date?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          received_date?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "inventory_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_settings: {
        Row: {
          auto_reorder_enabled: boolean | null
          created_at: string | null
          default_supplier_id: string | null
          id: string
          low_stock_threshold: number | null
          shop_id: string
          updated_at: string | null
        }
        Insert: {
          auto_reorder_enabled?: boolean | null
          created_at?: string | null
          default_supplier_id?: string | null
          id?: string
          low_stock_threshold?: number | null
          shop_id: string
          updated_at?: string | null
        }
        Update: {
          auto_reorder_enabled?: boolean | null
          created_at?: string | null
          default_supplier_id?: string | null
          id?: string
          low_stock_threshold?: number | null
          shop_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_settings_default_supplier_id_fkey"
            columns: ["default_supplier_id"]
            isOneToOne: false
            referencedRelation: "inventory_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_settings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: true
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_suppliers: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          lead_time_days: number | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          region: string | null
          type: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          lead_time_days?: number | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          region?: string | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          lead_time_days?: number | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          region?: string | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      inventory_transactions: {
        Row: {
          created_at: string
          id: string
          inventory_item_id: string
          notes: string | null
          performed_by: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
          transaction_date: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_item_id: string
          notes?: string | null
          performed_by?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_date?: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inventory_item_id?: string
          notes?: string | null
          performed_by?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_vendors: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          lead_time_days: number | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          lead_time_days?: number | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          lead_time_days?: number | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string | null
          hours: boolean | null
          id: string
          invoice_id: string
          name: string
          price: number
          quantity: number
          total: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          hours?: boolean | null
          id?: string
          invoice_id: string
          name: string
          price: number
          quantity: number
          total: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          hours?: boolean | null
          id?: string
          invoice_id?: string
          name?: string
          price?: number
          quantity?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_staff: {
        Row: {
          created_at: string | null
          id: string
          invoice_id: string
          staff_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invoice_id: string
          staff_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invoice_id?: string
          staff_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_staff_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_template_items: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          hours: boolean | null
          id: string
          name: string
          price: number
          quantity: number | null
          sku: string | null
          template_id: string | null
          total: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          hours?: boolean | null
          id?: string
          name: string
          price: number
          quantity?: number | null
          sku?: string | null
          template_id?: string | null
          total?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          hours?: boolean | null
          id?: string
          name?: string
          price?: number
          quantity?: number | null
          sku?: string | null
          template_id?: string | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "invoice_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_templates: {
        Row: {
          created_at: string | null
          default_due_date_days: number | null
          default_notes: string | null
          default_tax_rate: number | null
          description: string | null
          id: string
          last_used: string | null
          name: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          default_due_date_days?: number | null
          default_notes?: string | null
          default_tax_rate?: number | null
          description?: string | null
          id?: string
          last_used?: string | null
          name: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          default_due_date_days?: number | null
          default_notes?: string | null
          default_tax_rate?: number | null
          description?: string | null
          id?: string
          last_used?: string | null
          name?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer: string
          customer_address: string | null
          customer_email: string | null
          customer_id: string | null
          date: string
          description: string | null
          due_date: string
          id: string
          last_updated_at: string | null
          last_updated_by: string | null
          notes: string | null
          payment_method: string | null
          status: string
          subtotal: number | null
          tax: number | null
          total: number | null
          work_order_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer: string
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          date: string
          description?: string | null
          due_date: string
          id: string
          last_updated_at?: string | null
          last_updated_by?: string | null
          notes?: string | null
          payment_method?: string | null
          status: string
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          work_order_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          date?: string
          description?: string | null
          due_date?: string
          id?: string
          last_updated_at?: string | null
          last_updated_by?: string | null
          notes?: string | null
          payment_method?: string | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      job_line_discounts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string
          discount_amount: number
          discount_name: string
          discount_type: string
          discount_type_id: string | null
          discount_value: number
          id: string
          job_line_id: string
          reason: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by: string
          discount_amount: number
          discount_name: string
          discount_type: string
          discount_type_id?: string | null
          discount_value: number
          id?: string
          job_line_id: string
          reason?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string
          discount_amount?: number
          discount_name?: string
          discount_type?: string
          discount_type_id?: string | null
          discount_value?: number
          id?: string
          job_line_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_line_discounts_discount_type_id_fkey"
            columns: ["discount_type_id"]
            isOneToOne: false
            referencedRelation: "discount_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_line_discounts_job_line_id_fkey"
            columns: ["job_line_id"]
            isOneToOne: false
            referencedRelation: "work_order_job_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_rates: {
        Row: {
          created_at: string
          diagnostic_rate: number
          diy_rate: number
          emergency_rate: number
          id: string
          internal_rate: number
          shop_id: string
          standard_rate: number
          updated_at: string
          warranty_rate: number
        }
        Insert: {
          created_at?: string
          diagnostic_rate?: number
          diy_rate?: number
          emergency_rate?: number
          id?: string
          internal_rate?: number
          shop_id: string
          standard_rate?: number
          updated_at?: string
          warranty_rate?: number
        }
        Update: {
          created_at?: string
          diagnostic_rate?: number
          diy_rate?: number
          emergency_rate?: number
          id?: string
          internal_rate?: number
          shop_id?: string
          standard_rate?: number
          updated_at?: string
          warranty_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "labor_rates_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_redemptions: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          notes: string | null
          points_used: number
          reward_id: string | null
          status: string | null
          updated_at: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          points_used: number
          reward_id?: string | null
          status?: string | null
          updated_at?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          points_used?: number
          reward_id?: string | null
          status?: string | null
          updated_at?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_redemptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "loyalty_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_rewards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          points_cost: number
          reward_type: string
          reward_value: number | null
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_cost: number
          reward_type: string
          reward_value?: number | null
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_cost?: number
          reward_type?: string
          reward_value?: number | null
          shop_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_rewards_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean | null
          points_expiration_days: number | null
          points_per_dollar: number | null
          shop_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          points_expiration_days?: number | null
          points_per_dollar?: number | null
          shop_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          points_expiration_days?: number | null
          points_per_dollar?: number | null
          shop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_settings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: true
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_tiers: {
        Row: {
          benefits: string | null
          color: string | null
          created_at: string
          id: string
          multiplier: number | null
          name: string
          settings_id: string | null
          shop_id: string
          threshold: number
          updated_at: string
        }
        Insert: {
          benefits?: string | null
          color?: string | null
          created_at?: string
          id?: string
          multiplier?: number | null
          name: string
          settings_id?: string | null
          shop_id: string
          threshold: number
          updated_at?: string
        }
        Update: {
          benefits?: string | null
          color?: string | null
          created_at?: string
          id?: string
          multiplier?: number | null
          name?: string
          settings_id?: string | null
          shop_id?: string
          threshold?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_tiers_settings_id_fkey"
            columns: ["settings_id"]
            isOneToOne: false
            referencedRelation: "loyalty_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_tiers_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          customer_id: string | null
          description: string | null
          id: string
          points: number
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          description?: string | null
          id?: string
          points: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          description?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturers: {
        Row: {
          category: string
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_assets: {
        Row: {
          asset_type: string
          content: string | null
          created_at: string
          created_by: string | null
          description: string | null
          file_path: string | null
          id: string
          metadata: Json | null
          name: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          asset_type: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_path?: string | null
          id?: string
          metadata?: Json | null
          name: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          asset_type?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_path?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      marketing_automation_executions: {
        Row: {
          customer_id: string | null
          executed_at: string
          execution_details: Json | null
          execution_status: string
          id: string
          rule_id: string
          triggered_by: string | null
        }
        Insert: {
          customer_id?: string | null
          executed_at?: string
          execution_details?: Json | null
          execution_status?: string
          id?: string
          rule_id: string
          triggered_by?: string | null
        }
        Update: {
          customer_id?: string | null
          executed_at?: string
          execution_details?: Json | null
          execution_status?: string
          id?: string
          rule_id?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_automation_executions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_automation_executions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "marketing_automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_automation_rules: {
        Row: {
          action_details: Json
          action_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          trigger_criteria: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          action_details: Json
          action_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          trigger_criteria: Json
          trigger_type: string
          updated_at?: string
        }
        Update: {
          action_details?: Json
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          trigger_criteria?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_segment_members: {
        Row: {
          added_at: string
          customer_id: string
          id: string
          score: number | null
          segment_id: string
        }
        Insert: {
          added_at?: string
          customer_id: string
          id?: string
          score?: number | null
          segment_id: string
        }
        Update: {
          added_at?: string
          customer_id?: string
          id?: string
          score?: number | null
          segment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_segment_members_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_segment_members_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "marketing_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_segments: {
        Row: {
          created_at: string
          criteria: Json
          description: string | null
          id: string
          is_dynamic: boolean
          last_calculated_at: string | null
          name: string
          segment_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          is_dynamic?: boolean
          last_calculated_at?: string | null
          name: string
          segment_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          is_dynamic?: boolean
          last_calculated_at?: string | null
          name?: string
          segment_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          committee_memberships: string[] | null
          created_at: string
          customer_id: string | null
          dues_amount: number | null
          dues_frequency: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          expiry_date: string | null
          id: string
          join_date: string
          membership_benefits: Json | null
          membership_level: string | null
          membership_number: string | null
          membership_type: string
          renewal_date: string | null
          skills_offered: string[] | null
          status: string
          updated_at: string
          volunteer_interests: string[] | null
          voting_rights: boolean | null
        }
        Insert: {
          committee_memberships?: string[] | null
          created_at?: string
          customer_id?: string | null
          dues_amount?: number | null
          dues_frequency?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          expiry_date?: string | null
          id?: string
          join_date?: string
          membership_benefits?: Json | null
          membership_level?: string | null
          membership_number?: string | null
          membership_type: string
          renewal_date?: string | null
          skills_offered?: string[] | null
          status?: string
          updated_at?: string
          volunteer_interests?: string[] | null
          voting_rights?: boolean | null
        }
        Update: {
          committee_memberships?: string[] | null
          created_at?: string
          customer_id?: string | null
          dues_amount?: number | null
          dues_frequency?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          expiry_date?: string | null
          id?: string
          join_date?: string
          membership_benefits?: Json | null
          membership_level?: string | null
          membership_number?: string | null
          membership_type?: string
          renewal_date?: string | null
          skills_offered?: string[] | null
          status?: string
          updated_at?: string
          volunteer_interests?: string[] | null
          voting_rights?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "members_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      nonprofit_donations: {
        Row: {
          acknowledgment_date: string | null
          acknowledgment_sent: boolean | null
          amount: number | null
          created_at: string | null
          created_by: string
          description: string
          donation_date: string
          donation_type: string
          donor_id: string | null
          id: string
          notes: string | null
          program_id: string | null
          receipt_issued: boolean | null
          receipt_issued_date: string | null
          receipt_number: string | null
          received_date: string | null
          shop_id: string
          tax_receipt_value: number | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          acknowledgment_date?: string | null
          acknowledgment_sent?: boolean | null
          amount?: number | null
          created_at?: string | null
          created_by: string
          description: string
          donation_date: string
          donation_type: string
          donor_id?: string | null
          id?: string
          notes?: string | null
          program_id?: string | null
          receipt_issued?: boolean | null
          receipt_issued_date?: string | null
          receipt_number?: string | null
          received_date?: string | null
          shop_id: string
          tax_receipt_value?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          acknowledgment_date?: string | null
          acknowledgment_sent?: boolean | null
          amount?: number | null
          created_at?: string | null
          created_by?: string
          description?: string
          donation_date?: string
          donation_type?: string
          donor_id?: string | null
          id?: string
          notes?: string | null
          program_id?: string | null
          receipt_issued?: boolean | null
          receipt_issued_date?: string | null
          receipt_number?: string | null
          received_date?: string | null
          shop_id?: string
          tax_receipt_value?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nonprofit_donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "nonprofit_donors"
            referencedColumns: ["id"]
          },
        ]
      }
      nonprofit_donors: {
        Row: {
          address: Json | null
          communication_preferences: Json | null
          contact_person: string | null
          created_at: string | null
          created_by: string
          donation_frequency: string | null
          donor_type: string
          email: string | null
          first_donation_date: string | null
          id: string
          is_active: boolean | null
          last_donation_date: string | null
          name: string
          notes: string | null
          phone: string | null
          preferred_contact_method: string | null
          shop_id: string
          tax_receipt_required: boolean | null
          total_donated: number | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          communication_preferences?: Json | null
          contact_person?: string | null
          created_at?: string | null
          created_by: string
          donation_frequency?: string | null
          donor_type: string
          email?: string | null
          first_donation_date?: string | null
          id?: string
          is_active?: boolean | null
          last_donation_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          shop_id: string
          tax_receipt_required?: boolean | null
          total_donated?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          communication_preferences?: Json | null
          contact_person?: string | null
          created_at?: string | null
          created_by?: string
          donation_frequency?: string | null
          donor_type?: string
          email?: string | null
          first_donation_date?: string | null
          id?: string
          is_active?: boolean | null
          last_donation_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          shop_id?: string
          tax_receipt_required?: boolean | null
          total_donated?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      nonprofit_report_templates: {
        Row: {
          auto_generate: boolean | null
          created_at: string
          created_by: string
          description: string | null
          due_date_calculation: string | null
          filing_authority: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          regulatory_requirement: boolean | null
          required_fields: string[] | null
          shop_id: string
          template_content: Json
          template_name: string
          template_type: string
          updated_at: string
        }
        Insert: {
          auto_generate?: boolean | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date_calculation?: string | null
          filing_authority?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          regulatory_requirement?: boolean | null
          required_fields?: string[] | null
          shop_id: string
          template_content?: Json
          template_name: string
          template_type: string
          updated_at?: string
        }
        Update: {
          auto_generate?: boolean | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date_calculation?: string | null
          filing_authority?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          regulatory_requirement?: boolean | null
          required_fields?: string[] | null
          shop_id?: string
          template_content?: Json
          template_name?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          email_enabled: boolean | null
          id: string
          preferences: Json | null
          push_enabled: boolean | null
          sms_enabled: boolean | null
          user_id: string
        }
        Insert: {
          email_enabled?: boolean | null
          id?: string
          preferences?: Json | null
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          user_id: string
        }
        Update: {
          email_enabled?: boolean | null
          id?: string
          preferences?: Json | null
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          profile_id: string
          push_enabled: boolean | null
          subscriptions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          profile_id: string
          push_enabled?: boolean | null
          subscriptions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          profile_id?: string
          push_enabled?: boolean | null
          subscriptions?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          content: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          subject: string | null
          trigger_event: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          subject?: string | null
          trigger_event: string
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          subject?: string | null
          trigger_event?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          category: string | null
          expires_at: string | null
          id: string
          link: string | null
          message: string
          priority: string | null
          read: boolean
          recipient: string | null
          sender: string | null
          timestamp: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          category?: string | null
          expires_at?: string | null
          id?: string
          link?: string | null
          message: string
          priority?: string | null
          read?: boolean
          recipient?: string | null
          sender?: string | null
          timestamp?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          category?: string | null
          expires_at?: string | null
          id?: string
          link?: string | null
          message?: string
          priority?: string | null
          read?: boolean
          recipient?: string | null
          sender?: string | null
          timestamp?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          completed_steps: number[] | null
          created_at: string | null
          current_step: number | null
          id: string
          is_completed: boolean | null
          shop_id: string
          step_data: Json
          updated_at: string | null
        }
        Insert: {
          completed_steps?: number[] | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          is_completed?: boolean | null
          shop_id: string
          step_data?: Json
          updated_at?: string | null
        }
        Update: {
          completed_steps?: number[] | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          is_completed?: boolean | null
          shop_id?: string
          step_data?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: true
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          payment_intent_id: string | null
          payment_status: string
          shipping_address_id: string | null
          shipping_cost: number | null
          shipping_method: string | null
          status: string
          tax_amount: number | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_intent_id?: string | null
          payment_status?: string
          shipping_address_id?: string | null
          shipping_cost?: number | null
          shipping_method?: string | null
          status?: string
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_intent_id?: string | null
          payment_status?: string
          shipping_address_id?: string | null
          shipping_cost?: number | null
          shipping_method?: string | null
          status?: string
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_visibility: {
        Row: {
          created_at: string
          display_in_directory: boolean
          id: string
          is_public: boolean
          location_searchable: boolean
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_in_directory?: boolean
          id?: string
          is_public?: boolean
          location_searchable?: boolean
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_in_directory?: boolean
          id?: string
          is_public?: boolean
          location_searchable?: boolean
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_visibility_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      part_discounts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string
          discount_amount: number
          discount_name: string
          discount_type: string
          discount_type_id: string | null
          discount_value: number
          id: string
          part_id: string
          reason: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by: string
          discount_amount: number
          discount_name: string
          discount_type: string
          discount_type_id?: string | null
          discount_value: number
          id?: string
          part_id: string
          reason?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string
          discount_amount?: number
          discount_name?: string
          discount_type?: string
          discount_type_id?: string | null
          discount_value?: number
          id?: string
          part_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "part_discounts_discount_type_id_fkey"
            columns: ["discount_type_id"]
            isOneToOne: false
            referencedRelation: "discount_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "part_discounts_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "work_order_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      parts_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      parts_inventory: {
        Row: {
          category: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          id: string
          location: string | null
          min_quantity: number | null
          name: string
          part_number: string
          quantity: number
          retail_price: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          min_quantity?: number | null
          name: string
          part_number: string
          quantity?: number
          retail_price?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          min_quantity?: number | null
          name?: string
          part_number?: string
          quantity?: number
          retail_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          billing_address: string | null
          billing_city: string | null
          billing_country: string | null
          billing_name: string | null
          billing_postal_code: string | null
          billing_state: string | null
          card_brand: string | null
          card_last_four: string | null
          created_at: string | null
          customer_id: string
          expiry_month: number | null
          expiry_year: number | null
          id: string
          is_default: boolean | null
          method_type: string
          token_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_name?: string | null
          billing_postal_code?: string | null
          billing_state?: string | null
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string | null
          customer_id: string
          expiry_month?: number | null
          expiry_year?: number | null
          id?: string
          is_default?: boolean | null
          method_type: string
          token_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_name?: string | null
          billing_postal_code?: string | null
          billing_state?: string | null
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string | null
          customer_id?: string
          expiry_month?: number | null
          expiry_year?: number | null
          id?: string
          is_default?: boolean | null
          method_type?: string
          token_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods_options: {
        Row: {
          created_at: string | null
          id: string
          label: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          customer_id: string
          id: string
          invoice_id: string | null
          notes: string | null
          payment_method_id: string | null
          payment_type: string
          status: string
          transaction_date: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_id: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_method_id?: string | null
          payment_type: string
          status: string
          transaction_date?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_id?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_method_id?: string | null
          payment_type?: string
          status?: string
          transaction_date?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: Database["public"]["Enums"]["permission_type"]
          created_at: string
          description: string | null
          id: string
          name: string
          resource: Database["public"]["Enums"]["resource_type"]
        }
        Insert: {
          action: Database["public"]["Enums"]["permission_type"]
          created_at?: string
          description?: string | null
          id?: string
          name: string
          resource: Database["public"]["Enums"]["resource_type"]
        }
        Update: {
          action?: Database["public"]["Enums"]["permission_type"]
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          resource?: Database["public"]["Enums"]["resource_type"]
        }
        Relationships: []
      }
      portal_settings: {
        Row: {
          application_forms_enabled: boolean | null
          contact_info: Json | null
          created_at: string | null
          custom_sections: Json | null
          description: string | null
          gallery_enabled: boolean | null
          hero_image_url: string | null
          id: string
          is_public: boolean | null
          logo_url: string | null
          organization_name: string
          raffle_section_enabled: boolean | null
          seo_settings: Json | null
          shop_id: string
          social_media: Json | null
          success_stories_enabled: boolean | null
          tagline: string | null
          updated_at: string | null
        }
        Insert: {
          application_forms_enabled?: boolean | null
          contact_info?: Json | null
          created_at?: string | null
          custom_sections?: Json | null
          description?: string | null
          gallery_enabled?: boolean | null
          hero_image_url?: string | null
          id?: string
          is_public?: boolean | null
          logo_url?: string | null
          organization_name: string
          raffle_section_enabled?: boolean | null
          seo_settings?: Json | null
          shop_id: string
          social_media?: Json | null
          success_stories_enabled?: boolean | null
          tagline?: string | null
          updated_at?: string | null
        }
        Update: {
          application_forms_enabled?: boolean | null
          contact_info?: Json | null
          created_at?: string | null
          custom_sections?: Json | null
          description?: string | null
          gallery_enabled?: boolean | null
          hero_image_url?: string | null
          id?: string
          is_public?: boolean | null
          logo_url?: string | null
          organization_name?: string
          raffle_section_enabled?: boolean | null
          seo_settings?: Json | null
          shop_id?: string
          social_media?: Json | null
          success_stories_enabled?: boolean | null
          tagline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      preferred_technician_history: {
        Row: {
          change_date: string
          change_reason: string | null
          changed_by_id: string
          changed_by_name: string
          customer_id: string
          id: string
          new_technician_id: string
          new_technician_name: string
          previous_technician_id: string | null
          previous_technician_name: string | null
        }
        Insert: {
          change_date?: string
          change_reason?: string | null
          changed_by_id: string
          changed_by_name: string
          customer_id: string
          id?: string
          new_technician_id: string
          new_technician_name: string
          previous_technician_id?: string | null
          previous_technician_name?: string | null
        }
        Update: {
          change_date?: string
          change_reason?: string | null
          changed_by_id?: string
          changed_by_name?: string
          customer_id?: string
          id?: string
          new_technician_id?: string
          new_technician_name?: string
          previous_technician_id?: string | null
          previous_technician_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preferred_technician_history_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_analytics: {
        Row: {
          additional_data: Json | null
          category: string
          created_at: string
          id: string
          interaction_type: string
          product_id: string
          product_name: string
          user_id: string | null
        }
        Insert: {
          additional_data?: Json | null
          category: string
          created_at?: string
          id?: string
          interaction_type: string
          product_id: string
          product_name: string
          user_id?: string | null
        }
        Update: {
          additional_data?: Json | null
          category?: string
          created_at?: string
          id?: string
          interaction_type?: string
          product_id?: string
          product_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_inventory: {
        Row: {
          created_at: string
          id: string
          last_restock_date: string | null
          low_stock_threshold: number
          product_id: string
          quantity_in_stock: number
          restock_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_restock_date?: string | null
          low_stock_threshold?: number
          product_id: string
          quantity_in_stock?: number
          restock_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_restock_date?: string | null
          low_stock_threshold?: number
          product_id?: string
          quantity_in_stock?: number
          restock_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "product_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          created_at: string
          helpful_votes: number
          id: string
          is_approved: boolean
          is_verified_purchase: boolean
          product_id: string
          rating: number
          review_text: string | null
          review_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          helpful_votes?: number
          id?: string
          is_approved?: boolean
          is_verified_purchase?: boolean
          product_id: string
          rating: number
          review_text?: string | null
          review_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          helpful_votes?: number
          id?: string
          is_approved?: boolean
          is_verified_purchase?: boolean
          product_id?: string
          rating?: number
          review_text?: string | null
          review_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_submissions: {
        Row: {
          id: string
          notes: string | null
          product_name: string
          product_url: string
          status: string | null
          submitted_at: string
          suggested_by: string | null
          suggested_category: string
        }
        Insert: {
          id?: string
          notes?: string | null
          product_name: string
          product_url: string
          status?: string | null
          submitted_at?: string
          suggested_by?: string | null
          suggested_category: string
        }
        Update: {
          id?: string
          notes?: string | null
          product_name?: string
          product_url?: string
          status?: string | null
          submitted_at?: string
          suggested_by?: string | null
          suggested_category?: string
        }
        Relationships: []
      }
      product_view_history: {
        Row: {
          id: string
          product_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_view_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_view_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          affiliate_link: string | null
          average_rating: number | null
          category_id: string
          created_at: string
          description: string | null
          dimensions: Json | null
          id: string
          image_url: string | null
          is_approved: boolean | null
          is_available: boolean | null
          is_bestseller: boolean | null
          is_featured: boolean | null
          price: number | null
          product_type: Database["public"]["Enums"]["product_type"]
          review_count: number | null
          sale_end_date: string | null
          sale_price: number | null
          sale_start_date: string | null
          sku: string | null
          stock_quantity: number | null
          suggested_by: string | null
          suggestion_reason: string | null
          title: string
          tracking_params: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          affiliate_link?: string | null
          average_rating?: number | null
          category_id: string
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_available?: boolean | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          price?: number | null
          product_type?: Database["public"]["Enums"]["product_type"]
          review_count?: number | null
          sale_end_date?: string | null
          sale_price?: number | null
          sale_start_date?: string | null
          sku?: string | null
          stock_quantity?: number | null
          suggested_by?: string | null
          suggestion_reason?: string | null
          title: string
          tracking_params?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          affiliate_link?: string | null
          average_rating?: number | null
          category_id?: string
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_available?: boolean | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          price?: number | null
          product_type?: Database["public"]["Enums"]["product_type"]
          review_count?: number | null
          sale_end_date?: string | null
          sale_price?: number | null
          sale_start_date?: string | null
          sku?: string | null
          stock_quantity?: number | null
          suggested_by?: string | null
          suggestion_reason?: string | null
          title?: string
          tracking_params?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_metadata: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_metadata_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          department_id: string | null
          email: string
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          notification_preferences: Json | null
          phone: string | null
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          department_id?: string | null
          email: string
          first_name?: string | null
          id: string
          job_title?: string | null
          last_name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          department_id?: string | null
          email?: string
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          shop_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      public_applications: {
        Row: {
          applicant_address: Json | null
          applicant_email: string
          applicant_name: string
          applicant_phone: string | null
          application_data: Json
          application_type: string
          assigned_to: string | null
          created_at: string | null
          id: string
          priority_level: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          shop_id: string
          status: string | null
          supporting_documents: Json | null
          updated_at: string | null
        }
        Insert: {
          applicant_address?: Json | null
          applicant_email: string
          applicant_name: string
          applicant_phone?: string | null
          application_data?: Json
          application_type: string
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          priority_level?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          shop_id: string
          status?: string | null
          supporting_documents?: Json | null
          updated_at?: string | null
        }
        Update: {
          applicant_address?: Json | null
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string | null
          application_data?: Json
          application_type?: string
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          priority_level?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          shop_id?: string
          status?: string | null
          supporting_documents?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          item_type: string
          name: string
          quantity: number
          quote_id: string
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          item_type?: string
          name: string
          quantity?: number
          quote_id: string
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          item_type?: string
          name?: string
          quantity?: number
          quote_id?: string
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          approved_at: string | null
          converted_at: string | null
          converted_to_work_order_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          expiry_date: string | null
          id: string
          notes: string | null
          quote_number: string | null
          rejected_at: string | null
          sent_at: string | null
          status: string
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          terms_conditions: string | null
          total_amount: number | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          approved_at?: string | null
          converted_at?: string | null
          converted_to_work_order_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          expiry_date?: string | null
          id?: string
          notes?: string | null
          quote_number?: string | null
          rejected_at?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          terms_conditions?: string | null
          total_amount?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          approved_at?: string | null
          converted_at?: string | null
          converted_to_work_order_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          expiry_date?: string | null
          id?: string
          notes?: string | null
          quote_number?: string | null
          rejected_at?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          terms_conditions?: string | null
          total_amount?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_converted_to_work_order_id_fkey"
            columns: ["converted_to_work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      raffle_tickets: {
        Row: {
          amount_paid: number
          created_at: string | null
          id: string
          is_winner: boolean | null
          payment_method: string | null
          payment_reference: string | null
          purchase_date: string | null
          purchaser_email: string
          purchaser_name: string
          purchaser_phone: string | null
          raffle_id: string | null
          ticket_number: string
        }
        Insert: {
          amount_paid: number
          created_at?: string | null
          id?: string
          is_winner?: boolean | null
          payment_method?: string | null
          payment_reference?: string | null
          purchase_date?: string | null
          purchaser_email: string
          purchaser_name: string
          purchaser_phone?: string | null
          raffle_id?: string | null
          ticket_number: string
        }
        Update: {
          amount_paid?: number
          created_at?: string | null
          id?: string
          is_winner?: boolean | null
          payment_method?: string | null
          payment_reference?: string | null
          purchase_date?: string | null
          purchaser_email?: string
          purchaser_name?: string
          purchaser_phone?: string | null
          raffle_id?: string | null
          ticket_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "raffle_tickets_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
        ]
      }
      raffles: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          draw_date: string | null
          end_date: string
          id: string
          images: Json | null
          max_tickets: number | null
          shop_id: string
          start_date: string
          status: string | null
          terms_conditions: string | null
          ticket_price: number
          tickets_sold: number | null
          title: string
          updated_at: string | null
          vehicle_id: string | null
          winner_contact_info: Json | null
          winner_ticket_number: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          draw_date?: string | null
          end_date: string
          id?: string
          images?: Json | null
          max_tickets?: number | null
          shop_id: string
          start_date: string
          status?: string | null
          terms_conditions?: string | null
          ticket_price?: number
          tickets_sold?: number | null
          title: string
          updated_at?: string | null
          vehicle_id?: string | null
          winner_contact_info?: Json | null
          winner_ticket_number?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          draw_date?: string | null
          end_date?: string
          id?: string
          images?: Json | null
          max_tickets?: number | null
          shop_id?: string
          start_date?: string
          status?: string | null
          terms_conditions?: string | null
          ticket_price?: number
          tickets_sold?: number | null
          title?: string
          updated_at?: string | null
          vehicle_id?: string | null
          winner_contact_info?: Json | null
          winner_ticket_number?: string | null
        }
        Relationships: []
      }
      recurring_events: {
        Row: {
          base_event_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          recurrence_exception_dates: string[] | null
          recurrence_rule: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          base_event_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          recurrence_exception_dates?: string[] | null
          recurrence_rule: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          base_event_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          recurrence_exception_dates?: string[] | null
          recurrence_rule?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_events_base_event_id_fkey"
            columns: ["base_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_sources: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      referral_transactions: {
        Row: {
          created_at: string
          id: string
          points_awarded: number
          referral_id: string
          referred_id: string
          referrer_id: string
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_awarded?: number
          referral_id: string
          referred_id: string
          referrer_id: string
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          created_at?: string
          id?: string
          points_awarded?: number
          referral_id?: string
          referred_id?: string
          referrer_id?: string
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_transactions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "customer_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_transactions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "customer_referrals_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_transactions_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_transactions_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_types: {
        Row: {
          created_at: string | null
          id: string
          label: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reminder_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      reminder_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      reminder_templates: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string
          default_days_until_due: number | null
          description: string | null
          id: string
          is_recurring: boolean | null
          notification_days_before: number | null
          priority: string | null
          recurrence_interval: number | null
          recurrence_unit: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by: string
          default_days_until_due?: number | null
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          notification_days_before?: number | null
          priority?: string | null
          recurrence_interval?: number | null
          recurrence_unit?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string
          default_days_until_due?: number | null
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          notification_days_before?: number | null
          priority?: string | null
          recurrence_interval?: number | null
          recurrence_unit?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "reminder_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      role_audit_log: {
        Row: {
          action: Database["public"]["Enums"]["role_action_type"]
          changed_by: string | null
          created_at: string | null
          id: string
          profile_id: string | null
          role_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["role_action_type"]
          changed_by?: string | null
          created_at?: string | null
          id?: string
          profile_id?: string | null
          role_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["role_action_type"]
          changed_by?: string | null
          created_at?: string | null
          id?: string
          profile_id?: string | null
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_audit_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_audit_log_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_custom: boolean | null
          is_default: boolean | null
          name: Database["public"]["Enums"]["app_role"]
          permissions: Json | null
          priority: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_custom?: boolean | null
          is_default?: boolean | null
          name: Database["public"]["Enums"]["app_role"]
          permissions?: Json | null
          priority?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_custom?: boolean | null
          is_default?: boolean | null
          name?: Database["public"]["Enums"]["app_role"]
          permissions?: Json | null
          priority?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          created_at: string | null
          id: string
          ip_whitelist: string[] | null
          mfa_enabled: boolean | null
          password_policy: Json | null
          session_timeout_minutes: number | null
          shop_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_whitelist?: string[] | null
          mfa_enabled?: boolean | null
          password_policy?: Json | null
          session_timeout_minutes?: number | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_whitelist?: string[] | null
          mfa_enabled?: boolean | null
          password_policy?: Json | null
          session_timeout_minutes?: number | null
          shop_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_settings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: true
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      segment_rules: {
        Row: {
          created_at: string
          id: string
          rule_operator: string
          rule_type: string
          rule_value: string
          segment_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          rule_operator: string
          rule_type: string
          rule_value: string
          segment_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          rule_operator?: string
          rule_type?: string
          rule_value?: string
          segment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "segment_rules_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "customer_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          position: number | null
          sector_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          position?: number | null
          sector_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          position?: number | null
          sector_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "service_sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      service_hierarchy: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          position: number | null
          subcategories: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          position?: number | null
          subcategories?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          position?: number | null
          subcategories?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_jobs: {
        Row: {
          created_at: string | null
          description: string | null
          estimated_time: number | null
          id: string
          name: string
          position: number | null
          price: number | null
          subcategory_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          estimated_time?: number | null
          id?: string
          name: string
          position?: number | null
          price?: number | null
          subcategory_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          estimated_time?: number | null
          id?: string
          name?: string
          position?: number | null
          price?: number | null
          subcategory_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_jobs_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "service_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reminder_tags: {
        Row: {
          created_at: string
          reminder_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          reminder_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          reminder_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_reminder_tags_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "service_reminders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reminder_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "reminder_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reminders: {
        Row: {
          assigned_to: string | null
          category_id: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string
          customer_id: string
          description: string
          due_date: string
          id: string
          is_recurring: boolean | null
          last_occurred_at: string | null
          next_occurrence_date: string | null
          notes: string | null
          notification_date: string | null
          notification_sent: boolean
          parent_reminder_id: string | null
          priority: string | null
          recurrence_interval: number | null
          recurrence_unit: string | null
          status: string
          template_id: string | null
          title: string
          type: string
          vehicle_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by: string
          customer_id: string
          description: string
          due_date: string
          id?: string
          is_recurring?: boolean | null
          last_occurred_at?: string | null
          next_occurrence_date?: string | null
          notes?: string | null
          notification_date?: string | null
          notification_sent?: boolean
          parent_reminder_id?: string | null
          priority?: string | null
          recurrence_interval?: number | null
          recurrence_unit?: string | null
          status?: string
          template_id?: string | null
          title: string
          type: string
          vehicle_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string
          description?: string
          due_date?: string
          id?: string
          is_recurring?: boolean | null
          last_occurred_at?: string | null
          next_occurrence_date?: string | null
          notes?: string | null
          notification_date?: string | null
          notification_sent?: boolean
          parent_reminder_id?: string | null
          priority?: string | null
          recurrence_interval?: number | null
          recurrence_unit?: string | null
          status?: string
          template_id?: string | null
          title?: string
          type?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_reminders_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "reminder_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reminders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reminders_parent_reminder_id_fkey"
            columns: ["parent_reminder_id"]
            isOneToOne: false
            referencedRelation: "service_reminders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reminders_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "reminder_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reminders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_sectors: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          position: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          position?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          position?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      service_subcategories: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          position: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          position?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          position?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_chats: {
        Row: {
          chat_room_id: string | null
          created_at: string | null
          created_by: string | null
          end_time: string
          id: string
          location: string | null
          notes: string | null
          shift_date: string
          shift_name: string
          start_time: string
          technician_ids: string[] | null
          updated_at: string | null
        }
        Insert: {
          chat_room_id?: string | null
          created_at?: string | null
          created_by?: string | null
          end_time: string
          id?: string
          location?: string | null
          notes?: string | null
          shift_date: string
          shift_name: string
          start_time: string
          technician_ids?: string[] | null
          updated_at?: string | null
        }
        Update: {
          chat_room_id?: string | null
          created_at?: string | null
          created_by?: string | null
          end_time?: string
          id?: string
          location?: string | null
          notes?: string | null
          shift_date?: string
          shift_name?: string
          start_time?: string
          technician_ids?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_chats_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_methods: {
        Row: {
          base_cost: number
          created_at: string
          description: string | null
          estimated_delivery_days: number | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          base_cost: number
          created_at?: string
          description?: string | null
          estimated_delivery_days?: number | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          base_cost?: number
          created_at?: string
          description?: string | null
          estimated_delivery_days?: number | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      shop_hours: {
        Row: {
          close_time: string
          created_at: string
          day_of_week: number
          id: string
          is_closed: boolean
          open_time: string
          shop_id: string
          updated_at: string
        }
        Insert: {
          close_time?: string
          created_at?: string
          day_of_week: number
          id?: string
          is_closed?: boolean
          open_time?: string
          shop_id: string
          updated_at?: string
        }
        Update: {
          close_time?: string
          created_at?: string
          day_of_week?: number
          id?: string
          is_closed?: boolean
          open_time?: string
          shop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_hours_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_settings: {
        Row: {
          address: string | null
          booking_enabled: boolean
          created_at: string
          email: string | null
          hours: Json | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          booking_enabled?: boolean
          created_at?: string
          email?: string | null
          hours?: Json | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          booking_enabled?: boolean
          created_at?: string
          email?: string | null
          hours?: Json | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          shop_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_settings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_special_days: {
        Row: {
          close_time: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          is_closed: boolean
          name: string
          open_time: string | null
          shop_id: string
          updated_at: string
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          is_closed?: boolean
          name: string
          open_time?: string | null
          shop_id: string
          updated_at?: string
        }
        Update: {
          close_time?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_closed?: boolean
          name?: string
          open_time?: string | null
          shop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_special_days_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_carts: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shops: {
        Row: {
          address: string | null
          business_type: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          onboarding_completed: boolean | null
          onboarding_data: Json | null
          organization_id: string
          other_industry: string | null
          phone: string | null
          postal_code: string | null
          setup_step: number | null
          shop_description: string | null
          shop_image_url: string | null
          state: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_type?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          onboarding_completed?: boolean | null
          onboarding_data?: Json | null
          organization_id: string
          other_industry?: string | null
          phone?: string | null
          postal_code?: string | null
          setup_step?: number | null
          shop_description?: string | null
          shop_image_url?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_type?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          onboarding_completed?: boolean | null
          onboarding_data?: Json | null
          organization_id?: string
          other_industry?: string | null
          phone?: string | null
          postal_code?: string | null
          setup_step?: number | null
          shop_description?: string | null
          shop_image_url?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shops_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      sms_logs: {
        Row: {
          customer_id: string | null
          error_message: string | null
          id: string
          message: string
          phone_number: string
          sent_at: string
          status: string
          template_id: string | null
          twilio_sid: string | null
        }
        Insert: {
          customer_id?: string | null
          error_message?: string | null
          id?: string
          message: string
          phone_number: string
          sent_at?: string
          status: string
          template_id?: string | null
          twilio_sid?: string | null
        }
        Update: {
          customer_id?: string | null
          error_message?: string | null
          id?: string
          message?: string
          phone_number?: string
          sent_at?: string
          status?: string
          template_id?: string | null
          twilio_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "sms_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          benefits_provided: Json | null
          company_name: string
          contact_person: string | null
          created_at: string | null
          created_by: string
          email: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          phone: string | null
          shop_id: string
          sponsorship_level: string | null
          sponsorship_value: number | null
          start_date: string | null
          updated_at: string | null
          visibility_preferences: Json | null
          website: string | null
        }
        Insert: {
          benefits_provided?: Json | null
          company_name: string
          contact_person?: string | null
          created_at?: string | null
          created_by: string
          email?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          phone?: string | null
          shop_id: string
          sponsorship_level?: string | null
          sponsorship_value?: number | null
          start_date?: string | null
          updated_at?: string | null
          visibility_preferences?: Json | null
          website?: string | null
        }
        Update: {
          benefits_provided?: Json | null
          company_name?: string
          contact_person?: string | null
          created_at?: string | null
          created_by?: string
          email?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          phone?: string | null
          shop_id?: string
          sponsorship_level?: string | null
          sponsorship_value?: number | null
          start_date?: string | null
          updated_at?: string | null
          visibility_preferences?: Json | null
          website?: string | null
        }
        Relationships: []
      }
      success_stories: {
        Row: {
          consent_obtained: boolean | null
          created_at: string | null
          created_by: string
          date_occurred: string | null
          featured: boolean | null
          id: string
          metrics_achieved: Json | null
          outcome_description: string | null
          participant_name: string | null
          photos: Json | null
          program_type: string
          publication_status: string | null
          shop_id: string
          story_content: string
          story_title: string
          updated_at: string | null
        }
        Insert: {
          consent_obtained?: boolean | null
          created_at?: string | null
          created_by: string
          date_occurred?: string | null
          featured?: boolean | null
          id?: string
          metrics_achieved?: Json | null
          outcome_description?: string | null
          participant_name?: string | null
          photos?: Json | null
          program_type: string
          publication_status?: string | null
          shop_id: string
          story_content: string
          story_title: string
          updated_at?: string | null
        }
        Update: {
          consent_obtained?: boolean | null
          created_at?: string | null
          created_by?: string
          date_occurred?: string | null
          featured?: boolean | null
          id?: string
          metrics_achieved?: Json | null
          outcome_description?: string | null
          participant_name?: string | null
          photos?: Json | null
          program_type?: string
          publication_status?: string | null
          shop_id?: string
          story_content?: string
          story_title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tax_documents: {
        Row: {
          confirmation_number: string | null
          created_at: string | null
          created_by: string
          document_type: string
          document_url: string | null
          due_date: string
          extension_date: string | null
          filed_date: string | null
          filing_fees: number | null
          filing_status: string | null
          id: string
          notes: string | null
          preparer_contact: string | null
          preparer_name: string | null
          shop_id: string
          tax_year: number
          updated_at: string | null
        }
        Insert: {
          confirmation_number?: string | null
          created_at?: string | null
          created_by: string
          document_type: string
          document_url?: string | null
          due_date: string
          extension_date?: string | null
          filed_date?: string | null
          filing_fees?: number | null
          filing_status?: string | null
          id?: string
          notes?: string | null
          preparer_contact?: string | null
          preparer_name?: string | null
          shop_id: string
          tax_year: number
          updated_at?: string | null
        }
        Update: {
          confirmation_number?: string | null
          created_at?: string | null
          created_by?: string
          document_type?: string
          document_url?: string | null
          due_date?: string
          extension_date?: string | null
          filed_date?: string | null
          filing_fees?: number | null
          filing_status?: string | null
          id?: string
          notes?: string | null
          preparer_contact?: string | null
          preparer_name?: string | null
          shop_id?: string
          tax_year?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      team_member_certifications: {
        Row: {
          certification_name: string
          created_at: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          team_member_id: string | null
          updated_at: string | null
        }
        Insert: {
          certification_name: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          team_member_id?: string | null
          updated_at?: string | null
        }
        Update: {
          certification_name?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          team_member_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_member_certifications_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_emergency_contacts: {
        Row: {
          contact_name: string
          created_at: string | null
          id: string
          phone: string
          relationship: string
          team_member_id: string | null
          updated_at: string | null
        }
        Insert: {
          contact_name: string
          created_at?: string | null
          id?: string
          phone: string
          relationship: string
          team_member_id?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_name?: string
          created_at?: string | null
          id?: string
          phone?: string
          relationship?: string
          team_member_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_member_emergency_contacts_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_history: {
        Row: {
          action_by: string
          action_by_name: string | null
          action_type: string
          details: Json
          id: string
          profile_id: string
          timestamp: string
        }
        Insert: {
          action_by: string
          action_by_name?: string | null
          action_type: string
          details?: Json
          id?: string
          profile_id: string
          timestamp?: string
        }
        Update: {
          action_by?: string
          action_by_name?: string | null
          action_type?: string
          details?: Json
          id?: string
          profile_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_roles: {
        Row: {
          created_at: string | null
          id: string
          role_id: string
          team_member_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role_id: string
          team_member_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role_id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_roles_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_settings: {
        Row: {
          created_at: string | null
          id: string
          language_preference: string | null
          notification_preferences: Json | null
          profile_id: string
          theme_preference: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          language_preference?: string | null
          notification_preferences?: Json | null
          profile_id: string
          theme_preference?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          language_preference?: string | null
          notification_preferences?: Json | null
          profile_id?: string
          theme_preference?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_member_settings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_skills: {
        Row: {
          created_at: string | null
          id: string
          proficiency_level: string | null
          skill_name: string
          team_member_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          proficiency_level?: string | null
          skill_name: string
          team_member_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          proficiency_level?: string | null
          skill_name?: string
          team_member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_member_skills_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          access_financials: boolean | null
          admin_privileges: boolean | null
          banking_info_on_file: boolean | null
          can_close_jobs: boolean | null
          can_create_work_orders: boolean | null
          created_at: string | null
          department: string | null
          email: string
          employee_id: string | null
          employment_type: string | null
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          notes: string | null
          on_call_after_hours: boolean | null
          pay_rate: number | null
          pay_type: string | null
          phone: string | null
          primary_location: string | null
          shift_end: string | null
          shift_start: string | null
          start_date: string | null
          status: string | null
          supervisor_id: string | null
          tax_form_submitted: boolean | null
          updated_at: string | null
          work_at_other_locations: boolean | null
          work_days: string[] | null
        }
        Insert: {
          access_financials?: boolean | null
          admin_privileges?: boolean | null
          banking_info_on_file?: boolean | null
          can_close_jobs?: boolean | null
          can_create_work_orders?: boolean | null
          created_at?: string | null
          department?: string | null
          email: string
          employee_id?: string | null
          employment_type?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          notes?: string | null
          on_call_after_hours?: boolean | null
          pay_rate?: number | null
          pay_type?: string | null
          phone?: string | null
          primary_location?: string | null
          shift_end?: string | null
          shift_start?: string | null
          start_date?: string | null
          status?: string | null
          supervisor_id?: string | null
          tax_form_submitted?: boolean | null
          updated_at?: string | null
          work_at_other_locations?: boolean | null
          work_days?: string[] | null
        }
        Update: {
          access_financials?: boolean | null
          admin_privileges?: boolean | null
          banking_info_on_file?: boolean | null
          can_close_jobs?: boolean | null
          can_create_work_orders?: boolean | null
          created_at?: string | null
          department?: string | null
          email?: string
          employee_id?: string | null
          employment_type?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          notes?: string | null
          on_call_after_hours?: boolean | null
          pay_rate?: number | null
          pay_type?: string | null
          phone?: string | null
          primary_location?: string | null
          shift_end?: string | null
          shift_start?: string | null
          start_date?: string | null
          status?: string | null
          supervisor_id?: string | null
          tax_form_submitted?: boolean | null
          updated_at?: string | null
          work_at_other_locations?: boolean | null
          work_days?: string[] | null
        }
        Relationships: []
      }
      team_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          profile_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          profile_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          profile_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_schedules: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          profile_id: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          profile_id?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          profile_id?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_schedules_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_skills: {
        Row: {
          certification_date: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          profile_id: string | null
          skill_name: string
          updated_at: string | null
        }
        Insert: {
          certification_date?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          profile_id?: string | null
          skill_name: string
          updated_at?: string | null
        }
        Update: {
          certification_date?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          profile_id?: string | null
          skill_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_breaks: {
        Row: {
          created_at: string
          end_time: string
          id: string
          schedule_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          schedule_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          schedule_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_breaks_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "technician_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_recurring: boolean
          specific_date: string | null
          start_time: string
          technician_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_recurring?: boolean
          specific_date?: string | null
          start_time: string
          technician_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_recurring?: boolean
          specific_date?: string | null
          start_time?: string
          technician_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      technician_status_changes: {
        Row: {
          change_date: string
          change_reason: string | null
          changed_by: string
          id: string
          new_status: string
          previous_status: string
          technician_id: string
        }
        Insert: {
          change_date?: string
          change_reason?: string | null
          changed_by: string
          id?: string
          new_status: string
          previous_status: string
          technician_id: string
        }
        Update: {
          change_date?: string
          change_reason?: string | null
          changed_by?: string
          id?: string
          new_status?: string
          previous_status?: string
          technician_id?: string
        }
        Relationships: []
      }
      transaction_allocations: {
        Row: {
          allocated_by: string
          allocation_basis: string | null
          allocation_date: string | null
          allocation_method: string
          allocation_percentage_nonprofit: number | null
          allocation_percentage_profit: number | null
          created_at: string
          for_profit_amount: number | null
          id: string
          is_final: boolean | null
          non_profit_amount: number | null
          notes: string | null
          shop_id: string
          transaction_id: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          allocated_by: string
          allocation_basis?: string | null
          allocation_date?: string | null
          allocation_method: string
          allocation_percentage_nonprofit?: number | null
          allocation_percentage_profit?: number | null
          created_at?: string
          for_profit_amount?: number | null
          id?: string
          is_final?: boolean | null
          non_profit_amount?: number | null
          notes?: string | null
          shop_id: string
          transaction_id: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          allocated_by?: string
          allocation_basis?: string | null
          allocation_date?: string | null
          allocation_method?: string
          allocation_percentage_nonprofit?: number | null
          allocation_percentage_profit?: number | null
          created_at?: string
          for_profit_amount?: number | null
          id?: string
          is_final?: boolean | null
          non_profit_amount?: number | null
          notes?: string | null
          shop_id?: string
          transaction_id?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_inspections: {
        Row: {
          created_at: string
          damage_areas: Json | null
          id: string
          inspection_date: string
          notes: string | null
          status: string
          technician_id: string | null
          updated_at: string
          vehicle_body_style: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          damage_areas?: Json | null
          id?: string
          inspection_date?: string
          notes?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
          vehicle_body_style: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          damage_areas?: Json | null
          id?: string
          inspection_date?: string
          notes?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
          vehicle_body_style?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_makes: {
        Row: {
          created_at: string
          id: string
          make_display: string
          make_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          make_display: string
          make_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          make_display?: string
          make_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicle_models: {
        Row: {
          created_at: string
          id: string
          make_id: string
          model_display: string
          model_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          make_id: string
          model_display: string
          model_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          make_id?: string
          model_display?: string
          model_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          body_style: string | null
          color: string | null
          country: string | null
          created_at: string
          customer_id: string
          drive_type: string | null
          engine: string | null
          fuel_type: string | null
          gvwr: string | null
          id: string
          last_service_date: string | null
          license_plate: string | null
          make: string
          model: string
          notes: string | null
          transmission: string | null
          transmission_type: string | null
          trim: string | null
          updated_at: string
          vin: string | null
          year: number | null
        }
        Insert: {
          body_style?: string | null
          color?: string | null
          country?: string | null
          created_at?: string
          customer_id: string
          drive_type?: string | null
          engine?: string | null
          fuel_type?: string | null
          gvwr?: string | null
          id?: string
          last_service_date?: string | null
          license_plate?: string | null
          make: string
          model: string
          notes?: string | null
          transmission?: string | null
          transmission_type?: string | null
          trim?: string | null
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          body_style?: string | null
          color?: string | null
          country?: string | null
          created_at?: string
          customer_id?: string
          drive_type?: string | null
          engine?: string | null
          fuel_type?: string | null
          gvwr?: string | null
          id?: string
          last_service_date?: string | null
          license_plate?: string | null
          make?: string
          model?: string
          notes?: string | null
          transmission?: string | null
          transmission_type?: string | null
          trim?: string | null
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_hours: {
        Row: {
          activity_description: string | null
          activity_type: string
          created_at: string
          created_by: string
          date_worked: string
          hours_worked: number
          id: string
          impact_description: string | null
          location: string | null
          notes: string | null
          program_area: string | null
          shop_id: string
          skills_used: string[] | null
          supervisor_name: string | null
          updated_at: string
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          volunteer_id: string | null
          volunteer_name: string
        }
        Insert: {
          activity_description?: string | null
          activity_type: string
          created_at?: string
          created_by: string
          date_worked: string
          hours_worked: number
          id?: string
          impact_description?: string | null
          location?: string | null
          notes?: string | null
          program_area?: string | null
          shop_id: string
          skills_used?: string[] | null
          supervisor_name?: string | null
          updated_at?: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          volunteer_id?: string | null
          volunteer_name: string
        }
        Update: {
          activity_description?: string | null
          activity_type?: string
          created_at?: string
          created_by?: string
          date_worked?: string
          hours_worked?: number
          id?: string
          impact_description?: string | null
          location?: string | null
          notes?: string | null
          program_area?: string | null
          shop_id?: string
          skills_used?: string[] | null
          supervisor_name?: string | null
          updated_at?: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          volunteer_id?: string | null
          volunteer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_hours_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      warranty_terms: {
        Row: {
          created_at: string | null
          days: number
          description: string | null
          duration: string
          id: string
          is_active: boolean | null
        }
        Insert: {
          created_at?: string | null
          days: number
          description?: string | null
          duration: string
          id?: string
          is_active?: boolean | null
        }
        Update: {
          created_at?: string | null
          days?: number
          description?: string | null
          duration?: string
          id?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      work_order_activities: {
        Row: {
          action: string
          flag_reason: string | null
          flagged: boolean | null
          id: string
          timestamp: string | null
          user_id: string
          user_name: string
          work_order_id: string
        }
        Insert: {
          action: string
          flag_reason?: string | null
          flagged?: boolean | null
          id?: string
          timestamp?: string | null
          user_id: string
          user_name: string
          work_order_id: string
        }
        Update: {
          action?: string
          flag_reason?: string | null
          flagged?: boolean | null
          id?: string
          timestamp?: string | null
          user_id?: string
          user_name?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_activities_work_order"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_activities_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assigned_by_name: string
          assignment_notes: string | null
          id: string
          is_active: boolean | null
          technician_id: string | null
          unassigned_at: string | null
          work_order_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_by_name: string
          assignment_notes?: string | null
          id?: string
          is_active?: boolean | null
          technician_id?: string | null
          unassigned_at?: string | null
          work_order_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_by_name?: string
          assignment_notes?: string | null
          id?: string
          is_active?: boolean | null
          technician_id?: string | null
          unassigned_at?: string | null
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_assignments_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_discounts: {
        Row: {
          applies_to: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string
          discount_amount: number
          discount_name: string
          discount_type: string
          discount_type_id: string | null
          discount_value: number
          id: string
          reason: string | null
          work_order_id: string
        }
        Insert: {
          applies_to: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by: string
          discount_amount: number
          discount_name: string
          discount_type: string
          discount_type_id?: string | null
          discount_value: number
          id?: string
          reason?: string | null
          work_order_id: string
        }
        Update: {
          applies_to?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string
          discount_amount?: number
          discount_name?: string
          discount_type?: string
          discount_type_id?: string | null
          discount_value?: number
          id?: string
          reason?: string | null
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_discounts_discount_type_id_fkey"
            columns: ["discount_type_id"]
            isOneToOne: false
            referencedRelation: "discount_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_discounts_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_document_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      work_order_document_versions: {
        Row: {
          created_at: string | null
          created_by: string | null
          document_id: string | null
          file_url: string
          id: string
          notes: string | null
          version_number: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          file_url: string
          id?: string
          notes?: string | null
          version_number: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          file_url?: string
          id?: string
          notes?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "work_order_document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "work_order_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_documents: {
        Row: {
          category: string | null
          category_id: string | null
          created_by: string | null
          description: string | null
          file_name: string
          file_type: string
          file_url: string
          id: string
          metadata: Json | null
          uploaded_at: string | null
          uploaded_by: string | null
          version_count: number | null
          work_order_id: string | null
        }
        Insert: {
          category?: string | null
          category_id?: string | null
          created_by?: string | null
          description?: string | null
          file_name: string
          file_type: string
          file_url: string
          id?: string
          metadata?: Json | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version_count?: number | null
          work_order_id?: string | null
        }
        Update: {
          category?: string | null
          category_id?: string | null
          created_by?: string | null
          description?: string | null
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          metadata?: Json | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version_count?: number | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_order_documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "work_order_document_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_documents_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_inventory_items: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
          quantity: number
          sku: string
          unit_price: number
          work_order_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
          quantity: number
          sku: string
          unit_price: number
          work_order_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          quantity?: number
          sku?: string
          unit_price?: number
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_inventory_items_work_order"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_inventory_items_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_job_line_history: {
        Row: {
          change_reason: string | null
          changed_at: string
          changed_by: string | null
          changed_by_name: string
          created_at: string
          field_name: string
          id: string
          job_line_id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          changed_by_name: string
          created_at?: string
          field_name: string
          id?: string
          job_line_id: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          changed_by_name?: string
          created_at?: string
          field_name?: string
          id?: string
          job_line_id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_order_job_line_history_job_line_id_fkey"
            columns: ["job_line_id"]
            isOneToOne: false
            referencedRelation: "work_order_job_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_job_lines: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          display_order: number | null
          estimated_hours: number | null
          id: string
          labor_rate: number | null
          labor_rate_type: string | null
          name: string
          notes: string | null
          status: string | null
          subcategory: string | null
          total_amount: number | null
          updated_at: string
          work_order_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          estimated_hours?: number | null
          id?: string
          labor_rate?: number | null
          labor_rate_type?: string | null
          name: string
          notes?: string | null
          status?: string | null
          subcategory?: string | null
          total_amount?: number | null
          updated_at?: string
          work_order_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          estimated_hours?: number | null
          id?: string
          labor_rate?: number | null
          labor_rate_type?: string | null
          name?: string
          notes?: string | null
          status?: string | null
          subcategory?: string | null
          total_amount?: number | null
          updated_at?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_job_lines_work_order"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_job_lines_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_notifications: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          message: string
          notification_type: string
          recipient_id: string
          recipient_type: string
          sent_at: string | null
          status: string | null
          title: string
          updated_at: string | null
          work_order_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          notification_type: string
          recipient_id: string
          recipient_type: string
          sent_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          work_order_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          notification_type?: string
          recipient_id?: string
          recipient_type?: string
          sent_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_notifications_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_part_history: {
        Row: {
          change_reason: string | null
          changed_at: string
          changed_by: string | null
          changed_by_name: string
          created_at: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          part_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          changed_by_name: string
          created_at?: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          part_id: string
        }
        Update: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          changed_by_name?: string
          created_at?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          part_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_part_history_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "work_order_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_parts: {
        Row: {
          attachments: Json | null
          category: string | null
          core_charge_amount: number | null
          core_charge_applied: boolean | null
          created_at: string | null
          customer_price: number
          date_added: string | null
          id: string
          install_date: string | null
          installed_by: string | null
          inventory_item_id: string | null
          invoice_number: string | null
          is_stock_item: boolean | null
          is_taxable: boolean | null
          job_line_id: string | null
          markup_percentage: number | null
          notes: string | null
          notes_internal: string | null
          part_name: string
          part_number: string | null
          part_type: string
          po_line: string | null
          quantity: number
          retail_price: number | null
          status: string | null
          supplier_cost: number | null
          supplier_name: string | null
          supplier_suggested_retail_price: number | null
          updated_at: string | null
          warranty_duration: string | null
          warranty_expiry_date: string | null
          work_order_id: string
        }
        Insert: {
          attachments?: Json | null
          category?: string | null
          core_charge_amount?: number | null
          core_charge_applied?: boolean | null
          created_at?: string | null
          customer_price: number
          date_added?: string | null
          id?: string
          install_date?: string | null
          installed_by?: string | null
          inventory_item_id?: string | null
          invoice_number?: string | null
          is_stock_item?: boolean | null
          is_taxable?: boolean | null
          job_line_id?: string | null
          markup_percentage?: number | null
          notes?: string | null
          notes_internal?: string | null
          part_name: string
          part_number?: string | null
          part_type: string
          po_line?: string | null
          quantity?: number
          retail_price?: number | null
          status?: string | null
          supplier_cost?: number | null
          supplier_name?: string | null
          supplier_suggested_retail_price?: number | null
          updated_at?: string | null
          warranty_duration?: string | null
          warranty_expiry_date?: string | null
          work_order_id: string
        }
        Update: {
          attachments?: Json | null
          category?: string | null
          core_charge_amount?: number | null
          core_charge_applied?: boolean | null
          created_at?: string | null
          customer_price?: number
          date_added?: string | null
          id?: string
          install_date?: string | null
          installed_by?: string | null
          inventory_item_id?: string | null
          invoice_number?: string | null
          is_stock_item?: boolean | null
          is_taxable?: boolean | null
          job_line_id?: string | null
          markup_percentage?: number | null
          notes?: string | null
          notes_internal?: string | null
          part_name?: string
          part_number?: string | null
          part_type?: string
          po_line?: string | null
          quantity?: number
          retail_price?: number | null
          status?: string | null
          supplier_cost?: number | null
          supplier_name?: string | null
          supplier_suggested_retail_price?: number | null
          updated_at?: string | null
          warranty_duration?: string | null
          warranty_expiry_date?: string | null
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_parts_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_parts_job_line_id_fkey"
            columns: ["job_line_id"]
            isOneToOne: false
            referencedRelation: "work_order_job_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_priorities: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          level: number
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level: number
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: number
          name?: string
        }
        Relationships: []
      }
      work_order_signatures: {
        Row: {
          created_at: string | null
          id: string
          signature_type: string
          signature_url: string
          signed_at: string | null
          signed_by: string
          work_order_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          signature_type: string
          signature_url: string
          signed_at?: string | null
          signed_by: string
          work_order_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          signature_type?: string
          signature_url?: string
          signed_at?: string | null
          signed_by?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_order_signatures_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_status_history: {
        Row: {
          change_reason: string | null
          changed_at: string | null
          changed_by: string | null
          changed_by_name: string
          id: string
          new_status: string
          old_status: string | null
          work_order_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          changed_by_name: string
          id?: string
          new_status: string
          old_status?: string | null
          work_order_id: string
        }
        Update: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          changed_by_name?: string
          id?: string
          new_status?: string
          old_status?: string | null
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_status_history_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_template_items: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          name: string
          quantity: number | null
          sku: string | null
          template_id: string | null
          unit_price: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
          quantity?: number | null
          sku?: string | null
          template_id?: string | null
          unit_price?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
          quantity?: number | null
          sku?: string | null
          template_id?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "work_order_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "work_order_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          last_used: string | null
          name: string
          notes: string | null
          priority: string | null
          status: string | null
          technician: string | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          last_used?: string | null
          name: string
          notes?: string | null
          priority?: string | null
          status?: string | null
          technician?: string | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          last_used?: string | null
          name?: string
          notes?: string | null
          priority?: string | null
          status?: string | null
          technician?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      work_order_time_entries: {
        Row: {
          billable: boolean | null
          created_at: string | null
          duration: number
          employee_id: string
          employee_name: string
          end_time: string | null
          id: string
          notes: string | null
          start_time: string
          work_order_id: string
        }
        Insert: {
          billable?: boolean | null
          created_at?: string | null
          duration: number
          employee_id: string
          employee_name: string
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time: string
          work_order_id: string
        }
        Update: {
          billable?: boolean | null
          created_at?: string | null
          duration?: number
          employee_id?: string
          employee_name?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_time_entries_work_order"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_time_entries_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          additional_info: string | null
          advisor_id: string | null
          attachments: Json | null
          authorization_limit: number | null
          complaint_source: string | null
          created_at: string
          created_by: string | null
          customer_complaint: string | null
          customer_id: string | null
          customer_instructions: string | null
          customer_waiting: boolean | null
          description: string | null
          diagnostic_notes: string | null
          drop_off_type: string | null
          end_time: string | null
          estimated_hours: number | null
          id: string
          initial_mileage: number | null
          invoice_id: string | null
          invoiced_at: string | null
          is_repeat_issue: boolean | null
          is_warranty: boolean | null
          linked_prior_work_order_id: string | null
          preferred_contact_method: string | null
          requested_services: Json | null
          service_category_id: string | null
          service_tags: string[] | null
          service_type: string | null
          start_time: string | null
          status: string
          technician_id: string | null
          total_cost: number | null
          updated_at: string
          urgency_level: string | null
          vehicle_condition_notes: string | null
          vehicle_damages: Json | null
          vehicle_id: string | null
          work_order_number: string | null
          write_up_by: string | null
          write_up_time: string | null
        }
        Insert: {
          additional_info?: string | null
          advisor_id?: string | null
          attachments?: Json | null
          authorization_limit?: number | null
          complaint_source?: string | null
          created_at?: string
          created_by?: string | null
          customer_complaint?: string | null
          customer_id?: string | null
          customer_instructions?: string | null
          customer_waiting?: boolean | null
          description?: string | null
          diagnostic_notes?: string | null
          drop_off_type?: string | null
          end_time?: string | null
          estimated_hours?: number | null
          id?: string
          initial_mileage?: number | null
          invoice_id?: string | null
          invoiced_at?: string | null
          is_repeat_issue?: boolean | null
          is_warranty?: boolean | null
          linked_prior_work_order_id?: string | null
          preferred_contact_method?: string | null
          requested_services?: Json | null
          service_category_id?: string | null
          service_tags?: string[] | null
          service_type?: string | null
          start_time?: string | null
          status: string
          technician_id?: string | null
          total_cost?: number | null
          updated_at?: string
          urgency_level?: string | null
          vehicle_condition_notes?: string | null
          vehicle_damages?: Json | null
          vehicle_id?: string | null
          work_order_number?: string | null
          write_up_by?: string | null
          write_up_time?: string | null
        }
        Update: {
          additional_info?: string | null
          advisor_id?: string | null
          attachments?: Json | null
          authorization_limit?: number | null
          complaint_source?: string | null
          created_at?: string
          created_by?: string | null
          customer_complaint?: string | null
          customer_id?: string | null
          customer_instructions?: string | null
          customer_waiting?: boolean | null
          description?: string | null
          diagnostic_notes?: string | null
          drop_off_type?: string | null
          end_time?: string | null
          estimated_hours?: number | null
          id?: string
          initial_mileage?: number | null
          invoice_id?: string | null
          invoiced_at?: string | null
          is_repeat_issue?: boolean | null
          is_warranty?: boolean | null
          linked_prior_work_order_id?: string | null
          preferred_contact_method?: string | null
          requested_services?: Json | null
          service_category_id?: string | null
          service_tags?: string[] | null
          service_type?: string | null
          start_time?: string | null
          status?: string
          technician_id?: string | null
          total_cost?: number | null
          updated_at?: string
          urgency_level?: string | null
          vehicle_condition_notes?: string | null
          vehicle_damages?: Json | null
          vehicle_id?: string | null
          work_order_number?: string | null
          write_up_by?: string | null
          write_up_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_linked_prior_work_order"
            columns: ["linked_prior_work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_work_orders_advisor"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_work_orders_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_work_orders_technician"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_work_orders_vehicle"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_rules: {
        Row: {
          actions: Json | null
          conditions: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          next_status: string
          trigger_status: string
          updated_at: string | null
        }
        Insert: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          next_status: string
          trigger_status: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          next_status?: string
          trigger_status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      workflows: {
        Row: {
          created_at: string | null
          description: string | null
          edges: Json | null
          id: string
          is_active: boolean | null
          name: string
          nodes: Json | null
          updated_at: string | null
          workflow_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          edges?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          nodes?: Json | null
          updated_at?: string | null
          workflow_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          edges?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          nodes?: Json | null
          updated_at?: string | null
          workflow_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      customer_referrals_view: {
        Row: {
          converted_at: string | null
          created_at: string | null
          id: string | null
          notes: string | null
          referral_date: string | null
          referred_email: string | null
          referred_first_name: string | null
          referred_id: string | null
          referred_last_name: string | null
          referrer_email: string | null
          referrer_first_name: string | null
          referrer_id: string | null
          referrer_last_name: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_details: {
        Row: {
          affiliate_link: string | null
          average_rating: number | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          created_at: string | null
          description: string | null
          dimensions: Json | null
          id: string | null
          image_url: string | null
          inventory_quantity: number | null
          inventory_status: string | null
          is_approved: boolean | null
          is_available: boolean | null
          is_bestseller: boolean | null
          is_featured: boolean | null
          price: number | null
          product_type: Database["public"]["Enums"]["product_type"] | null
          review_count: number | null
          sale_end_date: string | null
          sale_price: number | null
          sale_start_date: string | null
          sku: string | null
          stock_quantity: number | null
          suggested_by: string | null
          suggestion_reason: string | null
          title: string | null
          tracking_params: string | null
          updated_at: string | null
          weight: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      addcustomindustry: {
        Args: { industry_name: string }
        Returns: string
      }
      adjust_customer_points: {
        Args: { p_customer_id: string; p_points: number }
        Returns: undefined
      }
      assign_role_to_user: {
        Args: { user_id_param: string; role_id_param: string }
        Returns: boolean
      }
      calculate_ab_test_winner: {
        Args: { campaign_id: string; criteria?: string }
        Returns: string
      }
      calculate_allocation_percentages: {
        Args: { for_profit_amount: number; non_profit_amount: number }
        Returns: {
          for_profit_percentage: number
          non_profit_percentage: number
        }[]
      }
      calculate_budget_variance: {
        Args: {
          p_shop_id: string
          p_category_id: string
          p_fiscal_year: number
        }
        Returns: number
      }
      calculate_grant_utilization: {
        Args: { p_grant_id: string }
        Returns: number
      }
      calculate_job_line_total_with_discounts: {
        Args: { job_line_id_param: string }
        Returns: Json
      }
      calculate_job_line_total_with_parts: {
        Args: { job_line_id_param: string }
        Returns: number
      }
      calculate_raffle_revenue: {
        Args: { p_raffle_id: string }
        Returns: number
      }
      calculate_work_order_totals_with_discounts: {
        Args: { work_order_id_param: string }
        Returns: Json
      }
      check_inventory_availability: {
        Args: { item_id: string; requested_quantity: number }
        Returns: boolean
      }
      clear_service_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      convert_quote_to_work_order: {
        Args: { p_quote_id: string; p_converted_by: string; p_notes?: string }
        Returns: string
      }
      convert_work_order_to_invoice: {
        Args: {
          p_work_order_id: string
          p_converted_by: string
          p_notes?: string
        }
        Returns: string
      }
      count_email_events: {
        Args: { campaign_id_param: string; event_type_param: string }
        Returns: number
      }
      create_audit_log: {
        Args: {
          user_id: string
          action: string
          resource: string
          resource_id: string
          details: Json
        }
        Returns: string
      }
      create_custom_role: {
        Args: { role_name: string; role_description: string }
        Returns: string
      }
      create_storage_folders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_work_order_procedures: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_work_order_inventory_items: {
        Args: { work_order_id: string }
        Returns: undefined
      }
      delete_work_order_job_line: {
        Args: { job_line_id_param: string }
        Returns: undefined
      }
      delete_work_order_job_lines: {
        Args: { work_order_id_param: string }
        Returns: undefined
      }
      delete_work_order_part: {
        Args: { part_id_param: string }
        Returns: undefined
      }
      delete_work_order_time_entries: {
        Args: { work_order_id: string }
        Returns: undefined
      }
      generate_quote_number: {
        Args: { p_shop_id?: string }
        Returns: string
      }
      generate_raffle_ticket_number: {
        Args: { p_raffle_id: string }
        Returns: string
      }
      generate_receipt_number: {
        Args: { shop_id_param: string }
        Returns: string
      }
      generate_recurring_reminder: {
        Args: { parent_id: string }
        Returns: string
      }
      generate_work_order_number: {
        Args: { p_shop_id: string }
        Returns: string
      }
      get_email_processing_schedule: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_inventory_categories: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_job_line_parts: {
        Args: { job_line_id_param: string }
        Returns: {
          attachments: Json | null
          category: string | null
          core_charge_amount: number | null
          core_charge_applied: boolean | null
          created_at: string | null
          customer_price: number
          date_added: string | null
          id: string
          install_date: string | null
          installed_by: string | null
          inventory_item_id: string | null
          invoice_number: string | null
          is_stock_item: boolean | null
          is_taxable: boolean | null
          job_line_id: string | null
          markup_percentage: number | null
          notes: string | null
          notes_internal: string | null
          part_name: string
          part_number: string | null
          part_type: string
          po_line: string | null
          quantity: number
          retail_price: number | null
          status: string | null
          supplier_cost: number | null
          supplier_name: string | null
          supplier_suggested_retail_price: number | null
          updated_at: string | null
          warranty_duration: string | null
          warranty_expiry_date: string | null
          work_order_id: string
        }[]
      }
      get_overdue_grant_reports: {
        Args: Record<PropertyKey, never>
        Returns: {
          report_id: string
          grant_name: string
          report_type: string
          due_date: string
          days_overdue: number
        }[]
      }
      get_product_interactions_by_category: {
        Args: Record<PropertyKey, never>
        Returns: {
          name: string
          views: number
          clicks: number
          saves: number
          shares: number
        }[]
      }
      get_upcoming_filing_deadlines: {
        Args: { days_ahead?: number }
        Returns: {
          filing_id: string
          filing_name: string
          due_date: string
          days_until_due: number
          priority_level: string
          shop_id: string
        }[]
      }
      get_work_order_inventory_items: {
        Args: { work_order_id: string }
        Returns: {
          category: string
          created_at: string | null
          id: string
          name: string
          quantity: number
          sku: string
          unit_price: number
          work_order_id: string
        }[]
      }
      get_work_order_job_lines: {
        Args: { work_order_id_param: string }
        Returns: {
          category: string | null
          created_at: string
          description: string | null
          display_order: number | null
          estimated_hours: number | null
          id: string
          labor_rate: number | null
          labor_rate_type: string | null
          name: string
          notes: string | null
          status: string | null
          subcategory: string | null
          total_amount: number | null
          updated_at: string
          work_order_id: string
        }[]
      }
      get_work_order_notifications: {
        Args: { work_order_id_param: string }
        Returns: {
          created_at: string | null
          error_message: string | null
          id: string
          message: string
          notification_type: string
          recipient_id: string
          recipient_type: string
          sent_at: string | null
          status: string | null
          title: string
          updated_at: string | null
          work_order_id: string
        }[]
      }
      get_work_order_parts: {
        Args: { work_order_id_param: string }
        Returns: {
          attachments: Json | null
          category: string | null
          core_charge_amount: number | null
          core_charge_applied: boolean | null
          created_at: string | null
          customer_price: number
          date_added: string | null
          id: string
          install_date: string | null
          installed_by: string | null
          inventory_item_id: string | null
          invoice_number: string | null
          is_stock_item: boolean | null
          is_taxable: boolean | null
          job_line_id: string | null
          markup_percentage: number | null
          notes: string | null
          notes_internal: string | null
          part_name: string
          part_number: string | null
          part_type: string
          po_line: string | null
          quantity: number
          retail_price: number | null
          status: string | null
          supplier_cost: number | null
          supplier_name: string | null
          supplier_suggested_retail_price: number | null
          updated_at: string | null
          warranty_duration: string | null
          warranty_expiry_date: string | null
          work_order_id: string
        }[]
      }
      get_work_order_time_entries: {
        Args: { work_order_id: string }
        Returns: {
          billable: boolean | null
          created_at: string | null
          duration: number
          employee_id: string
          employee_name: string
          end_time: string | null
          id: string
          notes: string | null
          start_time: string
          work_order_id: string
        }[]
      }
      get_work_order_with_details: {
        Args: { work_order_id: string }
        Returns: {
          id: string
          customer_id: string
          vehicle_id: string
          advisor_id: string
          technician_id: string
          estimated_hours: number
          total_cost: number
          created_by: string
          created_at: string
          updated_at: string
          start_time: string
          end_time: string
          service_category_id: string
          invoiced_at: string
          status: string
          description: string
          service_type: string
          invoice_id: string
          customer_first_name: string
          customer_last_name: string
          customer_email: string
          customer_phone: string
          vehicle_year: string
          vehicle_make: string
          vehicle_model: string
          vehicle_vin: string
          vehicle_license_plate: string
        }[]
      }
      has_permission: {
        Args: {
          user_id: string
          res: Database["public"]["Enums"]["resource_type"]
          act: Database["public"]["Enums"]["permission_type"]
        }
        Returns: boolean
      }
      has_role: {
        Args: { user_id: string; role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      increment_campaign_clicks: {
        Args: { campaign_id: string }
        Returns: undefined
      }
      increment_campaign_opens: {
        Args: { campaign_id: string }
        Returns: undefined
      }
      increment_template_usage: {
        Args: { template_id: string }
        Returns: undefined
      }
      increment_usage_count: {
        Args: { template_id: string }
        Returns: number
      }
      insert_service_category: {
        Args: { p_name: string; p_description?: string; p_position?: number }
        Returns: string
      }
      insert_service_job: {
        Args: {
          p_subcategory_id: string
          p_name: string
          p_description?: string
          p_estimated_time?: number
          p_price?: number
        }
        Returns: string
      }
      insert_service_sector: {
        Args: { p_name: string; p_description?: string; p_position?: number }
        Returns: string
      }
      insert_service_subcategory: {
        Args: { p_category_id: string; p_name: string; p_description?: string }
        Returns: string
      }
      insert_work_order_inventory_item: {
        Args: {
          p_work_order_id: string
          p_name: string
          p_sku: string
          p_category: string
          p_quantity: number
          p_unit_price: number
        }
        Returns: string
      }
      insert_work_order_part: {
        Args:
          | {
              p_work_order_id: string
              p_job_line_id: string
              p_inventory_item_id: string
              p_part_name: string
              p_part_number: string
              p_supplier_name: string
              p_supplier_cost: number
              p_markup_percentage: number
              p_retail_price: number
              p_customer_price: number
              p_quantity: number
              p_part_type: string
              p_invoice_number: string
              p_po_line: string
              p_notes: string
            }
          | {
              p_work_order_id: string
              p_job_line_id: string
              p_inventory_item_id: string
              p_part_name: string
              p_part_number: string
              p_supplier_name: string
              p_supplier_cost: number
              p_markup_percentage: number
              p_retail_price: number
              p_customer_price: number
              p_quantity: number
              p_part_type: string
              p_invoice_number: string
              p_po_line: string
              p_notes: string
              p_category?: string
              p_is_taxable?: boolean
              p_core_charge_amount?: number
              p_core_charge_applied?: boolean
              p_warranty_duration?: string
              p_install_date?: string
              p_installed_by?: string
              p_status?: string
              p_is_stock_item?: boolean
            }
          | {
              p_work_order_id: string
              p_job_line_id: string
              p_inventory_item_id: string
              p_part_name: string
              p_part_number: string
              p_supplier_name: string
              p_supplier_cost: number
              p_supplier_suggested_retail_price: number
              p_markup_percentage: number
              p_retail_price: number
              p_customer_price: number
              p_quantity: number
              p_part_type: string
              p_invoice_number: string
              p_po_line: string
              p_notes: string
              p_category?: string
              p_is_taxable?: boolean
              p_core_charge_amount?: number
              p_core_charge_applied?: boolean
              p_warranty_duration?: string
              p_install_date?: string
              p_installed_by?: string
              p_status?: string
              p_is_stock_item?: boolean
            }
        Returns: string
      }
      insert_work_order_time_entry: {
        Args: {
          p_work_order_id: string
          p_employee_id: string
          p_employee_name: string
          p_start_time: string
          p_end_time: string
          p_duration: number
          p_notes: string
          p_billable: boolean
        }
        Returns: string
      }
      is_customer: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_document_access: {
        Args: {
          p_document_id: string
          p_access_type: string
          p_accessed_by: string
          p_accessed_by_name: string
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: string
      }
      process_referral_reward: {
        Args: { referral_id: string; points?: number }
        Returns: string
      }
      receive_inventory_order: {
        Args: { order_id: string; quantity_to_receive: number }
        Returns: undefined
      }
      record_status_change_activity: {
        Args: {
          p_work_order_id: string
          p_old_status: string
          p_new_status: string
          p_user_id: string
          p_user_name: string
        }
        Returns: undefined
      }
      record_team_history: {
        Args: {
          profile_id_param: string
          action_type_param: string
          action_by_param: string
          action_by_name_param: string
          details_param: Json
        }
        Returns: string
      }
      record_team_member_history: {
        Args: {
          profile_id_param: string
          action_type_param: string
          action_by_param: string
          action_by_name_param: string
          details_param: Json
        }
        Returns: string
      }
      record_work_order_activity: {
        Args: {
          p_action: string
          p_work_order_id: string
          p_user_id: string
          p_user_name: string
        }
        Returns: string
      }
      remove_role_from_user: {
        Args: { user_role_id_param: string }
        Returns: boolean
      }
      search_documents: {
        Args: {
          p_search_query?: string
          p_category_id?: string
          p_document_type?: string
          p_tags?: string[]
          p_work_order_id?: string
          p_customer_id?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          title: string
          description: string
          document_type: string
          file_url: string
          category_name: string
          tags: string[]
          created_by_name: string
          created_at: string
          updated_at: string
          relevance_score: number
        }[]
      }
      update_email_processing_schedule: {
        Args: { new_settings: Json }
        Returns: Json
      }
      update_work_order_part: {
        Args:
          | {
              p_id: string
              p_part_name: string
              p_part_number: string
              p_supplier_name: string
              p_supplier_cost: number
              p_markup_percentage: number
              p_retail_price: number
              p_customer_price: number
              p_quantity: number
              p_part_type: string
              p_invoice_number: string
              p_po_line: string
              p_notes: string
            }
          | {
              p_id: string
              p_part_name: string
              p_part_number: string
              p_supplier_name: string
              p_supplier_cost: number
              p_markup_percentage: number
              p_retail_price: number
              p_customer_price: number
              p_quantity: number
              p_part_type: string
              p_invoice_number: string
              p_po_line: string
              p_notes: string
              p_category?: string
              p_is_taxable?: boolean
              p_core_charge_amount?: number
              p_core_charge_applied?: boolean
              p_warranty_duration?: string
              p_install_date?: string
              p_installed_by?: string
              p_status?: string
              p_is_stock_item?: boolean
            }
          | {
              p_id: string
              p_part_name: string
              p_part_number: string
              p_supplier_name: string
              p_supplier_cost: number
              p_supplier_suggested_retail_price: number
              p_markup_percentage: number
              p_retail_price: number
              p_customer_price: number
              p_quantity: number
              p_part_type: string
              p_invoice_number: string
              p_po_line: string
              p_notes: string
              p_category?: string
              p_is_taxable?: boolean
              p_core_charge_amount?: number
              p_core_charge_applied?: boolean
              p_warranty_duration?: string
              p_install_date?: string
              p_installed_by?: string
              p_status?: string
              p_is_stock_item?: boolean
            }
        Returns: string
      }
      upsert_work_order_job_line: {
        Args: {
          p_id: string
          p_work_order_id: string
          p_name: string
          p_category: string
          p_subcategory: string
          p_description: string
          p_estimated_hours: number
          p_labor_rate: number
          p_total_amount: number
          p_status: string
          p_notes: string
          p_display_order: number
        }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "owner"
        | "admin"
        | "manager"
        | "parts_manager"
        | "service_advisor"
        | "technician"
        | "reception"
        | "other_staff"
        | "customer"
      form_field_type:
        | "text"
        | "textarea"
        | "number"
        | "select"
        | "checkbox"
        | "radio"
        | "date"
        | "email"
        | "phone"
        | "file"
      permission_type: "create" | "read" | "update" | "delete"
      product_type: "affiliate" | "suggested"
      resource_type:
        | "users"
        | "roles"
        | "settings"
        | "billing"
        | "work_orders"
        | "inventory"
        | "appointments"
        | "reports"
        | "customers"
      role_action_type: "added" | "removed" | "modified"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "owner",
        "admin",
        "manager",
        "parts_manager",
        "service_advisor",
        "technician",
        "reception",
        "other_staff",
        "customer",
      ],
      form_field_type: [
        "text",
        "textarea",
        "number",
        "select",
        "checkbox",
        "radio",
        "date",
        "email",
        "phone",
        "file",
      ],
      permission_type: ["create", "read", "update", "delete"],
      product_type: ["affiliate", "suggested"],
      resource_type: [
        "users",
        "roles",
        "settings",
        "billing",
        "work_orders",
        "inventory",
        "appointments",
        "reports",
        "customers",
      ],
      role_action_type: ["added", "removed", "modified"],
    },
  },
} as const
