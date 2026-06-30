-- ======================================================================
-- Smart Merchant ERP — Database Schema v2.0
-- ======================================================================
-- Date     : 2026-06-28
-- Version  : 2.0 (Audited & Corrected)
-- Target   : MySQL 8.0+ / MariaDB 10.6+
-- Charset  : utf8mb4_unicode_ci
-- Engine   : InnoDB (required for Foreign Key support)
-- ======================================================================
-- NOTE: UUID type uses CHAR(36). In PostgreSQL replace with UUID type.
-- NOTE: ENUM types are MySQL-specific. In PostgreSQL use CHECK constraints.
-- ======================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ======================================================================
-- DOMAIN 1 — CORE
-- Entities: accounts, businesses, branches, plans, subscriptions,
--           roles, permissions, users, user_roles, role_permissions,
--           user_branches
-- ======================================================================

-- ------------------------------------------------------------
-- Table: accounts
-- Description: Top-level tenant. Root entity for all data.
-- ------------------------------------------------------------
CREATE TABLE accounts (
    id          CHAR(36)        NOT NULL DEFAULT (UUID()),
    name        VARCHAR(200)    NOT NULL,
    owner_name  VARCHAR(150)    NOT NULL,
    email       VARCHAR(255)    NOT NULL,
    phone       VARCHAR(30)     NULL,
    status      ENUM('Active','Suspended','Closed') NOT NULL DEFAULT 'Active',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP       NULL,
    CONSTRAINT pk_accounts PRIMARY KEY (id),
    CONSTRAINT uq_accounts_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tenant account — root entity of the system.';

-- ------------------------------------------------------------
-- Table: businesses
-- Description: Business entity belonging to an account.
-- ------------------------------------------------------------
CREATE TABLE businesses (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    account_id      CHAR(36)        NOT NULL,
    business_name   VARCHAR(255)    NOT NULL,
    business_type   VARCHAR(100)    NULL,
    primary_phone   VARCHAR(30)     NULL,
    primary_email   VARCHAR(255)    NULL,
    logo_path       VARCHAR(500)    NULL,
    status          ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_businesses PRIMARY KEY (id),
    CONSTRAINT fk_businesses_account FOREIGN KEY (account_id)
        REFERENCES accounts(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_businesses_account_id (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Business entity (company/store) under an account.';

-- ------------------------------------------------------------
-- Table: branches
-- Description: Branch belonging to a business.
-- ------------------------------------------------------------
CREATE TABLE branches (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id     CHAR(36)        NOT NULL,
    branch_name     VARCHAR(255)    NOT NULL,
    branch_code     VARCHAR(50)     NOT NULL,
    phone           VARCHAR(30)     NULL,
    email           VARCHAR(255)    NULL,
    address         TEXT            NULL,
    is_default      BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_branches PRIMARY KEY (id),
    CONSTRAINT uq_branches_code UNIQUE (business_id, branch_code),
    CONSTRAINT fk_branches_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_branches_business_id (business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Branch of a business.';

-- ------------------------------------------------------------
-- Table: plans
-- Description: SaaS subscription plans.
-- ------------------------------------------------------------
CREATE TABLE plans (
    id               CHAR(36)        NOT NULL DEFAULT (UUID()),
    plan_name        VARCHAR(100)    NOT NULL,
    billing_cycle    VARCHAR(100)    NOT NULL COMMENT 'Monthly / Yearly',
    duration_months  INT             NOT NULL,
    price            DECIMAL(18,2)   NOT NULL,
    max_businesses   INT             NOT NULL DEFAULT 1,
    max_branches     INT             NOT NULL DEFAULT 1,
    max_users        INT             NOT NULL DEFAULT 5,
    is_active        BOOLEAN         NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_plans PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Subscription plans available in the platform.';

-- ------------------------------------------------------------
-- Table: subscriptions
-- Description: Account subscription to a plan.
-- ------------------------------------------------------------
CREATE TABLE subscriptions (
    id          CHAR(36)        NOT NULL DEFAULT (UUID()),
    account_id  CHAR(36)        NOT NULL,
    plan_id     CHAR(36)        NOT NULL,
    start_date  DATE            NOT NULL,
    end_date    DATE            NOT NULL,
    status      ENUM('Active','Expired','Cancelled') NOT NULL DEFAULT 'Active',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_subscriptions PRIMARY KEY (id),
    CONSTRAINT fk_subscriptions_account FOREIGN KEY (account_id)
        REFERENCES accounts(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_subscriptions_plan FOREIGN KEY (plan_id)
        REFERENCES plans(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_subscriptions_account_id (account_id),
    INDEX idx_subscriptions_plan_id (plan_id),
    INDEX idx_subscriptions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Account subscription record.';

-- ------------------------------------------------------------
-- Table: roles
-- Description: User roles per business (Sales Manager, Cashier, etc.).
-- ------------------------------------------------------------
CREATE TABLE roles (
    id             CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id    CHAR(36)        NOT NULL,
    role_name      VARCHAR(100)    NOT NULL,
    description    TEXT            NULL,
    is_system_role BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_roles PRIMARY KEY (id),
    CONSTRAINT fk_roles_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_roles_business_id (business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Role definitions per business.';

-- ------------------------------------------------------------
-- Table: permissions
-- Description: System-level permissions per module.
-- ------------------------------------------------------------
CREATE TABLE permissions (
    id               CHAR(36)        NOT NULL DEFAULT (UUID()),
    module           VARCHAR(100)    NOT NULL,
    permission_code  VARCHAR(100)    NOT NULL,
    permission_name  VARCHAR(100)    NOT NULL,
    description      TEXT            NULL,
    CONSTRAINT pk_permissions PRIMARY KEY (id),
    CONSTRAINT uq_permissions_code UNIQUE (permission_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='System-level permissions catalogue.';

-- ------------------------------------------------------------
-- Table: users
-- Description: System users with login access.
-- ------------------------------------------------------------
CREATE TABLE users (
    id                 CHAR(36)        NOT NULL DEFAULT (UUID()),
    account_id         CHAR(36)        NOT NULL,
    default_branch_id  CHAR(36)        NULL,
    username           VARCHAR(50)     NOT NULL,
    email              VARCHAR(255)    NOT NULL,
    password_hash      VARCHAR(255)    NOT NULL,
    full_name          VARCHAR(255)    NOT NULL,
    phone              VARCHAR(30)     NULL,
    is_active          BOOLEAN         NOT NULL DEFAULT TRUE,
    last_login_at      TIMESTAMP       NULL,
    created_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_username UNIQUE (account_id, username),
    CONSTRAINT uq_users_email UNIQUE (account_id, email),
    CONSTRAINT fk_users_account FOREIGN KEY (account_id)
        REFERENCES accounts(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_users_default_branch FOREIGN KEY (default_branch_id)
        REFERENCES branches(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_users_account_id (account_id),
    INDEX idx_users_default_branch_id (default_branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='System users with login access.';

-- ------------------------------------------------------------
-- Table: user_roles  [Junction: users ↔ roles]
-- ------------------------------------------------------------
CREATE TABLE user_roles (
    user_id     CHAR(36)    NOT NULL,
    role_id     CHAR(36)    NOT NULL,
    assigned_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id)
        REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_roles_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Junction: assigns roles to users.';

-- ------------------------------------------------------------
-- Table: role_permissions  [Junction: roles ↔ permissions]
-- ------------------------------------------------------------
CREATE TABLE role_permissions (
    role_id       CHAR(36)    NOT NULL,
    permission_id CHAR(36)    NOT NULL,
    CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id)
        REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id)
        REFERENCES permissions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_role_permissions_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Junction: assigns permissions to roles.';

-- ------------------------------------------------------------
-- Table: user_branches  [Junction: users ↔ branches]
-- ------------------------------------------------------------
CREATE TABLE user_branches (
    user_id     CHAR(36)    NOT NULL,
    branch_id   CHAR(36)    NOT NULL,
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    assigned_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_user_branches PRIMARY KEY (user_id, branch_id),
    CONSTRAINT fk_user_branches_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_branches_branch FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_branches_branch_id (branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Junction: assigns users to allowed branches.';

-- ======================================================================
-- DOMAIN 3 — CATALOG
-- Entities: categories, brands, units, products, product_units,
--           product_images
-- ======================================================================

-- ------------------------------------------------------------
-- Table: categories
-- Description: Product categories (supports tree hierarchy via parent_id).
-- ------------------------------------------------------------
CREATE TABLE categories (
    id            CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id   CHAR(36)        NOT NULL,
    parent_id     CHAR(36)        NULL COMMENT 'Self-referencing FK for tree structure.',
    category_name VARCHAR(100)    NOT NULL,
    description   TEXT            NULL,
    image_path    VARCHAR(500)    NULL,
    is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_categories PRIMARY KEY (id),
    CONSTRAINT fk_categories_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id)
        REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_categories_business_id (business_id),
    INDEX idx_categories_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Product categories with unlimited nesting levels.';

-- ------------------------------------------------------------
-- Table: brands
-- Description: Product brands / trademarks per business.
-- ------------------------------------------------------------
CREATE TABLE brands (
    id          CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id CHAR(36)        NOT NULL,
    brand_name  VARCHAR(100)    NOT NULL,
    description TEXT            NULL,
    logo_path   VARCHAR(500)    NULL,
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_brands PRIMARY KEY (id),
    CONSTRAINT fk_brands_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_brands_business_id (business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Product brands per business.';

-- ------------------------------------------------------------
-- Table: units
-- Description: Global units of measure (piece, kg, carton, etc.).
-- ------------------------------------------------------------
CREATE TABLE units (
    id               CHAR(36)        NOT NULL DEFAULT (UUID()),
    unit_name        VARCHAR(100)    NOT NULL,
    unit_symbol      VARCHAR(10)     NOT NULL,
    unit_description TEXT            NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_units PRIMARY KEY (id),
    CONSTRAINT uq_units_symbol UNIQUE (unit_symbol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Global units of measure.';

-- ------------------------------------------------------------
-- Table: products
-- Description: Core product record (business-level, not branch-specific).
-- ------------------------------------------------------------
CREATE TABLE products (
    id           CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id  CHAR(36)        NOT NULL,
    category_id  CHAR(36)        NULL,
    brand_id     CHAR(36)        NULL,
    product_code VARCHAR(100)    NOT NULL,
    product_name VARCHAR(255)    NOT NULL,
    description  TEXT            NULL,
    is_active    BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at   TIMESTAMP       NULL,
    CONSTRAINT pk_products PRIMARY KEY (id),
    CONSTRAINT uq_products_code UNIQUE (business_id, product_code),
    CONSTRAINT fk_products_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id)
        REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_products_brand FOREIGN KEY (brand_id)
        REFERENCES brands(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_products_business_id (business_id),
    INDEX idx_products_category_id (category_id),
    INDEX idx_products_brand_id (brand_id),
    INDEX idx_products_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Core product definitions (not branch-specific).';

-- ------------------------------------------------------------
-- Table: product_units
-- Description: Units, barcodes, SKUs, and prices per product unit.
-- ------------------------------------------------------------
CREATE TABLE product_units (
    id                CHAR(36)        NOT NULL DEFAULT (UUID()),
    product_id        CHAR(36)        NOT NULL,
    unit_id           CHAR(36)        NOT NULL,
    sku               VARCHAR(100)    NULL,
    barcode           VARCHAR(100)    NULL,
    conversion_factor DECIMAL(18,4)   NOT NULL DEFAULT 1.0000
                      COMMENT 'Qty of this unit = 1 base unit.',
    purchase_price    DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    selling_price     DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    minimum_price     DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    is_base_unit      BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active         BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_product_units PRIMARY KEY (id),
    CONSTRAINT uq_product_units_barcode UNIQUE (barcode),
    CONSTRAINT uq_product_units_sku UNIQUE (product_id, sku),
    CONSTRAINT fk_product_units_product FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_product_units_unit FOREIGN KEY (unit_id)
        REFERENCES units(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_product_units_product_id (product_id),
    INDEX idx_product_units_unit_id (unit_id),
    INDEX idx_product_units_barcode (barcode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Product units with pricing, barcode, and conversion factor. SKU is unique per product.';

-- ------------------------------------------------------------
-- Table: product_images
-- Description: Product images (one can be marked as primary).
-- ------------------------------------------------------------
CREATE TABLE product_images (
    id         CHAR(36)        NOT NULL DEFAULT (UUID()),
    product_id CHAR(36)        NOT NULL,
    image_path VARCHAR(500)    NOT NULL,
    is_primary BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_product_images PRIMARY KEY (id),
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_product_images_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Product image gallery.';

-- ======================================================================
-- DOMAIN 4 — INVENTORY
-- Entities: warehouses, inventories, inventory_transactions,
--           inventory_transfers, inventory_transfer_items
-- ======================================================================

-- ------------------------------------------------------------
-- Table: warehouses
-- Description: Stock warehouses per branch.
-- ------------------------------------------------------------
CREATE TABLE warehouses (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id     CHAR(36)        NOT NULL,
    branch_id       CHAR(36)        NOT NULL,
    warehouse_name  VARCHAR(255)    NOT NULL,
    warehouse_code  VARCHAR(100)    NOT NULL,
    address         VARCHAR(255)    NULL,
    is_default      BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_warehouses PRIMARY KEY (id),
    CONSTRAINT uq_warehouses_code UNIQUE (business_id, warehouse_code),
    CONSTRAINT fk_warehouses_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_warehouses_branch FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_warehouses_business_id (business_id),
    INDEX idx_warehouses_branch_id (branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Stock warehouses per branch.';

-- ------------------------------------------------------------
-- Table: inventories
-- Description: Current stock level per product_unit per warehouse.
-- ------------------------------------------------------------
CREATE TABLE inventories (
    id               CHAR(36)        NOT NULL DEFAULT (UUID()),
    warehouse_id     CHAR(36)        NOT NULL,
    product_unit_id  CHAR(36)        NOT NULL,
    quantity         DECIMAL(18,3)   NOT NULL DEFAULT 0.000,
    average_cost     DECIMAL(18,2)   NOT NULL DEFAULT 0.00
                     COMMENT 'Weighted Average Cost (AVCO method).',
    alert_quantity   DECIMAL(18,3)   NOT NULL DEFAULT 0.000,
    updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_inventories PRIMARY KEY (id),
    CONSTRAINT uq_inventories_warehouse_unit UNIQUE (warehouse_id, product_unit_id),
    CONSTRAINT fk_inventories_warehouse FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_inventories_product_unit FOREIGN KEY (product_unit_id)
        REFERENCES product_units(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_inventories_warehouse_id (warehouse_id),
    INDEX idx_inventories_product_unit_id (product_unit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Real-time stock levels per product unit per warehouse.';

-- ------------------------------------------------------------
-- Table: inventory_transactions
-- Description: Ledger of all stock movements (In/Out/Adjust).
-- ------------------------------------------------------------
CREATE TABLE inventory_transactions (
    id               CHAR(36)        NOT NULL DEFAULT (UUID()),
    inventory_id     CHAR(36)        NOT NULL,
    product_unit_id  CHAR(36)        NOT NULL,
    transaction_type ENUM('In','Out','Adjust') NOT NULL,
    quantity         DECIMAL(18,3)   NOT NULL,
    unit_cost        DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    reference_type   ENUM(
                        'SalesInvoice','SalesReturn',
                        'PurchaseInvoice','PurchaseReturn',
                        'Transfer','Adjustment'
                     ) NOT NULL,
    reference_id     CHAR(36)        NOT NULL,
    transaction_date TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_inventory_transactions PRIMARY KEY (id),
    CONSTRAINT fk_inv_tx_inventory FOREIGN KEY (inventory_id)
        REFERENCES inventories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_inv_tx_product_unit FOREIGN KEY (product_unit_id)
        REFERENCES product_units(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_inv_tx_inventory_id (inventory_id),
    INDEX idx_inv_tx_product_unit_id (product_unit_id),
    INDEX idx_inv_tx_reference (reference_type, reference_id),
    INDEX idx_inv_tx_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Immutable ledger of all stock movements.';

-- ------------------------------------------------------------
-- Table: inventory_transfers
-- Description: Header of a stock transfer between warehouses.
-- ------------------------------------------------------------
CREATE TABLE inventory_transfers (
    id                 CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id        CHAR(36)        NOT NULL,
    from_warehouse_id  CHAR(36)        NOT NULL,
    to_warehouse_id    CHAR(36)        NOT NULL,
    transfer_number    VARCHAR(50)     NOT NULL,
    transfer_date      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status             ENUM('Pending','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
    notes              TEXT            NULL,
    created_by         CHAR(36)        NOT NULL,
    created_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_inventory_transfers PRIMARY KEY (id),
    CONSTRAINT uq_inventory_transfers_number UNIQUE (business_id, transfer_number),
    CONSTRAINT fk_inv_transfer_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_inv_transfer_from_wh FOREIGN KEY (from_warehouse_id)
        REFERENCES warehouses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_inv_transfer_to_wh FOREIGN KEY (to_warehouse_id)
        REFERENCES warehouses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_inv_transfer_created_by FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_inv_transfers_business_id (business_id),
    INDEX idx_inv_transfers_from_wh (from_warehouse_id),
    INDEX idx_inv_transfers_to_wh (to_warehouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Stock transfer header between warehouses.';

-- ------------------------------------------------------------
-- Table: inventory_transfer_items
-- Description: Line items of a stock transfer.
-- ------------------------------------------------------------
CREATE TABLE inventory_transfer_items (
    id               CHAR(36)        NOT NULL DEFAULT (UUID()),
    transfer_id      CHAR(36)        NOT NULL,
    product_unit_id  CHAR(36)        NOT NULL,
    quantity         DECIMAL(18,3)   NOT NULL,
    unit_cost        DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    CONSTRAINT pk_inventory_transfer_items PRIMARY KEY (id),
    CONSTRAINT fk_inv_transfer_items_transfer FOREIGN KEY (transfer_id)
        REFERENCES inventory_transfers(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_inv_transfer_items_product_unit FOREIGN KEY (product_unit_id)
        REFERENCES product_units(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_inv_transfer_items_transfer_id (transfer_id),
    INDEX idx_inv_transfer_items_product_unit_id (product_unit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Line items of a stock transfer.';

-- ======================================================================
-- DOMAIN 5 — SALES
-- Entities: customers, orders, order_items, sales_invoices,
--           sales_invoice_items, sales_returns, sales_return_items
-- ======================================================================

-- ------------------------------------------------------------
-- Table: customers
-- Description: Customers of a business (with soft delete).
-- ------------------------------------------------------------
CREATE TABLE customers (
    id            CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id   CHAR(36)        NOT NULL,
    customer_name VARCHAR(255)    NOT NULL,
    phone         VARCHAR(30)     NULL,
    email         VARCHAR(255)    NULL,
    address       TEXT            NULL,
    credit_limit  DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at    TIMESTAMP       NULL,
    CONSTRAINT pk_customers PRIMARY KEY (id),
    CONSTRAINT fk_customers_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_customers_business_id (business_id),
    INDEX idx_customers_phone (phone),
    INDEX idx_customers_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Customer records per business.';

-- ------------------------------------------------------------
-- Table: channels
-- Description: Sales channels (POS, Ecommerce, Wholesale).
-- NOTE: Created here because orders reference channels.
-- ------------------------------------------------------------
CREATE TABLE channels (
    id           CHAR(36)        NOT NULL DEFAULT (UUID()),
    channel_code VARCHAR(20)     NOT NULL,
    channel_name VARCHAR(255)    NOT NULL,
    channel_type ENUM('POS','Ecommerce','Wholesale','Other') NOT NULL,
    is_active    BOOLEAN         NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_channels PRIMARY KEY (id),
    CONSTRAINT uq_channels_code UNIQUE (channel_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Sales channels (POS, E-Commerce, etc.).';

-- ------------------------------------------------------------
-- Table: sales_invoices
-- Description: Final sales invoice issued to a customer.
-- ------------------------------------------------------------
CREATE TABLE sales_invoices (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id     CHAR(36)        NOT NULL,
    branch_id       CHAR(36)        NOT NULL,
    customer_id     CHAR(36)        NULL,
    invoice_number  VARCHAR(50)     NOT NULL,
    invoice_date    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date        TIMESTAMP       NULL,
    sub_total       DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    discount_total  DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    tax_total       DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    grand_total     DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    payment_status  ENUM('Unpaid','Partial','Paid') NOT NULL DEFAULT 'Unpaid',
    status          ENUM('Draft','Posted','Cancelled') NOT NULL DEFAULT 'Draft',
    notes           TEXT            NULL,
    created_by      CHAR(36)        NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP       NULL,
    CONSTRAINT pk_sales_invoices PRIMARY KEY (id),
    CONSTRAINT uq_sales_invoices_number UNIQUE (business_id, invoice_number),
    CONSTRAINT fk_sales_inv_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sales_inv_branch FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sales_inv_customer FOREIGN KEY (customer_id)
        REFERENCES customers(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_sales_inv_created_by FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_sales_inv_business_id (business_id),
    INDEX idx_sales_inv_branch_id (branch_id),
    INDEX idx_sales_inv_customer_id (customer_id),
    INDEX idx_sales_inv_status (status),
    INDEX idx_sales_inv_payment_status (payment_status),
    INDEX idx_sales_inv_date (invoice_date),
    INDEX idx_sales_inv_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Sales invoice header.';

-- ------------------------------------------------------------
-- Table: orders
-- Description: Sales order before conversion to invoice.
--   sales_invoice_id is NULL until the order is confirmed.
-- ------------------------------------------------------------
CREATE TABLE orders (
    id               CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id      CHAR(36)        NOT NULL,
    branch_id        CHAR(36)        NOT NULL,
    customer_id      CHAR(36)        NULL,
    channel_id       CHAR(36)        NULL,
    sales_invoice_id CHAR(36)        NULL COMMENT 'Populated after order is converted to invoice.',
    order_number     VARCHAR(50)     NOT NULL,
    order_date       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal         DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    discount_total   DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    tax_total        DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    grand_total      DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    status           ENUM('Draft','Pending','Confirmed','Processing','Ready','Completed','Cancelled')
                     NOT NULL DEFAULT 'Draft',
    payment_status   ENUM('Pending','Partial','Paid','Cancelled') NOT NULL DEFAULT 'Pending',
    notes            TEXT            NULL,
    created_by       CHAR(36)        NOT NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_orders PRIMARY KEY (id),
    CONSTRAINT uq_orders_number UNIQUE (business_id, order_number),
    CONSTRAINT fk_orders_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_orders_branch FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id)
        REFERENCES customers(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_orders_channel FOREIGN KEY (channel_id)
        REFERENCES channels(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_orders_sales_invoice FOREIGN KEY (sales_invoice_id)
        REFERENCES sales_invoices(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_orders_created_by FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_orders_business_id (business_id),
    INDEX idx_orders_branch_id (branch_id),
    INDEX idx_orders_customer_id (customer_id),
    INDEX idx_orders_channel_id (channel_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Sales order header (pre-invoice stage).';

-- ------------------------------------------------------------
-- Table: order_items
-- Description: Line items of a sales order.
-- ------------------------------------------------------------
CREATE TABLE order_items (
    id               CHAR(36)        NOT NULL DEFAULT (UUID()),
    order_id         CHAR(36)        NOT NULL,
    product_unit_id  CHAR(36)        NOT NULL,
    quantity         DECIMAL(18,3)   NOT NULL,
    unit_price       DECIMAL(18,2)   NOT NULL,
    discount_amount  DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    tax_amount       DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    line_total       DECIMAL(18,2)   NOT NULL,
    CONSTRAINT pk_order_items PRIMARY KEY (id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_order_items_product_unit FOREIGN KEY (product_unit_id)
        REFERENCES product_units(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_order_items_order_id (order_id),
    INDEX idx_order_items_product_unit_id (product_unit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Line items of a sales order.';

-- ------------------------------------------------------------
-- Table: sales_invoice_items
-- Description: Line items of a sales invoice.
-- ------------------------------------------------------------
CREATE TABLE sales_invoice_items (
    id               CHAR(36)        NOT NULL DEFAULT (UUID()),
    sales_invoice_id CHAR(36)        NOT NULL,
    product_unit_id  CHAR(36)        NOT NULL,
    warehouse_id     CHAR(36)        NOT NULL,
    quantity         DECIMAL(18,3)   NOT NULL,
    unit_price       DECIMAL(18,2)   NOT NULL,
    cost_price       DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    discount         DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    tax              DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    line_total       DECIMAL(18,2)   NOT NULL,
    cost_total       DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    CONSTRAINT pk_sales_invoice_items PRIMARY KEY (id),
    CONSTRAINT fk_sales_inv_items_invoice FOREIGN KEY (sales_invoice_id)
        REFERENCES sales_invoices(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sales_inv_items_product_unit FOREIGN KEY (product_unit_id)
        REFERENCES product_units(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sales_inv_items_warehouse FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_sales_inv_items_invoice_id (sales_invoice_id),
    INDEX idx_sales_inv_items_product_unit_id (product_unit_id),
    INDEX idx_sales_inv_items_warehouse_id (warehouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Line items of a sales invoice.';

-- ------------------------------------------------------------
-- Table: sales_returns
-- Description: Sales return (credit note) header.
-- ------------------------------------------------------------
CREATE TABLE sales_returns (
    id               CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id      CHAR(36)        NOT NULL,
    branch_id        CHAR(36)        NOT NULL,
    sales_invoice_id CHAR(36)        NOT NULL,
    return_number    VARCHAR(50)     NOT NULL,
    return_date      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount     DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    status           ENUM('Draft','Posted','Cancelled') NOT NULL DEFAULT 'Draft',
    notes            TEXT            NULL,
    created_by       CHAR(36)        NOT NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_sales_returns PRIMARY KEY (id),
    CONSTRAINT uq_sales_returns_number UNIQUE (business_id, return_number),
    CONSTRAINT fk_sales_ret_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sales_ret_branch FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sales_ret_invoice FOREIGN KEY (sales_invoice_id)
        REFERENCES sales_invoices(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sales_ret_created_by FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_sales_ret_business_id (business_id),
    INDEX idx_sales_ret_invoice_id (sales_invoice_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Sales return (credit note) header.';

-- ------------------------------------------------------------
-- Table: sales_return_items
-- Description: Line items of a sales return.
-- ------------------------------------------------------------
CREATE TABLE sales_return_items (
    id                    CHAR(36)        NOT NULL DEFAULT (UUID()),
    sales_return_id       CHAR(36)        NOT NULL,
    sales_invoice_item_id CHAR(36)        NOT NULL COMMENT 'Links back to the original invoice line.',
    product_unit_id       CHAR(36)        NOT NULL,
    warehouse_id          CHAR(36)        NOT NULL,
    quantity              DECIMAL(18,3)   NOT NULL,
    unit_price            DECIMAL(18,2)   NOT NULL,
    cost_price            DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    cost_total            DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    total_price           DECIMAL(18,2)   NOT NULL,
    CONSTRAINT pk_sales_return_items PRIMARY KEY (id),
    CONSTRAINT fk_sales_ret_items_return FOREIGN KEY (sales_return_id)
        REFERENCES sales_returns(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sales_ret_items_inv_item FOREIGN KEY (sales_invoice_item_id)
        REFERENCES sales_invoice_items(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sales_ret_items_product_unit FOREIGN KEY (product_unit_id)
        REFERENCES product_units(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sales_ret_items_warehouse FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_sales_ret_items_return_id (sales_return_id),
    INDEX idx_sales_ret_items_product_unit_id (product_unit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Line items of a sales return.';

-- ======================================================================
-- DOMAIN 6 — PURCHASING
-- Entities: suppliers, purchase_invoices, purchase_invoice_items,
--           purchase_returns, purchase_return_items
-- ======================================================================

-- ------------------------------------------------------------
-- Table: suppliers
-- Description: Supplier records per business (with soft delete).
-- ------------------------------------------------------------
CREATE TABLE suppliers (
    id               CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id      CHAR(36)        NOT NULL,
    supplier_name    VARCHAR(255)    NOT NULL,
    contact_person   VARCHAR(255)    NULL,
    phone            VARCHAR(30)     NULL,
    supplier_address VARCHAR(255)    NULL,
    is_active        BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at       TIMESTAMP       NULL,
    CONSTRAINT pk_suppliers PRIMARY KEY (id),
    CONSTRAINT fk_suppliers_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_suppliers_business_id (business_id),
    INDEX idx_suppliers_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Supplier records per business.';

-- ------------------------------------------------------------
-- Table: purchase_invoices
-- Description: Purchase invoice from a supplier.
-- ------------------------------------------------------------
CREATE TABLE purchase_invoices (
    id              CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id     CHAR(36)        NOT NULL,
    branch_id       CHAR(36)        NOT NULL,
    supplier_id     CHAR(36)        NOT NULL,
    warehouse_id    CHAR(36)        NOT NULL COMMENT 'Default receiving warehouse.',
    invoice_number  VARCHAR(50)     NOT NULL,
    purchase_date   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date        TIMESTAMP       NULL,
    sub_total       DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    discount_total  DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    tax_total       DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    grand_total     DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    status          ENUM('Draft','Posted','Cancelled') NOT NULL DEFAULT 'Draft',
    notes           TEXT            NULL,
    created_by      CHAR(36)        NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP       NULL,
    CONSTRAINT pk_purchase_invoices PRIMARY KEY (id),
    CONSTRAINT uq_purchase_invoices_number UNIQUE (business_id, invoice_number),
    CONSTRAINT fk_pur_inv_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pur_inv_branch FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pur_inv_supplier FOREIGN KEY (supplier_id)
        REFERENCES suppliers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pur_inv_warehouse FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pur_inv_created_by FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_pur_inv_business_id (business_id),
    INDEX idx_pur_inv_branch_id (branch_id),
    INDEX idx_pur_inv_supplier_id (supplier_id),
    INDEX idx_pur_inv_status (status),
    INDEX idx_pur_inv_date (purchase_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Purchase invoice header.';

-- ------------------------------------------------------------
-- Table: purchase_invoice_items
-- ------------------------------------------------------------
CREATE TABLE purchase_invoice_items (
    id                  CHAR(36)        NOT NULL DEFAULT (UUID()),
    purchase_invoice_id CHAR(36)        NOT NULL,
    product_unit_id     CHAR(36)        NOT NULL,
    warehouse_id        CHAR(36)        NOT NULL,
    quantity            DECIMAL(18,3)   NOT NULL,
    unit_price          DECIMAL(18,2)   NOT NULL,
    discount            DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    tax                 DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    line_total          DECIMAL(18,2)   NOT NULL,
    CONSTRAINT pk_purchase_invoice_items PRIMARY KEY (id),
    CONSTRAINT fk_pur_inv_items_invoice FOREIGN KEY (purchase_invoice_id)
        REFERENCES purchase_invoices(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pur_inv_items_product_unit FOREIGN KEY (product_unit_id)
        REFERENCES product_units(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pur_inv_items_warehouse FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_pur_inv_items_invoice_id (purchase_invoice_id),
    INDEX idx_pur_inv_items_product_unit_id (product_unit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Line items of a purchase invoice.';

-- ------------------------------------------------------------
-- Table: purchase_returns
-- ------------------------------------------------------------
CREATE TABLE purchase_returns (
    id                  CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id         CHAR(36)        NOT NULL,
    branch_id           CHAR(36)        NOT NULL,
    purchase_invoice_id CHAR(36)        NOT NULL,
    return_number       VARCHAR(50)     NOT NULL,
    return_date         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount        DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    status              ENUM('Draft','Posted','Cancelled') NOT NULL DEFAULT 'Draft',
    notes               TEXT            NULL,
    created_by          CHAR(36)        NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_purchase_returns PRIMARY KEY (id),
    CONSTRAINT uq_purchase_returns_number UNIQUE (business_id, return_number),
    CONSTRAINT fk_pur_ret_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pur_ret_branch FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pur_ret_invoice FOREIGN KEY (purchase_invoice_id)
        REFERENCES purchase_invoices(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pur_ret_created_by FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_pur_ret_business_id (business_id),
    INDEX idx_pur_ret_invoice_id (purchase_invoice_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Purchase return header.';

-- ------------------------------------------------------------
-- Table: purchase_return_items
-- ------------------------------------------------------------
CREATE TABLE purchase_return_items (
    id                 CHAR(36)        NOT NULL DEFAULT (UUID()),
    purchase_return_id CHAR(36)        NOT NULL,
    product_unit_id    CHAR(36)        NOT NULL,
    warehouse_id       CHAR(36)        NOT NULL,
    quantity           DECIMAL(18,3)   NOT NULL,
    unit_price         DECIMAL(18,2)   NOT NULL,
    line_total         DECIMAL(18,2)   NOT NULL,
    CONSTRAINT pk_purchase_return_items PRIMARY KEY (id),
    CONSTRAINT fk_pur_ret_items_return FOREIGN KEY (purchase_return_id)
        REFERENCES purchase_returns(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pur_ret_items_product_unit FOREIGN KEY (product_unit_id)
        REFERENCES product_units(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pur_ret_items_warehouse FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_pur_ret_items_return_id (purchase_return_id),
    INDEX idx_pur_ret_items_product_unit_id (product_unit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Line items of a purchase return.';

-- ======================================================================
-- DOMAIN 7 — FINANCE
-- Entities: currencies, payment_methods, payments, expense_categories,
--           expenses, chart_of_accounts, journal_entries,
--           journal_entry_lines, fiscal_years, fiscal_periods,
--           opening_balances
-- ======================================================================

-- ------------------------------------------------------------
-- Table: currencies
-- Description: Global currencies (System-level, not per-business).
--   Only ONE record may have is_base_currency = TRUE.
-- ------------------------------------------------------------
CREATE TABLE currencies (
    id               CHAR(36)        NOT NULL DEFAULT (UUID()),
    currency_code    VARCHAR(10)     NOT NULL,
    currency_name_ar VARCHAR(100)    NOT NULL,
    currency_name_en VARCHAR(100)    NOT NULL,
    currency_symbol  VARCHAR(10)     NOT NULL,
    decimal_places   INT             NOT NULL DEFAULT 2,
    exchange_rate    DECIMAL(18,8)   NOT NULL DEFAULT 1.00000000
                     COMMENT 'Rate relative to base currency.',
    is_base_currency BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active        BOOLEAN         NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_currencies PRIMARY KEY (id),
    CONSTRAINT uq_currencies_code UNIQUE (currency_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Global currencies table (system-level, not per business).';

-- ------------------------------------------------------------
-- Table: payment_methods
-- Description: Payment methods configured per business.
-- ------------------------------------------------------------
CREATE TABLE payment_methods (
    id           CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id  CHAR(36)        NOT NULL,
    method_code  VARCHAR(30)     NOT NULL,
    method_name  VARCHAR(100)    NOT NULL,
    payment_type ENUM('Cash','Bank','Card','DigitalWallet','Other') NOT NULL,
    is_active    BOOLEAN         NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_payment_methods PRIMARY KEY (id),
    CONSTRAINT uq_payment_methods_code UNIQUE (business_id, method_code),
    CONSTRAINT fk_payment_methods_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_payment_methods_business_id (business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Payment methods per business.';

-- ------------------------------------------------------------
-- Table: fiscal_years
-- Description: Fiscal year per business.
-- ------------------------------------------------------------
CREATE TABLE fiscal_years (
    id               CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id      CHAR(36)        NOT NULL,
    fiscal_year_code VARCHAR(20)     NOT NULL,
    start_date       DATE            NOT NULL,
    end_date         DATE            NOT NULL,
    status           ENUM('Open','Closed') NOT NULL DEFAULT 'Open',
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_fiscal_years PRIMARY KEY (id),
    CONSTRAINT uq_fiscal_years_code UNIQUE (business_id, fiscal_year_code),
    CONSTRAINT fk_fiscal_years_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_fiscal_years_business_id (business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Fiscal year definitions per business.';

-- ------------------------------------------------------------
-- Table: fiscal_periods
-- Description: Monthly fiscal periods within a fiscal year.
-- ------------------------------------------------------------
CREATE TABLE fiscal_periods (
    id             CHAR(36)    NOT NULL DEFAULT (UUID()),
    fiscal_year_id CHAR(36)    NOT NULL,
    period_number  INT         NOT NULL COMMENT 'Range: 1–12.',
    start_date     DATE        NOT NULL,
    end_date       DATE        NOT NULL,
    status         ENUM('Open','Closed') NOT NULL DEFAULT 'Open',
    created_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_fiscal_periods PRIMARY KEY (id),
    CONSTRAINT uq_fiscal_periods_num UNIQUE (fiscal_year_id, period_number),
    CONSTRAINT fk_fiscal_periods_year FOREIGN KEY (fiscal_year_id)
        REFERENCES fiscal_years(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_fiscal_periods_year_id (fiscal_year_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Monthly accounting periods within a fiscal year.';

-- ------------------------------------------------------------
-- Table: chart_of_accounts
-- Description: Chart of accounts tree per business.
--   account_code convention: 1xxx=Asset, 2xxx=Liability,
--   3xxx=Equity, 4xxx=Revenue, 5xxx=Expense
-- ------------------------------------------------------------
CREATE TABLE chart_of_accounts (
    id                CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id       CHAR(36)        NOT NULL,
    parent_account_id CHAR(36)        NULL COMMENT 'Self-referencing FK for tree structure.',
    currency_id       CHAR(36)        NOT NULL,
    account_code      VARCHAR(50)     NOT NULL,
    account_name      VARCHAR(255)    NOT NULL,
    account_type      ENUM('Asset','Liability','Equity','Revenue','Expense') NOT NULL,
    account_category  VARCHAR(100)    NULL,
    normal_balance    ENUM('Debit','Credit') NOT NULL
                      COMMENT 'Debit: Assets/Expenses. Credit: Liabilities/Equity/Revenue.',
    account_level     INT             NOT NULL DEFAULT 1,
    allow_posting     BOOLEAN         NOT NULL DEFAULT FALSE
                      COMMENT 'TRUE = leaf account (detail); FALSE = group account.',
    is_system         BOOLEAN         NOT NULL DEFAULT FALSE
                      COMMENT 'System accounts cannot be deleted.',
    is_active         BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_chart_of_accounts PRIMARY KEY (id),
    CONSTRAINT uq_chart_of_accounts_code UNIQUE (business_id, account_code),
    CONSTRAINT fk_coa_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_coa_parent FOREIGN KEY (parent_account_id)
        REFERENCES chart_of_accounts(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_coa_currency FOREIGN KEY (currency_id)
        REFERENCES currencies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_coa_business_id (business_id),
    INDEX idx_coa_parent_id (parent_account_id),
    INDEX idx_coa_type (account_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Chart of accounts (COA) — tree structure per business.';

-- ------------------------------------------------------------
-- Table: journal_entries
-- Description: Accounting journal entry header.
--   Rule: SUM(debit_amount) = SUM(credit_amount) per entry.
--   reference_type links to the source document (polymorphic).
-- ------------------------------------------------------------
CREATE TABLE journal_entries (
    id               CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id      CHAR(36)        NOT NULL,
    fiscal_year_id   CHAR(36)        NOT NULL,
    fiscal_period_id CHAR(36)        NOT NULL,
    journal_number   VARCHAR(50)     NOT NULL,
    journal_date     DATE            NOT NULL,
    reference_type   ENUM(
                         'SalesInvoice','SalesReturn',
                         'PurchaseInvoice','PurchaseReturn',
                         'Payment','Expense','Manual'
                     ) NOT NULL,
    reference_id     CHAR(36)        NOT NULL COMMENT 'Polymorphic FK — no DB constraint (varies by reference_type).',
    status           ENUM('Draft','Posted','Reversed') NOT NULL DEFAULT 'Draft',
    notes            TEXT            NULL,
    created_by       CHAR(36)        NOT NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_journal_entries PRIMARY KEY (id),
    CONSTRAINT uq_journal_entries_number UNIQUE (business_id, journal_number),
    CONSTRAINT fk_je_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_je_fiscal_year FOREIGN KEY (fiscal_year_id)
        REFERENCES fiscal_years(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_je_fiscal_period FOREIGN KEY (fiscal_period_id)
        REFERENCES fiscal_periods(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_je_created_by FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_je_business_id (business_id),
    INDEX idx_je_fiscal_year_id (fiscal_year_id),
    INDEX idx_je_fiscal_period_id (fiscal_period_id),
    INDEX idx_je_date (journal_date),
    INDEX idx_je_reference (reference_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Journal entry header. Debits must equal Credits per entry.';

-- ------------------------------------------------------------
-- Table: journal_entry_lines
-- Description: Debit/Credit lines of a journal entry.
-- ------------------------------------------------------------
CREATE TABLE journal_entry_lines (
    id                   CHAR(36)        NOT NULL DEFAULT (UUID()),
    journal_entry_id     CHAR(36)        NOT NULL,
    chart_of_account_id  CHAR(36)        NOT NULL,
    line_number          INT             NOT NULL,
    debit_amount         DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    credit_amount        DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    description          TEXT            NULL,
    CONSTRAINT pk_journal_entry_lines PRIMARY KEY (id),
    CONSTRAINT fk_jel_journal_entry FOREIGN KEY (journal_entry_id)
        REFERENCES journal_entries(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_jel_chart_of_account FOREIGN KEY (chart_of_account_id)
        REFERENCES chart_of_accounts(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_jel_journal_entry_id (journal_entry_id),
    INDEX idx_jel_chart_of_account_id (chart_of_account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Journal entry lines (debit/credit ledger).';

-- ------------------------------------------------------------
-- Table: payments
-- Description: All financial receipts and disbursements.
-- ------------------------------------------------------------
CREATE TABLE payments (
    id                   CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id          CHAR(36)        NOT NULL,
    branch_id            CHAR(36)        NOT NULL,
    payment_method_id    CHAR(36)        NOT NULL,
    currency_id          CHAR(36)        NOT NULL,
    chart_of_account_id  CHAR(36)        NOT NULL COMMENT 'Cash/Bank account in COA.',
    payment_number       VARCHAR(50)     NOT NULL,
    payment_type         ENUM('Receipt','Payment','Refund','Adjustment','Transfer') NOT NULL,
    reference_type       ENUM(
                             'SalesInvoice','PurchaseInvoice',
                             'SalesReturn','PurchaseReturn','Expense','Other'
                         ) NOT NULL,
    reference_id         CHAR(36)        NOT NULL,
    reference_number     VARCHAR(50)     NULL,
    amount               DECIMAL(18,2)   NOT NULL,
    payment_date         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status               ENUM('Draft','Posted','Cancelled') NOT NULL DEFAULT 'Draft',
    notes                TEXT            NULL,
    created_by           CHAR(36)        NOT NULL,
    created_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_payments PRIMARY KEY (id),
    CONSTRAINT uq_payments_number UNIQUE (business_id, payment_number),
    CONSTRAINT fk_payments_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_payments_branch FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_payments_method FOREIGN KEY (payment_method_id)
        REFERENCES payment_methods(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_payments_currency FOREIGN KEY (currency_id)
        REFERENCES currencies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_payments_coa FOREIGN KEY (chart_of_account_id)
        REFERENCES chart_of_accounts(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_payments_created_by FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_payments_business_id (business_id),
    INDEX idx_payments_branch_id (branch_id),
    INDEX idx_payments_method_id (payment_method_id),
    INDEX idx_payments_reference (reference_type, reference_id),
    INDEX idx_payments_date (payment_date),
    INDEX idx_payments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='All financial receipts and disbursements.';

-- ------------------------------------------------------------
-- Table: expense_categories
-- ------------------------------------------------------------
CREATE TABLE expense_categories (
    id            CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id   CHAR(36)        NOT NULL,
    category_name VARCHAR(100)    NOT NULL,
    is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_expense_categories PRIMARY KEY (id),
    CONSTRAINT fk_expense_cat_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_expense_cat_business_id (business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Expense classification categories per business.';

-- ------------------------------------------------------------
-- Table: expenses
-- Description: Administrative / operational expenses.
-- ------------------------------------------------------------
CREATE TABLE expenses (
    id                CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id       CHAR(36)        NOT NULL,
    branch_id         CHAR(36)        NOT NULL,
    category_id       CHAR(36)        NOT NULL,
    payment_method_id CHAR(36)        NOT NULL,
    amount            DECIMAL(18,2)   NOT NULL,
    expense_date      DATE            NOT NULL,
    description       TEXT            NULL,
    status            ENUM('Draft','Posted','Cancelled') NOT NULL DEFAULT 'Draft',
    created_by        CHAR(36)        NOT NULL,
    created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_expenses PRIMARY KEY (id),
    CONSTRAINT fk_expenses_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_expenses_branch FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_expenses_category FOREIGN KEY (category_id)
        REFERENCES expense_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_expenses_payment_method FOREIGN KEY (payment_method_id)
        REFERENCES payment_methods(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_expenses_created_by FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_expenses_business_id (business_id),
    INDEX idx_expenses_branch_id (branch_id),
    INDEX idx_expenses_category_id (category_id),
    INDEX idx_expenses_date (expense_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Operational and administrative expenses.';

-- ------------------------------------------------------------
-- Table: opening_balances
-- Description: Opening balances per account per fiscal year.
-- ------------------------------------------------------------
CREATE TABLE opening_balances (
    id                  CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id         CHAR(36)        NOT NULL,
    fiscal_year_id      CHAR(36)        NOT NULL,
    chart_of_account_id CHAR(36)        NOT NULL,
    currency_id         CHAR(36)        NOT NULL,
    debit_amount        DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    credit_amount       DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    created_by          CHAR(36)        NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_opening_balances PRIMARY KEY (id),
    CONSTRAINT uq_opening_balances UNIQUE (fiscal_year_id, chart_of_account_id),
    CONSTRAINT fk_ob_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ob_fiscal_year FOREIGN KEY (fiscal_year_id)
        REFERENCES fiscal_years(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ob_chart_of_account FOREIGN KEY (chart_of_account_id)
        REFERENCES chart_of_accounts(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ob_currency FOREIGN KEY (currency_id)
        REFERENCES currencies(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ob_created_by FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_ob_fiscal_year_id (fiscal_year_id),
    INDEX idx_ob_coa_id (chart_of_account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Opening balances per account per fiscal year.';

-- ======================================================================
-- DOMAIN 8 — SALES CHANNEL
-- Entities: product_channels, carts, cart_items
-- ======================================================================

-- ------------------------------------------------------------
-- Table: product_channels
-- Description: Enables/disables product units per channel with custom price.
-- ------------------------------------------------------------
CREATE TABLE product_channels (
    product_unit_id CHAR(36)        NOT NULL,
    channel_id      CHAR(36)        NOT NULL,
    sale_price      DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    display_order   INT             NOT NULL DEFAULT 0,
    is_enabled      BOOLEAN         NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_product_channels PRIMARY KEY (product_unit_id, channel_id),
    CONSTRAINT fk_product_ch_product_unit FOREIGN KEY (product_unit_id)
        REFERENCES product_units(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_product_ch_channel FOREIGN KEY (channel_id)
        REFERENCES channels(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_product_ch_channel_id (channel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Maps product units to sales channels with custom pricing.';

-- ------------------------------------------------------------
-- Table: carts
-- Description: Shopping cart for e-commerce channel.
-- ------------------------------------------------------------
CREATE TABLE carts (
    id          CHAR(36)    NOT NULL DEFAULT (UUID()),
    business_id CHAR(36)    NOT NULL,
    customer_id CHAR(36)    NULL,
    status      ENUM('Active','Converted','Abandoned') NOT NULL DEFAULT 'Active',
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_carts PRIMARY KEY (id),
    CONSTRAINT fk_carts_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_carts_customer FOREIGN KEY (customer_id)
        REFERENCES customers(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_carts_business_id (business_id),
    INDEX idx_carts_customer_id (customer_id),
    INDEX idx_carts_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Shopping cart for e-commerce.';

-- ------------------------------------------------------------
-- Table: cart_items
-- ------------------------------------------------------------
CREATE TABLE cart_items (
    id               CHAR(36)        NOT NULL DEFAULT (UUID()),
    cart_id          CHAR(36)        NOT NULL,
    product_unit_id  CHAR(36)        NOT NULL,
    quantity         DECIMAL(18,3)   NOT NULL,
    unit_price       DECIMAL(18,2)   NOT NULL,
    line_total       DECIMAL(18,2)   NOT NULL,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_cart_items PRIMARY KEY (id),
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id)
        REFERENCES carts(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cart_items_product_unit FOREIGN KEY (product_unit_id)
        REFERENCES product_units(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_cart_items_cart_id (cart_id),
    INDEX idx_cart_items_product_unit_id (product_unit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Items inside a shopping cart.';

-- ======================================================================
-- DOMAIN 9 — SYSTEM
-- Entities: system_settings, sequences
-- ======================================================================

-- ------------------------------------------------------------
-- Table: system_settings
-- Description: Key-value configuration per business.
-- ------------------------------------------------------------
CREATE TABLE system_settings (
    id            CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id   CHAR(36)        NOT NULL,
    setting_key   VARCHAR(100)    NOT NULL,
    setting_value TEXT            NULL,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_system_settings PRIMARY KEY (id),
    CONSTRAINT uq_system_settings_key UNIQUE (business_id, setting_key),
    CONSTRAINT fk_system_settings_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_system_settings_business_id (business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Key-value system configuration per business.';

-- ------------------------------------------------------------
-- Table: sequences
-- Description: Document number sequence per business/branch/type.
-- ------------------------------------------------------------
CREATE TABLE sequences (
    id            CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id   CHAR(36)        NOT NULL,
    branch_id     CHAR(36)        NULL,
    document_type ENUM(
                      'SalesInvoice','PurchaseInvoice',
                      'SalesReturn','PurchaseReturn',
                      'Order','Payment','Expense',
                      'Transfer','JournalEntry'
                  ) NOT NULL,
    prefix        VARCHAR(20)     NOT NULL DEFAULT '',
    next_number   BIGINT UNSIGNED NOT NULL DEFAULT 1,
    CONSTRAINT pk_sequences PRIMARY KEY (id),
    CONSTRAINT uq_sequences UNIQUE (business_id, branch_id, document_type),
    CONSTRAINT fk_sequences_business FOREIGN KEY (business_id)
        REFERENCES businesses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sequences_branch FOREIGN KEY (branch_id)
        REFERENCES branches(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_sequences_business_id (business_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Auto-increment document numbering per business/branch/type.';

-- ======================================================================
-- RE-ENABLE FOREIGN KEY CHECKS
-- ======================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ======================================================================
-- END OF SCHEMA
-- Total Tables : 51
-- Total Domains: 9
-- Database     : Smart Merchant ERP v2.0
-- ======================================================================

