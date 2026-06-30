import * as xlsx from 'xlsx';

export function exportToExcel(data: any[], filename: string, columnMap?: Record<string, string>) {
  if (!data || data.length === 0) {
    alert("لا توجد بيانات للتصدير / No data to export");
    return;
  }

  // If a column map is provided, map the object keys to the friendly names
  let exportData = data;
  if (columnMap) {
    exportData = data.map(item => {
      const mappedItem: any = {};
      Object.keys(columnMap).forEach(key => {
        // Handle nested properties or simple keys (very basic resolution)
        let value = item[key];
        if (value === undefined || value === null) {
          value = "";
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        mappedItem[columnMap[key]] = value;
      });
      return mappedItem;
    });
  }

  // Create a new workbook and add the worksheet
  const worksheet = xlsx.utils.json_to_sheet(exportData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Data");

  // Generate Excel file and prompt download
  xlsx.writeFile(workbook, `${filename}_${new Date().getTime()}.xlsx`);
}
