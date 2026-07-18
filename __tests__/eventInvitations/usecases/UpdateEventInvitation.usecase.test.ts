import { Types } from "mongoose";
import UpdateEventInvitationUseCase from "@src/application/usecases/eventInvitations/UpdateEventInvitation.usecase";
import { EventInvitation } from "@src/domain/entities/EventInvitation.entity";
import { IEventInvitationNotifier } from "@src/domain/interfaces/IEventInvitationNotifier";
import { IEventInvitationRepository } from "@src/domain/interfaces/IEventInvitationRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import {
  EventId,
  EventInvitationId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("UpdateEventInvitationUseCase", () => {
  let eventInvitationRepository: jest.Mocked<IEventInvitationRepository>;
  let eventRepository: jest.Mocked<IEventRepository>;
  let eventInvitationNotifier: jest.Mocked<IEventInvitationNotifier>;
  let useCase: UpdateEventInvitationUseCase;

  const initiatorId = mockObjectId();
  const collaboratorId = mockObjectId();
  const eventId = mockObjectId();
  const invitationId = mockObjectId();

  const pendingInvitation = () =>
    EventInvitation.reconstitute({
      id: EventInvitationId.from(invitationId),
      eventId: EventId.from(eventId),
      initiatorId: UserId.from(initiatorId),
      collaboratorId: UserId.from(collaboratorId),
      status: "pending",
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  beforeEach(() => {
    eventInvitationRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByEventAndCollaborator: jest.fn(),
      findListByEvent: jest.fn(),
      findListForUser: jest.fn(),
      deleteManyByEventIds: jest.fn(),
      deleteManyByUserId: jest.fn(),
      cancelPendingByEventIds: jest.fn(),
    };
    eventRepository = {
      findScheduleById: jest.fn().mockResolvedValue([]),
      updateSchedule: jest.fn(),
    } as unknown as jest.Mocked<IEventRepository>;
    eventInvitationNotifier = {
      notifyInvitation: jest.fn(),
      notifyAccepted: jest.fn(),
      notifyRefused: jest.fn(),
    };
    useCase = new UpdateEventInvitationUseCase(
      eventInvitationRepository,
      eventRepository,
      eventInvitationNotifier
    );
  });

  it("allows the collaborator to accept and notifies the initiator", async () => {
    eventInvitationRepository.findById.mockResolvedValue(pendingInvitation());

    await useCase.execute({
      userId: collaboratorId,
      invitations: [{ id: invitationId, status: "accepted" }],
    });

    expect(eventInvitationRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "accepted" })
    );
    expect(eventInvitationNotifier.notifyAccepted).toHaveBeenCalled();
    expect(eventInvitationRepository.delete).not.toHaveBeenCalled();
  });

  it("allows the collaborator to refuse, notifies and hard-deletes", async () => {
    eventInvitationRepository.findById.mockResolvedValue(pendingInvitation());

    await useCase.execute({
      userId: collaboratorId,
      invitations: [{ id: invitationId, status: "refused" }],
    });

    expect(eventInvitationNotifier.notifyRefused).toHaveBeenCalled();
    expect(eventInvitationRepository.delete).toHaveBeenCalled();
    expect(eventInvitationRepository.update).not.toHaveBeenCalled();
  });

  it("forbids a non-collaborator from accepting", async () => {
    eventInvitationRepository.findById.mockResolvedValue(pendingInvitation());

    await expect(
      useCase.execute({
        userId: initiatorId,
        invitations: [{ id: invitationId, status: "accepted" }],
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.EVENT_INVITATION_RESPOND_FORBIDDEN,
      statusCode: 403,
    });
  });

  it("allows the initiator to cancel via deleted flag and removes schedule collaborator", async () => {
    eventInvitationRepository.findById.mockResolvedValue(pendingInvitation());
    eventRepository.findScheduleById.mockResolvedValue([
      {
        startDate: new Date(),
        endDate: new Date(),
        timeSlots: [
          {
            title: "Slot",
            startTime: "09:00",
            endTime: "10:00",
            collaboratorIds: [collaboratorId, mockObjectId()],
          },
        ],
      },
    ]);

    await useCase.execute({
      userId: initiatorId,
      invitations: [{ id: invitationId, deleted: true }],
    });

    expect(eventInvitationRepository.delete).toHaveBeenCalled();
    expect(eventRepository.updateSchedule).toHaveBeenCalledWith(
      EventId.from(eventId),
      [
        expect.objectContaining({
          timeSlots: [
            expect.objectContaining({
              collaboratorIds: expect.not.arrayContaining([collaboratorId]),
            }),
          ],
        }),
      ]
    );
  });
});
