export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          auto_schedule: boolean
          calendly_link: string | null
          category: string
          company_name: string | null
          created_at: string
          draft_workflow: Json | null
          forwarding_number: string | null
          greeting_style: string | null
          id: string
          last_published_at: string | null
          name: string
          org_id: string
          phone_number: string | null
          published_workflow: Json | null
          retell_agent_id: string | null
          retell_flow_id: string | null
          service_areas: string[] | null
          status: Database["public"]["Enums"]["agent_status"]
          updated_at: string
          version: number | null
          voice_persona: string | null
        }
        Insert: {
          auto_schedule?: boolean
          calendly_link?: string | null
          category?: string
          company_name?: string | null
          created_at?: string
          draft_workflow?: Json | null
          forwarding_number?: string | null
          greeting_style?: string | null
          id?: string
          last_published_at?: string | null
          name: string
          org_id: string
          phone_number?: string | null
          published_workflow?: Json | null
          retell_agent_id?: string | null
          retell_flow_id?: string | null
          service_areas?: string[] | null
          status?: Database["public"]["Enums"]["agent_status"]
          updated_at?: string
          version?: number | null
          voice_persona?: string | null
        }
        Update: {
          auto_schedule?: boolean
          calendly_link?: string | null
          category?: string
          company_name?: string | null
          created_at?: string
          draft_workflow?: Json | null
          forwarding_number?: string | null
          greeting_style?: string | null
          id?: string
          last_published_at?: string | null
          name?: string
          org_id?: string
          phone_number?: string | null
          published_workflow?: Json | null
          retell_agent_id?: string | null
          retell_flow_id?: string | null
          service_areas?: string[] | null
          status?: Database["public"]["Enums"]["agent_status"]
          updated_at?: string
          version?: number | null
          voice_persona?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          agent_id: string | null
          calendar_provider: string | null
          created_at: string
          end_time: string | null
          external_event_id: string | null
          id: string
          lead_id: string | null
          location: string | null
          notes: string | null
          org_id: string
          outcome: string | null
          property_address: string | null
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          calendar_provider?: string | null
          created_at?: string
          end_time?: string | null
          external_event_id?: string | null
          id?: string
          lead_id?: string | null
          location?: string | null
          notes?: string | null
          org_id: string
          outcome?: string | null
          property_address?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          calendar_provider?: string | null
          created_at?: string
          end_time?: string | null
          external_event_id?: string | null
          id?: string
          lead_id?: string | null
          location?: string | null
          notes?: string | null
          org_id?: string
          outcome?: string | null
          property_address?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          agent_id: string | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          extracted_data: Json | null
          id: string
          lead_id: string | null
          org_id: string
          outcome: string | null
          recording_url: string | null
          retell_call_id: string | null
          started_at: string | null
          transcript: string | null
          transcript_summary: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          extracted_data?: Json | null
          id?: string
          lead_id?: string | null
          org_id: string
          outcome?: string | null
          recording_url?: string | null
          retell_call_id?: string | null
          started_at?: string | null
          transcript?: string | null
          transcript_summary?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          extracted_data?: Json | null
          id?: string
          lead_id?: string | null
          org_id?: string
          outcome?: string | null
          recording_url?: string | null
          retell_call_id?: string | null
          started_at?: string | null
          transcript?: string | null
          transcript_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      intake_submissions: {
        Row: {
          biggest_challenge: string | null
          business_name: string
          created_at: string
          email: string
          full_name: string
          growth_goal: string
          id: string
          industry: string
          lead_tracking: string
          location: string
          phone: string | null
          website: string | null
        }
        Insert: {
          biggest_challenge?: string | null
          business_name: string
          created_at?: string
          email: string
          full_name: string
          growth_goal: string
          id?: string
          industry: string
          lead_tracking: string
          location: string
          phone?: string | null
          website?: string | null
        }
        Update: {
          biggest_challenge?: string | null
          business_name?: string
          created_at?: string
          email?: string
          full_name?: string
          growth_goal?: string
          id?: string
          industry?: string
          lead_tracking?: string
          location?: string
          phone?: string | null
          website?: string | null
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_connected: boolean | null
          org_id: string
          type: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          org_id: string
          type: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          org_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          agent_id: string | null
          budget_max: number | null
          budget_min: number | null
          caller_phone: string | null
          created_at: string
          desired_areas: string[] | null
          down_payment_estimate: number | null
          email: string | null
          financing_status: string | null
          id: string
          motivation_reason: string | null
          motivation_score: number | null
          must_haves: Json | null
          name: string | null
          notes: string | null
          org_id: string
          pre_approved: boolean | null
          property_type: string | null
          score: string | null
          status: Database["public"]["Enums"]["lead_status"]
          tags: string[] | null
          timeline: string | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          caller_phone?: string | null
          created_at?: string
          desired_areas?: string[] | null
          down_payment_estimate?: number | null
          email?: string | null
          financing_status?: string | null
          id?: string
          motivation_reason?: string | null
          motivation_score?: number | null
          must_haves?: Json | null
          name?: string | null
          notes?: string | null
          org_id: string
          pre_approved?: boolean | null
          property_type?: string | null
          score?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[] | null
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          caller_phone?: string | null
          created_at?: string
          desired_areas?: string[] | null
          down_payment_estimate?: number | null
          email?: string | null
          financing_status?: string | null
          id?: string
          motivation_reason?: string | null
          motivation_score?: number | null
          must_haves?: Json | null
          name?: string | null
          notes?: string | null
          org_id?: string
          pre_approved?: boolean | null
          property_type?: string | null
          score?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[] | null
          timeline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          brand_colors: Json | null
          created_at: string
          id: string
          industry: string
          logo_url: string | null
          name: string
          onboarding_completed: boolean | null
          service_area: string | null
          subscription_status: string | null
          subscription_tier: string | null
          team_size: number | null
          updated_at: string
        }
        Insert: {
          brand_colors?: Json | null
          created_at?: string
          id?: string
          industry?: string
          logo_url?: string | null
          name: string
          onboarding_completed?: boolean | null
          service_area?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          team_size?: number | null
          updated_at?: string
        }
        Update: {
          brand_colors?: Json | null
          created_at?: string
          id?: string
          industry?: string
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean | null
          service_area?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          team_size?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      qualification_rules: {
        Row: {
          created_at: string
          id: string
          min_budget: number | null
          min_motivation_score: number | null
          org_id: string
          ready_timeline: string | null
          require_pre_approval: boolean | null
          send_to_human_rules: Json | null
          updated_at: string
          warm_timeline: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          min_budget?: number | null
          min_motivation_score?: number | null
          org_id: string
          ready_timeline?: string | null
          require_pre_approval?: boolean | null
          send_to_human_rules?: Json | null
          updated_at?: string
          warm_timeline?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          min_budget?: number | null
          min_motivation_score?: number | null
          org_id?: string
          ready_timeline?: string | null
          require_pre_approval?: boolean | null
          send_to_human_rules?: Json | null
          updated_at?: string
          warm_timeline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qualification_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_reports: {
        Row: {
          created_at: string
          id: string
          metrics: Json
          org_id: string
          sent_at: string | null
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          metrics?: Json
          org_id: string
          sent_at?: string | null
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          metrics?: Json
          org_id?: string
          sent_at?: string | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_ids: { Args: { _user_id: string }; Returns: string[] }
      has_org_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      agent_status: "draft" | "published" | "paused" | "archived"
      app_role: "owner" | "admin" | "agent" | "viewer"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "completed"
        | "no_show"
        | "cancelled"
        | "rescheduled"
      lead_status:
        | "new"
        | "qualified"
        | "warm"
        | "nurture"
        | "ready"
        | "disqualified"
        | "sent_to_agent"
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
      agent_status: ["draft", "published", "paused", "archived"],
      app_role: ["owner", "admin", "agent", "viewer"],
      appointment_status: [
        "scheduled",
        "confirmed",
        "completed",
        "no_show",
        "cancelled",
        "rescheduled",
      ],
      lead_status: [
        "new",
        "qualified",
        "warm",
        "nurture",
        "ready",
        "disqualified",
        "sent_to_agent",
      ],
    },
  },
} as const
