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
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          room_id: string
          sender_id: string
          sender_name: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          room_id: string
          sender_id: string
          sender_name: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
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
          name: string
          type: string
          updated_at: string
          work_order_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
          updated_at?: string
          work_order_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
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
          created_at: string
          email: string | null
          first_name: string
          household_id: string | null
          id: string
          last_name: string
          phone: string | null
          segments: Json | null
          shop_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          household_id?: string | null
          id?: string
          last_name: string
          phone?: string | null
          segments?: Json | null
          shop_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          household_id?: string | null
          id?: string
          last_name?: string
          phone?: string | null
          segments?: Json | null
          shop_id?: string
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
      invoices: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer: string
          customer_address: string | null
          customer_email: string | null
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
        Relationships: []
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
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
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
          name: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_custom?: boolean | null
          name: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_custom?: boolean | null
          name?: Database["public"]["Enums"]["app_role"]
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
      vehicles: {
        Row: {
          color: string | null
          created_at: string
          customer_id: string
          id: string
          last_service_date: string | null
          license_plate: string | null
          make: string
          model: string
          notes: string | null
          updated_at: string
          vin: string | null
          year: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          customer_id: string
          id?: string
          last_service_date?: string | null
          license_plate?: string | null
          make: string
          model: string
          notes?: string | null
          updated_at?: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          last_service_date?: string | null
          license_plate?: string | null
          make?: string
          model?: string
          notes?: string | null
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
      work_order_activities: {
        Row: {
          action: string
          id: string
          timestamp: string | null
          user_id: string
          user_name: string
          work_order_id: string
        }
        Insert: {
          action: string
          id?: string
          timestamp?: string | null
          user_id: string
          user_name: string
          work_order_id: string
        }
        Update: {
          action?: string
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
      [_ in never]: never
    }
    Functions: {
      assign_role_to_user: {
        Args: {
          user_id_param: string
          role_id_param: string
        }
        Returns: boolean
      }
      calculate_ab_test_winner: {
        Args: {
          campaign_id: string
          criteria?: string
        }
        Returns: string
      }
      count_email_events: {
        Args: {
          campaign_id_param: string
          event_type_param: string
        }
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
        Args: {
          role_name: string
          role_description: string
        }
        Returns: string
      }
      create_work_order_procedures: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_work_order_inventory_items: {
        Args: {
          work_order_id: string
        }
        Returns: undefined
      }
      delete_work_order_time_entries: {
        Args: {
          work_order_id: string
        }
        Returns: undefined
      }
      get_work_order_inventory_items: {
        Args: {
          work_order_id: string
        }
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
        Args: {
          work_order_id: string
        }
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
        Args: {
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_campaign_clicks: {
        Args: {
          campaign_id: string
        }
        Returns: undefined
      }
      increment_campaign_opens: {
        Args: {
          campaign_id: string
        }
        Returns: undefined
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
        Args: {
          user_role_id_param: string
        }
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
      permission_type: "create" | "read" | "update" | "delete"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
