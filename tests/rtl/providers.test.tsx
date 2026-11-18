/** @vitest-environment jsdom */

import { useQuery } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../helpers/render";

function HealthProbe() {
  const { data } = useQuery({
    queryKey: ["health"],
    queryFn: async () => "ok",
  });

  return <p>{data ?? "pending"}</p>;
}

describe("query provider", () => {
  it("provides a query client to children", async () => {
    renderWithProviders(<HealthProbe />);

    expect(await screen.findByText("ok")).toBeDefined();
  });
});
