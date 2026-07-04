import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Edit, Trash2, UserCircle, Shield, CheckCircle, XCircle, MapPin } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_USERS } from "@/core/data/usersMockData";
import { UserFormSheet } from "../components/UserFormSheet";
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";
import type { User } from "@/core/types/users";
import { MOCK_BRANCHES } from "@/core/data/mockData";

export function UserListScreen() {
  const { t, isDark, isRTL, ds } = useApp();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const filteredUsers = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.full_name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
  });

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";
  const subtle = isDark ? ds.surface2 : "#F1F5F9";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", background: surface, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserCircle size={22} color="#6366F1" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "إدارة المستخدمين" : "User Management"}</h2>
            <p style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 500 }}>{filteredUsers.length} {isRTL ? "مستخدم" : "Users"}</p>
          </div>
        </div>
        <motion.button 
          title={isRTL ? "إضافة مستخدم جديد" : "Add New User"}
          whileTap={{ scale: 0.95 }} 
          onClick={() => { setEditingUser(null); setShowForm(true); }}
          style={{ height: 44, background: "linear-gradient(135deg, #6366F1, #4F46E5)", border: "none", borderRadius: 12, padding: "0 16px", color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}
        >
          <Plus size={18} strokeWidth={2.5} />
          {isRTL ? "إضافة مستخدم" : "Add User"}
        </motion.button>
      </div>

      {/* Toolbar */}
      <div style={{ padding: "16px 24px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isRTL ? "ابحث بالاسم، الإيميل، أو اسم المستخدم..." : "Search name, email, username..."}
              style={{ width: "100%", height: 46, boxSizing: "border-box", paddingInlineStart: 44, paddingInlineEnd: 16, background: surface, border: `1px solid ${border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit" }}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filteredUsers.map((u, i) => {
            const userBranch = MOCK_BRANCHES.find(b => b.id === u.default_branch_id);
            return (
              <motion.div key={u.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                
                <div style={{ padding: 16, display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 24, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#6366F1", fontSize: 18, fontWeight: 800 }}>{u.full_name.charAt(0)}</span>
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <h3 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.full_name}</h3>
                      {u.is_active ? <CheckCircle size={16} color="#10B981" /> : <XCircle size={16} color="#EF4444" />}
                    </div>

                    
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {u.roles?.map(r => (
                        <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 4, background: subtle, padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: ds.textPrimary }}>
                          <Shield size={12} color="#6366F1" /> {r.role_name}
                        </div>
                      ))}
                      
                      {userBranch && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(16, 185, 129, 0.08)", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#10B981" }}>
                          <MapPin size={12} color="#10B981" /> {userBranch.branch_name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${isDark ? ds.border : "#F1F5F9"}`, padding: "8px 16px", display: "flex", justifyContent: "flex-end", gap: 8, background: subtle }}>
                  <button title={isRTL ? "تعديل المستخدم" : "Edit User"} onClick={() => { setEditingUser(u); setShowForm(true); }} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Edit size={16} color={ds.textSecondary} />
                  </button>
                  <button title={isRTL ? "حذف المستخدم" : "Delete User"} onClick={() => setUserToDelete(u)} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Trash2 size={16} color="#EF4444" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <UserFormSheet 
            user={editingUser} 
            onClose={() => setShowForm(false)} 
            onSave={(data) => {
              if (editingUser) {
                setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...data } : u));
              } else {
                const newUser: User = {
                  id: `usr_${Date.now()}`, account_id: "acc_001", default_branch_id: data.default_branch_id || "br_001",
                  username: data.username!, email: `${data.username}@tajir.ye`, full_name: data.full_name!, phone: data.phone || null,
                  is_active: data.is_active ?? true, last_login_at: null, roles: data.roles,
                  created_at: new Date().toISOString(), updated_at: new Date().toISOString()
                };
                setUsers(prev => [newUser, ...prev]);
              }
              setShowForm(false);
            }} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {userToDelete && (
          <ConfirmDeleteModal 
            isOpen={true} 
            onClose={() => setUserToDelete(null)}
            onConfirm={() => {
              setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
              setUserToDelete(null);
            }}
            itemName={userToDelete.full_name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
