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
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
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
          logo_url: string | null
          name: string
          organization_id: string
          other_industry: string | null
          phone: string | null
          postal_code: string | null
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
          logo_url?: string | null
          name: string
          organization_id: string
          other_industry?: string | null
          phone?: string | null
          postal_code?: string | null
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
          logo_url?: string | null
          name?: string
          organization_id?: string
          other_industry?: string | null
          phone?: string | null
          postal_code?: string | null
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
            foreignKeyName: "work_order_inventory_items_work_order_id_fkey"
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
          invoice_id: string | null
          invoiced_at: string | null
          service_category_id: string | null
          service_type: string | null
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
          invoice_id?: string | null
          invoiced_at?: string | null
          service_category_id?: string | null
          service_type?: string | null
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
          invoice_id?: string | null
          invoiced_at?: string | null
          service_category_id?: string | null
          service_type?: string | null
          start_time?: string | null
          status?: string
          technician_id?: string | null
          total_cost?: number | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
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
      check_inventory_availability: {
        Args: { item_id: string; requested_quantity: number }
        Returns: boolean
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
      delete_work_order_time_entries: {
        Args: { work_order_id: string }
        Returns: undefined
      }
      generate_recurring_reminder: {
        Args: { parent_id: string }
        Returns: string
      }
      get_email_processing_schedule: {
        Args: Record<PropertyKey, never>
        Returns: Json
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
      receive_inventory_order: {
        Args: { order_id: string; quantity_to_receive: number }
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
      update_email_processing_schedule: {
        Args: { new_settings: Json }
        Returns: Json
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
      role_action_type: "added" | "removed" | "modified"
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
      role_action_type: ["added", "removed", "modified"],
    },
  },
} as const
