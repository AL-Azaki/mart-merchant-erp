// ═══════════════════════════════════════════════════════════════════════════════
// SALES MOCK DATA — mirrors DB schema exactly (v2.0)
// Domains: catalog (categories, units, products, product_units),
//          inventory (warehouses, inventories),
//          sales (customers, channels, orders, sales_invoices, returns)
// ═══════════════════════════════════════════════════════════════════════════════

import type { Category, Unit, Product, ProductUnit } from "@/core/types/catalog";
import type { Warehouse, Inventory, InventoryTransaction } from "@/core/types/inventory";
import type {
  Customer, Channel, SalesInvoice, SalesInvoiceItem,
  SalesReturn, CartLine,
} from "@/core/types/sales";

// ─── Categories ───────────────────────────────────────────────────────────────
export const MOCK_CATEGORIES: Category[] = [
  { id: "cat_001", business_id: "biz_001", parent_id: null, category_name: "مشروبات",    description: null, image_path: null, is_active: true, created_at: "2024-01-15T10:00:00Z", updated_at: "2024-01-15T10:00:00Z" },
  { id: "cat_002", business_id: "biz_001", parent_id: null, category_name: "مواد غذائية", description: null, image_path: null, is_active: true, created_at: "2024-01-15T10:00:00Z", updated_at: "2024-01-15T10:00:00Z" },
  { id: "cat_003", business_id: "biz_001", parent_id: null, category_name: "منظفات",      description: null, image_path: null, is_active: true, created_at: "2024-01-15T10:00:00Z", updated_at: "2024-01-15T10:00:00Z" },
  { id: "cat_004", business_id: "biz_001", parent_id: null, category_name: "إلكترونيات", description: null, image_path: null, is_active: true, created_at: "2024-01-15T10:00:00Z", updated_at: "2024-01-15T10:00:00Z" },
];

// ─── Units (Global — not per business in DB) ──────────────────────────────────
export const MOCK_UNITS: Unit[] = [
  { id: "unit_001", unit_name: "قطعة",  unit_symbol: "قطعة",  unit_description: "وحدة مفردة",    is_active: true, is_default: true,  created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "unit_002", unit_name: "كرتون", unit_symbol: "كرتون", unit_description: "كرتون (12 قطعة)", is_active: true, is_default: false, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "unit_003", unit_name: "كيلو",  unit_symbol: "كغ",    unit_description: "كيلوجرام",       is_active: true, is_default: false, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "unit_004", unit_name: "لتر",   unit_symbol: "لتر",   unit_description: "لتر سائل",        is_active: true, is_default: false, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

// ─── Products (catalog level — no pricing here) ───────────────────────────────
export const MOCK_PRODUCTS: Product[] = [
  { id: "prod_001", business_id: "biz_001", category_id: "cat_001", brand_id: null, product_code: "WTR-001", product_name: "مياه معدنية 1.5 لتر", description: null, is_active: true, created_at: "2024-01-16T08:00:00Z", updated_at: "2024-01-16T08:00:00Z", deleted_at: null },
  { id: "prod_002", business_id: "biz_001", category_id: "cat_001", brand_id: null, product_code: "JCE-001", product_name: "عصير برتقال 250مل",  description: null, is_active: true, created_at: "2024-01-16T08:00:00Z", updated_at: "2024-01-16T08:00:00Z", deleted_at: null },
  { id: "prod_003", business_id: "biz_001", category_id: "cat_002", brand_id: null, product_code: "SGR-001", product_name: "سكر أبيض",            description: null, is_active: true, created_at: "2024-01-16T08:00:00Z", updated_at: "2024-01-16T08:00:00Z", deleted_at: null },
  { id: "prod_004", business_id: "biz_001", category_id: "cat_002", brand_id: null, product_code: "OIL-001", product_name: "زيت نباتي",           description: null, is_active: true, created_at: "2024-01-16T08:00:00Z", updated_at: "2024-01-16T08:00:00Z", deleted_at: null },
  { id: "prod_005", business_id: "biz_001", category_id: "cat_003", brand_id: null, product_code: "SOP-001", product_name: "صابون غسيل يدين",     description: null, is_active: true, created_at: "2024-01-16T08:00:00Z", updated_at: "2024-01-16T08:00:00Z", deleted_at: null },
  { id: "prod_006", business_id: "biz_001", category_id: "cat_004", brand_id: null, product_code: "ELC-001", product_name: "سماعات بلوتوث",       description: null, is_active: true, created_at: "2024-01-16T08:00:00Z", updated_at: "2024-01-16T08:00:00Z", deleted_at: null },
];

// ─── Product Units (pricing and barcodes live here) ───────────────────────────
export const MOCK_PRODUCT_UNITS: ProductUnit[] = [
  { id: "pu_001", product_id: "prod_001", unit_id: "unit_001", sku: "WTR-001-PC",  barcode: "6281234567890", conversion_factor: 1, purchase_price: 50,   selling_price: 80,    minimum_price: 60,    is_base_unit: true,  is_active: true, created_at: "2024-01-16T08:00:00Z", updated_at: "2024-01-16T08:00:00Z" },
  { id: "pu_002", product_id: "prod_001", unit_id: "unit_002", sku: "WTR-001-CT",  barcode: "6281234567899", conversion_factor: 12, purchase_price: 550, selling_price: 880,   minimum_price: 660,   is_base_unit: false, is_active: true, created_at: "2024-01-16T08:00:00Z", updated_at: "2024-01-16T08:00:00Z" },
  { id: "pu_003", product_id: "prod_002", unit_id: "unit_001", sku: "JCE-001-PC",  barcode: "6281234567891", conversion_factor: 1, purchase_price: 120,  selling_price: 180,   minimum_price: 150,   is_base_unit: true,  is_active: true, created_at: "2024-01-16T08:00:00Z", updated_at: "2024-01-16T08:00:00Z" },
  { id: "pu_004", product_id: "prod_003", unit_id: "unit_003", sku: "SGR-001-KG",  barcode: "6281234567892", conversion_factor: 1, purchase_price: 600,  selling_price: 750,   minimum_price: 680,   is_base_unit: true,  is_active: true, created_at: "2024-01-16T08:00:00Z", updated_at: "2024-01-16T08:00:00Z" },
  { id: "pu_005", product_id: "prod_004", unit_id: "unit_004", sku: "OIL-001-LT",  barcode: "6281234567893", conversion_factor: 1, purchase_price: 1800, selling_price: 2200,  minimum_price: 2000,  is_base_unit: true,  is_active: true, created_at: "2024-01-16T08:00:00Z", updated_at: "2024-01-16T08:00:00Z" },
  { id: "pu_006", product_id: "prod_005", unit_id: "unit_001", sku: "SOP-001-PC",  barcode: "6281234567894", conversion_factor: 1, purchase_price: 250,  selling_price: 350,   minimum_price: 300,   is_base_unit: true,  is_active: true, created_at: "2024-01-16T08:00:00Z", updated_at: "2024-01-16T08:00:00Z" },
  { id: "pu_007", product_id: "prod_006", unit_id: "unit_001", sku: "ELC-001-PC",  barcode: "6281234567895", conversion_factor: 1, purchase_price: 8000, selling_price: 12000, minimum_price: 10000, is_base_unit: true,  is_active: true, created_at: "2024-01-16T08:00:00Z", updated_at: "2024-01-16T08:00:00Z" },
];

// ─── Warehouses ───────────────────────────────────────────────────────────────
export const MOCK_WAREHOUSES: Warehouse[] = [
  { id: "wh_001", business_id: "biz_001", branch_id: "br_001", warehouse_name: "المستودع الرئيسي", warehouse_code: "WH-MAIN", address: "صنعاء، الروضة", is_default: true,  is_active: true, created_at: "2024-01-01T10:00:00Z", updated_at: "2024-01-01T10:00:00Z" },
  { id: "wh_002", business_id: "biz_001", branch_id: "br_002", warehouse_name: "مستودع المعلا",    warehouse_code: "WH-ML",   address: "عدن، المعلا",   is_default: false, is_active: true, created_at: "2024-02-01T10:00:00Z", updated_at: "2024-02-01T10:00:00Z" },
];

// ─── Inventories (current stock levels: product_unit × warehouse) ─────────────
export const MOCK_INVENTORIES: Inventory[] = [
  { id: "inv_stk_001", warehouse_id: "wh_001", product_unit_id: "pu_001", quantity: 240, average_cost: 50,   alert_quantity: 24, updated_at: "2024-06-26T10:00:00Z" },
  { id: "inv_stk_002", warehouse_id: "wh_001", product_unit_id: "pu_003", quantity: 96,  average_cost: 120,  alert_quantity: 12, updated_at: "2024-06-26T10:00:00Z" },
  { id: "inv_stk_003", warehouse_id: "wh_001", product_unit_id: "pu_004", quantity: 50,  average_cost: 600,  alert_quantity: 5,  updated_at: "2024-06-26T10:00:00Z" },
  { id: "inv_stk_004", warehouse_id: "wh_001", product_unit_id: "pu_005", quantity: 8,   average_cost: 1800, alert_quantity: 10, updated_at: "2024-06-26T10:00:00Z" },
  { id: "inv_stk_005", warehouse_id: "wh_001", product_unit_id: "pu_006", quantity: 60,  average_cost: 250,  alert_quantity: 12, updated_at: "2024-06-26T10:00:00Z" },
  { id: "inv_stk_006", warehouse_id: "wh_001", product_unit_id: "pu_007", quantity: 5,   average_cost: 8000, alert_quantity: 2,  updated_at: "2024-06-26T10:00:00Z" },
];

// ─── Inventory Transactions ───────────────────────────────────────────────────
export const MOCK_INVENTORY_TRANSACTIONS: InventoryTransaction[] = [
  { id: "inv_tx_001", inventory_id: "inv_stk_001", product_unit_id: "pu_001", transaction_type: "In",     quantity: 200,  unit_cost: 50,   reference_type: "PurchaseInvoice", reference_id: "po_001", transaction_date: "2024-06-20T08:00:00Z" },
  { id: "inv_tx_002", inventory_id: "inv_stk_002", product_unit_id: "pu_003", transaction_type: "In",     quantity: 100,  unit_cost: 120,  reference_type: "PurchaseInvoice", reference_id: "po_001", transaction_date: "2024-06-20T08:00:00Z" },
  { id: "inv_tx_003", inventory_id: "inv_stk_001", product_unit_id: "pu_001", transaction_type: "Out",    quantity: 10,   unit_cost: 50,   reference_type: "SalesInvoice",    reference_id: "si_001", transaction_date: "2024-06-25T10:30:00Z" },
  { id: "inv_tx_004", inventory_id: "inv_stk_003", product_unit_id: "pu_004", transaction_type: "Adjust", quantity: -2,   unit_cost: 600,  reference_type: "Adjustment",      reference_id: "adj_001", transaction_date: "2024-06-26T14:00:00Z" },
];

// ─── Customers ────────────────────────────────────────────────────────────────
export const MOCK_CUSTOMERS: Customer[] = [
  { id: "cust_001", business_id: "biz_001", customer_name: "محمد علي سالم",          phone: "+967771112233", email: null,               address: "شارع حده، صنعاء",     credit_limit: 50000,
    default_currency_id: "11111111-1111-1111-1111-111111111111",  is_active: true, created_at: "2024-02-01T09:00:00Z", updated_at: "2024-02-01T09:00:00Z", deleted_at: null },
  { id: "cust_002", business_id: "biz_001", customer_name: "شركة النهضة للتجارة",    phone: "+967775556677", email: "info@alnahda.ye",   address: "شارع الزبيري، صنعاء", credit_limit: 200000,
    default_currency_id: "11111111-1111-1111-1111-111111111111", is_active: true, created_at: "2024-02-05T10:00:00Z", updated_at: "2024-06-20T08:00:00Z", deleted_at: null },
  { id: "cust_003", business_id: "biz_001", customer_name: "فاطمة أحمد محمود",       phone: "+967779998877", email: "fatima@mail.com",   address: null,                   credit_limit: 0,
    default_currency_id: "11111111-1111-1111-1111-111111111111",      is_active: true, created_at: "2024-03-10T11:00:00Z", updated_at: "2024-03-10T11:00:00Z", deleted_at: null },
  { id: "cust_004", business_id: "biz_001", customer_name: "مؤسسة الأمين التجارية", phone: "+967774443322", email: null,               address: "المعلا، عدن",          credit_limit: 500000,
    default_currency_id: "11111111-1111-1111-1111-111111111111", is_active: true, created_at: "2024-04-01T09:00:00Z", updated_at: "2024-06-15T10:00:00Z", deleted_at: null },
];

// ─── Channels ─────────────────────────────────────────────────────────────────
export const MOCK_CHANNELS: Channel[] = [
  { id: "ch_001", channel_code: "POS",   channel_name: "نقطة البيع",     channel_type: "POS",       is_active: true },
  { id: "ch_002", channel_code: "WHOLE", channel_name: "بيع الجملة",     channel_type: "Wholesale", is_active: true },
  { id: "ch_003", channel_code: "ECOM",  channel_name: "التجارة الإلكترونية", channel_type: "Ecommerce", is_active: false },
];

// ─── Sales Invoices ────────────────────────────────────────────────────────────
export const MOCK_SALES_INVOICES: SalesInvoice[] = [
  {
    id: "si_001", business_id: "biz_001", branch_id: "br_001",
    customer_id: "cust_001", invoice_number: "INV-2024-0001",
    invoice_date: "2024-06-25T10:30:00Z", due_date: null,
    currency_id: "11111111-1111-1111-1111-111111111111",
    exchange_rate: 1,
    sub_total: 1700, discount_total: 0, tax_total: 0, grand_total: 1700,
    base_sub_total: 1700,
    base_discount_total: 0,
    base_tax_total: 0,
    base_grand_total: 1700,
    payment_status: "Paid", status: "Posted",
    notes: null, created_by: "usr_001",
    created_at: "2024-06-25T10:30:00Z", updated_at: "2024-06-25T10:35:00Z", deleted_at: null,
  },
  {
    id: "si_002", business_id: "biz_001", branch_id: "br_001",
    customer_id: "cust_002", invoice_number: "INV-2024-0002",
    invoice_date: "2024-06-25T14:00:00Z", due_date: "2024-07-05T00:00:00Z",
    currency_id: "11111111-1111-1111-1111-111111111111",
    exchange_rate: 1,
    sub_total: 24000, discount_total: 2400, tax_total: 3240, grand_total: 24840,
    base_sub_total: 24840,
    base_discount_total: 0,
    base_tax_total: 0,
    base_grand_total: 24840,
    payment_status: "Partial", status: "Posted",
    notes: "باقي الدفع آخر الشهر", created_by: "usr_001",
    created_at: "2024-06-25T14:00:00Z", updated_at: "2024-06-25T14:05:00Z", deleted_at: null,
  },
  {
    id: "si_003", business_id: "biz_001", branch_id: "br_001",
    customer_id: null, invoice_number: "INV-2024-0003",
    invoice_date: "2024-06-26T09:15:00Z", due_date: null,
    currency_id: "11111111-1111-1111-1111-111111111111",
    exchange_rate: 1,
    sub_total: 750, discount_total: 0, tax_total: 0, grand_total: 750,
    base_sub_total: 750,
    base_discount_total: 0,
    base_tax_total: 0,
    base_grand_total: 750,
    payment_status: "Paid", status: "Posted",
    notes: null, created_by: "usr_001",
    created_at: "2024-06-26T09:15:00Z", updated_at: "2024-06-26T09:16:00Z", deleted_at: null,
  },
  {
    id: "si_004", business_id: "biz_001", branch_id: "br_001",
    customer_id: "cust_004", invoice_number: "INV-2024-0004",
    invoice_date: "2024-06-26T11:00:00Z", due_date: "2024-07-15T00:00:00Z",
    currency_id: "11111111-1111-1111-1111-111111111111",
    exchange_rate: 1,
    sub_total: 6600, discount_total: 100, tax_total: 0, grand_total: 6500,
    base_sub_total: 6500,
    base_discount_total: 0,
    base_tax_total: 0,
    base_grand_total: 6500,
    payment_status: "Unpaid", status: "Draft",
    notes: "في انتظار الموافقة", created_by: "usr_001",
    created_at: "2024-06-26T11:00:00Z", updated_at: "2024-06-26T11:00:00Z", deleted_at: null,
  },
];

// ─── Sales Invoice Items ───────────────────────────────────────────────────────
export const MOCK_SALES_INVOICE_ITEMS: SalesInvoiceItem[] = [
  { id: "sii_001", sales_invoice_id: "si_001", product_unit_id: "pu_001", warehouse_id: "wh_001", quantity: 10, unit_price: 80,    cost_price: 50,   discount: 0,    tax: 0,    line_total: 800,
    base_line_total: 800,   cost_total: 500 },
  { id: "sii_002", sales_invoice_id: "si_001", product_unit_id: "pu_003", warehouse_id: "wh_001", quantity: 5,  unit_price: 180,   cost_price: 120,  discount: 0,    tax: 0,    line_total: 900,
    base_line_total: 900,   cost_total: 600 },
  { id: "sii_003", sales_invoice_id: "si_002", product_unit_id: "pu_007", warehouse_id: "wh_001", quantity: 2,  unit_price: 12000, cost_price: 8000, discount: 2400, tax: 3240, line_total: 24840,
    base_line_total: 24840, cost_total: 16000 },
  { id: "sii_004", sales_invoice_id: "si_003", product_unit_id: "pu_004", warehouse_id: "wh_001", quantity: 1,  unit_price: 750,   cost_price: 600,  discount: 0,    tax: 0,    line_total: 750,
    base_line_total: 750,   cost_total: 600 },
  { id: "sii_005", sales_invoice_id: "si_004", product_unit_id: "pu_005", warehouse_id: "wh_001", quantity: 3,  unit_price: 2200,  cost_price: 1800, discount: 100,  tax: 0,    line_total: 6500,
    base_line_total: 6500,  cost_total: 5400 },
];

// ─── Sales Returns ────────────────────────────────────────────────────────────
export const MOCK_SALES_RETURNS: SalesReturn[] = [
  {
    id: "sr_001", business_id: "biz_001", branch_id: "br_001",
    sales_invoice_id: "si_001", return_number: "RTN-2024-001",
    return_date: "2024-06-27T10:00:00Z",
    currency_id: "11111111-1111-1111-1111-111111111111",
    exchange_rate: 1, total_amount: 160,
    base_total_amount: 160,
    status: "Posted", notes: "منتج تالف",
    created_by: "usr_001",
    created_at: "2024-06-27T10:00:00Z", updated_at: "2024-06-27T10:00:00Z",
  },
];

// ─── Utility Helpers ──────────────────────────────────────────────────────────

/** Calculate a CartLine totals from inputs */
export function buildCartLine(
  product_unit: CartLine["product_unit"],
  warehouse_id: string,
  quantity: number,
  unit_price: number,
  discount: number,
  taxRate: number
): CartLine {
  const gross      = unit_price * quantity;
  const line_total = gross - discount + (gross - discount) * (taxRate / 100);
  const cost_total = product_unit.cost_price * quantity;
  return {
    product_unit,
    warehouse_id,
    quantity,
    unit_price,
    discount,
    tax: (gross - discount) * (taxRate / 100),
    line_total,
    base_line_total: line_total,
    cost_total,
  };
}

/** Generate the next invoice number */
export function nextInvoiceNumber(existing: Pick<SalesInvoice, "invoice_number">[]): string {
  const nums = existing
    .map((i) => parseInt(i.invoice_number.split("-").pop() ?? "0"))
    .filter(Boolean);
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `INV-${new Date().getFullYear()}-${String(next).padStart(4, "0")}`;
}
