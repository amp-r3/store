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
    PostgrestVersion: "14.5"
  }
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
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          quantity: number
          size_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          quantity: number
          size_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          quantity?: number
          size_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "product_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      delivery_methods: {
        Row: {
          code: Database["public"]["Enums"]["delivery_method_type"]
          estimated_time: string | null
          free_from_price: number | null
          id: string
          is_active: boolean
          name: string
          price: number
        }
        Insert: {
          code: Database["public"]["Enums"]["delivery_method_type"]
          estimated_time?: string | null
          free_from_price?: number | null
          id?: string
          is_active?: boolean
          name: string
          price?: number
        }
        Update: {
          code?: Database["public"]["Enums"]["delivery_method_type"]
          estimated_time?: string | null
          free_from_price?: number | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_path: string | null
          body: string | null
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          entity_id: string | null
          id: string
          is_read: boolean
          level: Database["public"]["Enums"]["notification_level"]
          title: string
          user_id: string
        }
        Insert: {
          action_path?: string | null
          body?: string | null
          category: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          entity_id?: string | null
          id?: string
          is_read?: boolean
          level?: Database["public"]["Enums"]["notification_level"]
          title: string
          user_id: string
        }
        Update: {
          action_path?: string | null
          body?: string | null
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          entity_id?: string | null
          id?: string
          is_read?: boolean
          level?: Database["public"]["Enums"]["notification_level"]
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_at_purchase: number
          product_id: number
          quantity: number
          size_id: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price_at_purchase: number
          product_id: number
          quantity: number
          size_id: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_at_purchase?: number
          product_id?: number
          quantity?: number
          size_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "product_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_cost: number
          delivery_method_id: string
          delivery_status: Database["public"]["Enums"]["delivery_status"]
          id: string
          order_number: string | null
          payment_fee: number
          payment_method_id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          shipping_address: Json
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_cost?: number
          delivery_method_id: string
          delivery_status?: Database["public"]["Enums"]["delivery_status"]
          id?: string
          order_number?: string | null
          payment_fee?: number
          payment_method_id: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_address: Json
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_cost?: number
          delivery_method_id?: string
          delivery_status?: Database["public"]["Enums"]["delivery_status"]
          id?: string
          order_number?: string | null
          payment_fee?: number
          payment_method_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipping_address?: Json
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_delivery_method_id_fkey"
            columns: ["delivery_method_id"]
            isOneToOne: false
            referencedRelation: "delivery_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          code: Database["public"]["Enums"]["payment_method_type"]
          created_at: string
          fee_fixed: number
          fee_percentage: number
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: Database["public"]["Enums"]["payment_method_type"]
          created_at?: string
          fee_fixed?: number
          fee_percentage?: number
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: Database["public"]["Enums"]["payment_method_type"]
          created_at?: string
          fee_fixed?: number
          fee_percentage?: number
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          comment: string | null
          date: string
          helpful_count: number
          id: number
          is_edited: boolean
          is_verified: boolean
          product_id: number
          rating: number
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          date?: string
          helpful_count?: number
          id?: number
          is_edited?: boolean
          is_verified?: boolean
          product_id: number
          rating: number
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          date?: string
          helpful_count?: number
          id?: number
          is_edited?: boolean
          is_verified?: boolean
          product_id?: number
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sizes: {
        Row: {
          id: number
          product_id: number | null
          stock: number
          value: string
        }
        Insert: {
          id?: number
          product_id?: number | null
          stock?: number
          value: string
        }
        Update: {
          id?: number
          product_id?: number | null
          stock?: number
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_view"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          availability_status: string | null
          base_price: number
          brand: string | null
          category_id: number | null
          created_at: string
          description: string | null
          dimensions: Json | null
          discount_percentage: number | null
          id: number
          images: string[] | null
          meta: Json | null
          minimum_order_quantity: number | null
          price: number | null
          rating: number | null
          return_policy: string | null
          reviews_count: number
          shipping_information: string | null
          sku: string | null
          tags: string[] | null
          thumbnail: string | null
          title: string
          warranty_information: string | null
          weight: number | null
        }
        Insert: {
          availability_status?: string | null
          base_price: number
          brand?: string | null
          category_id?: number | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          discount_percentage?: number | null
          id?: number
          images?: string[] | null
          meta?: Json | null
          minimum_order_quantity?: number | null
          price?: number | null
          rating?: number | null
          return_policy?: string | null
          reviews_count?: number
          shipping_information?: string | null
          sku?: string | null
          tags?: string[] | null
          thumbnail?: string | null
          title: string
          warranty_information?: string | null
          weight?: number | null
        }
        Update: {
          availability_status?: string | null
          base_price?: number
          brand?: string | null
          category_id?: number | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          discount_percentage?: number | null
          id?: number
          images?: string[] | null
          meta?: Json | null
          minimum_order_quantity?: number | null
          price?: number | null
          rating?: number | null
          return_policy?: string | null
          reviews_count?: number
          shipping_information?: string | null
          sku?: string | null
          tags?: string[] | null
          thumbnail?: string | null
          title?: string
          warranty_information?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      review_likes: {
        Row: {
          created_at: string
          id: number
          review_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          review_id: number
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: never
          review_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_likes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "product_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          created_at: string | null
          id: string
          price_at_add: number | null
          product_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          price_at_add?: number | null
          product_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          price_at_add?: number | null
          product_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      products_view: {
        Row: {
          availabilityStatus: string | null
          basePrice: number | null
          brand: string | null
          category: string | null
          description: string | null
          dimensions: Json | null
          discountPercentage: number | null
          id: number | null
          images: string[] | null
          meta: Json | null
          minimumOrderQuantity: number | null
          price: number | null
          rating: number | null
          returnPolicy: string | null
          reviewsCount: number | null
          shippingInformation: string | null
          sku: string | null
          tags: string[] | null
          thumbnail: string | null
          title: string | null
          warrantyInformation: string | null
          weight: number | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_or_update_review: {
        Args: { p_comment: string; p_product_id: number; p_rating: number }
        Returns: {
          comment: string | null
          date: string
          helpful_count: number
          id: number
          is_edited: boolean
          is_verified: boolean
          product_id: number
          rating: number
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "product_reviews"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_order: {
        Args: {
          p_delivery_method_id: string
          p_items: Json
          p_payment_method_id: string
          p_shipping_address: Json
        }
        Returns: Json
      }
      get_last_purchase_date: {
        Args: { p_product_id: number }
        Returns: string
      }
      get_review_stats: {
        Args: { p_product_id: number }
        Returns: {
          rating: number
          review_count: number
        }[]
      }
      get_unreviewed_purchases: {
        Args: never
        Returns: {
          last_purchased_at: string
          product_id: number
          purchase_count: number
        }[]
      }
      toggle_review_like: { Args: { p_review_id: number }; Returns: boolean }
    }
    Enums: {
      delivery_method_type: "standard" | "express" | "pickup"
      delivery_status:
        | "awaiting_dispatch"
        | "dispatched"
        | "in_transit"
        | "delivered"
        | "returned"
        | "cancelled"
      notification_category:
        | "order_status"
        | "review_reminder"
        | "price_drop"
        | "system"
      notification_level: "info" | "success" | "warning" | "error"
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "completed"
        | "cancelled"
      payment_method_type:
        | "cash_on_delivery"
        | "online_card"
        | "paypal"
        | "sepa"
        | "klarna"
      payment_status: "awaiting_payment" | "paid" | "failed" | "refunded"
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
      delivery_method_type: ["standard", "express", "pickup"],
      delivery_status: [
        "awaiting_dispatch",
        "dispatched",
        "in_transit",
        "delivered",
        "returned",
        "cancelled",
      ],
      notification_category: [
        "order_status",
        "review_reminder",
        "price_drop",
        "system",
      ],
      notification_level: ["info", "success", "warning", "error"],
      order_status: [
        "pending",
        "processing",
        "shipped",
        "completed",
        "cancelled",
      ],
      payment_method_type: [
        "cash_on_delivery",
        "online_card",
        "paypal",
        "sepa",
        "klarna",
      ],
      payment_status: ["awaiting_payment", "paid", "failed", "refunded"],
    },
  },
} as const
