import { ManagementShell } from "@/components/shells/management-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ManagementShell>{children}</ManagementShell>;
}
