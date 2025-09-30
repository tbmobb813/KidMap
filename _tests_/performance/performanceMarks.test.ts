import {
  clearMarks,
  getMarks,
  mark,
  measure,
} from "@/utils/performance/performanceMarks";

describe("performanceMarks utility", () => {
  afterEach(() => {
    clearMarks();
  });

  it("records mark and measure in non-production env", () => {
    mark("start");
    mark("end");
    measure("duration", "start", "end");

    const { marks, measures } = getMarks();
    expect(marks).toHaveLength(2);
    expect(measures).toHaveLength(1);
    expect(marks[0].name).toBe("start");
    expect(marks[1].name).toBe("end");
    expect(measures[0].name).toBe("duration");
    expect(measures[0].duration).toBeGreaterThanOrEqual(0);
  });

  it("works correctly in test environment", () => {
    clearMarks();

    mark("test-start");
    mark("test-end");
    measure("test-duration", "test-start", "test-end");

    const { marks, measures } = getMarks();
    expect(marks.length).toBe(2);
    expect(measures.length).toBe(1);

    expect(process.env.NODE_ENV).toBe("test");
  });
});
