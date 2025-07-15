// Types related to chat and analytics tables
import type { Database } from "./database";

export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];
export type ContactUpdate = Database["public"]["Tables"]["contacts"]["Update"];

export type ConversationMetrics =
  Database["public"]["Tables"]["conversation_metrics"]["Row"];
export type FunnelData = Database["public"]["Tables"]["funnel_data"]["Row"];
export type AIProduct = Database["public"]["Tables"]["ai_products"]["Row"];
export type UTMTracking = Database["public"]["Tables"]["utm_tracking"]["Row"];

export type DashboardMetrics =
  Database["public"]["Views"]["dashboard_metrics"]["Row"];
export type ConversionFunnelView =
  Database["public"]["Views"]["conversion_funnel_view"]["Row"];
