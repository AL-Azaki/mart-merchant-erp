// ═══════════════════════════════════════════════════════════════════════════════
// PURCHASES MOCK DATA — mirrors DB schema exactly (v2.1 — cleaned)
// ═══════════════════════════════════════════════════════════════════════════════

import type { Supplier, PurchaseInvoice, PurchaseInvoiceItem, PurchaseReturn, PurchaseReturnItem } from "@/core/types/purchases";

// ─── Suppliers ────────────────────────────────────────────────────────────────
export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id:               "sup_001",
    business_id:      "biz_001",
    supplier_name:    "شركة الفجر للتوزيع",
    contact_person:   "عبدالله محمد الفجر",
    phone:            "+967771100200",
    supplier_address: "شارع الستين، صنعاء",
    is_active:        true,
    default_currency_id: "cur_yer",
    created_at:       "2024-01-20T09:00:00Z",
    updated_at:       "2024-01-20T09:00:00Z",
    deleted_at:       null,
  },
  {
    id:               "sup_002",
    business_id:      "biz_001",
    supplier_name:    "مؤسسة البدر للمواد الغذائية",
    contact_person:   "خالد البدر",
    phone:            "+967773300400",
    supplier_address: "منطقة الصناعية، عدن",
    is_active:        true,
    default_currency_id: "cur_yer",
    created_at:       "2024-02-10T10:00:00Z",
    updated_at:       "2024-02-10T10:00:00Z",
    deleted_at:       null,
  },
  {
    id:               "sup_003",
    business_id:      "biz_001",
    supplier_name:    "شركة النخبة للإلكترونيات",
    contact_person:   null,
    phone:            "+967776600700",
    supplier_address: "حي السبعين، صنعاء",
    is_active:        false,
    default_currency_id: "cur_yer",
    created_at:       "2024-03-01T08:00:00Z",
    updated_at:       "2024-05-15T08:00:00Z",
    deleted_at:       null,
  },
];

// ─── Purchase Invoices ────────────────────────────────────────────────────────
export const MOCK_PURCHASE_INVOICES: PurchaseInvoice[] = [
  {
    id:             "po_001",
    business_id:    "biz_001",
    branch_id:      "br_001",
    supplier_id:    "sup_001",
    warehouse_id:   "wh_001",
    invoice_number: "PI-2024-001",
    purchase_date:  "2024-06-20T08:00:00Z",
    due_date:       null,
    currency_id:    "cur_yer",
    exchange_rate:  1,
    sub_total:      22000,
    discount_total: 0,
    tax_total:      0,
    grand_total:    22000,
    base_sub_total:      22000,
    base_discount_total: 0,
    base_tax_total:      0,
    base_grand_total:    22000,
    status:         "Posted",
    notes:          "أول دفعة من المورد",
    created_by:     "usr_001",
    created_at:     "2024-06-20T08:00:00Z",
    updated_at:     "2024-06-20T08:00:00Z",
    deleted_at:       null,
  },
  {
    id:             "po_002",
    business_id:    "biz_001",
    branch_id:      "br_001",
    supplier_id:    "sup_002",
    warehouse_id:   "wh_001",
    invoice_number: "PI-2024-002",
    purchase_date:  "2024-06-22T10:00:00Z",
    due_date:       "2024-07-22T00:00:00Z",
    currency_id:    "cur_yer",
    exchange_rate:  1,
    sub_total:      45000,
    discount_total: 1500,
    tax_total:      0,
    grand_total:    43500,
    base_sub_total:      43500,
    base_discount_total: 0,
    base_tax_total:      0,
    base_grand_total:    43500,
    status:         "Draft",
    notes:          null,
    created_by:     "usr_001",
    created_at:     "2024-06-22T10:00:00Z",
    updated_at:     "2024-06-22T10:00:00Z",
    deleted_at:     null,
  },
];

// ─── Purchase Invoice Items ───────────────────────────────────────────────────
export const MOCK_PURCHASE_INVOICE_ITEMS: PurchaseInvoiceItem[] = [
  {
    id:                  "pii_001",
    purchase_invoice_id: "po_001",
    product_unit_id:     "pu_001",
    warehouse_id:        "wh_001",
    quantity:            200,
    unit_price:          50,
    discount:            0,
    tax:                 0,
    line_total:          10000,
    base_line_total:     10000,
  },
  {
    id:                  "pii_002",
    purchase_invoice_id: "po_001",
    product_unit_id:     "pu_003",
    warehouse_id:        "wh_001",
    quantity:            100,
    unit_price:          120,
    discount:            0,
    tax:                 0,
    line_total:          12000,
    base_line_total:     12000,
  },
  {
    id:                  "pii_003",
    purchase_invoice_id: "po_002",
    product_unit_id:     "pu_004",
    warehouse_id:        "wh_001",
    quantity:            50,
    unit_price:          600,
    discount:            750,
    tax:                 0,
    line_total:          29250,
    base_line_total:     29250,
  },
  {
    id:                  "pii_004",
    purchase_invoice_id: "po_002",
    product_unit_id:     "pu_005",
    warehouse_id:        "wh_001",
    quantity:            10,
    unit_price:          1800,
    discount:            750,
    tax:                 0,
    line_total:          17250,
    base_line_total:     17250,
  },
];

// ─── Purchase Returns ─────────────────────────────────────────────────────────
export const MOCK_PURCHASE_RETURNS: PurchaseReturn[] = [
  {
    id:                  "pr_001",
    business_id:         "biz_001",
    branch_id:           "br_001",
    purchase_invoice_id: "po_001",
    return_number:       "PRN-2024-001",
    return_date:         "2024-06-21T09:00:00Z",
    currency_id:         "cur_yer",
    exchange_rate:       1,
    total_amount:        5000,
    base_total_amount:   5000,
    status:              "Posted",
    notes:               "منتجات تالفة من الشحنة",
    created_by:          "usr_001",
    created_at:          "2024-06-21T09:00:00Z",
    updated_at:          "2024-06-21T09:00:00Z",
  },
];

// ─── Purchase Return Items ────────────────────────────────────────────────────
export const MOCK_PURCHASE_RETURN_ITEMS: PurchaseReturnItem[] = [
  {
    id:                 "pri_001",
    purchase_return_id: "pr_001",
    product_unit_id:    "pu_001",
    warehouse_id:       "wh_001",
    quantity:           100,
    unit_price:         50,
    line_total:         5000,
    base_line_total:    5000,
  },
];

// ─── Utility helpers ──────────────────────────────────────────────────────────
export function nextPurchaseNumber(existing: Pick<PurchaseInvoice, "invoice_number">[]): string {
  const nums = existing
    .map((i) => parseInt(i.invoice_number.split("-").pop() ?? "0"))
    .filter(Boolean);
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `PI-${new Date().getFullYear()}-${String(next).padStart(3, "0")}`;
}

export const MOCK_PURCHASE_PAYMENTS: any[] = [];
