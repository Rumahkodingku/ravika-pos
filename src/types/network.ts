export type NetworkAddress = {
  interfaceId: string;
  interfaceName: string;
  description: string;
  address: string;
  netmask: string | null;
  gateway: string | null;
  family: "IPv4";
  status: "available";
  preferred: boolean;
  advertised: boolean;
  virtual: boolean;
};

export type ExcludedNetworkAddress = {
  interfaceName: string;
  address: string;
  reason: string;
};

export type NetworkStatus = {
  status: "available" | "no-lan" | "error";
  server: {
    listening: boolean;
    port: number;
  };
  preferredAccess: {
    type: "mdns" | "ip" | "none";
    url: string | null;
  };
  preferredInterfaceId: string | null;
  addresses: NetworkAddress[];
  excluded: ExcludedNetworkAddress[];
  mdns: {
    enabled: boolean;
    status: "published" | "disabled" | "degraded" | "error";
    hostname: string;
  };
  updatedAt: string;
};
