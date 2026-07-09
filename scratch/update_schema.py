import re
import os

SCHEMA_PATH = r"d:\ALL-My_Projects\projectUi\DB\smart_merchant_erp_schema.sql"

with open(SCHEMA_PATH, 'r', encoding='utf8') as f:
    sql = f.read()

def insert_after(table_name, after_col, to_insert, sql_content):
    # Find the table creation block
    pattern = r"(CREATE TABLE\s+" + table_name + r"\s+\([\s\S]*?^\s+" + after_col + r"\s+[^,]+,)"
    match = re.search(pattern, sql_content, re.MULTILINE | re.IGNORECASE)
    if match:
        insertion = "\n" + to_insert
        # Replace only the first occurrence (the column we matched) with itself + insertion
        replacement = match.group(1) + insertion
        return sql_content[:match.start()] + replacement + sql_content[match.end():]
    else:
        print(f"Warning: Could not find '{after_col}' in table '{table_name}'")
    return sql_content

# Add fields to existing tables
sql = insert_after("customers", "is_active", "    default_currency_id CHAR(36)        NULL,\n    payment_term_id     CHAR(36)        NULL,\n    opening_balance     DECIMAL(18,2)   NOT NULL DEFAULT 0.00,\n    opening_balance_type ENUM('debit','credit') NULL,\n    opening_balance_date DATE           NULL,", sql)
sql = insert_after("suppliers", "is_active", "    default_currency_id CHAR(36)        NULL,\n    payment_term_id     CHAR(36)        NULL,\n    credit_limit        DECIMAL(18,2)   NOT NULL DEFAULT 0.00,\n    opening_balance     DECIMAL(18,2)   NOT NULL DEFAULT 0.00,\n    opening_balance_type ENUM('debit','credit') NULL,\n    opening_balance_date DATE           NULL,", sql)

# Sales & Orders
sql = insert_after("sales_invoices", "due_date", "    currency_id     CHAR(36)        NOT NULL,\n    exchange_rate   DECIMAL(18,8)   NOT NULL DEFAULT 1.00000000,", sql)
sql = insert_after("sales_invoices", "grand_total", "    base_sub_total  DECIMAL(18,2)   NOT NULL DEFAULT 0.00,\n    base_discount_total DECIMAL(18,2) NOT NULL DEFAULT 0.00,\n    base_tax_total  DECIMAL(18,2)   NOT NULL DEFAULT 0.00,\n    base_grand_total DECIMAL(18,2)  NOT NULL DEFAULT 0.00,", sql)
sql = insert_after("sales_invoice_items", "line_total", "    base_line_total DECIMAL(18,2)   NOT NULL,", sql)

sql = insert_after("orders", "order_date", "    currency_id     CHAR(36)        NOT NULL,\n    exchange_rate   DECIMAL(18,8)   NOT NULL DEFAULT 1.00000000,", sql)
sql = insert_after("orders", "grand_total", "    base_subtotal   DECIMAL(18,2)   NOT NULL DEFAULT 0.00,\n    base_discount_total DECIMAL(18,2) NOT NULL DEFAULT 0.00,\n    base_tax_total  DECIMAL(18,2)   NOT NULL DEFAULT 0.00,\n    base_grand_total DECIMAL(18,2)  NOT NULL DEFAULT 0.00,", sql)
sql = insert_after("order_items", "line_total", "    base_line_total DECIMAL(18,2)   NOT NULL,", sql)

sql = insert_after("sales_returns", "return_date", "    currency_id     CHAR(36)        NOT NULL,\n    exchange_rate   DECIMAL(18,8)   NOT NULL DEFAULT 1.00000000,", sql)
sql = insert_after("sales_returns", "total_amount", "    base_total_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,", sql)
sql = insert_after("sales_return_items", "total_price", "    base_total_price DECIMAL(18,2)  NOT NULL,", sql)

# Purchases
sql = insert_after("purchase_invoices", "due_date", "    currency_id     CHAR(36)        NOT NULL,\n    exchange_rate   DECIMAL(18,8)   NOT NULL DEFAULT 1.00000000,", sql)
sql = insert_after("purchase_invoices", "grand_total", "    base_sub_total  DECIMAL(18,2)   NOT NULL DEFAULT 0.00,\n    base_discount_total DECIMAL(18,2) NOT NULL DEFAULT 0.00,\n    base_tax_total  DECIMAL(18,2)   NOT NULL DEFAULT 0.00,\n    base_grand_total DECIMAL(18,2)  NOT NULL DEFAULT 0.00,", sql)
sql = insert_after("purchase_invoice_items", "line_total", "    base_line_total DECIMAL(18,2)   NOT NULL,", sql)

sql = insert_after("purchase_returns", "return_date", "    currency_id     CHAR(36)        NOT NULL,\n    exchange_rate   DECIMAL(18,8)   NOT NULL DEFAULT 1.00000000,", sql)
sql = insert_after("purchase_returns", "total_amount", "    base_total_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,", sql)
sql = insert_after("purchase_return_items", "line_total", "    base_line_total DECIMAL(18,2)   NOT NULL,", sql)

# Finance
sql = insert_after("journal_entries", "journal_date", "    currency_id     CHAR(36)        NOT NULL,\n    exchange_rate   DECIMAL(18,8)   NOT NULL DEFAULT 1.00000000,", sql)
sql = insert_after("journal_entry_lines", "credit_amount", "    base_debit_amount  DECIMAL(18,2)   NOT NULL DEFAULT 0.00,\n    base_credit_amount DECIMAL(18,2)   NOT NULL DEFAULT 0.00,", sql)

sql = insert_after("payments", "exchange_rate", "    base_amount     DECIMAL(18,2)   NOT NULL,", sql) # Wait, is exchange_rate in payments?
# Let's check if exchange_rate exists in payments, if not add it.
if "exchange_rate" not in sql.split("CREATE TABLE payments")[1].split(";")[0]:
    sql = insert_after("payments", "currency_id", "    exchange_rate   DECIMAL(18,8)   NOT NULL DEFAULT 1.00000000,", sql)
sql = insert_after("payments", "amount", "    base_amount     DECIMAL(18,2)   NOT NULL,", sql)

# expenses
sql = insert_after("expenses", "payment_method_id", "    currency_id     CHAR(36)        NOT NULL,\n    exchange_rate   DECIMAL(18,8)   NOT NULL DEFAULT 1.00000000,", sql)
sql = insert_after("expenses", "amount", "    base_amount     DECIMAL(18,2)   NOT NULL,", sql)

# opening_balances
sql = insert_after("opening_balances", "currency_id", "    exchange_rate   DECIMAL(18,8)   NOT NULL DEFAULT 1.00000000,", sql)
sql = insert_after("opening_balances", "credit_amount", "    base_debit_amount  DECIMAL(18,2)   NOT NULL DEFAULT 0.00,\n    base_credit_amount DECIMAL(18,2)   NOT NULL DEFAULT 0.00,", sql)


# Update Journal Reference Enum
old_enum = "ENUM(\n                         'SalesInvoice','SalesReturn',\n                         'PurchaseInvoice','PurchaseReturn',\n                         'Payment','Expense','Manual'\n                     )"
new_enum = "ENUM(\n                         'SalesInvoice','SalesReturn',\n                         'PurchaseInvoice','PurchaseReturn',\n                         'Payment','Expense','Manual','StockAdjustment','ClosingEntry'\n                     )"
sql = sql.replace(old_enum, new_enum)
old_enum2 = "ENUM('SalesInvoice','SalesReturn','PurchaseInvoice','PurchaseReturn','Payment','Expense','Manual')"
new_enum2 = "ENUM('SalesInvoice','SalesReturn','PurchaseInvoice','PurchaseReturn','Payment','Expense','Manual','StockAdjustment','ClosingEntry')"
sql = sql.replace(old_enum2, new_enum2)

# NEW TABLES TO APPEND
new_tables_sql = """
-- ======================================================================
-- DOMAIN 10 — HR & EMPLOYEES
-- ======================================================================

CREATE TABLE departments (
    id            CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id   CHAR(36)        NOT NULL,
    department_name VARCHAR(150)  NOT NULL,
    description   TEXT            NULL,
    is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_departments PRIMARY KEY (id),
    CONSTRAINT fk_departments_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Departments within a business.';

CREATE TABLE job_titles (
    id            CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id   CHAR(36)        NOT NULL,
    job_title     VARCHAR(150)    NOT NULL,
    description   TEXT            NULL,
    is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_job_titles PRIMARY KEY (id),
    CONSTRAINT fk_job_titles_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Job titles within a business.';

CREATE TABLE employees (
    id            CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id   CHAR(36)        NOT NULL,
    user_id       CHAR(36)        NULL COMMENT 'Linked user account for login',
    department_id CHAR(36)        NULL,
    job_title_id  CHAR(36)        NULL,
    branch_id     CHAR(36)        NOT NULL,
    first_name    VARCHAR(100)    NOT NULL,
    last_name     VARCHAR(100)    NOT NULL,
    phone         VARCHAR(30)     NULL,
    email         VARCHAR(255)    NULL,
    hire_date     DATE            NOT NULL,
    salary        DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at    TIMESTAMP       NULL,
    CONSTRAINT pk_employees PRIMARY KEY (id),
    CONSTRAINT fk_employees_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_employees_job FOREIGN KEY (job_title_id) REFERENCES job_titles(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_employees_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Employee records.';

CREATE TABLE employee_documents (
    id            CHAR(36)        NOT NULL DEFAULT (UUID()),
    employee_id   CHAR(36)        NOT NULL,
    document_type VARCHAR(100)    NOT NULL,
    file_path     VARCHAR(500)    NOT NULL,
    uploaded_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_employee_documents PRIMARY KEY (id),
    CONSTRAINT fk_employee_documents_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Employee documents and attachments.';

-- ======================================================================
-- DOMAIN 11 — EXTENDED FEATURES
-- ======================================================================

CREATE TABLE payment_terms (
    id            CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id   CHAR(36)        NOT NULL,
    term_name     VARCHAR(100)    NOT NULL,
    days_to_due   INT             NOT NULL DEFAULT 0,
    is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_payment_terms PRIMARY KEY (id),
    CONSTRAINT fk_payment_terms_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Payment terms for customers/suppliers.';

CREATE TABLE taxes (
    id            CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id   CHAR(36)        NOT NULL,
    tax_name      VARCHAR(100)    NOT NULL,
    tax_rate      DECIMAL(5,2)    NOT NULL COMMENT 'Percentage (e.g. 15.00)',
    is_active     BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_taxes PRIMARY KEY (id),
    CONSTRAINT fk_taxes_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tax definitions.';

CREATE TABLE product_taxes (
    product_id    CHAR(36)        NOT NULL,
    tax_id        CHAR(36)        NOT NULL,
    CONSTRAINT pk_product_taxes PRIMARY KEY (product_id, tax_id),
    CONSTRAINT fk_product_taxes_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_product_taxes_tax FOREIGN KEY (tax_id) REFERENCES taxes(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mapping products to taxes.';

CREATE TABLE product_variants (
    id            CHAR(36)        NOT NULL DEFAULT (UUID()),
    product_id    CHAR(36)        NOT NULL,
    variant_name  VARCHAR(100)    NOT NULL COMMENT 'e.g. Size, Color',
    variant_value VARCHAR(100)    NOT NULL COMMENT 'e.g. XL, Red',
    CONSTRAINT pk_product_variants PRIMARY KEY (id),
    CONSTRAINT fk_product_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Product variants (size, color, etc).';

CREATE TABLE stock_adjustments (
    id                CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id       CHAR(36)        NOT NULL,
    warehouse_id      CHAR(36)        NOT NULL,
    adjustment_number VARCHAR(50)     NOT NULL,
    adjustment_date   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    adjustment_type   ENUM('Increase','Decrease','Damage','Loss') NOT NULL,
    status            ENUM('Draft','Posted') NOT NULL DEFAULT 'Draft',
    notes             TEXT            NULL,
    created_by        CHAR(36)        NOT NULL,
    created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_stock_adjustments PRIMARY KEY (id),
    CONSTRAINT fk_stock_adj_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_stock_adj_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_stock_adj_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Header for physical count and stock adjustments.';

CREATE TABLE stock_adjustment_items (
    id                CHAR(36)        NOT NULL DEFAULT (UUID()),
    adjustment_id     CHAR(36)        NOT NULL,
    product_unit_id   CHAR(36)        NOT NULL,
    system_qty        DECIMAL(18,3)   NOT NULL,
    physical_qty      DECIMAL(18,3)   NOT NULL,
    diff_qty          DECIMAL(18,3)   NOT NULL,
    unit_cost         DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    total_cost        DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    CONSTRAINT pk_stock_adjustment_items PRIMARY KEY (id),
    CONSTRAINT fk_stock_adj_items_adj FOREIGN KEY (adjustment_id) REFERENCES stock_adjustments(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_stock_adj_items_product FOREIGN KEY (product_unit_id) REFERENCES product_units(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Line items for stock adjustments.';

CREATE TABLE attachments (
    id            CHAR(36)        NOT NULL DEFAULT (UUID()),
    entity_type   VARCHAR(100)    NOT NULL COMMENT 'e.g. Customer, Supplier, SalesInvoice',
    entity_id     CHAR(36)        NOT NULL,
    file_path     VARCHAR(500)    NOT NULL,
    file_name     VARCHAR(255)    NULL,
    uploaded_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_attachments PRIMARY KEY (id),
    INDEX idx_attachments_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Polymorphic attachments for various entities.';

CREATE TABLE activity_logs (
    id            CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id   CHAR(36)        NOT NULL,
    user_id       CHAR(36)        NOT NULL,
    action        VARCHAR(100)    NOT NULL,
    entity_type   VARCHAR(100)    NOT NULL,
    entity_id     CHAR(36)        NOT NULL,
    details       JSON            NULL,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_activity_logs PRIMARY KEY (id),
    CONSTRAINT fk_activity_logs_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_activity_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_activity_logs_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='System activity logs for auditing.';

CREATE TABLE fixed_assets (
    id                CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id       CHAR(36)        NOT NULL,
    branch_id         CHAR(36)        NOT NULL,
    asset_name        VARCHAR(255)    NOT NULL,
    asset_code        VARCHAR(50)     NOT NULL,
    purchase_date     DATE            NOT NULL,
    purchase_price    DECIMAL(18,2)   NOT NULL,
    current_value     DECIMAL(18,2)   NOT NULL,
    depreciation_rate DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
    status            ENUM('Active','Disposed','Depreciated') NOT NULL DEFAULT 'Active',
    created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_fixed_assets PRIMARY KEY (id),
    CONSTRAINT fk_fixed_assets_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_fixed_assets_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Fixed assets registry.';

CREATE TABLE bank_reconciliations (
    id                  CHAR(36)        NOT NULL DEFAULT (UUID()),
    business_id         CHAR(36)        NOT NULL,
    chart_of_account_id CHAR(36)        NOT NULL COMMENT 'The bank account in COA',
    statement_date      DATE            NOT NULL,
    statement_balance   DECIMAL(18,2)   NOT NULL,
    system_balance      DECIMAL(18,2)   NOT NULL,
    difference          DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    status              ENUM('Draft','Completed') NOT NULL DEFAULT 'Draft',
    created_by          CHAR(36)        NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_bank_reconciliations PRIMARY KEY (id),
    CONSTRAINT fk_bank_recon_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_bank_recon_coa FOREIGN KEY (chart_of_account_id) REFERENCES chart_of_accounts(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bank_recon_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bank reconciliation headers.';

CREATE TABLE bank_reconciliation_lines (
    id                     CHAR(36)        NOT NULL DEFAULT (UUID()),
    bank_reconciliation_id CHAR(36)        NOT NULL,
    payment_id             CHAR(36)        NOT NULL,
    is_cleared             BOOLEAN         NOT NULL DEFAULT FALSE,
    cleared_date           DATE            NULL,
    CONSTRAINT pk_bank_reconciliation_lines PRIMARY KEY (id),
    CONSTRAINT fk_bank_recon_lines_recon FOREIGN KEY (bank_reconciliation_id) REFERENCES bank_reconciliations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_bank_recon_lines_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bank reconciliation lines linking to payments.';

"""

end_marker = "-- ======================================================================\n-- RE-ENABLE FOREIGN KEY CHECKS\n-- ======================================================================"
sql = sql.replace(end_marker, new_tables_sql + "\n" + end_marker)

# Update foreign keys for customers and suppliers missing currencies and terms:
fk_additions = """
    CONSTRAINT fk_customers_currency FOREIGN KEY (default_currency_id) REFERENCES currencies(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_customers_term FOREIGN KEY (payment_term_id) REFERENCES payment_terms(id) ON DELETE SET NULL ON UPDATE CASCADE,
"""
# This requires payment_terms and currencies tables. `currencies` is there, but `payment_terms` is defined AFTER `customers`.
# Since `SET FOREIGN_KEY_CHECKS = 0;` is at the top of the file, we CAN reference tables that are created later!
sql = insert_after("customers", "INDEX idx_customers_phone \\(phone\\),", fk_additions, sql)

fk_supp_additions = """
    CONSTRAINT fk_suppliers_currency FOREIGN KEY (default_currency_id) REFERENCES currencies(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_suppliers_term FOREIGN KEY (payment_term_id) REFERENCES payment_terms(id) ON DELETE SET NULL ON UPDATE CASCADE,
"""
sql = insert_after("suppliers", "INDEX idx_suppliers_deleted_at \\(deleted_at\\)", fk_supp_additions, sql)

with open(SCHEMA_PATH, 'w', encoding='utf8') as f:
    f.write(sql)

print("SUCCESS")
