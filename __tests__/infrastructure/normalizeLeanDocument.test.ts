import { Types } from "mongoose";
import {
  normalizeLeanDocument,
  normalizeLeanDocuments,
} from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

describe("normalizeLeanDocument", () => {
  it("maps _id to id and stringifies ObjectIds", () => {
    const id = new Types.ObjectId();
    const nestedId = new Types.ObjectId();

    const result = normalizeLeanDocument({
      _id: id,
      name: "atelier",
      place: { _id: nestedId, label: "Paris" },
    });

    expect(result).toEqual({
      id: id.toString(),
      name: "atelier",
      place: { id: nestedId.toString(), label: "Paris" },
    });
  });

  it("normalizes arrays of documents", () => {
    const a = new Types.ObjectId();
    const b = new Types.ObjectId();
    const result = normalizeLeanDocuments([{ _id: a }, { _id: b }]);
    expect(result).toEqual([{ id: a.toString() }, { id: b.toString() }]);
  });
});
