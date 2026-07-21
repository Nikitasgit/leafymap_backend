import { Types } from "mongoose";
import UpdateEventLifecycleStatusUseCase from "@src/application/usecases/events/UpdateEventLifecycleStatus.usecase";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import {
  calculateEventStatus,
  getEventDateRange,
  getLifecycleStatus,
} from "@src/domain/value-objects/EventSchedule.vo";
import { EventId } from "@src/domain/value-objects/ObjectId.vo";

const eventId = (): EventId => EventId.from(new Types.ObjectId().toString());

describe("EventSchedule value object", () => {
  afterEach(() => jest.useRealTimers());

  it("derives the complete range from unsorted periods", () => {
    const earliest = new Date("2026-07-20T10:00:00Z");
    const latest = new Date("2026-07-25T18:00:00Z");

    expect(
      getEventDateRange([
        {
          startDate: new Date("2026-07-24T10:00:00Z"),
          endDate: latest,
        },
        { startDate: earliest, endDate: new Date("2026-07-21T18:00:00Z") },
      ])
    ).toEqual({ firstDate: earliest, latestDate: latest });
  });

  it.each([
    ["ongoing", new Date(2026, 6, 20), new Date(2026, 6, 22)],
    ["upcoming", new Date(2026, 6, 22), new Date(2026, 6, 23)],
    ["completed", new Date(2026, 6, 18), new Date(2026, 6, 20)],
    ["unvalid", new Date(0), new Date(0)],
  ] as const)("returns %s for the relevant date range", (expected, first, latest) => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 6, 21, 15));
    expect(getLifecycleStatus({ firstDate: first, latestDate: latest })).toBe(
      expected
    );
  });

  it("rejects an empty schedule", () => {
    expect(() => calculateEventStatus([])).toThrow(
      expect.objectContaining({
        code: "VALIDATION_ERROR",
        data: { schedule: "Schedule must contain at least one period" },
      })
    );
  });
});

describe("UpdateEventLifecycleStatusUseCase", () => {
  let repository: jest.Mocked<
    Pick<
      IEventRepository,
      "findAllForLifecycleUpdate" | "updateLifecycleFields"
    >
  >;
  let useCase: UpdateEventLifecycleStatusUseCase;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 6, 21, 15));
    repository = {
      findAllForLifecycleUpdate: jest.fn(),
      updateLifecycleFields: jest.fn(),
    };
    useCase = new UpdateEventLifecycleStatusUseCase(
      repository as unknown as IEventRepository
    );
  });

  afterEach(() => jest.useRealTimers());

  it("backfills date ranges and reports terminal transitions", async () => {
    const completedId = eventId();
    const upcomingId = eventId();
    repository.findAllForLifecycleUpdate.mockResolvedValue([
      {
        id: completedId,
        schedule: [
          {
            startDate: new Date(2026, 6, 18),
            endDate: new Date(2026, 6, 19),
          },
        ],
        lifecycleStatus: "upcoming",
      },
      {
        id: upcomingId,
        schedule: [
          {
            startDate: new Date(2026, 6, 25),
            endDate: new Date(2026, 6, 26),
          },
        ],
        dateRange: {
          firstDate: new Date(2026, 6, 25),
          latestDate: new Date(2026, 6, 26),
        },
        lifecycleStatus: "upcoming",
      },
    ]);

    await expect(useCase.execute()).resolves.toEqual([completedId.toString()]);
    expect(repository.updateLifecycleFields).toHaveBeenNthCalledWith(
      1,
      completedId,
      {
        dateRange: {
          firstDate: new Date(2026, 6, 18),
          latestDate: new Date(2026, 6, 19),
        },
      }
    );
    expect(repository.updateLifecycleFields).toHaveBeenNthCalledWith(
      2,
      completedId,
      { lifecycleStatus: "completed" }
    );
  });

  it("ignores records without a schedule", async () => {
    repository.findAllForLifecycleUpdate.mockResolvedValue([
      {
        id: eventId(),
        schedule: [],
        lifecycleStatus: "unvalid",
      },
    ]);

    await expect(useCase.execute()).resolves.toEqual([]);
    expect(repository.updateLifecycleFields).not.toHaveBeenCalled();
  });
});
