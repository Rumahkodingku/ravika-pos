import { describe, expect, it } from "vitest";
import {
  isApipa,
  isPrivateAddress,
  type RawNetworkAddress,
  rankNetworkAddresses,
} from "@/modules/network/network.ranking";

function address(
  input: Partial<RawNetworkAddress> & Pick<RawNetworkAddress, "address">,
): RawNetworkAddress {
  return {
    address: input.address,
    description: input.description ?? input.interfaceName ?? "Ethernet",
    gateway: input.gateway ?? null,
    interfaceId: input.interfaceId ?? input.interfaceName ?? "ethernet",
    interfaceName: input.interfaceName ?? "Ethernet",
    netmask: input.netmask ?? "255.255.255.0",
    virtual: input.virtual ?? false,
  };
}

describe("network ranking", () => {
  it("classifies APIPA and private addresses", () => {
    expect(isApipa("169.254.10.2")).toBe(true);
    expect(isApipa("192.168.1.2")).toBe(false);
    expect(isPrivateAddress("10.0.0.2")).toBe(true);
    expect(isPrivateAddress("172.20.0.2")).toBe(true);
    expect(isPrivateAddress("192.168.1.2")).toBe(true);
    expect(isPrivateAddress("8.8.8.8")).toBe(false);
  });

  it("prefers an interface with a default gateway", () => {
    const ranked = rankNetworkAddresses([
      address({ address: "192.168.1.10", interfaceName: "Wi-Fi" }),
      address({
        address: "10.10.10.10",
        gateway: "10.10.10.1",
        interfaceName: "Ethernet",
      }),
    ]);

    expect(ranked[0]?.interfaceName).toBe("Ethernet");
    expect(ranked[0]?.preferred).toBe(true);
    expect(ranked[1]?.preferred).toBe(false);
  });

  it("prefers a selected interface even when another has a gateway", () => {
    const ranked = rankNetworkAddresses(
      [
        address({
          address: "10.10.10.10",
          gateway: "10.10.10.1",
          interfaceId: "ethernet",
          interfaceName: "Ethernet",
        }),
        address({
          address: "192.168.1.10",
          interfaceId: "wifi",
          interfaceName: "Wi-Fi",
        }),
      ],
      "wifi",
    );

    expect(ranked[0]?.interfaceId).toBe("wifi");
  });

  it("penalizes virtual adapters", () => {
    const ranked = rankNetworkAddresses([
      address({ address: "192.168.1.10", interfaceName: "Wi-Fi" }),
      address({
        address: "172.20.0.1",
        interfaceName: "vEthernet (Default Switch)",
        virtual: true,
      }),
    ]);

    expect(ranked[0]?.interfaceName).toBe("Wi-Fi");
  });
});
