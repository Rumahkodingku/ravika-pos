import "server-only";

import { networkInterfaces } from "node:os";
import { getWindowsNetworkMetadata } from "@/modules/platform/windows";
import { AppError } from "@/shared/errors/app-error";
import type { ExcludedNetworkAddress, NetworkStatus } from "@/types/network";
import { MDNS_HOSTNAME, publishMdns, stopMdns } from "./mdns.service";
import { readNetworkConfig, writeNetworkConfig } from "./network.config";
import {
  isApipa,
  isVirtualInterface,
  type RawNetworkAddress,
  rankNetworkAddresses,
} from "./network.ranking";

let cache: NetworkStatus | null = null;
let cachedAt = 0;
let scanning: Promise<NetworkStatus> | null = null;
let monitor: ReturnType<typeof setInterval> | null = null;

function port() {
  const value = Number.parseInt(process.env.PORT ?? "3000", 10);

  return Number.isFinite(value) ? value : 3000;
}

function scanAddresses(
  metadata: Awaited<ReturnType<typeof getWindowsNetworkMetadata>>,
) {
  const addresses: RawNetworkAddress[] = [];
  const excluded: ExcludedNetworkAddress[] = [];

  for (const [name, entries] of Object.entries(networkInterfaces())) {
    const info = metadata.get(name.toLowerCase());
    const description = info?.description ?? name;
    const virtual = isVirtualInterface(name, description);
    const interfaceId = info?.id ?? name;

    for (const entry of entries ?? []) {
      if (String(entry.family) !== "IPv4" && String(entry.family) !== "4") {
        continue;
      }

      if (entry.internal) {
        excluded.push({
          address: entry.address,
          interfaceName: name,
          reason: "Alamat internal atau loopback.",
        });
        continue;
      }

      if (isApipa(entry.address)) {
        excluded.push({
          address: entry.address,
          interfaceName: name,
          reason: "Alamat APIPA tidak dapat dipakai untuk LAN.",
        });
        continue;
      }

      if (info?.status && info.status !== "Up") {
        excluded.push({
          address: entry.address,
          interfaceName: name,
          reason: `Adapter berstatus ${info.status}.`,
        });
        continue;
      }

      addresses.push({
        address: entry.address,
        description,
        gateway: info?.gateway ?? null,
        interfaceId,
        interfaceName: name,
        netmask: entry.netmask ?? null,
        virtual,
      });
    }
  }

  return { addresses, excluded };
}

async function buildStatus(): Promise<NetworkStatus> {
  const metadata = await getWindowsNetworkMetadata();
  const { addresses, excluded } = scanAddresses(metadata);
  const config = readNetworkConfig();
  const ranked = rankNetworkAddresses(addresses, config.preferredInterface);
  const preferred = ranked[0] ?? null;
  const listeningPort = port();
  const mdns = publishMdns(listeningPort, preferred?.address ?? null);

  return {
    addresses: ranked,
    excluded,
    mdns,
    preferredAccess:
      mdns.status === "published" && preferred
        ? { type: "mdns", url: `http://${MDNS_HOSTNAME}:${listeningPort}` }
        : preferred
          ? { type: "ip", url: `http://${preferred.address}:${listeningPort}` }
          : { type: "none", url: null },
    preferredInterfaceId: config.preferredInterface ?? null,
    server: { listening: true, port: listeningPort },
    status: ranked.length > 0 ? "available" : "no-lan",
    updatedAt: new Date().toISOString(),
  };
}

export async function getNetworkStatus(force = false) {
  if (!force && cache && Date.now() - cachedAt < 5000) {
    return cache;
  }

  if (!scanning) {
    scanning = buildStatus()
      .then((status) => {
        cache = status;
        cachedAt = Date.now();
        return status;
      })
      .finally(() => {
        scanning = null;
      });
  }

  return scanning;
}

export async function setPreferredInterface(interfaceId: string) {
  const current = await getNetworkStatus(true);

  if (
    !current.addresses.some((address) => address.interfaceId === interfaceId)
  ) {
    throw AppError.validation([
      {
        path: "interfaceId",
        message: "Interface jaringan tidak ditemukan.",
      },
    ]);
  }

  writeNetworkConfig({ preferredInterface: interfaceId });

  return getNetworkStatus(true);
}

export async function getPreferredLanUrl(path = "/") {
  try {
    const status = await getNetworkStatus(true);
    const address =
      status.addresses.find((entry) => entry.preferred)?.address ??
      status.addresses[0]?.address;

    if (!address) {
      return null;
    }

    return `http://${address}:${status.server.port}${path}`;
  } catch {
    // Setup must not fail because network detection failed.
    return null;
  }
}

export function startNetworkMonitor() {
  if (monitor) {
    return;
  }

  const interval = Number.parseInt(
    process.env.RAVIKA_NETWORK_POLL_MS ?? "15000",
    10,
  );

  void getNetworkStatus(true);
  monitor = setInterval(
    () => void getNetworkStatus(true),
    Number.isFinite(interval) && interval > 0 ? interval : 15000,
  );
  monitor.unref();
}

export function stopNetworkMonitor() {
  if (monitor) {
    clearInterval(monitor);
    monitor = null;
  }

  stopMdns();
}
