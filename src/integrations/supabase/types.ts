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
      admin_profiles: {
        Row: {
          created_at: string
          gender: string
          id: string
          name: string
          photo: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          gender: string
          id?: string
          name: string
          photo: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          gender?: string
          id?: string
          name?: string
          photo?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          is_active: boolean
          notification_type: string | null
          priority: string
          related_publication: string | null
          sent_to_all: boolean | null
          specific_companies: string[] | null
          start_date: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          notification_type?: string | null
          priority: string
          related_publication?: string | null
          sent_to_all?: boolean | null
          specific_companies?: string[] | null
          start_date: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          notification_type?: string | null
          priority?: string
          related_publication?: string | null
          sent_to_all?: boolean | null
          specific_companies?: string[] | null
          start_date?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_related_publication_fkey"
            columns: ["related_publication"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          start_date: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          start_date: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          start_date?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          id: string
          logo: string | null
          name: string
          participant_types: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo?: string | null
          name: string
          participant_types?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo?: string | null
          name?: string
          participant_types?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      completed_psalms: {
        Row: {
          completed_at: string | null
          created_at: string | null
          day: number
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          day: number
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          day?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      content_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      contents: {
        Row: {
          arquivos: Json | null
          canais: string[]
          copy: string | null
          created_at: string
          created_by: string | null
          data_criacao: string
          data_publicacao: string
          formato: string
          id: string
          projeto: string
          responsavel: string
          status: string
          titulo: string
          updated_at: string
          updated_by: string | null
          url: string | null
        }
        Insert: {
          arquivos?: Json | null
          canais?: string[]
          copy?: string | null
          created_at?: string
          created_by?: string | null
          data_criacao: string
          data_publicacao: string
          formato: string
          id?: string
          projeto: string
          responsavel: string
          status?: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
          url?: string | null
        }
        Update: {
          arquivos?: Json | null
          canais?: string[]
          copy?: string | null
          created_at?: string
          created_by?: string | null
          data_criacao?: string
          data_publicacao?: string
          formato?: string
          id?: string
          projeto?: string
          responsavel?: string
          status?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
          url?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string | null
          created_at: string | null
          day: number
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          day: number
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          day?: number
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          last_update: string
          name: string
          reference_material: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          last_update?: string
          name: string
          reference_material?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          last_update?: string
          name?: string
          reference_material?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          company_id: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          company_id?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          role: string
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          company_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      publication_boards: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          notes: string | null
          priority: string
          publication_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          priority: string
          publication_id: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          priority?: string
          publication_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "publication_boards_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      publication_tags: {
        Row: {
          publication_id: string
          tag_id: string
        }
        Insert: {
          publication_id: string
          tag_id: string
        }
        Update: {
          publication_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "publication_tags_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          billing_line: string | null
          brand: string
          bulletin_version: string | null
          category_id: string | null
          classification: string | null
          continuity: boolean | null
          cost: number | null
          created_at: string
          created_by: string | null
          custom_region: string | null
          effective_date: string
          executive_summary: string | null
          financial_impact: boolean | null
          fine: number | null
          id: string
          impact: string
          impact_category: string | null
          impact_type: string | null
          impacted_product: string | null
          impacted_roles: string[] | null
          impacted_system: string | null
          is_featured: boolean
          is_priority: boolean
          is_public_consultation: boolean | null
          is_release: boolean | null
          keywords: string[] | null
          pdf_url: string
          publication_date: string
          recommended_actions: string | null
          reference_number: string | null
          region: string | null
          release_version: string | null
          response_deadline: string | null
          risk_classification: string | null
          risk_description: string | null
          status: string
          summary: string
          support_materials: Json | null
          title: string
          update_date: string | null
          updated_at: string
          updated_by: string | null
          urgency: string | null
          visible_to: string
          visible_to_companies: string[] | null
        }
        Insert: {
          billing_line?: string | null
          brand: string
          bulletin_version?: string | null
          category_id?: string | null
          classification?: string | null
          continuity?: boolean | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          custom_region?: string | null
          effective_date: string
          executive_summary?: string | null
          financial_impact?: boolean | null
          fine?: number | null
          id?: string
          impact: string
          impact_category?: string | null
          impact_type?: string | null
          impacted_product?: string | null
          impacted_roles?: string[] | null
          impacted_system?: string | null
          is_featured?: boolean
          is_priority?: boolean
          is_public_consultation?: boolean | null
          is_release?: boolean | null
          keywords?: string[] | null
          pdf_url: string
          publication_date: string
          recommended_actions?: string | null
          reference_number?: string | null
          region?: string | null
          release_version?: string | null
          response_deadline?: string | null
          risk_classification?: string | null
          risk_description?: string | null
          status?: string
          summary: string
          support_materials?: Json | null
          title: string
          update_date?: string | null
          updated_at?: string
          updated_by?: string | null
          urgency?: string | null
          visible_to?: string
          visible_to_companies?: string[] | null
        }
        Update: {
          billing_line?: string | null
          brand?: string
          bulletin_version?: string | null
          category_id?: string | null
          classification?: string | null
          continuity?: boolean | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          custom_region?: string | null
          effective_date?: string
          executive_summary?: string | null
          financial_impact?: boolean | null
          fine?: number | null
          id?: string
          impact?: string
          impact_category?: string | null
          impact_type?: string | null
          impacted_product?: string | null
          impacted_roles?: string[] | null
          impacted_system?: string | null
          is_featured?: boolean
          is_priority?: boolean
          is_public_consultation?: boolean | null
          is_release?: boolean | null
          keywords?: string[] | null
          pdf_url?: string
          publication_date?: string
          recommended_actions?: string | null
          reference_number?: string | null
          region?: string | null
          release_version?: string | null
          response_deadline?: string | null
          risk_classification?: string | null
          risk_description?: string | null
          status?: string
          summary?: string
          support_materials?: Json | null
          title?: string
          update_date?: string | null
          updated_at?: string
          updated_by?: string | null
          urgency?: string | null
          visible_to?: string
          visible_to_companies?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "publications_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      report_publications: {
        Row: {
          publication_id: string
          report_id: string
        }
        Insert: {
          publication_id: string
          report_id: string
        }
        Update: {
          publication_id?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_publications_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_publications_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          pdf_url: string | null
          publish_date: string
          updated_at: string
          updated_by: string | null
          zip_url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          pdf_url?: string | null
          publish_date: string
          updated_at?: string
          updated_by?: string | null
          zip_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          pdf_url?: string | null
          publish_date?: string
          updated_at?: string
          updated_by?: string | null
          zip_url?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          publication_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          publication_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          publication_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      video_analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          node_id: string | null
          project_id: string
          user_session: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          node_id?: string | null
          project_id: string
          user_session: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          node_id?: string | null
          project_id?: string
          user_session?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_analytics_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "video_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_analytics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "video_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      video_connections: {
        Row: {
          conditions: Json | null
          created_at: string
          id: string
          project_id: string
          source_node_id: string
          target_node_id: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          id?: string
          project_id: string
          source_node_id: string
          target_node_id: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          id?: string
          project_id?: string
          source_node_id?: string
          target_node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_connections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "video_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_connections_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "video_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_connections_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "video_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      video_nodes: {
        Row: {
          created_at: string
          height: number | null
          id: string
          node_type: string
          position_x: number
          position_y: number
          project_id: string
          settings: Json | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
          width: number | null
        }
        Insert: {
          created_at?: string
          height?: number | null
          id?: string
          node_type: string
          position_x?: number
          position_y?: number
          project_id: string
          settings?: Json | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string
          height?: number | null
          id?: string
          node_type?: string
          position_x?: number
          position_y?: number
          project_id?: string
          settings?: Json | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_nodes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "video_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      video_projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          thumbnail_url?: string | null
          title?: string
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
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
