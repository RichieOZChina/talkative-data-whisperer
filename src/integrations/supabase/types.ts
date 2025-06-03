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
      analyses: {
        Row: {
          analysis_type: string
          completed_at: string | null
          created_at: string
          dataset_id: string
          error_message: string | null
          id: string
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          analysis_type: string
          completed_at?: string | null
          created_at?: string
          dataset_id: string
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          analysis_type?: string
          completed_at?: string | null
          created_at?: string
          dataset_id?: string
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyses_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_results: {
        Row: {
          analysis_id: string
          confidence_score: number | null
          content: Json
          created_at: string
          id: string
          insights: string[] | null
          result_type: string
          title: string
        }
        Insert: {
          analysis_id: string
          confidence_score?: number | null
          content: Json
          created_at?: string
          id?: string
          insights?: string[] | null
          result_type: string
          title: string
        }
        Update: {
          analysis_id?: string
          confidence_score?: number | null
          content?: Json
          created_at?: string
          id?: string
          insights?: string[] | null
          result_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_suggestions: {
        Row: {
          analysis_id: string | null
          analysis_type: string
          complexity_level: string | null
          created_at: string
          dataset_id: string
          description: string
          estimated_time_minutes: number | null
          id: string
          metadata: Json | null
          required_columns: string[] | null
          suggested_prompt: string | null
          title: string
          updated_at: string
        }
        Insert: {
          analysis_id?: string | null
          analysis_type: string
          complexity_level?: string | null
          created_at?: string
          dataset_id: string
          description: string
          estimated_time_minutes?: number | null
          id?: string
          metadata?: Json | null
          required_columns?: string[] | null
          suggested_prompt?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          analysis_id?: string | null
          analysis_type?: string
          complexity_level?: string | null
          created_at?: string
          dataset_id?: string
          description?: string
          estimated_time_minutes?: number | null
          id?: string
          metadata?: Json | null
          required_columns?: string[] | null
          suggested_prompt?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_suggestions_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_suggestions_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      dataset_columns: {
        Row: {
          column_index: number
          column_name: string
          column_type: string
          created_at: string
          data_type_detected: string | null
          dataset_id: string
          id: string
          max_value: string | null
          mean_value: number | null
          min_value: string | null
          null_count: number | null
          sample_values: Json | null
          std_dev: number | null
          unique_count: number | null
        }
        Insert: {
          column_index: number
          column_name: string
          column_type: string
          created_at?: string
          data_type_detected?: string | null
          dataset_id: string
          id?: string
          max_value?: string | null
          mean_value?: number | null
          min_value?: string | null
          null_count?: number | null
          sample_values?: Json | null
          std_dev?: number | null
          unique_count?: number | null
        }
        Update: {
          column_index?: number
          column_name?: string
          column_type?: string
          created_at?: string
          data_type_detected?: string | null
          dataset_id?: string
          id?: string
          max_value?: string | null
          mean_value?: number | null
          min_value?: string | null
          null_count?: number | null
          sample_values?: Json | null
          std_dev?: number | null
          unique_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dataset_columns_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      dataset_schemas: {
        Row: {
          column_analysis: Json
          created_at: string
          dataset_id: string
          generated_sql: string
          id: string
          updated_at: string
        }
        Insert: {
          column_analysis: Json
          created_at?: string
          dataset_id: string
          generated_sql: string
          id?: string
          updated_at?: string
        }
        Update: {
          column_analysis?: Json
          created_at?: string
          dataset_id?: string
          generated_sql?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dataset_schemas_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      datasets: {
        Row: {
          basic_metadata: Json | null
          column_count: number | null
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          metadata_extracted_at: string | null
          name: string
          row_count: number | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          basic_metadata?: Json | null
          column_count?: number | null
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          metadata_extracted_at?: string | null
          name: string
          row_count?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          basic_metadata?: Json | null
          column_count?: number | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          metadata_extracted_at?: string | null
          name?: string
          row_count?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      models: {
        Row: {
          context_length: number | null
          cost_per_input_token: number | null
          cost_per_output_token: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          model_id: string
          name: string
          provider: string
          supports_streaming: boolean | null
          updated_at: string
        }
        Insert: {
          context_length?: number | null
          cost_per_input_token?: number | null
          cost_per_output_token?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model_id: string
          name: string
          provider: string
          supports_streaming?: boolean | null
          updated_at?: string
        }
        Update: {
          context_length?: number | null
          cost_per_input_token?: number | null
          cost_per_output_token?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model_id?: string
          name?: string
          provider?: string
          supports_streaming?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompts: {
        Row: {
          analysis_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          prompt_text: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          analysis_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          prompt_text: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          analysis_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          prompt_text?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
