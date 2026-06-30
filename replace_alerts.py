import os
import re

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
        
    if "useToast" not in content:
        # Add import useToast
        content = re.sub(
            r"(import \{ useApp \} from [^\n]+)",
            r"\1\nimport { useToast } from \"@/providers/ToastProvider\";",
            content
        )
        
        # Add const toast = useToast(); inside component
        content = re.sub(
            r"(const \{ t, isDark, isRTL, ds \} = useApp\(\);)",
            r"\1\n  const toast = useToast();",
            content
        )

        # In ProductFormSheet, there is a success alert
        if "ProductFormSheet" in file_path:
            content = content.replace(
                "alert(isRTL ? \"تم تحميل الصورة بنجاح للمعاينة!\" : \"Image uploaded successfully for preview!\");",
                "toast.success(isRTL ? \"تم تحميل الصورة بنجاح للمعاينة!\" : \"Image uploaded successfully for preview!\");"
            )
            content = content.replace("alert(", "toast.warning(")
        else:
            content = content.replace("alert(", "toast.warning(")
            
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {file_path}")
