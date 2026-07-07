const fs = require('fs');
const path = require('path');

const salesMockFile = path.join(__dirname, 'src/core/data/salesMockData.ts');
const purchasesMockFile = path.join(__dirname, 'src/core/data/purchasesMockData.ts');
const financeMockFile = path.join(__dirname, 'src/core/data/financeMockData.ts');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    for (const rep of replacements) {
        content = content.replace(rep.regex, rep.replacement);
    }
    fs.writeFileSync(filePath, content);
}

// Dummy UUID for currency
const currId = '"11111111-1111-1111-1111-111111111111"';

replaceInFile(salesMockFile, [
    {
        // Customers
        regex: /(credit_limit:\s*\d+,)/g,
        replacement: `$1\n    default_currency_id: ${currId},`
    },
    {
        // Sales Invoices
        regex: /(due_date:\s*[^,]+,)/g,
        replacement: `$1\n    currency_id: ${currId},\n    exchange_rate: 1,`
    },
    {
        // Sales Invoices base amounts
        regex: /(grand_total:\s*(\d+(\.\d+)?),)/g,
        replacement: `$1\n    base_sub_total: $2,\n    base_discount_total: 0,\n    base_tax_total: 0,\n    base_grand_total: $2,`
    },
    {
        // Sales Invoice Items
        regex: /(line_total:\s*(\d+(\.\d+)?),)/g,
        replacement: `$1\n    base_line_total: $2,`
    },
    {
        // Sales Returns
        regex: /(return_date:\s*[^,]+,)/g,
        replacement: `$1\n    currency_id: ${currId},\n    exchange_rate: 1,`
    },
    {
        // Sales Returns base amounts
        regex: /(total_amount:\s*(\d+(\.\d+)?),)/g,
        replacement: `$1\n    base_total_amount: $2,`
    }
]);

replaceInFile(purchasesMockFile, [
    {
        // Suppliers
        regex: /(is_active:\s*(true|false),)/g,
        replacement: `$1\n    default_currency_id: ${currId},`
    },
    {
        // Purchase Invoices
        regex: /(due_date:\s*[^,]+,)/g,
        replacement: `$1\n    currency_id: ${currId},\n    exchange_rate: 1,`
    },
    {
        // Purchase Invoices base amounts
        regex: /(grand_total:\s*(\d+(\.\d+)?),)/g,
        replacement: `$1\n    base_sub_total: $2,\n    base_discount_total: 0,\n    base_tax_total: 0,\n    base_grand_total: $2,`
    },
    {
        // Purchase Invoice Items
        regex: /(line_total:\s*(\d+(\.\d+)?),)/g,
        replacement: `$1\n    base_line_total: $2,`
    },
    {
        // Purchase Returns
        regex: /(return_date:\s*[^,]+,)/g,
        replacement: `$1\n    currency_id: ${currId},\n    exchange_rate: 1,`
    },
    {
        // Purchase Returns base amounts
        regex: /(total_amount:\s*(\d+(\.\d+)?),)/g,
        replacement: `$1\n    base_total_amount: $2,`
    }
]);

replaceInFile(financeMockFile, [
    {
        // Journal Entries
        regex: /(journal_date:\s*[^,]+,)/g,
        replacement: `$1\n    currency_id: ${currId},\n    exchange_rate: 1,`
    },
    {
        // Journal Lines
        regex: /(credit_amount:\s*(\d+(\.\d+)?),)/g,
        replacement: `$1\n    base_debit_amount: 0,\n    base_credit_amount: $2,`
    },
    {
        // Journal Lines 2 (hacky but it'll set base debit if credit is 0, let's fix manually if it complains or use a replacer func)
    },
    {
        // Payments
        regex: /(currency_id:\s*[^,]+,)/g,
        replacement: `$1\n    exchange_rate: 1,`
    },
    {
        // Payments base amount
        regex: /(amount:\s*(\d+(\.\d+)?),)/g,
        replacement: `$1\n    base_amount: $2,`
    },
    {
        // Expenses
        regex: /(payment_method_id:\s*[^,]+,)/g,
        replacement: `$1\n    currency_id: ${currId},\n    exchange_rate: 1,`
    },
    {
        // Opening Balances
        regex: /(currency_id:\s*[^,]+,)/g,
        replacement: `$1\n    exchange_rate: 1,`
    }
]);

// More robust journal lines replacement
let finContent = fs.readFileSync(financeMockFile, 'utf-8');
finContent = finContent.replace(/debit_amount:\s*(\d+(\.\d+)?),\s*credit_amount:\s*(\d+(\.\d+)?),/g, 
    "debit_amount: $1, credit_amount: $3, base_debit_amount: $1, base_credit_amount: $3,");
fs.writeFileSync(financeMockFile, finContent);

let openBalContent = fs.readFileSync(financeMockFile, 'utf-8');
openBalContent = openBalContent.replace(/debit_amount:\s*(\d+(\.\d+)?),\s*credit_amount:\s*(\d+(\.\d+)?),/g, 
    "debit_amount: $1, credit_amount: $3, base_debit_amount: $1, base_credit_amount: $3,");
fs.writeFileSync(financeMockFile, openBalContent);

console.log("Mock data updated.");
