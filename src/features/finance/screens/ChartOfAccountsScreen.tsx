import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Folder, FileText, ChevronDown, ChevronRight, Edit, ShieldAlert } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_CHART_OF_ACCOUNTS } from "@/core/data/financeMockData";
import { AccountFormSheet } from "../components/AccountFormSheet";
import type { ChartOfAccount } from "@/core/types/finance";

export function ChartOfAccountsScreen() {
  const { t, isDark, isRTL, ds } = useApp();
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState<ChartOfAccount[]>(MOCK_CHART_OF_ACCOUNTS);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(MOCK_CHART_OF_ACCOUNTS.filter(a => a.parent_account_id === null).map(a => a.id)));
  
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Build tree
  const buildTree = (parentId: string | null): ChartOfAccount[] => {
    return accounts.filter(a => a.parent_account_id === parentId).sort((a, b) => a.account_code.localeCompare(b.account_code));
  };

  const rootAccounts = buildTree(null);

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "Asset": return "#3B82F6"; // Blue
      case "Liability": return "#EF4444"; // Red
      case "Equity": return "#8B5CF6"; // Purple
      case "Revenue": return "#10B981"; // Green
      case "Expense": return "#F59E0B"; // Orange
      default: return ds.textPrimary;
    }
  };

  const renderAccountNode = (account: ChartOfAccount, depth: number = 0) => {
    const children = buildTree(account.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(account.id);
    const matchesSearch = search && (account.account_name.includes(search) || account.account_code.includes(search));

    // Simple search filter: if there's a search, expand all and show matched
    if (search && !matchesSearch && !children.some(c => c.account_name.includes(search) || c.account_code.includes(search))) {
      return null;
    }

    return (
      <div key={account.id} style={{ display: "flex", flexDirection: "column" }}>
        <div 
          onClick={() => hasChildren && toggleNode(account.id)}
          style={{ 
            display: "flex", alignItems: "center", padding: "10px 16px", 
            paddingInlineStart: 16 + depth * 24,
            borderBottom: `1px solid ${border}`, background: matchesSearch ? (isDark ? ds.surface2 : "#F0FDF4") : surface,
            cursor: hasChildren ? "pointer" : "default", transition: "background 0.2s"
          }}
        >
          <div style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {hasChildren ? (
              isExpanded ? <ChevronDown size={18} color={ds.textSecondary} /> : <ChevronRight size={18} color={ds.textSecondary} style={{ transform: isRTL ? "rotate(180deg)" : "none" }} />
            ) : null}
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
            {account.allow_posting ? (
              <FileText size={18} color={ds.textSecondary} />
            ) : (
              <Folder size={18} color={getAccountTypeColor(account.account_type)} fill={getAccountTypeColor(account.account_type) + "20"} />
            )}
            
            <span style={{ fontWeight: 700, color: ds.textPrimary, width: 80 }}>{account.account_code}</span>
            <span style={{ fontWeight: account.allow_posting ? 600 : 800, color: account.allow_posting ? ds.textPrimary : ds.textPrimary, flex: 1 }}>{account.account_name}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, width: 250 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: getAccountTypeColor(account.account_type), width: 80, textAlign: "center", background: getAccountTypeColor(account.account_type) + "15", padding: "4px 8px", borderRadius: 6 }}>
              {account.account_type}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {account.is_system && <ShieldAlert size={16} color="#F59E0B" title={isRTL ? "حساب نظام" : "System Account"} />}
              <button title={isRTL ? "تعديل الحساب" : "Edit Account"} onClick={() => { setEditingAccount(account); setShowForm(true); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8 }}>
                <Edit size={16} color={ds.textSecondary} />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {(isExpanded || search) && hasChildren && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
              {children.map(child => renderAccountNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      <div style={{ padding: "20px 24px", background: surface, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, margin: "0 0 4px 0" }}>{isRTL ? "دليل الحسابات (شجرة الحسابات)" : "Chart of Accounts"}</h2>
          <p style={{ color: ds.textSecondary, fontSize: 13, margin: 0 }}>{isRTL ? "هيكلة الحسابات المالية للنظام" : "Financial accounts structure"}</p>
        </div>
        <button title={isRTL ? "إضافة حساب مالي جديد" : "Add new financial account"} onClick={() => { setEditingAccount(null); setShowForm(true); }} style={{ height: 44, background: "#6366F1", border: "none", borderRadius: 12, padding: "0 16px", color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <Plus size={18} strokeWidth={2.5} />
          {isRTL ? "إضافة حساب" : "Add Account"}
        </button>
      </div>

      <div style={{ padding: "16px 24px", background: surface, borderBottom: `1px solid ${border}` }}>
        <div style={{ position: "relative" }}>
          <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14 }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? "ابحث برقم أو اسم الحساب..." : "Search by code or name..."}
            style={{ width: "100%", height: 46, paddingInlineStart: 44, paddingInlineEnd: 16, background: isDark ? ds.surface2 : "#F8FAFC", border: `1px solid ${border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit" }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", padding: "12px 16px", paddingInlineStart: 56, background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${border}`, color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>
          <div style={{ width: 80 }}>{isRTL ? "الرمز" : "Code"}</div>
          <div style={{ flex: 1 }}>{isRTL ? "اسم الحساب" : "Account Name"}</div>
          <div style={{ width: 250, display: "flex", justifyContent: "space-between", paddingInlineEnd: 48 }}>
            <span>{isRTL ? "النوع" : "Type"}</span>
            <span>{isRTL ? "إجراء" : "Action"}</span>
          </div>
        </div>
        <div style={{ paddingBottom: 40 }}>
          {rootAccounts.map(acc => renderAccountNode(acc))}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <AccountFormSheet 
            account={editingAccount} 
            onClose={() => setShowForm(false)}
            onSave={(data) => {
              if (editingAccount) {
                setAccounts(prev => prev.map(a => a.id === editingAccount.id ? { ...a, ...data } : a));
              } else {
                const newAccount: ChartOfAccount = {
                  id: `acc_${Date.now()}`, business_id: "biz_001", currency_id: "cur_001",
                  account_level: 1, is_system: false, is_active: true,
                  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
                  ...(data as any)
                };
                setAccounts(prev => [...prev, newAccount]);
              }
              setShowForm(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
