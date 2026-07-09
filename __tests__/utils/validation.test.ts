import { z } from "zod";
import { validateData } from "@/utils/validation";

describe("validateData", () => {
  const schema = z.object({
    name: z.string().min(1),
    nested: z.object({
      value: z.number().positive(),
    }),
  });

  it("returns null when validation succeeds", () => {
    const result = validateData(schema, {
      name: "Test",
      nested: { value: 1 },
    });

    expect(result).toBeNull();
  });

  it("returns field errors keyed by path", () => {
    const result = validateData(schema, {
      name: "",
      nested: { value: -1 },
    });

    expect(result).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        "nested.value": expect.any(String),
      })
    );
  });

  it("uses _root for root-level schema errors", () => {
    const rootSchema = z.string().min(1);
    const result = validateData(rootSchema, "");

    expect(result).toEqual({
      _root: expect.any(String),
    });
  });
});
