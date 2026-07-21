import { RequestHandler } from "express";
import {
  createEventBookingSchema,
  updateEventBookingSchema,
} from "@src/api/dto/eventBookings/eventBooking.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import type CancelEventBookingUseCase from "@src/application/usecases/eventBookings/CancelEventBooking.usecase";
import type CreateEventBookingUseCase from "@src/application/usecases/eventBookings/CreateEventBooking.usecase";
import type GetEventBookingsByEventUseCase from "@src/application/usecases/eventBookings/GetEventBookingsByEvent.usecase";
import type GetMyEventBookingForEventUseCase from "@src/application/usecases/eventBookings/GetMyEventBookingForEvent.usecase";
import type GetMyEventBookingsUseCase from "@src/application/usecases/eventBookings/GetMyEventBookings.usecase";
import type UpdateEventBookingUseCase from "@src/application/usecases/eventBookings/UpdateEventBooking.usecase";

class EventBookingsController extends BaseHttpController {
  constructor(
    private readonly createEventBookingUseCase: CreateEventBookingUseCase,
    private readonly updateEventBookingUseCase: UpdateEventBookingUseCase,
    private readonly cancelEventBookingUseCase: CancelEventBookingUseCase,
    private readonly getMyEventBookingsUseCase: GetMyEventBookingsUseCase,
    private readonly getMyEventBookingForEventUseCase: GetMyEventBookingForEventUseCase,
    private readonly getEventBookingsByEventUseCase: GetEventBookingsByEventUseCase
  ) {
    super();
  }

  create(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const bookingData = validateOrThrow(createEventBookingSchema, req.body);
        return this.createEventBookingUseCase.execute({
          eventId: requireObjectIdParam(req, "eventId"),
          userId: requireAuth(req).id,
          seats: bookingData.seats,
        });
      },
      successMessage: "Réservation créée avec succès",
      successStatus: 201,
      mapResult: (result) => ({ id: result.id }),
    });
  }

  cancel(): RequestHandler {
    return this.handler({
      execute: (req) =>
        this.cancelEventBookingUseCase.execute({
          bookingId: requireObjectIdParam(req, "bookingId"),
          requesterId: requireAuth(req).id,
        }),
      successMessage: "Réservation annulée avec succès",
    });
  }

  update(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const bookingData = validateOrThrow(updateEventBookingSchema, req.body);
        return this.updateEventBookingUseCase.execute({
          bookingId: requireObjectIdParam(req, "bookingId"),
          requesterId: requireAuth(req).id,
          seats: bookingData.seats,
        });
      },
      successMessage: "Réservation mise à jour avec succès",
    });
  }

  listByEvent(): RequestHandler {
    return this.handler({
      execute: (req) =>
        this.getEventBookingsByEventUseCase.execute({
          eventId: requireObjectIdParam(req, "eventId"),
          actorId: requireAuth(req).id,
        }),
      successMessage: "Réservations récupérées avec succès",
    });
  }

  getMyForEvent(): RequestHandler {
    return this.handler({
      execute: (req) =>
        this.getMyEventBookingForEventUseCase.execute({
          eventId: requireObjectIdParam(req, "eventId"),
          userId: requireAuth(req).id,
        }),
      successMessage: "Réservation récupérée avec succès",
    });
  }

  listMine(): RequestHandler {
    return this.handler({
      execute: (req) =>
        this.getMyEventBookingsUseCase.execute({
          userId: requireAuth(req).id,
        }),
      successMessage: "Réservations récupérées avec succès",
    });
  }
}

export default EventBookingsController;
