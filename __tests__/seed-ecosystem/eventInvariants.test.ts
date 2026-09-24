import { Types } from "mongoose";
import {
  assertEventInvariants,
  clampEventName,
} from "../../scripts/seed-ecosystem/generators/eventInvariants";
import {
  assertAllowedTarget,
  extractMongoHost,
  isLocalMongoHost,
  isProductionMongoHost,
  isStagingMongoHost,
} from "../../scripts/seed-ecosystem/safety";

describe("seed-ecosystem event invariants", () => {
  it("clamps event names to 4-40 characters", () => {
    expect(clampEventName("ab")).toBe("ab live");
    expect(clampEventName("Concert acoustique")).toBe("Concert acoustique");
    expect(clampEventName("x".repeat(50))).toHaveLength(40);
  });

  it("rejects online events that still have a place", () => {
    expect(() =>
      assertEventInvariants({
        name: "Live cooking",
        online: true,
        place: new Types.ObjectId(),
        location: null,
      })
    ).toThrow(/must not have a place/);
  });

  it("rejects offline events without place or location", () => {
    expect(() =>
      assertEventInvariants({
        name: "Marché créateurs",
        online: false,
        place: null,
        location: null,
      })
    ).toThrow(/require a place/);
  });

  it("accepts offline events with a location only", () => {
    expect(() =>
      assertEventInvariants({
        name: "Marché de nuit",
        online: false,
        place: null,
        location: {
          type: "Point",
          coordinates: [2.35, 48.85],
          label: "Paris",
          id: "seed.paris.custom.1",
        },
      })
    ).not.toThrow();
  });
});

describe("seed-ecosystem safety", () => {
  it("extracts hosts from mongodb+srv URIs", () => {
    expect(
      extractMongoHost(
        "mongodb+srv://user:pass@leafymap-staging.example.net/leafymap"
      )
    ).toBe("leafymap-staging.example.net");
  });

  it("classifies local, staging and production hosts", () => {
    expect(isLocalMongoHost("localhost:27017")).toBe(true);
    expect(isLocalMongoHost("mongo")).toBe(true);
    expect(isStagingMongoHost("leafymap-staging.abc.mongodb.net")).toBe(true);
    expect(isProductionMongoHost("leafymap-production.abc.mongodb.net")).toBe(
      true
    );
  });

  it("refuses a production host unless the target is production", () => {
    expect(() =>
      assertAllowedTarget(
        "mongodb+srv://u:p@leafymap-production.abc.mongodb.net/leafymap",
        "staging",
        {
          confirmStaging: true,
          confirmProduction: false,
          nodeEnv: "development",
        }
      )
    ).toThrow(/production/);
  });

  it("refuses NODE_ENV=production for non-production targets", () => {
    expect(() =>
      assertAllowedTarget("mongodb://localhost:27017/leafymap", "local", {
        confirmStaging: false,
        confirmProduction: false,
        nodeEnv: "production",
      })
    ).toThrow(/NODE_ENV=production/);
  });

  it("requires --confirm staging for staging target", () => {
    expect(() =>
      assertAllowedTarget(
        "mongodb+srv://u:p@leafymap-staging.abc.mongodb.net/db",
        "staging",
        {
          confirmStaging: false,
          confirmProduction: false,
          nodeEnv: "development",
        }
      )
    ).toThrow(/confirm staging/);
  });

  it("requires --confirm production and a production host", () => {
    expect(() =>
      assertAllowedTarget(
        "mongodb+srv://u:p@leafymap-production.abc.mongodb.net/leafymap",
        "production",
        {
          confirmStaging: false,
          confirmProduction: false,
          nodeEnv: "development",
        }
      )
    ).toThrow(/confirm production/);

    expect(() =>
      assertAllowedTarget(
        "mongodb+srv://u:p@leafymap-staging.abc.mongodb.net/db",
        "production",
        {
          confirmStaging: false,
          confirmProduction: true,
          nodeEnv: "development",
        }
      )
    ).toThrow(/not a local or staging host/);
  });

  it("accepts a production host when explicitly confirmed", () => {
    expect(() =>
      assertAllowedTarget(
        "mongodb+srv://u:p@leafymap-production.abc.mongodb.net/leafymap",
        "production",
        {
          confirmStaging: false,
          confirmProduction: true,
          nodeEnv: "production",
        }
      )
    ).not.toThrow();
  });

  it("accepts local docker mongo", () => {
    expect(() =>
      assertAllowedTarget("mongodb://mongo:27017/leafymap", "local", {
        confirmStaging: false,
        confirmProduction: false,
        nodeEnv: "development",
      })
    ).not.toThrow();
  });
});
