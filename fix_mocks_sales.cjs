const fs = require('fs');
const path = require('path');

const salesMockFile = path.join(__dirname, 'src/core/data/salesMockData.ts');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    for (const rep of replacements) {
        content = content.replace(rep.regex, rep.replacement);
    }
    fs.writeFileSync(filePath, content);
}

const currId = '"11111111-1111-1111-1111-111111111111"';

replaceInFile(salesMockFile, [
    {
        regex: /(credit_limit:\s*\d+,)/g,
        replacement: `$1\n    default_currency_id: ${currId},`
    },
    {
        regex: /(due_date:\s*[^,]+,)/g,
        replacement: `$1\n    currency_id: ${currId},\n    exchange_rate: 1,`
    },
    {
        regex: /(grand_total:\s*(\d+(\.\d+)?),)/g,
        replacement: `$1\n    base_sub_total: $2,\n    base_discount_total: 0,\n    base_tax_total: 0,\n    base_grand_total: $2,`
    },
    {
        regex: /line_total:\s*(\d+(\.\d+)?),/g,
        replacement: `line_total: $1,\n    base_line_total: $1,`
    },
    {
        regex: /(return_date:\s*[^,]+,)/g,
        replacement: `$1\n    currency_id: ${currId},\n    exchange_rate: 1,`
    },
    {
        regex: /(total_amount:\s*(\d+(\.\d+)?),)/g,
        replacement: `$1\n    base_total_amount: $2,`
    }
]);

// Special case for buildCartLine
let content = fs.readFileSync(salesMockFile, 'utf-8');
content = content.replace(/line_total,\s*cost_total,/g, "line_total,\n    base_line_total: line_total,\n    cost_total,");
fs.writeFileSync(salesMockFile, content);

console.log("Mock data updated for sales.");
