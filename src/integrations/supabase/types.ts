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
      chat_messages: {
        Row: {
          content: string
          created_at: string
          file_url: string | null
          flag_reason: string | null
          id: string
          is_flagged: boolean | null
          is_read: boolean | null
          message_type: string | null
          metadata: Json | null
          reply_to_id: string | null
          room_id: string
          sender_id: string
          sender_name: string
        }
        Insert: {
          content: string
          created_at?: string
          file_url?: string | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          is_read?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          reply_to_id?: string | null
          room_id: string
          sender_id: string
          sender_name: string
        }
        Update: {
          content?: string
          created_at?: string
          file_url?: string | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          is_read?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          reply_to_id?: string | null
          room_id?: string
          sender_id?: string
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
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
            foreignKeyName: "customer_documents_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "document_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
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
      customers: {
        Row: {
          address: string | null
          city: string | null
          communication_preference: string | null
          company: string | null
          country: string | null
          created_at: string
          email: string | null
          first_name: string
          fleet_company: string | null
          household_id: string | null
          id: string
          is_fleet: boolean | null
          last_name: string
          notes: string | null
          other_referral_details: string | null
          phone: string | null
          postal_code: string | null
          preferred_technician_id: string | null
          referral_person_id: string | null
          referral_source: string | null
          segments: Json | null
          shop_id: string
          state: string | null
          tags: Json | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          communication_preference?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          fleet_company?: string | null
          household_id?: string | null
          id?: string
          is_fleet?: boolean | null
          last_name: string
          notes?: string | null
          other_referral_details?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_technician_id?: string | null
          referral_person_id?: string | null
          referral_source?: string | null
          segments?: Json | null
          shop_id: string
          state?: string | null
          tags?: Json | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          communication_preference?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          fleet_company?: string | null
          household_id?: string | null
          id?: string
          is_fleet?: boolean | null
          last_name?: string
          notes?: string | null
          other_referral_details?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_technician_id?: string | null
          referral_person_id?: string | null
          referral_source?: string | null
          segments?: Json | null
          shop_id?: string
          state?: string | null
          tags?: Json | null
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
      document_categories: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          shop_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          shop_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          shop_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          usage_count?: number
        }
        Update: {
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
          document_id: string
          file_path: string
          file_size: number
          id: string
          uploaded_by: string
          uploaded_by_name: string
          version_notes: string | null
          version_number: number
        }
        Insert: {
          created_at?: string
          document_id: string
          file_path: string
          file_size: number
          id?: string
          uploaded_by: string
          uploaded_by_name: string
          version_notes?: string | null
          version_number: number
        }
        Update: {
          created_at?: string
          document_id?: string
          file_path?: string
          file_size?: number
          id?: string
          uploaded_by?: string
          uploaded_by_name?: string
          version_notes?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "customer_documents"
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
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          points_expiration_days?: number | null
          points_per_dollar?: number | null
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          points_expiration_days?: number | null
          points_per_dollar?: number | null
          shop_id?: string | null
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
      products: {
        Row: {
          affiliate_link: string | null
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_approved: boolean | null
          is_bestseller: boolean | null
          is_featured: boolean | null
          price: number | null
          product_type: Database["public"]["Enums"]["product_type"]
          suggested_by: string | null
          suggestion_reason: string | null
          title: string
          tracking_params: string | null
          updated_at: string
        }
        Insert: {
          affiliate_link?: string | null
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          price?: number | null
          product_type?: Database["public"]["Enums"]["product_type"]
          suggested_by?: string | null
          suggestion_reason?: string | null
          title: string
          tracking_params?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_link?: string | null
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_approved?: boolean | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          price?: number | null
          product_type?: Database["public"]["Enums"]["product_type"]
          suggested_by?: string | null
          suggestion_reason?: string | null
          title?: string
          tracking_params?: string | null
          updated_at?: string
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
          email: string
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          phone: string | null
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          first_name?: string | null
          id: string
          job_title?: string | null
          last_name?: string | null
          phone?: string | null
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          phone?: string | null
          shop_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
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
      service_reminders: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string
          customer_id: string
          description: string
          due_date: string
          id: string
          notes: string | null
          notification_date: string | null
          notification_sent: boolean
          status: string
          title: string
          type: string
          vehicle_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by: string
          customer_id: string
          description: string
          due_date: string
          id?: string
          notes?: string | null
          notification_date?: string | null
          notification_sent?: boolean
          status?: string
          title: string
          type: string
          vehicle_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string
          description?: string
          due_date?: string
          id?: string
          notes?: string | null
          notification_date?: string | null
          notification_sent?: boolean
          status?: string
          title?: string
          type?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_reminders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
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
      shops: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          organization_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          organization_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          organization_id?: string
          phone?: string | null
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
            foreignKeyName: "fk_vehicles_customer_id"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "work_order_activities_work_order_id_fkey"
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
            foreignKeyName: "work_order_inventory_items_work_order_id_fkey"
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
          advisor_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          end_time: string | null
          estimated_hours: number | null
          id: string
          start_time: string | null
          status: string
          technician_id: string | null
          total_cost: number | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          advisor_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          end_time?: string | null
          estimated_hours?: number | null
          id?: string
          start_time?: string | null
          status: string
          technician_id?: string | null
          total_cost?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          advisor_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          end_time?: string | null
          estimated_hours?: number | null
          id?: string
          start_time?: string | null
          status?: string
          technician_id?: string | null
          total_cost?: number | null
          updated_at?: string
          vehicle_id?: string | null
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
    }
    Functions: {
      assign_role_to_user: {
        Args: { user_id_param: string; role_id_param: string }
        Returns: boolean
      }
      calculate_ab_test_winner: {
        Args: { campaign_id: string; criteria?: string }
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
      create_work_order_procedures: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_work_order_inventory_items: {
        Args: { work_order_id: string }
        Returns: undefined
      }
      delete_work_order_time_entries: {
        Args: { work_order_id: string }
        Returns: undefined
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
      process_referral_reward: {
        Args: { referral_id: string; points?: number }
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
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
    },
  },
} as const
