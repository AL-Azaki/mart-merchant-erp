import os
import glob

files_to_update = [
    r"d:\ALL-My_Projects\projectUi\src\features\users\components\UserFormSheet.tsx",
    r"d:\ALL-My_Projects\projectUi\src\features\users\components\RoleFormSheet.tsx",
    r"d:\ALL-My_Projects\projectUi\src\features\inventory\components\UnitFormSheet.tsx",
    r"d:\ALL-My_Projects\projectUi\src\features\inventory\components\WarehouseFormSheet.tsx",
    r"d:\ALL-My_Projects\projectUi\src\features\finance\components\TransactionFormSheet.tsx",
    r"d:\ALL-My_Projects\projectUi\src\features\finance\components\JournalEntryFormSheet.tsx",
    r"d:\ALL-My_Projects\projectUi\src\features\finance\components\AccountFormSheet.tsx",
    r"d:\ALL-My_Projects\projectUi\src\features\inventory\components\ProductFormSheet.tsx",
    r"d:\ALL-My_Projects\projectUi\src\features\inventory\components\CategoryFormSheet.tsx"
]

for file_path in files_to_update:
    if not os.path.exists(file_path):
        continue
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    content = content.replace('from \\"@/providers/ToastProvider\\";', 'from "@/providers/ToastProvider";')
    content = content.replace('toast.success(\\"تم تحميل الصورة بنجاح للمعاينة!\\"', 'toast.success("تم تحميل الصورة بنجاح للمعاينة!"')
    content = content.replace(': \\"Image uploaded successfully for preview!\\")', ': "Image uploaded successfully for preview!")')
            
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
