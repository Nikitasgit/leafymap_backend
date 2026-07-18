import { IEventInvitationRepository } from "@/types/repositories/eventInvitation.repository.types";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { EventId } from "@src/domain/value-objects/ObjectId.vo";

class EventInvitationService {
  constructor(
    private eventInvitationRepository: IEventInvitationRepository,
    private eventRepository: IEventRepository
  ) {}

  async deleteEventInvitation(invitationId: string): Promise<void> {
    const invitation = await this.eventInvitationRepository.findById(
      invitationId
    );
    if (!invitation) {
      throw new Error(`Event invitation ${invitationId} not found`);
    }
    const eventId = EventId.from(invitation.event.toString());
    const collaboratorId = invitation.collaborator.toString();
    await this.eventInvitationRepository.deleteOne(invitationId);

    const schedule = await this.eventRepository.findScheduleById(eventId);
    if (!schedule || schedule.length === 0) {
      return;
    }

    const updatedSchedule = schedule.map((period) => ({
      ...period,
      timeSlots: (period.timeSlots ?? []).map((slot) => ({
        ...slot,
        collaboratorIds: (slot.collaboratorIds ?? []).filter(
          (id) => id !== collaboratorId
        ),
      })),
    }));

    await this.eventRepository.updateSchedule(eventId, updatedSchedule);
  }
}

export default EventInvitationService;
