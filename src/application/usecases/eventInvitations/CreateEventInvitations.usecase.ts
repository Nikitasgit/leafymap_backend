import { EventInvitation } from "@src/domain/entities/EventInvitation.entity";
import { IEventInvitationNotifier } from "@src/domain/interfaces/IEventInvitationNotifier";
import { IEventInvitationRepository } from "@src/domain/interfaces/IEventInvitationRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@src/shared/errors";
import { CreateEventInvitationsInput } from "@src/application/dtos/eventInvitations/createEventInvitations.dto";

class CreateEventInvitationsUseCase {
  constructor(
    private readonly eventInvitationRepository: IEventInvitationRepository,
    private readonly eventRepository: IEventRepository,
    private readonly eventInvitationNotifier: IEventInvitationNotifier,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(params: CreateEventInvitationsInput): Promise<void> {
    const eventId = EventId.from(params.eventId);
    const initiatorId = UserId.from(params.initiatorId);

    const event = await this.eventRepository.findById(eventId);
    if (!event || event.deleted) {
      throw new NotFoundError(ERROR_CODES.EVENT_NOT_FOUND, "Event not found");
    }
    if (!event.belongsTo(initiatorId)) {
      throw new ForbiddenError(ERROR_CODES.FORBIDDEN);
    }

    await Promise.all(
      params.invitations.map(async (item) => {
        if (!item.collaboratorId) {
          return;
        }

        const collaboratorId = UserId.from(item.collaboratorId);
        const existing =
          await this.eventInvitationRepository.findByEventAndCollaborator(
            eventId,
            collaboratorId
          );
        if (existing) {
          return;
        }

        const collaborator = await this.userRepository.findById(collaboratorId);
        if (!collaborator || collaborator.deleted) {
          throw new NotFoundError(
            ERROR_CODES.USER_NOT_FOUND,
            "Collaborator not found"
          );
        }
        if (collaborator.userType !== "creator") {
          throw new ValidationError(
            { collaborator: "Only creators can be invited" },
            ERROR_CODES.EVENT_INVITATION_COLLABORATOR_MUST_BE_CREATOR,
            "Only creators can be invited to an event"
          );
        }

        const invitation = EventInvitation.create({
          eventId,
          initiatorId,
          collaboratorId,
        });
        await this.eventInvitationRepository.save(invitation);

        await this.eventInvitationNotifier.notifyInvitation({
          senderId: initiatorId,
          receiverId: collaboratorId,
          eventId,
        });
      })
    );
  }
}

export default CreateEventInvitationsUseCase;
