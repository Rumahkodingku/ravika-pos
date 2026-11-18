/** @vitest-environment jsdom */

import { act, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useKdsOrdersQuery } from "@/features/kds/api";
import { useKdsEvents } from "@/features/kds/use-kds-events";
import { renderWithProviders } from "../helpers/render";

const fetchMock = vi.fn();

class FakeEventSource {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 2;
  static instances: FakeEventSource[] = [];

  readonly url: string;
  readyState = FakeEventSource.CONNECTING;
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn(() => {
    this.readyState = FakeEventSource.CLOSED;
  });
  private listeners = new Map<string, Set<(event: MessageEvent) => void>>();

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: (event: MessageEvent) => void) {
    this.listeners.get(type)?.delete(listener);
  }

  emitOpen() {
    this.readyState = FakeEventSource.OPEN;
    this.onopen?.();
  }

  emitMessage(type: string) {
    const event = new MessageEvent(type, { data: "{}" });
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event);
    }
  }

  emitError(closed = false) {
    this.readyState = closed
      ? FakeEventSource.CLOSED
      : FakeEventSource.CONNECTING;
    this.onerror?.();
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

function kdsReads() {
  return fetchMock.mock.calls.filter(
    ([url, init]) => String(url) === "/api/kds/orders" && !init?.method,
  ).length;
}

function Probe() {
  const { status } = useKdsEvents();
  const { data } = useKdsOrdersQuery();

  return (
    <>
      <p>{`Koneksi ${status}`}</p>
      <p>{`Tiket ${data?.active.length ?? 0}`}</p>
    </>
  );
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(
    jsonResponse({
      active: [
        {
          id: "order-1",
          businessId: "business-1",
          orderNumber: "RVK-100",
          orderType: "DINE_IN",
          source: "QR",
          tableId: "table-1",
          tableName: "Meja 01",
          orderStatus: "NEW",
          paymentStatus: "UNPAID",
          publicToken: null,
          subtotal: 20000,
          grandTotal: 20000,
          notes: "",
          createdBy: null,
          createdAt: "2026-11-18T08:00:00.000Z",
          updatedAt: "2026-11-18T08:00:00.000Z",
          items: [],
        },
      ],
      completed: [],
    }),
  );
  FakeEventSource.instances = [];
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("EventSource", FakeEventSource);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("KDS events", () => {
  it("connects, invalidates KDS on messages, and recovers after errors", async () => {
    const view = renderWithProviders(<Probe />);

    expect(await screen.findByText("Koneksi reconnecting")).toBeDefined();
    expect(await screen.findByText("Tiket 1")).toBeDefined();
    expect(kdsReads()).toBe(1);

    const source = FakeEventSource.instances[0];
    expect(source.url).toBe("/api/events");

    await act(async () => {
      source.emitOpen();
    });
    expect(screen.getByText("Koneksi connected")).toBeDefined();

    await act(async () => {
      source.emitMessage("order.status_changed");
    });
    await waitFor(() => expect(kdsReads()).toBe(2));

    await act(async () => {
      source.emitError();
    });
    expect(screen.getByText("Koneksi reconnecting")).toBeDefined();

    await act(async () => {
      source.emitOpen();
    });
    await waitFor(() =>
      expect(screen.getByText("Koneksi connected")).toBeDefined(),
    );
    await waitFor(() => expect(kdsReads()).toBe(3));

    view.unmount();
    expect(source.close).toHaveBeenCalledTimes(1);
  });

  it("reports a closed stream as disconnected", async () => {
    renderWithProviders(<Probe />);
    await screen.findByText("Tiket 1");

    const source = FakeEventSource.instances[0];

    await act(async () => {
      source.emitError(true);
    });

    expect(screen.getByText("Koneksi disconnected")).toBeDefined();
  });
});
