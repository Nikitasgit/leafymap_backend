import { Types } from "mongoose";
import { IEventInvitationRepository } from "@/types/repositories/eventInvitation.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IEvent, IEventPeriod } from "@/types/models/event";

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
    const eventId = invitation.event.toString();
    const collaboratorId = invitation.collaborator.toString();
    await this.eventInvitationRepository.deleteOne(invitationId);
    const event = await this.eventRepository.findById(eventId, ["schedule"]);
    if (!event || !event.schedule || event.schedule.length === 0) {
      return;
    }
    const collaboratorObjectId = new Types.ObjectId(collaboratorId);
    const updatedSchedule: IEventPeriod[] = event.schedule.map((period) => ({
      ...period,
      timeSlots: (period.timeSlots ?? []).map((slot) => ({
        ...slot,
        collaborators: (slot.collaborators ?? []).filter(
          (id) => !new Types.ObjectId(id).equals(collaboratorObjectId)
        ),
      })),
    }));
    await this.eventRepository.updateOne(eventId, {
      schedule: updatedSchedule,
    });
  }
}

export default EventInvitationService;
