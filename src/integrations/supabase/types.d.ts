export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          advisor_id: string;
          created_at: string;
          customer_id: string;
          date: string;
          duration: number;
          id: string;
          notes: string;
          status: string;
          updated_at: string;
          vehicle_id: string;
        };
        Insert: {
          advisor_id: string;
          created_at?: string;
          customer_id: string;
          date: string;
          duration: number;
          id?: string;
          notes?: string;
          status?: string;
          updated_at?: string;
          vehicle_id: string;
        };
        Update: {
          advisor_id?: string;
          created_at?: string;
          customer_id?: string;
          date?: string;
          duration?: number;
          id?: string;
          notes?: string;
          status?: string;
          updated_at?: string;
          vehicle_id?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          action: string;
          created_at: string;
          entity_id: string;
          entity_type: string;
          id: string;
          metadata: Json;
          user_id: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          entity_id: string;
          entity_type: string;
          id?: string;
          metadata?: Json;
          user_id: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          metadata?: Json;
          user_id?: string;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          room_id: string;
          sender_id: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          room_id: string;
          sender_id: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          room_id?: string;
          sender_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      chat_participants: {
        Row: {
          created_at: string;
          id: string;
          room_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          room_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          room_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      chat_rooms: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      communication_templates: {
        Row: {
          content: string;
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          subject: string;
          template_type: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          created_by: string;
          id?: string;
          name: string;
          subject: string;
          template_type: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          subject?: string;
          template_type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customer_communications: {
        Row: {
          communication_type: string;
          content: string;
          created_at: string;
          customer_id: string;
          id: string;
          metadata: Json;
          sent_by: string;
          status: string;
          subject: string;
          updated_at: string;
        };
        Insert: {
          communication_type: string;
          content: string;
          created_at?: string;
          customer_id: string;
          id?: string;
          metadata?: Json;
          sent_by: string;
          status?: string;
          subject: string;
          updated_at?: string;
        };
        Update: {
          communication_type?: string;
          content?: string;
          created_at?: string;
          customer_id?: string;
          id?: string;
          metadata?: Json;
          sent_by?: string;
          status?: string;
          subject?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          address: string;
          city: string;
          created_at: string;
          email: string;
          first_name: string;
          id: string;
          last_name: string;
          notes: string;
          phone: string;
          postal_code: string;
          state: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          address?: string;
          city?: string;
          created_at?: string;
          email: string;
          first_name: string;
          id?: string;
          last_name: string;
          notes?: string;
          phone?: string;
          postal_code?: string;
          state?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          address?: string;
          city?: string;
          created_at?: string;
          email?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
          notes?: string;
          phone?: string;
          postal_code?: string;
          state?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      form_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          is_published: boolean
          version: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          is_published?: boolean
          version?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          is_published?: boolean
          version?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      form_sections: {
        Row: {
          id: string
          template_id: string
          title: string
          description: string | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_id: string
          title: string
          description?: string | null
          display_order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          title?: string
          description?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      form_fields: {
        Row: {
          id: string
          section_id: string
          label: string
          field_type: string
          placeholder: string | null
          help_text: string | null
          is_required: boolean
          display_order: number
          options: Json | null
          default_value: string | null
          validation_rules: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id: string
          label: string
          field_type: string
          placeholder?: string | null
          help_text?: string | null
          is_required?: boolean
          display_order: number
          options?: Json | null
          default_value?: string | null
          validation_rules?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          label?: string
          field_type?: string
          placeholder?: string | null
          help_text?: string | null
          is_required?: boolean
          display_order?: number
          options?: Json | null
          default_value?: string | null
          validation_rules?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      form_submissions: {
        Row: {
          id: string
          template_id: string
          submitted_by: string | null
          submitted_data: Json
          customer_id: string | null
          vehicle_id: string | null
          work_order_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          submitted_by?: string | null
          submitted_data: Json
          customer_id?: string | null
          vehicle_id?: string | null
          work_order_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          submitted_by?: string | null
          submitted_data?: Json
          customer_id?: string | null
          vehicle_id?: string | null
          work_order_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
