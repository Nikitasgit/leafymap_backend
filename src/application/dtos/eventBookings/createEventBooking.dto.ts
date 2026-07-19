export interface CreateEventBookingInput {
  eventId: string;
  userId: string;
  seats: number;
}

export interface CreateEventBookingOutput {
  id: string;
}
