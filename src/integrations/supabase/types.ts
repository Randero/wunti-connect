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
      campaign_gallery: {
        Row: {
          campaign_id: string | null
          caption: string | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_gallery_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: unknown | null
          message: string
          name: string
          phone: string | null
          status: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: unknown | null
          message: string
          name: string
          phone?: string | null
          status?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown | null
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limit_contact: {
        Row: {
          ip_address: unknown
          last_submission: string | null
          reset_time: string | null
          submission_count: number | null
        }
        Insert: {
          ip_address: unknown
          last_submission?: string | null
          reset_time?: string | null
          submission_count?: number | null
        }
        Update: {
          ip_address?: unknown
          last_submission?: string | null
          reset_time?: string | null
          submission_count?: number | null
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          created_at: string
          earnings_this_month: number
          earnings_this_week: number
          earnings_today: number
          id: string
          last_post_time: string | null
          last_visit_at: string | null
          next_eligible_post_time: string | null
          posts_this_month: number
          posts_this_week: number
          posts_today: number
          total_earnings: number
          total_posts: number
          total_visits: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          earnings_this_month?: number
          earnings_this_week?: number
          earnings_today?: number
          id?: string
          last_post_time?: string | null
          last_visit_at?: string | null
          next_eligible_post_time?: string | null
          posts_this_month?: number
          posts_this_week?: number
          posts_today?: number
          total_earnings?: number
          total_posts?: number
          total_visits?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          earnings_this_month?: number
          earnings_this_week?: number
          earnings_today?: number
          id?: string
          last_post_time?: string | null
          last_visit_at?: string | null
          next_eligible_post_time?: string | null
          posts_this_month?: number
          posts_this_week?: number
          posts_today?: number
          total_earnings?: number
          total_posts?: number
          total_visits?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_levels: {
        Row: {
          created_at: string
          current_level: number
          experience_points: number
          id: string
          next_level_threshold: number
          total_earnings: number
          total_posts: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          experience_points?: number
          id?: string
          next_level_threshold?: number
          total_earnings?: number
          total_posts?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          experience_points?: number
          id?: string
          next_level_threshold?: number
          total_earnings?: number
          total_posts?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_posts: {
        Row: {
          created_at: string
          earnings: number | null
          id: string
          last_post_date: string | null
          post_url: string
          reward_type: string
          selected_images: string[]
          social_platform: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          earnings?: number | null
          id?: string
          last_post_date?: string | null
          post_url: string
          reward_type: string
          selected_images: string[]
          social_platform: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          earnings?: number | null
          id?: string
          last_post_date?: string | null
          post_url?: string
          reward_type?: string
          selected_images?: string[]
          social_platform?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_user_level: {
        Args: { user_id: string }
        Returns: number
      }
      can_user_post: {
        Args: { user_id: string }
        Returns: boolean
      }
      check_contact_rate_limit: {
        Args: { client_ip: unknown }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_or_manager: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_valid_email: {
        Args: { email: string }
        Returns: boolean
      }
      is_valid_post_url: {
        Args: { url: string; platform: string }
        Returns: boolean
      }
      request_password_reset: {
        Args: { user_email: string }
        Returns: Json
      }
      sanitize_html: {
        Args: { input_text: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
