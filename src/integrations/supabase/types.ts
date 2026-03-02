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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          article_body: string
          article_title: string
          id: string
          meta_description: string | null
          updated_at: string
        }
        Insert: {
          article_body?: string
          article_title?: string
          id?: string
          meta_description?: string | null
          updated_at?: string
        }
        Update: {
          article_body?: string
          article_title?: string
          id?: string
          meta_description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      about_gallery: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      admin_activity_log: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          record_id: string | null
          table_name: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          record_id?: string | null
          table_name?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          record_id?: string | null
          table_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          body: string
          created_at: string
          failed_count: number
          icon_name: string | null
          id: string
          image_url: string | null
          is_draft: boolean
          is_read: boolean
          redirect_url: string | null
          scheduled_at: string | null
          sent_count: number
          status: string
          target_type: string
          target_value: string | null
          title: string
        }
        Insert: {
          body?: string
          created_at?: string
          failed_count?: number
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_draft?: boolean
          is_read?: boolean
          redirect_url?: string | null
          scheduled_at?: string | null
          sent_count?: number
          status?: string
          target_type?: string
          target_value?: string | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          failed_count?: number
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_draft?: boolean
          is_read?: boolean
          redirect_url?: string | null
          scheduled_at?: string | null
          sent_count?: number
          status?: string
          target_type?: string
          target_value?: string | null
          title?: string
        }
        Relationships: []
      }
      advertisements: {
        Row: {
          click_count: number
          created_at: string
          description: string | null
          expire_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          click_count?: number
          created_at?: string
          description?: string | null
          expire_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          click_count?: number
          created_at?: string
          description?: string | null
          expire_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          text?: string
        }
        Relationships: []
      }
      blood_donors: {
        Row: {
          address: string | null
          blood_group: string
          created_at: string
          id: string
          is_approved: boolean
          is_available: boolean
          last_donation_date: string | null
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          blood_group: string
          created_at?: string
          id?: string
          is_approved?: boolean
          is_available?: boolean
          last_donation_date?: string | null
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          blood_group?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          is_available?: boolean
          last_donation_date?: string | null
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          category: string
          complaint_date: string
          created_at: string
          description: string | null
          id: string
          is_approved: boolean
          location: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          complaint_date?: string
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean
          location?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          complaint_date?: string
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean
          location?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      doctors: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_approved: boolean
          location: string | null
          name: string
          phone: string | null
          specialty: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_approved?: boolean
          location?: string | null
          name: string
          phone?: string | null
          specialty?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_approved?: boolean
          location?: string | null
          name?: string
          phone?: string | null
          specialty?: string
          updated_at?: string
        }
        Relationships: []
      }
      donation_methods: {
        Row: {
          account_number: string
          account_type: string
          created_at: string
          gradient_colors: string | null
          id: string
          is_active: boolean
          method_name: string
          sort_order: number
        }
        Insert: {
          account_number: string
          account_type: string
          created_at?: string
          gradient_colors?: string | null
          id?: string
          is_active?: boolean
          method_name: string
          sort_order?: number
        }
        Update: {
          account_number?: string
          account_type?: string
          created_at?: string
          gradient_colors?: string | null
          id?: string
          is_active?: boolean
          method_name?: string
          sort_order?: number
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          donor_name: string
          id: string
          message: string | null
          payment_method: string
          phone: string
          trx_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          donor_name: string
          id?: string
          message?: string | null
          payment_method: string
          phone: string
          trx_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          donor_name?: string
          id?: string
          message?: string | null
          payment_method?: string
          phone?: string
          trx_id?: string | null
        }
        Relationships: []
      }
      education_institutes: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          is_approved: boolean
          location: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_approved?: boolean
          location?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_approved?: boolean
          location?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      emergency_calls: {
        Row: {
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean
          name: string
          phone: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string
          created_at: string
          description: string | null
          event_date: string | null
          icon_name: string | null
          id: string
          is_approved: boolean
          location: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          icon_name?: string | null
          id?: string
          is_approved?: boolean
          location?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          icon_name?: string | null
          id?: string
          is_approved?: boolean
          location?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      expatriate_forums: {
        Row: {
          category: string
          country: string
          created_at: string
          description: string | null
          id: string
          is_approved: boolean
          location: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          country: string
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean
          location?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean
          location?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          category: string
          company: string
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          is_approved: boolean
          phone: string | null
          salary_range: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          company: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_approved?: boolean
          phone?: string | null
          salary_range?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          company?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_approved?: boolean
          phone?: string | null
          salary_range?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lost_found: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_approved: boolean
          item_date: string | null
          item_name: string
          location: string | null
          phone: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean
          item_date?: string | null
          item_name: string
          location?: string | null
          phone?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean
          item_date?: string | null
          item_name?: string
          location?: string | null
          phone?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketplace: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_approved: boolean
          location: string | null
          phone: string | null
          price: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean
          location?: string | null
          phone?: string | null
          price?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean
          location?: string | null
          phone?: string | null
          price?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          body: string
          created_at: string
          id: string
          is_active: boolean
          published_at: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          is_active?: boolean
          published_at?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_active?: boolean
          published_at?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      offices: {
        Row: {
          address: string | null
          category: string
          created_at: string
          description: string | null
          designation: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          sort_order: number
          updated_at: string
          visiting_hours: string | null
        }
        Insert: {
          address?: string | null
          category?: string
          created_at?: string
          description?: string | null
          designation?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          sort_order?: number
          updated_at?: string
          visiting_hours?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          created_at?: string
          description?: string | null
          designation?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          sort_order?: number
          updated_at?: string
          visiting_hours?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          page_path: string
          referrer: string | null
          user_agent: string | null
          visitor_ip: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page_path: string
          referrer?: string | null
          user_agent?: string | null
          visitor_ip?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
          visitor_ip?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          fcm_token: string
          id: string
          is_active: boolean
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          fcm_token: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          fcm_token?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          view_count: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          view_count?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          view_count?: number
        }
        Relationships: []
      }
      services: {
        Row: {
          address: string | null
          area: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          metadata: Json | null
          phone: string | null
          status: string
          submitted_by: string | null
          title: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          area?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          metadata?: Json | null
          phone?: string | null
          status?: string
          submitted_by?: string | null
          title: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          area?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          metadata?: Json | null
          phone?: string | null
          status?: string
          submitted_by?: string | null
          title?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          is_approved: boolean
          location: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_approved?: boolean
          location?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_approved?: boolean
          location?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      slider_items: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          created_at: string
          description: string | null
          id: string
          sort_order: number
          title: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deactivate_expired_ads: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_ad_click: { Args: { ad_id: string }; Returns: undefined }
      increment_category_view: { Args: { cat_id: string }; Returns: undefined }
      increment_news_view: { Args: { news_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
