import "server-only";

import { Bonjour, type Service } from "bonjour-service";
import { logger } from "@/shared/logging/logger";

export const MDNS_HOSTNAME = "ravika-pos.local";

type MdnsStatus = "published" | "disabled" | "degraded" | "error";

let bonjour: Bonjour | null = null;
let service: Service | null = null;
let publishedKey = "";
let status: MdnsStatus = "disabled";
let message: string | null = null;

export function isMdnsEnabled() {
  return process.env.RAVIKA_MDNS_ENABLED !== "false";
}

export function getMdnsSnapshot() {
  return {
    enabled: isMdnsEnabled(),
    hostname: MDNS_HOSTNAME,
    message,
    status,
  };
}

function stopCurrent() {
  try {
    bonjour?.destroy();
  } catch {
    // Best effort during shutdown or network change.
  }

  bonjour = null;
  service = null;
  publishedKey = "";
}

export function publishMdns(port: number, address: string | null) {
  if (!isMdnsEnabled()) {
    stopCurrent();
    status = "disabled";
    message = "mDNS dimatikan.";
    return getMdnsSnapshot();
  }

  if (!address) {
    stopCurrent();
    status = "degraded";
    message = "Tidak ada alamat LAN yang dapat dipakai.";
    return getMdnsSnapshot();
  }

  const key = `${port}:${address}`;

  if (service && publishedKey === key && status === "published") {
    return getMdnsSnapshot();
  }

  stopCurrent();

  try {
    bonjour = new Bonjour({}, (error: unknown) => {
      status = "error";
      message = "mDNS gagal berjalan.";
      logger.error("mDNS error", {
        error: error instanceof Error ? error.message : String(error),
      });
    });
    service = bonjour.publish({
      disableIPv6: true,
      host: MDNS_HOSTNAME,
      name: "RAVIKA POS",
      port,
      txt: { path: "/" },
      type: "http",
    });
    publishedKey = key;
    status = "published";
    message = null;
    service.on("error", (error: unknown) => {
      status = "error";
      message = "mDNS gagal dipublikasikan.";
      logger.error("mDNS publish failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    });
  } catch (error) {
    stopCurrent();
    status = "error";
    message = "mDNS gagal dipublikasikan.";
    logger.error("mDNS publish failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return getMdnsSnapshot();
}

export function stopMdns() {
  stopCurrent();
  status = "disabled";
  message = "mDNS dimatikan.";
}
