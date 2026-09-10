export function canAccessResource(user, permission) {
  const permissionsByRole = {
    admin: [
      "view_reports",
      "view_audit_logs",
      "manage_users",
      "delete_customer",
      "approve_payments",
      "send_reminders"
    ],
    ceo: [
      "view_reports",
      "view_audit_logs",
      "manage_users",
      "delete_customer",
      "approve_payments",
      "send_reminders"
    ],
    manager: [
      "view_reports",
      "view_audit_logs",
      "send_reminders",
      "approve_payments"
    ],
    staff: ["send_reminders"]
  };

  const role = user?.role || "staff";
  return (permissionsByRole[role] || []).includes(permission);
}
