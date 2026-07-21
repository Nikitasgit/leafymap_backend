import { Types } from "mongoose";
import { groupEventsByDay } from "@src/application/usecases/places/placeScheduleWithEvents";
import { ConversationReadMapper } from "@src/infrastructure/read-mappers/Conversation.read-mapper";
import { EventReadMapper } from "@src/infrastructure/read-mappers/Event.read-mapper";
import { EventBookingReadMapper } from "@src/infrastructure/read-mappers/EventBooking.read-mapper";
import { ImageReadMapper } from "@src/infrastructure/read-mappers/Image.read-mapper";
import { ReviewReadMapper } from "@src/infrastructure/read-mappers/Review.read-mapper";

describe("read mappers", () => {
  it("maps event schedule collaborators explicitly", () => {
    const collaboratorId = new Types.ObjectId();
    const event = EventReadMapper.toDetail({
      _id: new Types.ObjectId(),
      name: "Market",
      schedule: [
        {
          startDate: new Date("2026-07-21"),
          endDate: new Date("2026-07-21"),
          timeSlots: [
            {
              title: "Morning",
              startTime: "09:00",
              endTime: "12:00",
              collaborators: [
                {
                  _id: collaboratorId,
                  username: "alice",
                  image: { urls: { thumbnail: "thumb.jpg" } },
                },
              ],
            },
          ],
        },
      ],
    });

    expect(event.schedule?.[0].timeSlots?.[0].collaborators).toEqual([
      { id: collaboratorId.toString(), name: "alice", image: "thumb.jpg" },
    ]);
  });

  it("maps reviews without manufacturing dates or references", () => {
    const createdAt = new Date("2026-07-20");
    const updatedAt = new Date("2026-07-21");
    const review = ReviewReadMapper.toListItem({
      _id: new Types.ObjectId(),
      author: null,
      rating: 5,
      reference: new Types.ObjectId(),
      referenceType: "Place",
      certified: true,
      createdAt,
      updatedAt,
    });

    expect(review.createdAt).toBe(createdAt);
    expect(review.updatedAt).toBe(updatedAt);
    expect(typeof review.reference).toBe("string");
  });

  it("maps conversation participants and last message deterministically", () => {
    const createdAt = new Date("2026-07-21");
    const conversation = ConversationReadMapper.toInboxItem(
      {
        _id: new Types.ObjectId(),
        participants: [
          { _id: new Types.ObjectId(), username: "alice" },
          new Types.ObjectId(),
        ],
        lastMessage: {
          _id: new Types.ObjectId(),
          content: "Hello",
          partnership: { type: "event" },
          createdAt,
        },
      },
      2
    );

    expect(conversation.participants).toHaveLength(2);
    expect(conversation.lastMessage).toEqual({
      content: "Hello",
      partnership: { type: "event" },
      createdAt,
    });
    expect(conversation.unreadCount).toBe(2);
  });

  it("maps image list records into the read contract", () => {
    const image = ImageReadMapper.toListItem({
      _id: new Types.ObjectId(),
      urls: {
        original: "original.jpg",
        thumbnail: "thumbnail.jpg",
        medium: "medium.jpg",
      },
      user: new Types.ObjectId(),
      reference: new Types.ObjectId(),
      referenceType: "Place",
      type: "gallery",
      originalName: "photo.jpg",
      size: 1024,
      mimetype: "image/jpeg",
      deleted: false,
      createdAt: new Date("2026-07-20"),
      updatedAt: new Date("2026-07-21"),
    });

    expect(typeof image.user).toBe("string");
    expect(typeof image.reference).toBe("string");
    expect(image.originalName).toBe("photo.jpg");
  });

  it("maps the unit booking query directly", () => {
    const booking = EventBookingReadMapper.toMyEventBooking({
      _id: new Types.ObjectId(),
      event: new Types.ObjectId(),
      user: new Types.ObjectId(),
      seats: 2,
      status: "confirmed",
      cancelledAt: null,
      createdAt: new Date("2026-07-20"),
      updatedAt: new Date("2026-07-21"),
    });

    expect(booking.status).toBe("confirmed");
    expect(typeof booking.event).toBe("string");
    expect(typeof booking.user).toBe("string");
  });

  it("groups schedule summaries and ignores unpopulated image refs", () => {
    const monday = new Date("2026-07-20T12:00:00.000Z");
    jest.useFakeTimers().setSystemTime(monday);

    const event = EventReadMapper.toScheduleSummary({
      _id: new Types.ObjectId(),
      name: "Market",
      schedule: [{ startDate: monday, endDate: monday }],
      image: new Types.ObjectId(),
      status: "available",
      deleted: false,
    });

    expect(groupEventsByDay([event]).monday[0]).toEqual({
      id: event.id,
      name: "Market",
      image: null,
    });

    jest.useRealTimers();
  });
});
