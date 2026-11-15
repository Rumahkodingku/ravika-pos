import { KdsShell } from "@/components/shells/kds-shell";

export default function KdsLayout({ children }: { children: React.ReactNode }) {
  return <KdsShell>{children}</KdsShell>;
}
