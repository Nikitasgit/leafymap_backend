import DeleteEventAction from "@/actions/events/DeleteEvent.action";
import CascadeDeleteService from "@/services/cascadeDeleteService";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { ERROR_CODES } from "@/utils/errors";
import {
  buildEvent,
  createMockRepository,
  mockObjectId,
} from "../../helpers/mockRepositories";

const mockDeleteEvents = jest.fn().mockResolvedValue(undefined);

jest.mock("@/services/cascadeDeleteService", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    deleteEvents: mockDeleteEvents,
  })),
}));

jest.mock("@/utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe("DeleteEventAction", () => {
  let eventRepository: jest.Mocked<IEventRepository>;
  let cascadeDeleteService: CascadeDeleteService;
  let action: DeleteEventAction;

  beforeEach(() => {
    mockDeleteEvents.mockClear();
    eventRepository = createMockRepository<IEventRepository>();
    cascadeDeleteService = new CascadeDeleteService(
      createMockRepository() as never,
      createMockRepository() as never,
      createMockRepository() as never,
      createMockRepository() as never,
      createMockRepository() as never,
      createMockRepository() as never,
      createMockRepository() as never,
      createMockRepository() as never,
      createMockRepository() as never,
      { execute: jest.fn() } as never
    );
    action = new DeleteEventAction(eventRepository, cascadeDeleteService);
  });

  it("deletes an event and its associated data", async () => {
    const eventId = mockObjectId();

    eventRepository.findById.mockResolvedValue(buildEvent() as never);

    await action.execute({ eventId });

    expect(mockDeleteEvents).toHaveBeenCalledWith([eventId]);
  });

  it("rejects when the event does not exist", async () => {
    eventRepository.findById.mockResolvedValue(null);

    await expect(action.execute({ eventId: mockObjectId() })).rejects.toMatchObject(
      {
        code: ERROR_CODES.EVENT_NOT_FOUND,
        statusCode: 404,
      }
    );

    expect(mockDeleteEvents).not.toHaveBeenCalled();
  });
});
