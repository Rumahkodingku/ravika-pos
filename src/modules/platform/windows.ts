import { execFile } from "node:child_process";

type Adapter = {
  InterfaceGuid?: string;
  InterfaceDescription?: string;
  Name?: string;
  Status?: string;
  ifIndex?: number;
};

type Configuration = {
  InterfaceAlias?: string;
  InterfaceIndex?: number;
  IPv4Address?: Array<{ IPAddress?: string }>;
  IPv4DefaultGateway?: Array<{ NextHop?: string }>;
};

export type WindowsNetworkMetadata = {
  description: string;
  gateway: string | null;
  id: string;
  name: string;
  status: string;
};

const script = `
$ErrorActionPreference = 'SilentlyContinue'
$adapters = Get-NetAdapter | Select-Object ifIndex, Name, InterfaceGuid, InterfaceDescription, Status
$configs = Get-NetIPConfiguration | Select-Object InterfaceAlias, InterfaceIndex, IPv4Address, IPv4DefaultGateway
[pscustomobject]@{ adapters = @($adapters); configs = @($configs) } | ConvertTo-Json -Depth 5 -Compress
`;

function readPowerShell() {
  return new Promise<string | null>((resolve) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", script],
      { timeout: 4000, windowsHide: true },
      (error, stdout) => {
        resolve(error ? null : stdout);
      },
    );
  });
}

export async function getWindowsNetworkMetadata() {
  const metadata = new Map<string, WindowsNetworkMetadata>();

  if (process.platform !== "win32") {
    return metadata;
  }

  const raw = await readPowerShell();

  if (!raw) {
    return metadata;
  }

  try {
    const parsed = JSON.parse(raw) as {
      adapters?: Adapter[];
      configs?: Configuration[];
    };
    const configs = parsed.configs ?? [];

    for (const adapter of parsed.adapters ?? []) {
      const config = configs.find(
        (entry) =>
          entry.InterfaceIndex === adapter.ifIndex ||
          entry.InterfaceAlias === adapter.Name,
      );
      const name = adapter.Name ?? `Interface ${adapter.ifIndex ?? ""}`.trim();
      const id = adapter.InterfaceGuid ?? name;

      metadata.set(name.toLowerCase(), {
        description: adapter.InterfaceDescription ?? name,
        gateway: config?.IPv4DefaultGateway?.[0]?.NextHop ?? null,
        id,
        name,
        status: adapter.Status ?? "Unknown",
      });
    }
  } catch {
    return metadata;
  }

  return metadata;
}
