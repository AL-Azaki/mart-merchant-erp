export interface DocumentItem {
  id: string;
  title: string;
  category: "contract" | "license" | "invoice" | "other";
  ref_number: string;
  issue_date: string;
  expiry_date: string | null;
  file_url: string;
  notes: string;
  created_at: string;
}

// Inline SVGs for beautiful realistic document templates
const contractSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%23FFFFFF" rx="8"/><rect x="20" y="20" width="260" height="360" fill="none" stroke="%23E2E8F0" stroke-width="2"/><text x="150" y="60" font-family="sans-serif" font-size="16" font-weight="bold" fill="%231E293B" text-anchor="middle">عقد إيجار المحل الرئيسي</text><line x1="40" y1="100" x2="260" y2="100" stroke="%2394A3B8" stroke-width="2"/><line x1="40" y1="140" x2="220" y2="140" stroke="%23CBD5E1" stroke-width="2"/><line x1="40" y1="180" x2="260" y2="180" stroke="%23CBD5E1" stroke-width="2"/><line x1="40" y1="220" x2="180" y2="220" stroke="%23CBD5E1" stroke-width="2"/><line x1="40" y1="260" x2="260" y2="260" stroke="%23CBD5E1" stroke-width="2"/><rect x="40" y="300" width="100" height="40" fill="none" stroke="%236366F1" stroke-width="2" rx="4"/><text x="90" y="325" font-family="sans-serif" font-size="11" fill="%236366F1" text-anchor="middle">توقيع الطرف الأول</text><rect x="160" y="300" width="100" height="40" fill="none" stroke="%236366F1" stroke-width="2" rx="4"/><text x="210" y="325" font-family="sans-serif" font-size="11" fill="%236366F1" text-anchor="middle">توقيع الطرف الثاني</text></svg>`;

const licenseSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%23F8FAFC" rx="8"/><rect x="20" y="20" width="260" height="360" fill="none" stroke="%23F59E0B" stroke-width="3"/><text x="150" y="60" font-family="sans-serif" font-size="15" font-weight="bold" fill="%23D97706" text-anchor="middle">رخصة ممارسة المهن والبلدية</text><circle cx="150" cy="150" r="40" fill="none" stroke="%23F59E0B" stroke-width="3"/><text x="150" y="155" font-family="sans-serif" font-size="10" font-weight="bold" fill="%23D97706" text-anchor="middle">شعار البلدية</text><line x1="50" y1="230" x2="250" y2="230" stroke="%2394A3B8" stroke-width="2"/><line x1="50" y1="270" x2="200" y2="270" stroke="%23CBD5E1" stroke-width="2"/><line x1="50" y1="310" x2="250" y2="310" stroke="%23CBD5E1" stroke-width="2"/><text x="150" y="350" font-family="sans-serif" font-size="12" font-weight="bold" fill="%2310B981" text-anchor="middle">مرخصة وصالحة</text></svg>`;

const invoiceSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%23FFFFFF" rx="8"/><rect x="20" y="20" width="260" height="360" fill="none" stroke="%23E2E8F0" stroke-width="2"/><text x="50" y="60" font-family="sans-serif" font-size="14" font-weight="bold" fill="%231E293B">فاتورة توريد بضاعة</text><text x="250" y="60" font-family="sans-serif" font-size="11" fill="%2364748B" text-anchor="end">#INV-9982</text><line x1="30" y1="90" x2="270" y2="90" stroke="%2338BDF8" stroke-width="2"/><rect x="30" y="110" width="240" height="80" fill="%23F8FAFC" rx="4"/><text x="40" y="135" font-family="sans-serif" font-size="11" fill="%231E293B">الشركة الموردة: مصنع الأغذية المحدود</text><text x="40" y="165" font-family="sans-serif" font-size="11" fill="%231E293B">تاريخ الشراء: 2026-06-15</text><line x1="30" y1="210" x2="270" y2="210" stroke="%23E2E8F0" stroke-width="1"/><line x1="30" y1="240" x2="270" y2="240" stroke="%23E2E8F0" stroke-width="1"/><line x1="30" y1="270" x2="270" y2="270" stroke="%23E2E8F0" stroke-width="1"/><text x="270" y="320" font-family="sans-serif" font-size="14" font-weight="bold" fill="%231E293B" text-anchor="end">الإجمالي: 450,000 ر.ي</text><rect x="30" y="340" width="80" height="24" fill="%2310B981" rx="12"/><text x="70" y="356" font-family="sans-serif" font-size="10" font-weight="bold" fill="%23FFFFFF" text-anchor="middle">مدفوعة كاش</text></svg>`;

export const MOCK_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc_1",
    title: "عقد إيجار المركز الرئيسي",
    category: "contract",
    ref_number: "CONT-2025-88",
    issue_date: "2025-01-01",
    expiry_date: "2027-01-01",
    file_url: contractSvg,
    notes: "عقد إيجار المحل التجاري بشارع حدة، الإيجار يدفع سنوياً.",
    created_at: "2025-01-01T10:00:00Z"
  },
  {
    id: "doc_2",
    title: "رخصة البلدية ومزاولة المهن",
    category: "license",
    ref_number: "LIC-88902-YE",
    issue_date: "2026-01-10",
    expiry_date: "2027-01-10",
    file_url: licenseSvg,
    notes: "رخصة محل البيع بالتجزئة الصادرة من المجلس المحلي بصنعاء.",
    created_at: "2026-01-10T12:00:00Z"
  },
  {
    id: "doc_3",
    title: "فاتورة بضاعة المراعي الخارجية",
    category: "invoice",
    ref_number: "INV-ALMARAI-772",
    issue_date: "2026-06-15",
    expiry_date: null,
    file_url: invoiceSvg,
    notes: "فاتورة توريد مصورة لمنتجات الحليب والأجبان المستلمة في الفرع الثاني.",
    created_at: "2026-06-15T09:00:00Z"
  }
];
