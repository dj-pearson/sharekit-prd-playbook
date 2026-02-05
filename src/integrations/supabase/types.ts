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
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          page_id: string
          resource_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_id: string
          resource_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_id?: string
          resource_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          cta_text: string | null
          cta_url: string | null
          dismissible: boolean
          display_location: string
          ends_at: string | null
          id: string
          message: string
          starts_at: string
          target_audience: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          cta_text?: string | null
          cta_url?: string | null
          dismissible?: boolean
          display_location?: string
          ends_at?: string | null
          id?: string
          message: string
          starts_at?: string
          target_audience?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          cta_text?: string | null
          cta_url?: string | null
          dismissible?: boolean
          display_location?: string
          ends_at?: string | null
          id?: string
          message?: string
          starts_at?: string
          target_audience?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_domains: {
        Row: {
          created_at: string | null
          dns_verified_at: string | null
          domain: string
          id: string
          is_verified: boolean | null
          ssl_issued_at: string | null
          updated_at: string | null
          user_id: string
          verification_token: string
        }
        Insert: {
          created_at?: string | null
          dns_verified_at?: string | null
          domain: string
          id?: string
          is_verified?: boolean | null
          ssl_issued_at?: string | null
          updated_at?: string | null
          user_id: string
          verification_token: string
        }
        Update: {
          created_at?: string | null
          dns_verified_at?: string | null
          domain?: string
          id?: string
          is_verified?: boolean | null
          ssl_issued_at?: string | null
          updated_at?: string | null
          user_id?: string
          verification_token?: string
        }
        Relationships: []
      }
      email_captures: {
        Row: {
          captured_at: string
          download_count: number | null
          download_token: string | null
          email: string
          full_name: string | null
          id: string
          page_id: string
          token_expires_at: string | null
        }
        Insert: {
          captured_at?: string
          download_count?: number | null
          download_token?: string | null
          email: string
          full_name?: string | null
          id?: string
          page_id: string
          token_expires_at?: string | null
        }
        Update: {
          captured_at?: string
          download_count?: number | null
          download_token?: string | null
          email?: string
          full_name?: string | null
          id?: string
          page_id?: string
          token_expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_captures_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sent_logs: {
        Row: {
          email_capture_id: string
          error_message: string | null
          id: string
          sent_at: string
          sequence_id: string
          status: string
        }
        Insert: {
          email_capture_id: string
          error_message?: string | null
          id?: string
          sent_at?: string
          sequence_id: string
          status?: string
        }
        Update: {
          email_capture_id?: string
          error_message?: string | null
          id?: string
          sent_at?: string
          sequence_id?: string
          status?: string
        }
        Relationships: []
      }
      email_sequences: {
        Row: {
          body: string
          created_at: string
          delay_hours: number
          id: string
          is_active: boolean
          name: string
          page_id: string
          send_order: number
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          delay_hours?: number
          id?: string
          is_active?: boolean
          name: string
          page_id: string
          send_order?: number
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          delay_hours?: number
          id?: string
          is_active?: boolean
          name?: string
          page_id?: string
          send_order?: number
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      help_articles: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          helpful_count: number
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_id: string
          category: string
          content: string
          created_at?: string
          helpful_count?: number
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          helpful_count?: number
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      moderation_queue: {
        Row: {
          created_at: string
          id: string
          moderated_at: string | null
          moderator_id: string | null
          moderator_notes: string | null
          reason: string | null
          resource_id: string
          resource_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          moderated_at?: string | null
          moderator_id?: string | null
          moderator_notes?: string | null
          reason?: string | null
          resource_id: string
          resource_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          moderated_at?: string | null
          moderator_id?: string | null
          moderator_notes?: string | null
          reason?: string | null
          resource_id?: string
          resource_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      page_resources: {
        Row: {
          created_at: string
          display_order: number
          id: string
          page_id: string
          resource_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          page_id: string
          resource_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          page_id?: string
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_resources_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      page_variants: {
        Row: {
          created_at: string
          custom_css: string | null
          id: string
          is_active: boolean
          name: string
          page_id: string
          slug: string
          template: string
          traffic_percentage: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_css?: string | null
          id?: string
          is_active?: boolean
          name: string
          page_id: string
          slug: string
          template?: string
          traffic_percentage?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_css?: string | null
          id?: string
          is_active?: boolean
          name?: string
          page_id?: string
          slug?: string
          template?: string
          traffic_percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          created_at: string
          custom_css: string | null
          description: string | null
          id: string
          is_published: boolean
          slug: string
          team_id: string | null
          template: string
          title: string
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          created_at?: string
          custom_css?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          slug: string
          team_id?: string | null
          template?: string
          title: string
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          created_at?: string
          custom_css?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          slug?: string
          team_id?: string | null
          template?: string
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "pages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_user_id_fkey"
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
          created_at: string
          email: string
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_plan: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          team_id: string | null
          thumbnail_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          team_id?: string | null
          thumbnail_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          team_id?: string | null
          thumbnail_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      variant_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          variant_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          variant_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          variant_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          response_body: string | null
          status_code: number | null
          webhook_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          response_body?: string | null
          status_code?: number | null
          webhook_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          response_body?: string | null
          status_code?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          events: string[]
          id: string
          is_active: boolean
          name: string
          secret: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          name: string
          secret?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          name?: string
          secret?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          role: string
          permissions: Json
          last_login_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          permissions?: Json
          last_login_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          permissions?: Json
          last_login_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_activity_log: {
        Row: {
          id: string
          admin_id: string
          action: string
          resource_type: string
          resource_id: string | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          resource_type: string
          resource_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          resource_type?: string
          resource_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          id: string
          ticket_number: string
          user_id: string | null
          assigned_to: string | null
          subject: string
          description: string
          status: string
          priority: string
          category: string | null
          tags: string[] | null
          metadata: Json | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_number?: string
          user_id?: string | null
          assigned_to?: string | null
          subject: string
          description: string
          status?: string
          priority?: string
          category?: string | null
          tags?: string[] | null
          metadata?: Json | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_number?: string
          user_id?: string | null
          assigned_to?: string | null
          subject?: string
          description?: string
          status?: string
          priority?: string
          category?: string | null
          tags?: string[] | null
          metadata?: Json | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          id: string
          ticket_id: string
          sender_id: string
          is_admin: boolean
          is_internal: boolean
          message: string
          attachments: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          sender_id: string
          is_admin?: boolean
          is_internal?: boolean
          message: string
          attachments?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          sender_id?: string
          is_admin?: boolean
          is_internal?: boolean
          message?: string
          attachments?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          id: string
          name: string
          key: string
          description: string | null
          enabled: boolean
          rollout_type: string
          rollout_percentage: number | null
          rollout_user_ids: string[] | null
          rollout_plans: string[] | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          key: string
          description?: string | null
          enabled?: boolean
          rollout_type?: string
          rollout_percentage?: number | null
          rollout_user_ids?: string[] | null
          rollout_plans?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          key?: string
          description?: string | null
          enabled?: boolean
          rollout_type?: string
          rollout_percentage?: number | null
          rollout_user_ids?: string[] | null
          rollout_plans?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_value: number
          dimensions: Json | null
          timestamp: string
        }
        Insert: {
          id?: string
          metric_name: string
          metric_value: number
          dimensions?: Json | null
          timestamp?: string
        }
        Update: {
          id?: string
          metric_name?: string
          metric_value?: number
          dimensions?: Json | null
          timestamp?: string
        }
        Relationships: []
      }
      canned_responses: {
        Row: {
          id: string
          title: string
          category: string
          shortcut: string
          content: string
          variables: string[] | null
          usage_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          category: string
          shortcut: string
          content: string
          variables?: string[] | null
          usage_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string
          shortcut?: string
          content?: string
          variables?: string[] | null
          usage_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "canned_responses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_download_count: {
        Args: { capture_id: string }
        Returns: undefined
      }
      is_team_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_username_available: {
        Args: { check_username: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      team_role: "owner" | "admin" | "member"
      admin_role: "super_admin" | "admin" | "support_manager" | "content_manager" | "read_only"
      ticket_status: "open" | "in_progress" | "waiting" | "resolved" | "closed"
      ticket_priority: "low" | "normal" | "high" | "urgent"
      ticket_category: "billing" | "technical" | "feature" | "bug" | "account" | "other"
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
      app_role: ["admin", "user"],
      team_role: ["owner", "admin", "member"],
      admin_role: ["super_admin", "admin", "support_manager", "content_manager", "read_only"],
      ticket_status: ["open", "in_progress", "waiting", "resolved", "closed"],
      ticket_priority: ["low", "normal", "high", "urgent"],
      ticket_category: ["billing", "technical", "feature", "bug", "account", "other"],
    },
  },
} as const
