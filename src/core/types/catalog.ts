// ═══════════════════════════════════════════════════════════════════════════════
// CATALOG TYPES — Domain 3: Catalog
// Mirrors DB schema exactly (smart_merchant_erp_schema.sql v2.0)
// Tables: categories, brands, units, products, product_units, product_images
// ═══════════════════════════════════════════════════════════════════════════════

import type { UUID, ISODateString } from "./index";

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: categories
// Description: Product categories (supports tree hierarchy via parent_id).
// ═══════════════════════════════════════════════════════════════════════════════
export interface Category {
  id:            UUID;
  business_id:   UUID;
  parent_id:     UUID | null;   // self-referencing FK for tree hierarchy
  category_name: string;
  description:   string | null;
  image_path:    string | null;
  is_active:     boolean;
  created_at:    ISODateString;
  updated_at:    ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: brands
// Description: Product brands / trademarks per business.
// ═══════════════════════════════════════════════════════════════════════════════
export interface Brand {
  id:          UUID;
  business_id: UUID;
  brand_name:  string;
  description: string | null;
  logo_path:   string | null;
  is_active:   boolean;
  created_at:  ISODateString;
  updated_at:  ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: units
// Description: Global units of measure (piece, kg, carton, litre, etc.).
// NOTE: units are global (not per-business) in the DB.
// ═══════════════════════════════════════════════════════════════════════════════
export interface Unit {
  id:               UUID;
  unit_name:        string;      // e.g. "كرتون", "قطعة", "كيلوجرام"
  unit_symbol:      string;      // e.g. "ك", "pcs", "kg"
  unit_description: string | null;
  is_active?:       boolean;     // Optional active flag
  is_default?:      boolean;     // System default unit flag
  created_at:       ISODateString;
  updated_at:       ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: products
// Description: Core product record (business-level, not branch-specific).
// NOTE: Does NOT include pricing — pricing is in product_units.
// ═══════════════════════════════════════════════════════════════════════════════
export interface Product {
  id:           UUID;
  business_id:  UUID;
  category_id:  UUID | null;
  brand_id:     UUID | null;
  product_code: string;          // unique per business
  product_name: string;
  description:  string | null;
  is_active:    boolean;
  created_at:   ISODateString;
  updated_at:   ISODateString;
  deleted_at:   ISODateString | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: product_units
// Description: Units, barcodes, SKUs, and prices per product unit.
//   One product may have multiple product_units (e.g. piece + carton of 12).
// ═══════════════════════════════════════════════════════════════════════════════
export interface ProductUnit {
  id:                UUID;
  product_id:        UUID;
  unit_id:           UUID;
  sku:               string | null;
  barcode:           string | null;
  conversion_factor: number;     // qty of this unit = 1 base unit (default 1.0)
  purchase_price:    number;
  selling_price:     number;
  minimum_price:     number;     // floor price for discounts
  is_base_unit:      boolean;
  is_active:         boolean;
  created_at:        ISODateString;
  updated_at:        ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: product_images
// Description: Product images (one can be marked as primary).
// ═══════════════════════════════════════════════════════════════════════════════
export interface ProductImage {
  id:         UUID;
  product_id: UUID;
  image_path: string;
  is_primary: boolean;
  created_at: ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI-ONLY HELPERS — Hydrated composite types for display
// ═══════════════════════════════════════════════════════════════════════════════

/** A product_unit with its parent product, unit, category, and brand hydrated */
export interface ProductUnitWithDetails extends ProductUnit {
  product:  Product;
  unit:     Unit;
  category: Category | null;
  brand:    Brand | null;
  images:   ProductImage[];
}

/** A product with all its units hydrated */
export interface ProductWithUnits extends Product {
  units:    ProductUnit[];
  category: Category | null;
  brand:    Brand | null;
  images:   ProductImage[];
}

/** Category with its children (tree node) */
export interface CategoryNode extends Category {
  children: CategoryNode[];
}
