import { getPlacesInViewQuerySchema } from "@src/api/dto/places/place.dto";
import { MAX_PLACE_IDS } from "@src/application/dtos/places/getPlacesInView.dto";

describe("getPlacesInViewQuerySchema", () => {
  it("parses ids CSV, filters and the legacy integer limit", () => {
    const result = getPlacesInViewQuerySchema.parse({
      ids: " first, second ,, third ",
      ne: "ignored when ids are present",
      filters: '{"placeTypes":["shop"]}',
      limit: "12items",
    });

    expect(result).toEqual({
      ids: ["first", "second", "third"],
      clientFilters: '{"placeTypes":["shop"]}',
      limit: 12,
    });
  });

  it("parses JSON coordinates when ids are absent", () => {
    const result = getPlacesInViewQuerySchema.parse({
      ne: "[2.4,48.9]",
      sw: "[2.2,48.7]",
    });

    expect(result).toEqual({
      ids: undefined,
      clientFilters: undefined,
      limit: undefined,
      ne: [2.4, 48.9],
      sw: [2.2, 48.7],
    });
  });

  it("requires valid JSON coordinates without ids", () => {
    expect(
      getPlacesInViewQuerySchema.safeParse({ ne: "invalid", sw: "[1,2]" })
        .success
    ).toBe(false);
    expect(getPlacesInViewQuerySchema.safeParse({}).success).toBe(false);
  });

  it("rejects more than the maximum number of ids", () => {
    const ids = Array.from(
      { length: MAX_PLACE_IDS + 1 },
      (_, index) => `id-${index}`
    ).join(",");

    expect(getPlacesInViewQuerySchema.safeParse({ ids }).success).toBe(false);
  });

  it("requires filters to remain a string", () => {
    expect(
      getPlacesInViewQuerySchema.safeParse({
        ids: "first",
        filters: ["invalid"],
      }).success
    ).toBe(false);
  });
});
