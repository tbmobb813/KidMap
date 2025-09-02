import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react-native";
import React from "react";

import { useRoutesQuery } from "@/hooks/useRoutesQuery";
import * as routeService from "@/services/routeService";

const origin = {
  id: "o1",
  name: "Origin",
  address: "",
  category: "other",
  coordinates: { latitude: 0, longitude: 0 },
} as any;
const destination = {
  id: "d1",
  name: "Destination",
  address: "",
  category: "other",
  coordinates: { latitude: 1, longitude: 1 },
} as any;
const options = {
  travelMode: "transit",
  avoidHighways: false,
  avoidTolls: false,
  accessibilityMode: false,
} as any;

function ComponentOnce() {
  useRoutesQuery(origin, destination, "transit", options);
  return null;
}

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: 0, staleTime: 10000 } },
  });
}

describe("Routes cache metrics", () => {
  it("calls fetchRoutes only once; second mount reuses cache", async () => {
    const client = createClient();
    const fetchSpy = jest.spyOn(routeService, "fetchRoutes");
    const { unmount, rerender } = render(
      <QueryClientProvider client={client}>
        <ComponentOnce />
      </QueryClientProvider>
    );
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1), {
      timeout: 8000,
    });
    // Ensure promise chain settled
    await new Promise((r) => setTimeout(r, 50));
    unmount();
    rerender(
      <QueryClientProvider client={client}>
        <ComponentOnce />
      </QueryClientProvider>
    );
    await new Promise((r) => setTimeout(r, 250));
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  }, 15000);
});
