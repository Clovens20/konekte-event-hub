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
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          password_hash: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          password_hash: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          password_hash?: string
        }
        Relationships: []
      }
      benefits: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          ordre: number
          titre: string
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string
          id?: string
          ordre?: number
          titre: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          ordre?: number
          titre?: string
        }
        Relationships: []
      }
      footer_config: {
        Row: {
          adresse: string
          copyright: string
          email: string
          facebook: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          telephone: string
          updated_at: string
        }
        Insert: {
          adresse?: string
          copyright?: string
          email?: string
          facebook?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          telephone?: string
          updated_at?: string
        }
        Update: {
          adresse?: string
          copyright?: string
          email?: string
          facebook?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          telephone?: string
          updated_at?: string
        }
        Relationships: []
      }
      inscriptions: {
        Row: {
          code_promo: string | null
          created_at: string
          email: string
          id: string
          montant_paye: number
          motivation: string | null
          niveau_experience: Database["public"]["Enums"]["experience_level"]
          nom_complet: string
          pourcentage_paye: Database["public"]["Enums"]["payment_percentage"]
          statut: Database["public"]["Enums"]["inscription_status"]
          telephone: string
          transaction_id: string | null
        }
        Insert: {
          code_promo?: string | null
          created_at?: string
          email: string
          id?: string
          montant_paye: number
          motivation?: string | null
          niveau_experience: Database["public"]["Enums"]["experience_level"]
          nom_complet: string
          pourcentage_paye: Database["public"]["Enums"]["payment_percentage"]
          statut?: Database["public"]["Enums"]["inscription_status"]
          telephone: string
          transaction_id?: string | null
        }
        Update: {
          code_promo?: string | null
          created_at?: string
          email?: string
          id?: string
          montant_paye?: number
          motivation?: string | null
          niveau_experience?: Database["public"]["Enums"]["experience_level"]
          nom_complet?: string
          pourcentage_paye?: Database["public"]["Enums"]["payment_percentage"]
          statut?: Database["public"]["Enums"]["inscription_status"]
          telephone?: string
          transaction_id?: string | null
        }
        Relationships: []
      }
      program_modules: {
        Row: {
          created_at: string
          description: string
          id: string
          jour: number
          ordre: number
          titre: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          jour: number
          ordre?: number
          titre: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          jour?: number
          ordre?: number
          titre?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          actif: boolean
          code: string
          created_at: string
          date_expiration: string | null
          id: string
          type: Database["public"]["Enums"]["promo_type"]
          utilisations_actuelles: number
          utilisations_max: number | null
          valeur: number
        }
        Insert: {
          actif?: boolean
          code: string
          created_at?: string
          date_expiration?: string | null
          id?: string
          type?: Database["public"]["Enums"]["promo_type"]
          utilisations_actuelles?: number
          utilisations_max?: number | null
          valeur: number
        }
        Update: {
          actif?: boolean
          code?: string
          created_at?: string
          date_expiration?: string | null
          id?: string
          type?: Database["public"]["Enums"]["promo_type"]
          utilisations_actuelles?: number
          utilisations_max?: number | null
          valeur?: number
        }
        Relationships: []
      }
      seminar_info: {
        Row: {
          created_at: string
          date_debut: string
          date_fin: string
          description: string
          id: string
          lieu: string
          nombre_places_total: number
          organisateur: string
          prix_base: number
          titre: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_debut?: string
          date_fin?: string
          description?: string
          id?: string
          lieu?: string
          nombre_places_total?: number
          organisateur?: string
          prix_base?: number
          titre?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_debut?: string
          date_fin?: string
          description?: string
          id?: string
          lieu?: string
          nombre_places_total?: number
          organisateur?: string
          prix_base?: number
          titre?: string
          updated_at?: string
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
      get_inscription_count: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_promo_usage: {
        Args: { promo_code: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin"
      experience_level: "Débutant" | "Intermédiaire" | "Avancé"
      inscription_status: "Confirmé" | "En attente" | "Annulé"
      payment_percentage: "25" | "50" | "100"
      promo_type: "percentage" | "fixed"
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
      app_role: ["admin"],
      experience_level: ["Débutant", "Intermédiaire", "Avancé"],
      inscription_status: ["Confirmé", "En attente", "Annulé"],
      payment_percentage: ["25", "50", "100"],
      promo_type: ["percentage", "fixed"],
    },
  },
} as const
