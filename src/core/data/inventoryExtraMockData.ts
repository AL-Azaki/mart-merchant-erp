export interface Employee {
  id: string;
  name: string;
  job_title: string;
  phone: string;
  email: string;
  warehouse_name: string;
  salary: number;
  status: "active" | "inactive" | "on_leave";
}

export interface FixedAsset {
  id: string;
  name: string;
  code: string;
  category: string;
  purchase_date: string;
  cost: number;
  location: string;
  status: "excellent" | "needs_maintenance" | "broken";
}

export const MOCK_EMPLOYEES: Employee[] = [
  { id: "emp_1", name: "محمد أحمد الحيمي", job_title: "أمين مستودع", phone: "+96777111222", email: "m.himi@tajir.ye", warehouse_name: "المستودع الرئيسي", salary: 150000, status: "active" },
  { id: "emp_2", name: "خالد سعيد باوزير", job_title: "كاشير", phone: "+96777333444", email: "k.wazir@tajir.ye", warehouse_name: "المستودع الرئيسي", salary: 120000, status: "active" },
  { id: "emp_3", name: "أروى محمد الصبري", job_title: "إدارة المخزون", phone: "+96777555666", email: "a.sabri@tajir.ye", warehouse_name: "مستودع الفروع", salary: 180000, status: "active" },
  { id: "emp_4", name: "صالح علي الصنعاني", job_title: "سائق توزيع", phone: "+96777777888", email: "s.sanaani@tajir.ye", warehouse_name: "المستودع الرئيسي", salary: 100000, status: "on_leave" },
];

export const MOCK_ASSETS: FixedAsset[] = [
  { id: "ast_1", name: "طابعة فواتير Epson T88", code: "EQP-PRINT-001", category: "أجهزة إلكترونية", purchase_date: "2024-01-10", cost: 185000, location: "المستودع الرئيسي", status: "excellent" },
  { id: "ast_2", name: "قارئ باركود لاسلكي Zebra", code: "EQP-SCAN-002", category: "أجهزة إلكترونية", purchase_date: "2024-02-15", cost: 75000, location: "مستودع الفروع", status: "excellent" },
  { id: "ast_3", name: "مكيف هواء LG 2 طن", code: "FUR-AC-001", category: "أثاث ومعدات", purchase_date: "2023-06-01", cost: 450000, location: "المستودع الرئيسي", status: "needs_maintenance" },
  { id: "ast_4", name: "رفوف تخزين حديد ثقيل", code: "FUR-SHELF-01", category: "أثاث ومعدات", purchase_date: "2023-08-20", cost: 320000, location: "المستودع الرئيسي", status: "excellent" },
];
