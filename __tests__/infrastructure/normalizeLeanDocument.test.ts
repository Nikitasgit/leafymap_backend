import { Types } from "mongoose";
import {
  normalizeLeanDocument,
  normalizeLeanDocuments,
} from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

const expectMongoFree = (value: unknown): void => {
  expect(value).not.toBeInstanceOf(Types.ObjectId);
  if (Array.isArray(value)) {
    value.forEach(expectMongoFree);
    return;
  }
  if (value && typeof value === "object" && !(value instanceof Date)) {
    Object.entries(value).forEach(([key, nested]) => {
      expect(key).not.toBe("_id");
      expectMongoFree(nested);
    });
  }
};

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

  it("recursively confines Mongo details from representative read payloads", () => {
    const payloads = [
      {
        kind: "Event",
        value: {
          _id: new Types.ObjectId(),
          user: { _id: new Types.ObjectId(), username: "alice" },
          schedule: [
            {
              timeSlots: [
                { collaborators: [{ _id: new Types.ObjectId() }] },
              ],
            },
          ],
        },
      },
      {
        kind: "User",
        value: {
          _id: new Types.ObjectId(),
          place: { _id: new Types.ObjectId() },
          interests: [new Types.ObjectId()],
        },
      },
      {
        kind: "Place",
        value: {
          _id: new Types.ObjectId(),
          placeCategory: { _id: new Types.ObjectId(), name: "Market" },
          user: { _id: new Types.ObjectId(), username: "owner" },
        },
      },
      {
        kind: "Conversation",
        value: {
          _id: new Types.ObjectId(),
          participants: [{ _id: new Types.ObjectId() }],
          lastMessage: { _id: new Types.ObjectId(), content: "Hello" },
        },
      },
    ];

    payloads.forEach(({ value }) => {
      expectMongoFree(normalizeLeanDocument(value));
    });
  });
});
