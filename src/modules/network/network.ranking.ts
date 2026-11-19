import type { NetworkAddress } from "@/types/network";

export type RawNetworkAddress = Omit<
  NetworkAddress,
  "advertised" | "family" | "preferred" | "status"
>;

const virtualPattern =
  /vEthernet|Hyper-V|VMware|VirtualBox|Docker|WSL|Loopback|Tailscale|ZeroTier|VPN/i;

export function isApipa(address: string) {
  return address.startsWith("169.254.");
}

export function isPrivateAddress(address: string) {
  const parts = address.split(".").map(Number);

  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  return (
    parts[0] === 10 ||
    (parts[0] === 172 && (parts[1] ?? 0) >= 16 && (parts[1] ?? 0) <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
  );
}

export function isVirtualInterface(name: string, description: string) {
  return virtualPattern.test(`${name} ${description}`);
}

export function rankNetworkAddresses(
  addresses: RawNetworkAddress[],
  preferredId?: string | null,
): NetworkAddress[] {
  const scored = addresses.map((address) => {
    let score = 0;

    if (preferredId && address.interfaceId === preferredId) {
      score += 1000;
    }
    if (address.gateway) {
      score += 100;
    }
    if (isPrivateAddress(address.address)) {
      score += 50;
    }
    if (!address.virtual) {
      score += 20;
    }

    return { address, score };
  });

  scored.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return (
      left.address.interfaceName.localeCompare(right.address.interfaceName) ||
      left.address.address.localeCompare(right.address.address)
    );
  });

  return scored.map(({ address }, index) => ({
    ...address,
    advertised: true,
    family: "IPv4",
    preferred: index === 0,
    status: "available",
  }));
}
