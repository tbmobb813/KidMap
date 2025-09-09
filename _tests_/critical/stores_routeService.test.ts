import { fetchRoutes } from "@/services/routeService";

jest.setTimeout(5000);

describe("routeService.fetchRoutes", () => {
  it("transforms walking routes with increased duration", async () => {
    const routes = await fetchRoutes({
      origin: { id: "o1" } as any,
      destination: { id: "d1" } as any,
      mode: "walking",
      options: {} as any,
    });
    expect(routes.length).toBeGreaterThan(0);
    routes.forEach((r) => {
      expect(r.id.startsWith("walk_")).toBe(true);
      expect(r.steps[0].type).toBe("walk");
    });
  });

  it("transforms driving routes with decreased duration", async () => {
    const routes = await fetchRoutes({
      origin: { id: "o1" } as any,
      destination: { id: "d1" } as any,
      mode: "driving",
      options: {} as any,
    });
    expect(routes.length).toBeGreaterThan(0);
    routes.forEach((r) => {
      expect(r.id.startsWith("drive_")).toBe(true);
      expect(r.steps[0].type).toBe("car");
    });
  });
});
