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
      Events: {
        Row: {
          category: string | null
          description: string | null
          event_date: string
          event_id: number
          image: string | null
          organizer_name: string | null
          title: string
          venue_id: number | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          event_date: string
          event_id?: number
          image?: string | null
          organizer_name?: string | null
          title: string
          venue_id?: number | null
        }
        Update: {
          category?: string | null
          description?: string | null
          event_date?: string
          event_id?: number
          image?: string | null
          organizer_name?: string | null
          title?: string
          venue_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "Venues"
            referencedColumns: ["venue_id"]
          },
        ]
      }
      EventSectorPricing: {
        Row: {
          available_tickets: number
          event_id: number
          price: number
          pricing_id: number
          sector_id: number
        }
        Insert: {
          available_tickets: number
          event_id: number
          price: number
          pricing_id?: number
          sector_id: number
        }
        Update: {
          available_tickets?: number
          event_id?: number
          price?: number
          pricing_id?: number
          sector_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "EventSectorPricing_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "Events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "EventSectorPricing_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "Sectors"
            referencedColumns: ["sector_id"]
          },
        ]
      }
      Notifications: {
        Row: {
          created_at: string | null
          is_read: boolean | null
          message: string
          notification_id: number
          type: string | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          is_read?: boolean | null
          message: string
          notification_id?: number
          type?: string | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          is_read?: boolean | null
          message?: string
          notification_id?: number
          type?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ResaleListings: {
        Row: {
          created_at: string | null
          expires_at: string | null
          original_price: number | null
          resale_id: number
          resale_price: number | null
          resale_status: string | null
          sold_at: string | null
          ticket_id: number | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          original_price?: number | null
          resale_id?: number
          resale_price?: number | null
          resale_status?: string | null
          sold_at?: string | null
          ticket_id?: number | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          original_price?: number | null
          resale_id?: number
          resale_price?: number | null
          resale_status?: string | null
          sold_at?: string | null
          ticket_id?: number | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ResaleListings_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "Tickets"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "ResaleListings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      Sectors: {
        Row: {
          capacity: number
          description: string | null
          sector_id: number
          sector_name: string
          venue_id: number
        }
        Insert: {
          capacity: number
          description?: string | null
          sector_id?: number
          sector_name: string
          venue_id: number
        }
        Update: {
          capacity?: number
          description?: string | null
          sector_id?: number
          sector_name?: string
          venue_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "Sectors_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "Venues"
            referencedColumns: ["venue_id"]
          },
        ]
      }
      SystemLogs: {
        Row: {
          action_type: string | null
          description: string | null
          log_id: number
          timestamp: string | null
          user_id: number | null
        }
        Insert: {
          action_type?: string | null
          description?: string | null
          log_id?: number
          timestamp?: string | null
          user_id?: number | null
        }
        Update: {
          action_type?: string | null
          description?: string | null
          log_id?: number
          timestamp?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "SystemLogs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      Tickets: {
        Row: {
          event_id: number | null
          owner_id: number | null
          seat_info: string | null
          sector_id: number | null
          status: string | null
          ticket_id: number
          ticket_type: string | null
        }
        Insert: {
          event_id?: number | null
          owner_id?: number | null
          seat_info?: string | null
          sector_id?: number | null
          status?: string | null
          ticket_id?: number
          ticket_type?: string | null
        }
        Update: {
          event_id?: number | null
          owner_id?: number | null
          seat_info?: string | null
          sector_id?: number | null
          status?: string | null
          ticket_id?: number
          ticket_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "Events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "Tickets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "Tickets_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "Sectors"
            referencedColumns: ["sector_id"]
          },
        ]
      }
      Transactions: {
        Row: {
          buyer_id: number | null
          is_resale: boolean | null
          payment_method: string | null
          payment_status: string | null
          platform_fee: number | null
          resale_listing_id: number | null
          seller_id: number | null
          ticket_id: number | null
          total_amount: number | null
          transaction_id: number
          transaction_time: string | null
        }
        Insert: {
          buyer_id?: number | null
          is_resale?: boolean | null
          payment_method?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          resale_listing_id?: number | null
          seller_id?: number | null
          ticket_id?: number | null
          total_amount?: number | null
          transaction_id?: number
          transaction_time?: string | null
        }
        Update: {
          buyer_id?: number | null
          is_resale?: boolean | null
          payment_method?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          resale_listing_id?: number | null
          seller_id?: number | null
          ticket_id?: number | null
          total_amount?: number | null
          transaction_id?: number
          transaction_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "Transactions_resale_listing_id_fkey"
            columns: ["resale_listing_id"]
            isOneToOne: false
            referencedRelation: "ResaleListings"
            referencedColumns: ["resale_id"]
          },
          {
            foreignKeyName: "Transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "Transactions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "Tickets"
            referencedColumns: ["ticket_id"]
          },
        ]
      }
      Users: {
        Row: {
          auth_uid: string | null
          created_at: string | null
          email: string
          full_name: string | null
          is_verified: boolean | null
          password_hash: string
          phone_number: string | null
          role: string | null
          user_id: number
          username: string
        }
        Insert: {
          auth_uid?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          is_verified?: boolean | null
          password_hash: string
          phone_number?: string | null
          role?: string | null
          user_id?: number
          username: string
        }
        Update: {
          auth_uid?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          is_verified?: boolean | null
          password_hash?: string
          phone_number?: string | null
          role?: string | null
          user_id?: number
          username?: string
        }
        Relationships: []
      }
      Venues: {
        Row: {
          capacity: number | null
          description: string | null
          location: string | null
          name: string
          venue_id: number
        }
        Insert: {
          capacity?: number | null
          description?: string | null
          location?: string | null
          name: string
          venue_id?: number
        }
        Update: {
          capacity?: number | null
          description?: string | null
          location?: string | null
          name?: string
          venue_id?: number
        }
        Relationships: []
      }
      Verifications: {
        Row: {
          doc_path: string | null
          doc_type: string | null
          status: string | null
          user_id: number | null
          verification_id: number
        }
        Insert: {
          doc_path?: string | null
          doc_type?: string | null
          status?: string | null
          user_id?: number | null
          verification_id?: number
        }
        Update: {
          doc_path?: string | null
          doc_type?: string | null
          status?: string | null
          user_id?: number | null
          verification_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "Verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["user_id"]
          },
        ]
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
