// ═══════════════════════════════════════════════════════════════════════════════
// CHANNELS TYPES — Domain 8: Sales Channel
// Mirrors DB schema exactly (smart_merchant_erp_schema.sql v2.0)
// Tables: product_channels, carts, cart_items
// ═══════════════════════════════════════════════════════════════════════════════

import type { UUID, ISODateString } from "./index";

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: product_channels
// Description: Enables/disables product units per channel with custom price.
//   Composite PK: (product_unit_id, channel_id)
// ═══════════════════════════════════════════════════════════════════════════════
export interface ProductChannel {
  product_unit_id: UUID;
  channel_id:      UUID;
  sale_price:      number;      // custom price for this channel
  display_order:   number;
  is_enabled:      boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: carts
// Description: Shopping cart for e-commerce channel.
// ═══════════════════════════════════════════════════════════════════════════════
export type CartStatus = "Active" | "Converted" | "Abandoned";

export interface Cart {
  id:          UUID;
  business_id: UUID;
  customer_id: UUID | null;
  status:      CartStatus;
  created_at:  ISODateString;
  updated_at:  ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: cart_items
// ═══════════════════════════════════════════════════════════════════════════════
export interface CartItem {
  id:              UUID;
  cart_id:         UUID;
  product_unit_id: UUID;
  quantity:        number;
  unit_price:      number;
  line_total:      number;
  created_at:      ISODateString;
}
