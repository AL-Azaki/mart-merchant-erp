// ═══════════════════════════════════════════════════════════════════════════════
// PURCHASES TYPES — Domain 6: Purchasing
// Mirrors DB schema exactly (smart_merchant_erp_schema.sql v2.0)
// Tables: suppliers, purchase_invoices, purchase_invoice_items,
//         purchase_returns, purchase_return_items
// ═══════════════════════════════════════════════════════════════════════════════

import type { UUID, ISODateString } from "./index";
import type { ProductUnit, Product, Unit } from "./catalog";
import type { Warehouse } from "./inventory";

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: suppliers
// Description: Supplier records per business (with soft delete).
// NOTE: suppliers is a SEPARATE entity from customers — different fields.
// ═══════════════════════════════════════════════════════════════════════════════
export interface Supplier {
  id:               UUID;
  business_id:      UUID;
  supplier_name:    string;
  contact_person:   string | null;   // primary contact at the supplier
  phone:            string | null;
  supplier_address: string | null;
  is_active:        boolean;
  opening_balance?:       number;
  opening_balance_type?:  "debit" | "credit";
  opening_balance_date?:  string;
  opening_balance_notes?: string;
  created_at:       ISODateString;
  updated_at:       ISODateString;
  deleted_at:       ISODateString | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: purchase_invoices
// Description: Purchase invoice from a supplier.
// ═══════════════════════════════════════════════════════════════════════════════
export type PurchaseInvoiceStatus = "Draft" | "Posted" | "Cancelled";

export interface PurchaseInvoice {
  id:             UUID;
  business_id:    UUID;
  branch_id:      UUID;
  supplier_id:    UUID;
  warehouse_id:   UUID;          // default receiving warehouse
  invoice_number: string;
  purchase_date:  ISODateString;
  due_date:       ISODateString | null;
  sub_total:      number;
  discount_total: number;
  tax_total:      number;
  grand_total:    number;
  status:         PurchaseInvoiceStatus;
  notes:          string | null;
  created_by:     UUID;
  created_at:     ISODateString;
  updated_at:     ISODateString;
  deleted_at:     ISODateString | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: purchase_invoice_items
// Description: Line items of a purchase invoice.
//   Each item has its own warehouse_id (can differ from invoice default).
// ═══════════════════════════════════════════════════════════════════════════════
export interface PurchaseInvoiceItem {
  id:                  UUID;
  purchase_invoice_id: UUID;
  product_unit_id:     UUID;
  warehouse_id:        UUID;     // stock received into this warehouse
  quantity:            number;
  unit_price:          number;   // purchase (cost) price per unit
  discount:            number;
  tax:                 number;
  line_total:          number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: purchase_returns
// Description: Purchase return header (return goods back to supplier).
// ═══════════════════════════════════════════════════════════════════════════════
export type PurchaseReturnStatus = "Draft" | "Posted" | "Cancelled";

export interface PurchaseReturn {
  id:                  UUID;
  business_id:         UUID;
  branch_id:           UUID;
  purchase_invoice_id: UUID;     // must link to the original purchase invoice
  return_number:       string;
  return_date:         ISODateString;
  total_amount:        number;
  status:              PurchaseReturnStatus;
  notes:               string | null;
  created_by:          UUID;
  created_at:          ISODateString;
  updated_at:          ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: purchase_return_items
// Description: Line items of a purchase return.
// ═══════════════════════════════════════════════════════════════════════════════
export interface PurchaseReturnItem {
  id:                 UUID;
  purchase_return_id: UUID;
  product_unit_id:    UUID;
  warehouse_id:       UUID;      // stock deducted from this warehouse
  quantity:           number;
  unit_price:         number;
  line_total:         number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI-ONLY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Purchase invoice with supplier, warehouse, and items hydrated */
export interface PurchaseInvoiceWithDetails extends PurchaseInvoice {
  supplier:  Supplier;
  warehouse: Warehouse;
  items:     (PurchaseInvoiceItem & {
    product_unit: ProductUnit & { product: Product; unit: Unit };
    warehouse:    Warehouse;
  })[];
}

/** Purchase return with original invoice hydrated */
export interface PurchaseReturnWithDetails extends PurchaseReturn {
  purchase_invoice: PurchaseInvoice;
  supplier:         Supplier;
  items:            (PurchaseReturnItem & {
    product_unit: ProductUnit & { product: Product; unit: Unit };
    warehouse:    Warehouse;
  })[];
}

/** A line being built when creating a new purchase invoice */
export interface PurchaseLine {
  product_unit:    ProductUnit & { product: Product; unit: Unit };
  warehouse_id:    UUID;
  quantity:        number;
  unit_price:      number;
  discount:        number;
  tax:             number;
  // computed:
  line_total:      number;
}
