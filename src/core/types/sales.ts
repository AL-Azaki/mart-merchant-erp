// ═══════════════════════════════════════════════════════════════════════════════
// SALES TYPES — Domain 5: Sales
// Mirrors DB schema exactly (smart_merchant_erp_schema.sql v2.0)
// Tables: customers, channels, orders, order_items,
//         sales_invoices, sales_invoice_items,
//         sales_returns, sales_return_items
// ═══════════════════════════════════════════════════════════════════════════════

import type { UUID, ISODateString } from "./index";
import type { ProductUnit, Product, Unit } from "./catalog";
import type { Warehouse } from "./inventory";

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: customers
// Description: Customer records per business (with soft delete).
// ═══════════════════════════════════════════════════════════════════════════════
export interface Customer {
  id:            UUID;
  business_id:   UUID;
  customer_name: string;
  phone:         string | null;
  email:         string | null;
  address:       string | null;
  credit_limit:  number;          // 0 = no credit allowed
  is_active:     boolean;
  created_at:    ISODateString;
  updated_at:    ISODateString;
  deleted_at:    ISODateString | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: channels
// Description: Sales channels (POS, Ecommerce, Wholesale).
// ═══════════════════════════════════════════════════════════════════════════════
export type ChannelType = "POS" | "Ecommerce" | "Wholesale" | "Other";

export interface Channel {
  id:           UUID;
  channel_code: string;
  channel_name: string;
  channel_type: ChannelType;
  is_active:    boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: orders
// Description: Sales order before conversion to invoice.
//   sales_invoice_id is NULL until the order is confirmed.
// ═══════════════════════════════════════════════════════════════════════════════
export type OrderStatus =
  | "Draft" | "Pending" | "Confirmed"
  | "Processing" | "Ready" | "Completed" | "Cancelled";

export type OrderPaymentStatus = "Pending" | "Partial" | "Paid" | "Cancelled";

export interface Order {
  id:               UUID;
  business_id:      UUID;
  branch_id:        UUID;
  customer_id:      UUID | null;
  channel_id:       UUID | null;
  sales_invoice_id: UUID | null;    // populated after order converts to invoice
  order_number:     string;
  order_date:       ISODateString;
  subtotal:         number;
  discount_total:   number;
  tax_total:        number;
  grand_total:      number;
  status:           OrderStatus;
  payment_status:   OrderPaymentStatus;
  notes:            string | null;
  created_by:       UUID;
  created_at:       ISODateString;
  updated_at:       ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: order_items
// Description: Line items of a sales order.
// ═══════════════════════════════════════════════════════════════════════════════
export interface OrderItem {
  id:              UUID;
  order_id:        UUID;
  product_unit_id: UUID;
  quantity:        number;
  unit_price:      number;
  discount_amount: number;
  tax_amount:      number;
  line_total:      number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: sales_invoices
// Description: Final sales invoice issued to a customer.
// ═══════════════════════════════════════════════════════════════════════════════
export type SalesInvoicePaymentStatus = "Unpaid" | "Partial" | "Paid";
export type SalesInvoiceStatus        = "Draft" | "Posted" | "Cancelled";

export interface SalesInvoice {
  id:             UUID;
  business_id:    UUID;
  branch_id:      UUID;
  customer_id:    UUID | null;       // null = walk-in / anonymous customer
  invoice_number: string;
  invoice_date:   ISODateString;
  due_date:       ISODateString | null;
  sub_total:      number;
  discount_total: number;
  tax_total:      number;
  grand_total:    number;
  payment_status: SalesInvoicePaymentStatus;
  status:         SalesInvoiceStatus;
  notes:          string | null;
  created_by:     UUID;
  created_at:     ISODateString;
  updated_at:     ISODateString;
  deleted_at:     ISODateString | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: sales_invoice_items
// Description: Line items of a sales invoice.
//   Each item includes the source warehouse (for stock deduction).
// ═══════════════════════════════════════════════════════════════════════════════
export interface SalesInvoiceItem {
  id:               UUID;
  sales_invoice_id: UUID;
  product_unit_id:  UUID;
  warehouse_id:     UUID;        // stock deducted from this warehouse
  quantity:         number;
  unit_price:       number;
  cost_price:       number;      // snapshot of purchase cost (for profit calc)
  discount:         number;
  tax:              number;
  line_total:       number;
  cost_total:       number;      // quantity * cost_price
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: sales_returns
// Description: Sales return (credit note) header.
// ═══════════════════════════════════════════════════════════════════════════════
export type SalesReturnStatus = "Draft" | "Posted" | "Cancelled";

export interface SalesReturn {
  id:               UUID;
  business_id:      UUID;
  branch_id:        UUID;
  sales_invoice_id: UUID;        // must link to the original invoice
  return_number:    string;
  return_date:      ISODateString;
  total_amount:     number;
  status:           SalesReturnStatus;
  notes:            string | null;
  created_by:       UUID;
  created_at:       ISODateString;
  updated_at:       ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: sales_return_items
// Description: Line items of a sales return.
// ═══════════════════════════════════════════════════════════════════════════════
export interface SalesReturnItem {
  id:                    UUID;
  sales_return_id:       UUID;
  sales_invoice_item_id: UUID;   // links back to the original invoice line
  product_unit_id:       UUID;
  warehouse_id:          UUID;   // stock returned to this warehouse
  quantity:              number;
  unit_price:            number;
  cost_price:            number;
  cost_total:            number;
  total_price:           number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI-ONLY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Sales invoice with items, customer, and payments hydrated */
export interface SalesInvoiceWithDetails extends SalesInvoice {
  customer: Customer | null;
  items:    (SalesInvoiceItem & {
    product_unit: ProductUnit & { product: Product; unit: Unit };
    warehouse:    Warehouse;
  })[];
}

/** Order with items and customer hydrated */
export interface OrderWithDetails extends Order {
  customer: Customer | null;
  channel:  Channel | null;
  items:    (OrderItem & {
    product_unit: ProductUnit & { product: Product; unit: Unit };
  })[];
}

/** Sales return with original invoice hydrated */
export interface SalesReturnWithDetails extends SalesReturn {
  sales_invoice: SalesInvoice;
  items:         (SalesReturnItem & {
    product_unit: ProductUnit & { product: Product; unit: Unit };
    warehouse:    Warehouse;
  })[];
}

/** A cart line item being built before creating the invoice (UI only) */
export interface CartLine {
  product_unit:    ProductUnit & { product: Product; unit: Unit };
  warehouse_id:    UUID;
  quantity:        number;
  unit_price:      number;        // can be edited by cashier
  discount:        number;
  tax:             number;
  // computed:
  line_total:      number;
  cost_total:      number;
}
