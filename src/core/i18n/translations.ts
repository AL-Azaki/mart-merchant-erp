// ═══════════════════════════════════════════════════════════════════════════════
// i18n — translation dictionary
// Language: "ar" | "en"
// ═══════════════════════════════════════════════════════════════════════════════

export type Language = "ar" | "en";

export type TranslationKeys =
  // Brand
  | "appName" | "appNameFull" | "tagline" | "taglineSub"
  // Onboarding
  | "onboarding1Title" | "onboarding1Subtitle" | "onboarding1Desc"
  | "onboarding2Title" | "onboarding2Subtitle" | "onboarding2Desc"
  | "onboarding3Title" | "onboarding3Subtitle" | "onboarding3Desc"
  | "getStarted" | "skip" | "next"
  // Common
  | "continue" | "back" | "save" | "cancel" | "loading"
  | "required" | "optional" | "yes" | "no" | "or"
  // Theme
  | "themeLight" | "themeDark" | "themeSystem"
  // Language
  | "langArabic" | "langEnglish"
  // Auth — Login
  | "welcomeBack" | "loginSubtitle" | "emailLabel" | "passwordLabel"
  | "rememberMe" | "forgotPassword" | "loginBtn" | "noAccount"
  | "createAccount" | "demoCredentials" | "demoEmail" | "demoPassword"
  | "emailRequired" | "passwordRequired" | "invalidEmail" | "loginError"
  // Auth — Register
  | "createNewAccount" | "registerSubtitle" | "firstName" | "lastName"
  | "username" | "phone" | "confirmPassword" | "country"
  | "preferredLanguage" | "acceptTerms" | "alreadyHaveAccount" | "signIn"
  | "step" | "of"
  // Business Setup
  | "setupBusiness" | "setupBusinessSub" | "businessName" | "businessType"
  | "businessTypePlaceholder" | "businessPhone" | "businessEmail"
  | "businessLogo" | "city" | "address" | "timezone" | "currency"
  | "fiscalYear"
  | "businessTypeGrocery" | "businessTypeRetail" | "businessTypeWholesale"
  | "businessTypeRestaurant" | "businessTypeCafe" | "businessTypePharmacy"
  | "businessTypeElectronics" | "businessTypeFashion" | "businessTypeOther"
  // Branch Setup
  | "setupBranch" | "setupBranchSub" | "branchName" | "branchCode"
  | "branchPhone" | "branchEmail" | "branchAddress"
  | "isDefaultBranch" | "isDefaultBranchSub" | "createBranchBtn"
  // Success
  | "congratulations" | "successTitle" | "successSubtitle"
  | "successAccount" | "successBusiness" | "successBranch" | "successPermissions"
  | "successAccountSub" | "successBusinessSub" | "successBranchSub"
  | "successPermissionsSub" | "goToDashboard"
  // Dashboard
  | "dashboardTitle" | "welcomeUser" | "todaySales" | "totalProducts"
  | "totalCustomers" | "totalInvoices" | "quickActions"
  | "newSale" | "addProduct" | "newCustomer" | "reportsBtn"
  | "comingSoon" | "mainDashboard" | "yourStats"
  // Navigation
  | "navHome" | "navSales" | "navInventory" | "navFinance" | "navSettings" | "navCustomers"
  // Settings
  | "settingsTitle" | "settingsProfile" | "settingsBusiness"
  | "settingsTheme" | "settingsLanguage" | "settingsLogout"
  // Auth Gate
  | "authGateTitle" | "authGateSubtitle" | "trialBadge" | "trialBadgeSub"
  | "startTrialBtn" | "haveAccount" | "signInLink"
  | "trialFeature1" | "trialFeature2" | "trialFeature3"
  | "trialDaysLeft" | "trialExpired" | "upgradePlan"
  // Plans
  | "choosePlan" | "planSubtitle" | "planMonthly" | "planYearly"
  | "planYearlySave" | "planPopular" | "planContactSales"
  | "planSelectBtn" | "planCurrentBtn" | "planPerMonth" | "planPerYear" | "planYER"
  // Units
  | "currencyYER" | "items" | "clients" | "invoices"
  // ── Sales Module ─────────────────────────────────────────────────────────
  | "salesTitle" | "allInvoices" | "newInvoice" | "searchInvoices"
  | "filterAll" | "filterPaid" | "filterUnpaid" | "filterDraft" | "filterOverdue"
  | "invoiceNumber" | "invoiceDate" | "invoiceStatus" | "invoiceTotal"
  | "invoiceCustomer" | "cashCustomer" | "invoicePaid" | "invoicePartial"
  | "invoiceDraft" | "invoiceCancelled" | "invoiceConfirmed" | "invoiceOverdue"
  | "invoiceReturn"
  // New Invoice
  | "selectCustomer" | "walkInCustomer" | "searchCustomer" | "addNewCustomer"
  | "searchProducts" | "addItem" | "scanBarcode" | "productName"
  | "productPrice" | "productQty" | "productDiscount" | "productTax"
  | "invoiceSubtotal" | "invoiceDiscount" | "invoiceTax" | "invoiceGrandTotal"
  | "invoiceNotes" | "invoiceRef" | "discountType" | "discountFixed" | "discountPercent"
  // Payment
  | "paymentMethod" | "payCash" | "payCard" | "payTransfer" | "payCredit" | "payMulti"
  | "amountPaid" | "amountChange" | "amountDue" | "confirmPayment" | "saveAsDraft"
  | "printReceipt" | "shareReceipt" | "newSaleAfter"
  // Invoice Details
  | "invoiceItems" | "invoicePayments" | "editInvoice" | "cancelInvoice"
  | "invoiceSummary" | "noInvoicesYet" | "noInvoicesDesc"
  // Customers
  | "customersTitle" | "addCustomer" | "customerName" | "customerPhone"
  | "customerEmail" | "customerType" | "customerIndividual" | "customerCompany"
  | "customerBalance" | "customerCredit" | "customerTaxNumber" | "noCustomers";

export type TranslationDict = Record<TranslationKeys, string>;
export type Translations = Record<Language, TranslationDict>;

export const translations: Translations = {
  ar: {
    // ── Brand ──────────────────────────────────────────────────────────────────
    appName: "تاجر",
    appNameFull: "تاجر — نظام إدارة الأعمال",
    tagline: "كل تجارتك. في راحة يدك.",
    taglineSub: "مبيعات · مخزون · محاسبة · تقارير",

    // ── Onboarding ─────────────────────────────────────────────────────────────
    onboarding1Title: "بيّع. فاتر. واكسب.",
    onboarding1Subtitle: "نقطة بيع لا تعرف التعقيد",
    onboarding1Desc: "أصدر فواتير ضريبية رسمية في ثوانٍ، تتبّع كل ريال، وأدِر عملاءك وموردينك من شاشة واحدة.",
    onboarding2Title: "مخزونك. تحت سيطرتك.",
    onboarding2Subtitle: "لا مزيد من الفقد والمفاجآت",
    onboarding2Desc: "تتبّع كل منتج في كل فرع لحظةً بلحظة، واستقبل تنبيهات نفاد المخزون قبل أن تخسر المبيعات.",
    onboarding3Title: "أرقامك تتكلم. أنت تقرر.",
    onboarding3Subtitle: "محاسبة دقيقة وتقارير تنير الطريق",
    onboarding3Desc: "راقب أرباحك ومصروفاتك يومياً، وافهم تجارتك بتقارير ذكية تساعدك على القرار الصح.",
    getStarted: "ابدأ رحلتك",
    skip: "تخطى",
    next: "التالي",

    // ── Common ─────────────────────────────────────────────────────────────────
    continue: "متابعة",
    back: "رجوع",
    save: "حفظ",
    cancel: "إلغاء",
    loading: "جاري التحميل...",
    required: "مطلوب",
    optional: "اختياري",
    yes: "نعم",
    no: "لا",
    or: "أو",

    // ── Theme ──────────────────────────────────────────────────────────────────
    themeLight: "فاتح",
    themeDark: "داكن",
    themeSystem: "تلقائي",

    // ── Language ───────────────────────────────────────────────────────────────
    langArabic: "العربية",
    langEnglish: "English",

    // ── Auth — Login ───────────────────────────────────────────────────────────
    welcomeBack: "أهلاً بعودتك",
    loginSubtitle: "سجّل دخولك لمتابعة تجارتك",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    rememberMe: "تذكرني",
    forgotPassword: "نسيت كلمة المرور؟",
    loginBtn: "تسجيل الدخول",
    noAccount: "ليس لديك حساب؟",
    createAccount: "إنشاء حساب",
    demoCredentials: "بيانات الحساب التجريبي",
    demoEmail: "demo@tajir.ye",
    demoPassword: "123456",
    emailRequired: "البريد الإلكتروني مطلوب",
    passwordRequired: "كلمة المرور مطلوبة",
    invalidEmail: "صيغة البريد الإلكتروني غير صحيحة",
    loginError: "البريد الإلكتروني أو كلمة المرور غير صحيحة",

    // ── Auth — Register ────────────────────────────────────────────────────────
    createNewAccount: "إنشاء حساب جديد",
    registerSubtitle: "أنشئ حسابك وابدأ إدارة تجارتك",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    username: "اسم المستخدم",
    phone: "رقم الهاتف",
    confirmPassword: "تأكيد كلمة المرور",
    country: "الدولة",
    preferredLanguage: "اللغة المفضلة",
    acceptTerms: "أوافق على شروط الاستخدام وسياسة الخصوصية",
    alreadyHaveAccount: "لديك حساب بالفعل؟",
    signIn: "تسجيل الدخول",
    step: "الخطوة",
    of: "من",

    // ── Business Setup ─────────────────────────────────────────────────────────
    setupBusiness: "إعداد النشاط التجاري",
    setupBusinessSub: "أخبرنا عن نشاطك لنُهيئ النظام لك",
    businessName: "اسم النشاط التجاري",
    businessType: "نوع النشاط",
    businessTypePlaceholder: "اختر نوع النشاط",
    businessPhone: "هاتف النشاط",
    businessEmail: "بريد النشاط الإلكتروني",
    businessLogo: "شعار النشاط",
    city: "المدينة",
    address: "العنوان",
    timezone: "المنطقة الزمنية",
    currency: "العملة الافتراضية",
    fiscalYear: "بداية السنة المالية",
    businessTypeGrocery: "بقالة",
    businessTypeRetail: "تجزئة",
    businessTypeWholesale: "جملة",
    businessTypeRestaurant: "مطعم",
    businessTypeCafe: "مقهى",
    businessTypePharmacy: "صيدلية",
    businessTypeElectronics: "إلكترونيات",
    businessTypeFashion: "أزياء",
    businessTypeOther: "أخرى",

    // ── Branch Setup ───────────────────────────────────────────────────────────
    setupBranch: "إعداد الفرع الأول",
    setupBranchSub: "أضف فرعك الأول لتبدأ العمل",
    branchName: "اسم الفرع",
    branchCode: "رمز الفرع",
    branchPhone: "هاتف الفرع",
    branchEmail: "بريد الفرع",
    branchAddress: "عنوان الفرع",
    isDefaultBranch: "فرع افتراضي",
    isDefaultBranchSub: "سيُستخدم هذا الفرع تلقائياً في العمليات",
    createBranchBtn: "إنشاء الفرع والانطلاق",

    // ── Success ────────────────────────────────────────────────────────────────
    congratulations: "تهانينا! 🎉",
    successTitle: "نشاطك جاهز للانطلاق",
    successSubtitle: "تم إعداد كل شيء. حان وقت البيع!",
    successAccount: "الحساب",
    successBusiness: "النشاط",
    successBranch: "الفرع",
    successPermissions: "الصلاحيات",
    successAccountSub: "تم إنشاؤه",
    successBusinessSub: "تم إعداده",
    successBranchSub: "جاهز للعمل",
    successPermissionsSub: "وصول كامل",
    goToDashboard: "انطلق إلى لوحة التحكم",

    // ── Dashboard ──────────────────────────────────────────────────────────────
    dashboardTitle: "لوحة التحكم",
    welcomeUser: "مرحباً،",
    todaySales: "مبيعات اليوم",
    totalProducts: "المنتجات",
    totalCustomers: "العملاء",
    totalInvoices: "الفواتير",
    quickActions: "إجراءات سريعة",
    newSale: "بيع جديد",
    addProduct: "إضافة منتج",
    newCustomer: "عميل جديد",
    reportsBtn: "التقارير",
    comingSoon: "قريباً — هذا القسم قيد التطوير",
    mainDashboard: "لوحة التحكم الرئيسية",
    yourStats: "ستظهر إحصائياتك ومبيعاتك هنا",

    // ── Navigation ─────────────────────────────────────────────────────────────
    navHome: "الرئيسية",
    navSales: "نقطة البيع",
    navInventory: "المخزون",
    navFinance: "المالية",
    navSettings: "الإعدادات",
    navCustomers: "العملاء",

    // ── Settings ───────────────────────────────────────────────────────────────
    settingsTitle: "الإعدادات",
    settingsProfile: "الملف الشخصي",
    settingsBusiness: "النشاط التجاري",
    settingsTheme: "المظهر",
    settingsLanguage: "اللغة",
    settingsLogout: "تسجيل الخروج",

    // ── Auth Gate ──────────────────────────────────────────────────────────────
    authGateTitle: "ابدأ تجارتك الرقمية اليوم",
    authGateSubtitle: "انضم إلى آلاف التجار الذين يديرون أعمالهم بذكاء مع تاجر",
    trialBadge: "٧ أيام مجاناً",
    trialBadgeSub: "بدون بطاقة ائتمان",
    startTrialBtn: "ابدأ التجربة المجانية",
    haveAccount: "لديّ حساب بالفعل —",
    signInLink: "تسجيل الدخول",
    trialFeature1: "وصول كامل لجميع الميزات",
    trialFeature2: "لا تحتاج بطاقة ائتمان",
    trialFeature3: "إلغاء في أي وقت",
    trialDaysLeft: "يوم متبقٍ في التجربة",
    trialExpired: "انتهت فترة التجربة",
    upgradePlan: "ترقية الباقة",

    // ── Plans ──────────────────────────────────────────────────────────────────
    choosePlan: "اختر الباقة المناسبة",
    planSubtitle: "ابدأ بالتجربة المجانية ثم اختر ما يناسب نشاطك",
    planMonthly: "شهرياً",
    planYearly: "سنوياً",
    planYearlySave: "وفّر 17%",
    planPopular: "الأكثر شيوعاً",
    planContactSales: "تواصل معنا",
    planSelectBtn: "اختر هذه الباقة",
    planCurrentBtn: "باقتك الحالية",
    planPerMonth: "/ شهر",
    planPerYear: "/ سنة",
    planYER: "ر.ي",

    // ── Units ──────────────────────────────────────────────────────────────────
    currencyYER: "ر.ي",
    items: "منتج",
    clients: "عميل",
    invoices: "فاتورة",

    // ── Sales Module ───────────────────────────────────────────────────────────
    salesTitle: "المبيعات",
    allInvoices: "جميع الفواتير",
    newInvoice: "فاتورة جديدة",
    searchInvoices: "بحث في الفواتير...",
    filterAll: "الكل",
    filterPaid: "مدفوعة",
    filterUnpaid: "غير مدفوعة",
    filterDraft: "مسودة",
    filterOverdue: "متأخرة",
    invoiceNumber: "رقم الفاتورة",
    invoiceDate: "تاريخ الفاتورة",
    invoiceStatus: "الحالة",
    invoiceTotal: "الإجمالي",
    invoiceCustomer: "العميل",
    cashCustomer: "عميل نقدي",
    invoicePaid: "مدفوعة",
    invoicePartial: "جزئي",
    invoiceDraft: "مسودة",
    invoiceCancelled: "ملغاة",
    invoiceConfirmed: "مؤكدة",
    invoiceOverdue: "متأخرة",
    invoiceReturn: "مرتجع",
    // New Invoice
    selectCustomer: "اختر العميل",
    walkInCustomer: "عميل نقدي",
    searchCustomer: "بحث عن عميل...",
    addNewCustomer: "+ إضافة عميل جديد",
    searchProducts: "بحث عن منتج...",
    addItem: "إضافة صنف",
    scanBarcode: "مسح الباركود",
    productName: "اسم المنتج",
    productPrice: "السعر",
    productQty: "الكمية",
    productDiscount: "الخصم",
    productTax: "الضريبة",
    invoiceSubtotal: "المجموع الفرعي",
    invoiceDiscount: "الخصم",
    invoiceTax: "الضريبة",
    invoiceGrandTotal: "الإجمالي النهائي",
    invoiceNotes: "ملاحظات...",
    invoiceRef: "رقم مرجعي",
    discountType: "نوع الخصم",
    discountFixed: "مبلغ ثابت",
    discountPercent: "نسبة مئوية",
    // Payment
    paymentMethod: "طريقة الدفع",
    payCash: "نقداً",
    payCard: "بطاقة",
    payTransfer: "تحويل",
    payCredit: "آجل",
    payMulti: "متعدد",
    amountPaid: "المبلغ المدفوع",
    amountChange: "الباقي للعميل",
    amountDue: "المبلغ المستحق",
    confirmPayment: "تأكيد الدفع",
    saveAsDraft: "حفظ كمسودة",
    printReceipt: "طباعة الإيصال",
    shareReceipt: "مشاركة الإيصال",
    newSaleAfter: "بيع جديد",
    // Invoice Details
    invoiceItems: "الأصناف",
    invoicePayments: "المدفوعات",
    editInvoice: "تعديل",
    cancelInvoice: "إلغاء الفاتورة",
    invoiceSummary: "ملخص الفاتورة",
    noInvoicesYet: "لا توجد فواتير بعد",
    noInvoicesDesc: "ابدأ بإنشاء أول فاتورة مبيعات",
    // Customers
    customersTitle: "العملاء",
    addCustomer: "إضافة عميل",
    customerName: "الاسم",
    customerPhone: "الهاتف",
    customerEmail: "البريد الإلكتروني",
    customerType: "النوع",
    customerIndividual: "فرد",
    customerCompany: "شركة",
    customerBalance: "الرصيد",
    customerCredit: "حد الائتمان",
    customerTaxNumber: "الرقم الضريبي",
    noCustomers: "لا يوجد عملاء بعد",
  },

  en: {
    // ── Brand ──────────────────────────────────────────────────────────────────
    appName: "Tajir",
    appNameFull: "Tajir — Business Management System",
    tagline: "All your business. In the palm of your hand.",
    taglineSub: "Sales · Inventory · Accounting · Reports",

    // ── Onboarding ─────────────────────────────────────────────────────────────
    onboarding1Title: "Sell. Invoice. Earn.",
    onboarding1Subtitle: "A POS that knows no complexity",
    onboarding1Desc: "Issue official tax invoices in seconds, track every penny, and manage customers and suppliers from one screen.",
    onboarding2Title: "Your Inventory. Under Control.",
    onboarding2Subtitle: "No more losses or surprises",
    onboarding2Desc: "Track every product across every branch in real time and receive low-stock alerts before you lose a sale.",
    onboarding3Title: "Your Numbers Talk. You Decide.",
    onboarding3Subtitle: "Precise accounting, reports that light the way",
    onboarding3Desc: "Monitor your profits and expenses daily, and understand your business with smart reports that guide your decisions.",
    getStarted: "Start Your Journey",
    skip: "Skip",
    next: "Next",

    // ── Common ─────────────────────────────────────────────────────────────────
    continue: "Continue",
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    required: "Required",
    optional: "Optional",
    yes: "Yes",
    no: "No",
    or: "or",

    // ── Theme ──────────────────────────────────────────────────────────────────
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",

    // ── Language ───────────────────────────────────────────────────────────────
    langArabic: "العربية",
    langEnglish: "English",

    // ── Auth — Login ───────────────────────────────────────────────────────────
    welcomeBack: "Welcome Back",
    loginSubtitle: "Sign in to continue managing your business",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    rememberMe: "Remember Me",
    forgotPassword: "Forgot Password?",
    loginBtn: "Sign In",
    noAccount: "Don't have an account?",
    createAccount: "Create Account",
    demoCredentials: "Demo Account Credentials",
    demoEmail: "demo@tajir.ye",
    demoPassword: "123456",
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    invalidEmail: "Invalid email format",
    loginError: "Invalid email or password",

    // ── Auth — Register ────────────────────────────────────────────────────────
    createNewAccount: "Create New Account",
    registerSubtitle: "Create your account and start managing your business",
    firstName: "First Name",
    lastName: "Last Name",
    username: "Username",
    phone: "Phone Number",
    confirmPassword: "Confirm Password",
    country: "Country",
    preferredLanguage: "Preferred Language",
    acceptTerms: "I accept the Terms of Service and Privacy Policy",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign In",
    step: "Step",
    of: "of",

    // ── Business Setup ─────────────────────────────────────────────────────────
    setupBusiness: "Business Setup",
    setupBusinessSub: "Tell us about your business so we can configure the system for you",
    businessName: "Business Name",
    businessType: "Business Type",
    businessTypePlaceholder: "Select business type",
    businessPhone: "Business Phone",
    businessEmail: "Business Email",
    businessLogo: "Business Logo",
    city: "City",
    address: "Address",
    timezone: "Timezone",
    currency: "Default Currency",
    fiscalYear: "Fiscal Year Start",
    businessTypeGrocery: "Grocery",
    businessTypeRetail: "Retail",
    businessTypeWholesale: "Wholesale",
    businessTypeRestaurant: "Restaurant",
    businessTypeCafe: "Café",
    businessTypePharmacy: "Pharmacy",
    businessTypeElectronics: "Electronics",
    businessTypeFashion: "Fashion",
    businessTypeOther: "Other",

    // ── Branch Setup ───────────────────────────────────────────────────────────
    setupBranch: "First Branch Setup",
    setupBranchSub: "Add your first branch to start working",
    branchName: "Branch Name",
    branchCode: "Branch Code",
    branchPhone: "Branch Phone",
    branchEmail: "Branch Email",
    branchAddress: "Branch Address",
    isDefaultBranch: "Default Branch",
    isDefaultBranchSub: "This branch will be used by default in operations",
    createBranchBtn: "Create Branch & Launch",

    // ── Success ────────────────────────────────────────────────────────────────
    congratulations: "Congratulations! 🎉",
    successTitle: "Your Business is Ready to Launch",
    successSubtitle: "Everything is set up. Time to sell!",
    successAccount: "Account",
    successBusiness: "Business",
    successBranch: "Branch",
    successPermissions: "Permissions",
    successAccountSub: "Created",
    successBusinessSub: "Configured",
    successBranchSub: "Ready",
    successPermissionsSub: "Full access",
    goToDashboard: "Go to Dashboard",

    // ── Dashboard ──────────────────────────────────────────────────────────────
    dashboardTitle: "Dashboard",
    welcomeUser: "Welcome,",
    todaySales: "Today's Sales",
    totalProducts: "Products",
    totalCustomers: "Customers",
    totalInvoices: "Invoices",
    quickActions: "Quick Actions",
    newSale: "New Sale",
    addProduct: "Add Product",
    newCustomer: "New Customer",
    reportsBtn: "Reports",
    comingSoon: "Coming soon — this section is under development",
    mainDashboard: "Main Dashboard",
    yourStats: "Your stats and sales will appear here",

    // ── Navigation ─────────────────────────────────────────────────────────────
    navHome: "Home",
    navSales: "POS / Sales",
    navInventory: "Inventory",
    navFinance: "Finance",
    navSettings: "Settings",
    navCustomers: "Customers",

    // ── Settings ───────────────────────────────────────────────────────────────
    settingsTitle: "Settings",
    settingsProfile: "Profile",
    settingsBusiness: "Business",
    settingsTheme: "Theme",
    settingsLanguage: "Language",
    settingsLogout: "Log Out",

    // ── Auth Gate ──────────────────────────────────────────────────────────────
    authGateTitle: "Start Your Digital Business Today",
    authGateSubtitle: "Join thousands of merchants managing their business smarter with Tajir",
    trialBadge: "7 Days Free",
    trialBadgeSub: "No credit card required",
    startTrialBtn: "Start Free Trial",
    haveAccount: "Already have an account —",
    signInLink: "Sign In",
    trialFeature1: "Full access to all features",
    trialFeature2: "No credit card required",
    trialFeature3: "Cancel anytime",
    trialDaysLeft: "days left in your trial",
    trialExpired: "Your trial has ended",
    upgradePlan: "Upgrade Plan",

    // ── Plans ──────────────────────────────────────────────────────────────────
    choosePlan: "Choose Your Plan",
    planSubtitle: "Start with the free trial then choose what fits your business",
    planMonthly: "Monthly",
    planYearly: "Yearly",
    planYearlySave: "Save 17%",
    planPopular: "Most Popular",
    planContactSales: "Contact Sales",
    planSelectBtn: "Choose This Plan",
    planCurrentBtn: "Your Current Plan",
    planPerMonth: "/ mo",
    planPerYear: "/ yr",
    planYER: "YER",

    // ── Units ──────────────────────────────────────────────────────────────────
    currencyYER: "YER",
    items: "items",
    clients: "clients",
    invoices: "invoices",

    // ── Sales Module ───────────────────────────────────────────────────────────
    salesTitle: "Sales",
    allInvoices: "All Invoices",
    newInvoice: "New Invoice",
    searchInvoices: "Search invoices...",
    filterAll: "All",
    filterPaid: "Paid",
    filterUnpaid: "Unpaid",
    filterDraft: "Draft",
    filterOverdue: "Overdue",
    invoiceNumber: "Invoice No.",
    invoiceDate: "Date",
    invoiceStatus: "Status",
    invoiceTotal: "Total",
    invoiceCustomer: "Customer",
    cashCustomer: "Cash Customer",
    invoicePaid: "Paid",
    invoicePartial: "Partial",
    invoiceDraft: "Draft",
    invoiceCancelled: "Cancelled",
    invoiceConfirmed: "Confirmed",
    invoiceOverdue: "Overdue",
    invoiceReturn: "Return",
    // New Invoice
    selectCustomer: "Select Customer",
    walkInCustomer: "Walk-in Customer",
    searchCustomer: "Search customer...",
    addNewCustomer: "+ Add New Customer",
    searchProducts: "Search products...",
    addItem: "Add Item",
    scanBarcode: "Scan Barcode",
    productName: "Product",
    productPrice: "Price",
    productQty: "Qty",
    productDiscount: "Discount",
    productTax: "Tax",
    invoiceSubtotal: "Subtotal",
    invoiceDiscount: "Discount",
    invoiceTax: "Tax",
    invoiceGrandTotal: "Grand Total",
    invoiceNotes: "Notes...",
    invoiceRef: "Reference No.",
    discountType: "Discount Type",
    discountFixed: "Fixed Amount",
    discountPercent: "Percentage",
    // Payment
    paymentMethod: "Payment Method",
    payCash: "Cash",
    payCard: "Card",
    payTransfer: "Transfer",
    payCredit: "Credit",
    payMulti: "Multi",
    amountPaid: "Amount Paid",
    amountChange: "Change",
    amountDue: "Amount Due",
    confirmPayment: "Confirm Payment",
    saveAsDraft: "Save as Draft",
    printReceipt: "Print Receipt",
    shareReceipt: "Share Receipt",
    newSaleAfter: "New Sale",
    // Invoice Details
    invoiceItems: "Items",
    invoicePayments: "Payments",
    editInvoice: "Edit",
    cancelInvoice: "Cancel Invoice",
    invoiceSummary: "Invoice Summary",
    noInvoicesYet: "No invoices yet",
    noInvoicesDesc: "Start by creating your first sales invoice",
    // Customers
    customersTitle: "Customers",
    addCustomer: "Add Customer",
    customerName: "Name",
    customerPhone: "Phone",
    customerEmail: "Email",
    customerType: "Type",
    customerIndividual: "Individual",
    customerCompany: "Company",
    customerBalance: "Balance",
    customerCredit: "Credit Limit",
    customerTaxNumber: "Tax Number",
    noCustomers: "No customers yet",
  },
};
