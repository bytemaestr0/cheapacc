// Hand-authored minimal types so the template compiles out of the box.
// Once your Supabase project exists, replace this file with the real
// generated types:
//   npx supabase gen types typescript --project-id <id> > types/database.ts

export type OrderStatus = "pending" | "paid" | "fulfilled" | "refunded" | "cancelled";
export type ListingStatus = "draft" | "active" | "archived";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      categories: {
        Row: { id: string; name: string; slug: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
      };
      listings: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          price_cents: number;
          currency: string;
          status: ListingStatus;
          category_id: string | null;
          image_url: string | null;
          stock_count: number;
          delivery_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["listings"]["Row"]> & {
          title: string;
          slug: string;
          description: string;
          price_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["listings"]["Row"]>;
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string;
          status: OrderStatus;
          total_cents: number;
          currency: string;
          payment_provider: string | null;
          payment_ref: string | null;
          buyer_note: string | null;
          created_at: string;
          fulfilled_at: string | null;
          fulfilled_by: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          buyer_id: string;
          total_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          listing_id: string;
          quantity: number;
          unit_price_cents: number;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]> & {
          order_id: string;
          listing_id: string;
          unit_price_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
      };
      fulfillment_assets: {
        Row: {
          id: string;
          order_id: string;
          label: string;
          content: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["fulfillment_assets"]["Row"]> & {
          order_id: string;
          label: string;
          content: string;
        };
        Update: Partial<Database["public"]["Tables"]["fulfillment_assets"]["Row"]>;
      };
    };
  };
}
