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
            display: "flex", alignItems: "center", padding: "16px 20px", 
            paddingInlineStart: 20 + depth * 32,
            borderBottom: `1.5px solid ${border}`, background: matchesSearch ? (isDark ? ds.surface2 : "#F0FDF4") : surface,
            cursor: hasChildren ? "pointer" : "default", transition: "background 0.2s"
          }}
        >
          <div style={{ width: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {hasChildren ? (
              isExpanded ? <ChevronDown size={22} color={ds.textSecondary} /> : <ChevronRight size={22} color={ds.textSecondary} style={{ transform: isRTL ? "rotate(180deg)" : "none" }} />
            ) : null}
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
            {account.allow_posting ? (
              <FileText size={22} color={ds.textSecondary} />
            ) : (
              <Folder size={22} color={getAccountTypeColor(account.account_type)} fill={getAccountTypeColor(account.account_type) + "20"} />
            )}
            
            <span style={{ fontWeight: 800, color: ds.textPrimary, width: 100, fontSize: 16 }}>{account.account_code}</span>
            <span style={{ fontWeight: account.allow_posting ? 600 : 800, color: ds.textPrimary, flex: 1, fontSize: 16 }}>{account.account_name}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20, width: 280 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: getAccountTypeColor(account.account_type), width: 90, textAlign: "center", background: getAccountTypeColor(account.account_type) + "15", padding: "6px 10px", borderRadius: 8 }}>
              {account.account_type}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {account.is_system && <ShieldAlert size={20} color="#F59E0B" title={isRTL ? "حساب نظام" : "System Account"} />}
              <button title={isRTL ? "تعديل الحساب" : "Edit Account"} onClick={(e) => { e.stopPropagation(); setEditingAccount(account); setShowForm(true); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 12 }}>
                <Edit size={20} color={ds.textSecondary} />
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
      <div style={{ padding: "20px 24px", background: surface, borderBottom: `1.5px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ color: ds.textPrimary, fontSize: 22, fontWeight: 900, margin: "0 0 6px 0" }}>{isRTL ? "دليل الحسابات (شجرة الحسابات)" : "Chart of Accounts"}</h2>
          <p style={{ color: ds.textSecondary, fontSize: 15, margin: 0 }}>{isRTL ? "هيكلة الحسابات المالية للنظام" : "Financial accounts structure"}</p>
        </div>
        <button title={isRTL ? "إضافة حساب مالي جديد" : "Add new financial account"} onClick={() => { setEditingAccount(null); setShowForm(true); }} style={{ height: 60, background: "#6366F1", border: "none", borderRadius: 14, padding: "0 24px", color: "white", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
          <Plus size={22} strokeWidth={2.5} />
          {isRTL ? "إضافة حساب" : "Add Account"}
        </button>
      </div>

      <div style={{ padding: "16px 24px", background: surface, borderBottom: `1.5px solid ${border}` }}>
        <div style={{ position: "relative" }}>
          <Search size={22} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 16 }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? "ابحث برقم أو اسم الحساب..." : "Search by code or name..."}
            style={{ width: "100%", height: 60, paddingInlineStart: 50, paddingInlineEnd: 16, background: isDark ? ds.surface2 : "#F8FAFC", border: `1.5px solid ${border}`, borderRadius: 14, color: ds.textPrimary, fontSize: 16, fontWeight: 700, outline: "none", fontFamily: "inherit" }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", padding: "16px 20px", paddingInlineStart: 72, background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1.5px solid ${border}`, color: ds.textSecondary, fontSize: 15, fontWeight: 800 }}>
          <div style={{ width: 100 }}>{isRTL ? "الرمز" : "Code"}</div>
          <div style={{ flex: 1 }}>{isRTL ? "اسم الحساب" : "Account Name"}</div>
          <div style={{ width: 280, display: "flex", justifyContent: "space-between", paddingInlineEnd: 60 }}>
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
