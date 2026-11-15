import { PosShell } from "@/components/shells/pos-shell";

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return <PosShell>{children}</PosShell>;
}
