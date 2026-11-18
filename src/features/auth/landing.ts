export function landingPathForPermissions(permissions: string[]): string {
  if (permissions.includes("dashboard.view")) {
    return "/app";
  }

  if (permissions.includes("orders.create")) {
    return "/app/pos";
  }

  if (permissions.includes("kds.view")) {
    return "/kds";
  }

  return "/login?error=forbidden";
}
