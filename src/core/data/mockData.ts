// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA — Core Entities
// All data here mirrors the real DB schema exactly.
// Replace with real API calls when the backend is ready.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  Account, Business, Branch, Plan, Subscription,
  Role, Permission, User, UserRole, RolePermission, SystemSetting,
} from "@/core/types/index";

// ─── Demo Credentials ──────────────────────────────────────────────────────────
export const DEMO_CREDENTIALS = {
  email:    "demo@tajir.ye",
  password: "123456",
};

// ─── Account ───────────────────────────────────────────────────────────────────
export const MOCK_ACCOUNT: Account = {
  id:         "acc_001",
  name:       "شركة النور للتجارة",
  owner_name: "أحمد محمد العمري",
  email:      "demo@tajir.ye",
  phone:      "+967771234567",
  status:     "Active",
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
  deleted_at: null,
};

// ─── Business ─────────────────────────────────────────────────────────────────
export const MOCK_BUSINESS: Business = {
  id:            "biz_001",
  account_id:    "acc_001",
  business_name: "متجر النور",
  business_type: "retail",
  primary_phone: "+967771234567",
  primary_email: "info@alnoor.ye",
  logo_path:     null,
  status:        "Active",
  created_at:    "2024-01-15T10:05:00Z",
  updated_at:    "2024-01-15T10:05:00Z",
};

// ─── Branches ─────────────────────────────────────────────────────────────────
export const MOCK_BRANCHES: Branch[] = [
  {
    id:          "br_001",
    business_id: "biz_001",
    branch_name: "الفرع الرئيسي",
    branch_code: "BR-001",
    phone:       "+967771234567",
    email:       "main@alnoor.ye",
    address:     "شارع حده، حي الروضة، صنعاء",
    is_default:  true,
    is_active:   true,
    created_at:  "2024-01-15T10:10:00Z",
    updated_at:  "2024-01-15T10:10:00Z",
  },
  {
    id:          "br_002",
    business_id: "biz_001",
    branch_name: "فرع المعلا",
    branch_code: "BR-002",
    phone:       "+967773456789",
    email:       "maalla@alnoor.ye",
    address:     "شارع المعلا، عدن",
    is_default:  false,
    is_active:   true,
    created_at:  "2024-02-01T09:00:00Z",
    updated_at:  "2024-02-01T09:00:00Z",
  },
];

// ─── Plans (SaaS) ─────────────────────────────────────────────────────────────
export const MOCK_PLANS: Plan[] = [
  {
    id:              "plan_trial",
    plan_name:       "تجربة مجانية",
    billing_cycle:   "Monthly",
    duration_months: 0,
    price:           0,
    max_businesses:  1,
    max_branches:    1,
    max_users:       2,
    is_active:       true,
  },
  {
    id:              "plan_basic",
    plan_name:       "الأساسية",
    billing_cycle:   "Monthly",
    duration_months: 1,
    price:           4_999,
    max_businesses:  1,
    max_branches:    1,
    max_users:       3,
    is_active:       true,
  },
  {
    id:              "plan_pro",
    plan_name:       "الاحترافية",
    billing_cycle:   "Monthly",
    duration_months: 1,
    price:           9_999,
    max_businesses:  1,
    max_branches:    3,
    max_users:       10,
    is_active:       true,
  },
  {
    id:              "plan_enterprise",
    plan_name:       "المؤسسية",
    billing_cycle:   "Monthly",
    duration_months: 1,
    price:           0,        // contact sales
    max_businesses:  99,
    max_branches:    99,
    max_users:       999,
    is_active:       true,
  },
];

// ─── Subscription ─────────────────────────────────────────────────────────────
export const MOCK_SUBSCRIPTION: Subscription = {
  id:         "sub_001",
  account_id: "acc_001",
  plan_id:    "plan_trial",
  start_date: "2026-06-26",
  end_date:   "2026-07-03",
  status:     "Active",
  created_at: "2026-06-26T10:00:00Z",
  updated_at: "2026-06-26T10:00:00Z",
};

// ─── Roles ────────────────────────────────────────────────────────────────────
export const MOCK_ROLES: Role[] = [
  {
    id:             "role_001",
    business_id:    "biz_001",
    role_name:      "مالك",
    description:    "صلاحيات كاملة على جميع الوحدات",
    is_system_role: true,
    is_active:      true,
    created_at:     "2024-01-15T10:15:00Z",
  },
  {
    id:             "role_002",
    business_id:    "biz_001",
    role_name:      "مدير",
    description:    "إدارة المبيعات والمخزون والموظفين",
    is_system_role: true,
    is_active:      true,
    created_at:     "2024-01-15T10:15:00Z",
  },
  {
    id:             "role_003",
    business_id:    "biz_001",
    role_name:      "كاشير",
    description:    "إنشاء الفواتير والمبيعات فقط",
    is_system_role: true,
    is_active:      true,
    created_at:     "2024-01-15T10:15:00Z",
  },
  {
    id:             "role_004",
    business_id:    "biz_001",
    role_name:      "محاسب",
    description:    "عرض وإدارة الحسابات والتقارير",
    is_system_role: false,
    is_active:      true,
    created_at:     "2024-01-20T08:00:00Z",
  },
];

// ─── Permissions ──────────────────────────────────────────────────────────────
export const MOCK_PERMISSIONS: Permission[] = [
  { id: "perm_001", module: "sales",      permission_code: "sales.create",       permission_name: "إنشاء مبيعات",            description: "إنشاء فاتورة مبيعات" },
  { id: "perm_002", module: "sales",      permission_code: "sales.read",         permission_name: "عرض المبيعات",            description: "عرض الفواتير والمبيعات" },
  { id: "perm_003", module: "sales",      permission_code: "sales.update",       permission_name: "تعديل المبيعات",          description: "تعديل الفاتورة" },
  { id: "perm_004", module: "sales",      permission_code: "sales.delete",       permission_name: "حذف المبيعات",            description: "إلغاء الفاتورة" },
  { id: "perm_005", module: "inventory",  permission_code: "inventory.create",   permission_name: "إضافة منتجات",            description: "إضافة منتج جديد" },
  { id: "perm_006", module: "inventory",  permission_code: "inventory.read",     permission_name: "عرض المخزون",             description: "عرض المنتجات والمخزون" },
  { id: "perm_007", module: "inventory",  permission_code: "inventory.update",   permission_name: "تعديل المنتجات",          description: "تحديث بيانات المنتج" },
  { id: "perm_008", module: "inventory",  permission_code: "inventory.delete",   permission_name: "حذف المنتجات",            description: "حذف المنتج" },
  { id: "perm_009", module: "accounting", permission_code: "accounting.read",    permission_name: "عرض الحسابات",            description: "عرض الحسابات والأرصدة" },
  { id: "perm_010", module: "accounting", permission_code: "accounting.create",  permission_name: "إنشاء قيود",              description: "إنشاء قيد محاسبي" },
  { id: "perm_011", module: "reports",    permission_code: "reports.read",       permission_name: "عرض التقارير",            description: "عرض التقارير" },
  { id: "perm_012", module: "reports",    permission_code: "reports.export",     permission_name: "تصدير التقارير",          description: "تصدير التقارير" },
  { id: "perm_013", module: "users",      permission_code: "users.create",       permission_name: "إضافة مستخدمين",          description: "إضافة مستخدم جديد" },
  { id: "perm_014", module: "users",      permission_code: "users.read",         permission_name: "عرض المستخدمين",          description: "عرض قائمة المستخدمين" },
  { id: "perm_015", module: "users",      permission_code: "users.update",       permission_name: "تعديل المستخدمين",        description: "تعديل بيانات المستخدم" },
  { id: "perm_016", module: "settings",   permission_code: "settings.read",      permission_name: "عرض الإعدادات",           description: "عرض إعدادات النظام" },
  { id: "perm_017", module: "settings",   permission_code: "settings.update",    permission_name: "تعديل الإعدادات",         description: "تعديل إعدادات النظام" },
];

// ─── User ─────────────────────────────────────────────────────────────────────
export const MOCK_USER: User = {
  id:                "usr_001",
  account_id:        "acc_001",
  default_branch_id: "br_001",
  username:          "ahmed.m",
  email:             "demo@tajir.ye",
  password_hash:     "[hashed]",
  full_name:         "أحمد محمد العمري",
  phone:             "+967771234567",
  is_active:         true,
  last_login_at:     new Date().toISOString(),
  created_at:        "2024-01-15T10:00:00Z",
  updated_at:        new Date().toISOString(),
};

// ─── User Roles ───────────────────────────────────────────────────────────────
export const MOCK_USER_ROLES: UserRole[] = [
  { user_id: "usr_001", role_id: "role_001", assigned_at: "2024-01-15T10:00:00Z" },
];

// ─── Role Permissions (Owner gets all) ────────────────────────────────────────
export const MOCK_ROLE_PERMISSIONS: RolePermission[] = MOCK_PERMISSIONS.map((p) => ({
  role_id:       "role_001",
  permission_id: p.id,
}));

// ─── System Settings ──────────────────────────────────────────────────────────
export const MOCK_SYSTEM_SETTINGS: SystemSetting[] = [
  { id: "ss_001", business_id: "biz_001", setting_key: "allow_negative_stock", setting_value: "false", created_at: "2024-01-15T10:00:00Z", updated_at: "2024-01-15T10:00:00Z" },
  { id: "ss_002", business_id: "biz_001", setting_key: "auto_backup",          setting_value: "true",  created_at: "2024-01-15T10:00:00Z", updated_at: "2024-01-15T10:00:00Z" },
  { id: "ss_003", business_id: "biz_001", setting_key: "receipt_footer",       setting_value: "شكراً لتعاملكم معنا",  created_at: "2024-01-15T10:00:00Z", updated_at: "2024-01-15T10:00:00Z" },
  { id: "ss_004", business_id: "biz_001", setting_key: "tax_rate",             setting_value: "5",     created_at: "2024-01-15T10:00:00Z", updated_at: "2024-01-15T10:00:00Z" },
  { id: "ss_005", business_id: "biz_001", setting_key: "low_stock_alert",      setting_value: "10",    created_at: "2024-01-15T10:00:00Z", updated_at: "2024-01-15T10:00:00Z" },
  { id: "ss_006", business_id: "biz_001", setting_key: "default_currency",     setting_value: "YER",   created_at: "2024-01-15T10:00:00Z", updated_at: "2024-01-15T10:00:00Z" },
  { id: "ss_007", business_id: "biz_001", setting_key: "paper_size",           setting_value: "80mm",  created_at: "2024-01-15T10:00:00Z", updated_at: "2024-01-15T10:00:00Z" },
];

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const MOCK_DASHBOARD_STATS = {
  today_sales:      125_000,
  today_invoices:   8,
  total_products:   142,
  total_customers:  37,
  monthly_revenue:  1_850_000,
  monthly_expenses: 420_000,
  currency:         "YER",
};

// ─── Reference data: Countries, Timezones, Currencies ─────────────────────────
export const COUNTRIES_AR = ["اليمن","السعودية","الإمارات","الكويت","قطر","البحرين","عُمان","الأردن","مصر","العراق","سوريا","لبنان"];
export const COUNTRIES_EN = ["Yemen","Saudi Arabia","UAE","Kuwait","Qatar","Bahrain","Oman","Jordan","Egypt","Iraq","Syria","Lebanon"];

export const TIMEZONES = [
  { value: "Asia/Aden",   label_ar: "صنعاء / عدن (UTC+3)", label_en: "Sanaa / Aden (UTC+3)" },
  { value: "Asia/Riyadh", label_ar: "الرياض (UTC+3)",       label_en: "Riyadh (UTC+3)" },
  { value: "Asia/Dubai",  label_ar: "دبي (UTC+4)",           label_en: "Dubai (UTC+4)" },
  { value: "Asia/Kuwait", label_ar: "الكويت (UTC+3)",        label_en: "Kuwait (UTC+3)" },
  { value: "Africa/Cairo",label_ar: "القاهرة (UTC+2)",       label_en: "Cairo (UTC+2)" },
];

export const CURRENCIES = [
  { code: "YER", name_ar: "ريال يمني",    name_en: "Yemeni Rial",  symbol: "ر.ي" },
  { code: "SAR", name_ar: "ريال سعودي",   name_en: "Saudi Riyal",  symbol: "ر.س" },
  { code: "AED", name_ar: "درهم إماراتي", name_en: "UAE Dirham",   symbol: "د.إ" },
  { code: "USD", name_ar: "دولار أمريكي", name_en: "US Dollar",    symbol: "$" },
  { code: "EUR", name_ar: "يورو",         name_en: "Euro",         symbol: "€" },
];

export const FISCAL_MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
export const FISCAL_MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─── UI-only plan display data (enriched with labels and features for UI) ────
export interface UIPlan {
  db_plan_id:       string;
  name_ar:          string;
  name_en:          string;
  description_ar:   string;
  description_en:   string;
  price_monthly:    number;   // in YER (0 = free, -1 = contact sales)
  price_yearly:     number;
  trial_days:       number;
  is_popular:       boolean;
  features_ar:      string[];
  features_en:      string[];
}

export const UI_PLANS: UIPlan[] = [
  {
    db_plan_id:     "plan_trial",
    name_ar:        "تجربة مجانية",
    name_en:        "Free Trial",
    description_ar: "جرّب تاجر كاملاً لمدة 7 أيام بدون أي التزام",
    description_en: "Try Tajir fully for 7 days with no commitment",
    price_monthly:  0,
    price_yearly:   0,
    trial_days:     7,
    is_popular:     false,
    features_ar:    ["جميع الميزات مفعّلة","حتى فرع واحد","حتى مستخدمَين","حتى 100 منتج","حتى 50 فاتورة"],
    features_en:    ["All features enabled","Up to 1 branch","Up to 2 users","Up to 100 products","Up to 50 invoices"],
  },
  {
    db_plan_id:     "plan_basic",
    name_ar:        "الأساسية",
    name_en:        "Basic",
    description_ar: "مناسب للمتاجر الصغيرة والأعمال الناشئة",
    description_en: "Suitable for small shops and growing businesses",
    price_monthly:  4_999,
    price_yearly:   49_999,
    trial_days:     0,
    is_popular:     false,
    features_ar:    ["مبيعات وفواتير غير محدودة","مخزون أساسي","إدارة العملاء والموردين","فرع واحد","حتى 3 مستخدمين","تقارير أساسية","دعم عبر الواتساب"],
    features_en:    ["Unlimited sales & invoices","Basic inventory","Customer & supplier management","1 branch","Up to 3 users","Basic reports","WhatsApp support"],
  },
  {
    db_plan_id:     "plan_pro",
    name_ar:        "الاحترافية",
    name_en:        "Professional",
    description_ar: "للأعمال المتنامية التي تحتاج مرونة وتوسع",
    description_en: "For growing businesses that need flexibility and scale",
    price_monthly:  9_999,
    price_yearly:   99_999,
    trial_days:     0,
    is_popular:     true,
    features_ar:    ["كل ميزات الأساسية","حتى 3 فروع","حتى 10 مستخدمين","منتجات غير محدودة","محاسبة كاملة وقيود","تقارير متقدمة وتصدير","صلاحيات متقدمة","دعم أولوية"],
    features_en:    ["Everything in Basic","Up to 3 branches","Up to 10 users","Unlimited products","Full accounting & journal entries","Advanced reports & export","Advanced permissions","Priority support"],
  },
  {
    db_plan_id:     "plan_enterprise",
    name_ar:        "المؤسسية",
    name_en:        "Enterprise",
    description_ar: "للشركات الكبيرة ومتعددة الفروع — حلول مخصصة",
    description_en: "For large multi-branch companies — custom solutions",
    price_monthly:  -1,
    price_yearly:   -1,
    trial_days:     0,
    is_popular:     false,
    features_ar:    ["كل ميزات الاحترافية","فروع غير محدودة","مستخدمون غير محدودون","تكاملات API مخصصة","مدير حساب مخصص","SLA مضمون 99.9%"],
    features_en:    ["Everything in Professional","Unlimited branches","Unlimited users","Custom API integrations","Dedicated account manager","99.9% SLA guarantee"],
  },
];
