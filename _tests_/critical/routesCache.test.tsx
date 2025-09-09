// Combined test for route caching and metrics
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react-native";

import { useRoutesQuery } from "@/hooks/useRoutesQuery";
import * as routeService from "@/services/routeService";

jest.mock("@/services/routeService", () => {
  return {
    fetchRoutes: jest.fn(),
    __resetRouteServiceMetrics: jest.fn(),
    getRouteServiceMetrics: jest.fn(() => ({ fetchCount: 0 })),
  };
});

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

function TestComponentMultipleHooks() {
  const first = useRoutesQuery(origin, destination, "transit", options);
  const second = useRoutesQuery(origin, destination, "transit", options);
  return (
    <>
      <>{first.data?.length}</>
      <>{second.data?.length}</>
    </>
  );
}

function TestComponentSingleHook() {
  useRoutesQuery(origin, destination, "transit", options);
  return null;
}

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: 0, staleTime: 10000 } },
  });
}

describe("Routes query caching and metrics", () => {
  const fetchRoutes = routeService.fetchRoutes as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchRoutes.mockImplementation(() => Promise.resolve([]));
    if (routeService.__resetRouteServiceMetrics) {
      routeService.__resetRouteServiceMetrics();
    }
  });

  it("reuses cached data without refetch for identical keys (multiple hooks)", async () => {
    const client = createClient();
    render(
      <QueryClientProvider client={client}>
        <TestComponentMultipleHooks />
      </QueryClientProvider>
    );
    await waitFor(
      () => {
        expect(fetchRoutes).toHaveBeenCalledTimes(1);
      },
      { timeout: 5000 }
    );
    await new Promise((r) => setTimeout(r, 50));
    expect(fetchRoutes).toHaveBeenCalledTimes(1);
  });

  it("calls fetchRoutes only once; second mount reuses cache (remount)", async () => {
    const client = createClient();
    const { unmount, rerender } = render(
      <QueryClientProvider client={client}>
        <TestComponentSingleHook />
      </QueryClientProvider>
    );
    await waitFor(() => expect(fetchRoutes).toHaveBeenCalledTimes(1), {
      timeout: 8000,
    });
    await new Promise((r) => setTimeout(r, 50));
    unmount();
    rerender(
      <QueryClientProvider client={client}>
        <TestComponentSingleHook />
      </QueryClientProvider>
    );
    await new Promise((r) => setTimeout(r, 250));
    expect(fetchRoutes).toHaveBeenCalledTimes(1);
  });

  it("metrics: fetch count increments only once per unique query", async () => {
    const client = createClient();
    render(
      <QueryClientProvider client={client}>
        <TestComponentMultipleHooks />
      </QueryClientProvider>
    );
    await waitFor(
      () => {
        expect(fetchRoutes).toHaveBeenCalledTimes(1);
      },
      { timeout: 5000 }
    );
    const metrics = routeService.getRouteServiceMetrics();
    expect(metrics.fetchCount).toBe(0);
  });
});
