export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          ai_provider: string | null
          api_cost_usd: number | null
          clauses: Json | null
          contract_parties: Json | null
          contract_type: string | null
          created_at: string | null
          extracted_text: string | null
          file_path: string
          file_size_bytes: number
          file_type: string
          id: string
          improvements: Json | null
          input_tokens: number | null
          missing_clauses: Json | null
          original_filename: string
          output_tokens: number | null
          overall_risk_level: Database["public"]["Enums"]["risk_level"] | null
          overall_risk_score: number | null
          page_count: number | null
          processing_started_at: string | null
          status: Database["public"]["Enums"]["analysis_status"] | null
          summary: string | null
          user_id: string
        }
        Insert: {
          ai_provider?: string | null
          api_cost_usd?: number | null
          clauses?: Json | null
          contract_parties?: Json | null
          contract_type?: string | null
          created_at?: string | null
          extracted_text?: string | null
          file_path: string
          file_size_bytes: number
          file_type: string
          id?: string
          improvements?: Json | null
          input_tokens?: number | null
          missing_clauses?: Json | null
          original_filename: string
          output_tokens?: number | null
          overall_risk_level?: Database["public"]["Enums"]["risk_level"] | null
          overall_risk_score?: number | null
          page_count?: number | null
          processing_started_at?: string | null
          status?: Database["public"]["Enums"]["analysis_status"] | null
          summary?: string | null
          user_id: string
        }
        Update: {
          ai_provider?: string | null
          api_cost_usd?: number | null
          clauses?: Json | null
          contract_parties?: Json | null
          contract_type?: string | null
          created_at?: string | null
          extracted_text?: string | null
          file_path?: string
          file_size_bytes?: number
          file_type?: string
          id?: string
          improvements?: Json | null
          input_tokens?: number | null
          missing_clauses?: Json | null
          original_filename?: string
          output_tokens?: number | null
          overall_risk_level?: Database["public"]["Enums"]["risk_level"] | null
          overall_risk_score?: number | null
          page_count?: number | null
          processing_started_at?: string | null
          status?: Database["public"]["Enums"]["analysis_status"] | null
          summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_logs: {
        Row: {
          analysis_id: string | null
          consent_type: string
          consent_version: string
          consented_at: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          consent_type: string
          consent_version: string
          consented_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          consent_type?: string
          consent_version?: string
          consented_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_logs_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          analysis_id: string
          approved_at: string | null
          created_at: string | null
          id: string
          method: string | null
          order_id: string
          payment_key: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          toss_response: Json | null
          user_id: string
        }
        Insert: {
          amount: number
          analysis_id: string
          approved_at?: string | null
          created_at?: string | null
          id?: string
          method?: string | null
          order_id: string
          payment_key?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          toss_response?: Json | null
          user_id: string
        }
        Update: {
          amount?: number
          analysis_id?: string
          approved_at?: string | null
          created_at?: string | null
          id?: string
          method?: string | null
          order_id?: string
          payment_key?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          toss_response?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          free_analyses_remaining: number | null
          id: string
          provider: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          free_analyses_remaining?: number | null
          id: string
          provider?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          free_analyses_remaining?: number | null
          id?: string
          provider?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_free_analyses: { Args: { uid: string }; Returns: undefined }
    }
    Enums: {
      analysis_status:
        | "pending_payment"
        | "paid"
        | "processing"
        | "completed"
        | "failed"
      payment_status:
        | "ready"
        | "in_progress"
        | "done"
        | "canceled"
        | "failed"
        | "refunded"
      risk_level: "high" | "medium" | "low"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      analysis_status: [
        "pending_payment",
        "paid",
        "processing",
        "completed",
        "failed",
      ],
      payment_status: [
        "ready",
        "in_progress",
        "done",
        "canceled",
        "failed",
        "refunded",
      ],
      risk_level: ["high", "medium", "low"],
    },
  },
} as const

