// ═══════════════════════════════════════════════════════════════════════════════
// INVENTORY TYPES — Domain 4: Inventory
// Mirrors DB schema exactly (smart_merchant_erp_schema.sql v2.0)
// Tables: warehouses, inventories, inventory_transactions,
//         inventory_transfers, inventory_transfer_items
// ═══════════════════════════════════════════════════════════════════════════════

import type { UUID, ISODateString } from "./index";
import type { ProductUnit, Product, Unit } from "./catalog";

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: warehouses
// Description: Stock warehouses per branch.
// ═══════════════════════════════════════════════════════════════════════════════
export interface Warehouse {
  id:             UUID;
  business_id:    UUID;
  branch_id:      UUID;
  warehouse_name: string;
  warehouse_code: string;       // unique per business
  address:        string | null;
  is_default:     boolean;
  is_active:      boolean;
  created_at:     ISODateString;
  updated_at:     ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: inventories
// Description: Real-time stock levels per product_unit per warehouse.
//   Keyed by (warehouse_id, product_unit_id).
// ═══════════════════════════════════════════════════════════════════════════════
export interface Inventory {
  id:              UUID;
  warehouse_id:    UUID;
  product_unit_id: UUID;
  quantity:        number;         // current stock level
  average_cost:    number;         // weighted average cost (AVCO method)
  alert_quantity:  number;         // trigger low-stock alert when quantity <= this
  updated_at:      ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: inventory_transactions
// Description: Immutable ledger of all stock movements (In / Out / Adjust).
// ═══════════════════════════════════════════════════════════════════════════════
export type InventoryTransactionType  = "In" | "Out" | "Adjust";
export type InventoryReferenceType    =
  | "SalesInvoice"    | "SalesReturn"
  | "PurchaseInvoice" | "PurchaseReturn"
  | "Transfer"        | "Adjustment";

export interface InventoryTransaction {
  id:               UUID;
  inventory_id:     UUID;           // FK → inventories.id
  product_unit_id:  UUID;           // FK → product_units.id
  transaction_type: InventoryTransactionType;
  quantity:         number;
  unit_cost:        number;
  reference_type:   InventoryReferenceType;
  reference_id:     UUID;           // polymorphic FK (no DB constraint)
  transaction_date: ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: inventory_transfers
// Description: Header of a stock transfer between warehouses.
// ═══════════════════════════════════════════════════════════════════════════════
export type InventoryTransferStatus = "Pending" | "Completed" | "Cancelled";

export interface InventoryTransfer {
  id:                UUID;
  business_id:       UUID;
  from_warehouse_id: UUID;
  to_warehouse_id:   UUID;
  transfer_number:   string;
  transfer_date:     ISODateString;
  status:            InventoryTransferStatus;
  notes:             string | null;
  created_by:        UUID;
  created_at:        ISODateString;
  updated_at:        ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: inventory_transfer_items
// Description: Line items of a stock transfer.
// ═══════════════════════════════════════════════════════════════════════════════
export interface InventoryTransferItem {
  id:              UUID;
  transfer_id:     UUID;
  product_unit_id: UUID;
  quantity:        number;
  unit_cost:       number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI-ONLY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Inventory with product and warehouse hydrated — for stock level screens */
export interface InventoryWithDetails extends Inventory {
  product_unit: ProductUnit & { product: Product; unit: Unit };
  warehouse:    Warehouse;
}

/** Inventory transfer with hydrated warehouses and items */
export interface InventoryTransferWithDetails extends InventoryTransfer {
  from_warehouse: Warehouse;
  to_warehouse:   Warehouse;
  items:          (InventoryTransferItem & {
    product_unit: ProductUnit & { product: Product; unit: Unit };
  })[];
}
