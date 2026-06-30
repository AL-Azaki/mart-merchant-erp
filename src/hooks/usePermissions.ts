import { useMemo } from "react";
import { PermissionKey, PERMISSIONS } from "@/core/constants/permissions";

// This is a placeholder for the actual permissions implementation
// which would typically come from an AuthContext or global store.
export function usePermissions(userPermissions: PermissionKey[] = []) {
  
  const hasPermission = useMemo(() => {
    return (permission: PermissionKey) => {
      // In a real app, Owner might have a wildcard '*'
      if (userPermissions.includes("*" as any)) return true;
      return userPermissions.includes(permission);
    };
  }, [userPermissions]);

  const canCreateSales = hasPermission(PERMISSIONS.SALES_CREATE);
  const canReadSales = hasPermission(PERMISSIONS.SALES_READ);

  return {
    hasPermission,
    canCreateSales,
    canReadSales,
  };
}
