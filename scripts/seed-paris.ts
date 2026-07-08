import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User";
import Place from "../models/Place";
import Event from "../models/Event";
import { EventInvitation } from "../models/EventInvitation";
import { Partnership } from "../models/Partnership";
import PlaceCategory from "../models/PlaceCategory";
import UserCategory from "../models/UserCategory";
import CategoryType from "../models/CategoryType";
import { Types } from "mongoose";

const PARIS_CENTER = { lng: 2.3522, lat: 48.8566 };

const defaultSchedule = {
  monday: { open: true, timeSlots: [{ startTime: "09:00", endTime: "18:00" }] },
  tuesday: {
    open: true,
    timeSlots: [{ startTime: "09:00", endTime: "18:00" }],
  },
  wednesday: {
    open: true,
    timeSlots: [{ startTime: "09:00", endTime: "18:00" }],
  },
  thursday: {
    open: true,
    timeSlots: [{ startTime: "09:00", endTime: "18:00" }],
  },
  friday: { open: true, timeSlots: [{ startTime: "09:00", endTime: "18:00" }] },
  saturday: {
    open: true,
    timeSlots: [{ startTime: "10:00", endTime: "17:00" }],
  },
  sunday: { open: false, timeSlots: [] },
};

function getParisLocation(index: number) {
  const offset = (index - 5) * 0.01;
  return {
    type: "Point" as const,
    coordinates: [
      PARIS_CENTER.lng + offset + (Math.random() - 0.5) * 0.02,
      PARIS_CENTER.lat + (Math.random() - 0.5) * 0.02,
    ] as [number, number],
    label: `Paris - Quartier ${index}`,
    id: `paris-${index}-${Date.now()}`,
  };
}

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined");
    }
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    const placeCategory = await PlaceCategory.findOne();
    const userCategory = await UserCategory.findOne();
    const artCategoryType = await CategoryType.findOne({ name: "art" });

    if (!placeCategory || !userCategory || !artCategoryType) {
      throw new Error(
        "PlaceCategory, UserCategory et CategoryType requis. Exécutez d'abord npm run seed:categories."
      );
    }

    const seedEmails = Array.from(
      { length: 10 },
      (_, i) => `creator${i + 1}@paris.dev`
    );
    const existingSeedUsers = await User.find({
      email: { $in: seedEmails },
    }).select("_id");
    const seedUserIds = existingSeedUsers.map((u) => u._id);

    if (seedUserIds.length > 0) {
      const seedPlaces = await Place.find({
        user: { $in: seedUserIds },
      }).select("_id");
      const seedPlaceIds = seedPlaces.map((p) => p._id);
      const seedEventIds = (
        await Event.find({ place: { $in: seedPlaceIds } }).select("_id")
      ).map((e) => e._id);

      await EventInvitation.deleteMany({
        $or: [
          { initiator: { $in: seedUserIds } },
          { collaborator: { $in: seedUserIds } },
          { event: { $in: seedEventIds } },
        ],
      });
      await Partnership.deleteMany({
        $or: [
          { initiator: { $in: seedUserIds } },
          { collaborator: { $in: seedUserIds } },
        ],
      });
      await Event.deleteMany({ place: { $in: seedPlaceIds } });
      await Place.deleteMany({ user: { $in: seedUserIds } });
      await User.deleteMany({ email: { $in: seedEmails } });
      console.log("Existing seed data removed");
    }

    const hashedPassword = await bcrypt.hash("dev-default", 10);

    const userNames = [
      "Marie Dubois",
      "Jean Martin",
      "Sophie Bernard",
      "Pierre Leroy",
      "Julie Petit",
      "Thomas Moreau",
      "Camille Simon",
      "Lucas Laurent",
      "Emma Michel",
      "Hugo Garcia",
    ];

    const users: Types.ObjectId[] = [];
    const places: Types.ObjectId[] = [];
    const events: Types.ObjectId[] = [];

    for (let i = 0; i < 10; i++) {
      const user = await User.create({
        email: `creator${i + 1}@paris.dev`,
        username: `paris_creator_${i + 1}`,
        password: hashedPassword,
        userType: "creator",
        userCategory: userCategory._id,
        acceptedCGU: true,
        acceptedAt: new Date(),
        deleted: false,
        firstname: userNames[i].split(" ")[0],
        lastname: userNames[i].split(" ")[1],
        description: `Organisateur parisien ${i + 1} - Événements locaux`,
      });
      users.push(user._id);
      console.log(`User ${i + 1} created: ${user.email}`);
    }

    for (let i = 0; i < 10; i++) {
      const place = await Place.create({
        user: users[i],
        location: getParisLocation(i + 1),
        placeCategory: placeCategory._id,
        placeType: [artCategoryType._id],
        defaultSchedule,
        customDates: [],
      });
      places.push(place._id);

      await User.findByIdAndUpdate(users[i], { place: place._id });
      console.log(`Place ${i + 1} created for user ${i + 1}`);
    }

    const eventNames = [
      "Atelier peinture",
      "Exposition photo",
      "Concert acoustique",
      "Cours de poterie",
      "Soirée jazz",
      "Workshop créatif",
      "Vernissage",
      "Performance live",
    ];

    for (let i = 0; i < 10; i++) {
      const numEvents = 2 + (i % 2);
      for (let e = 0; e < numEvents; e++) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 7 + e * 3);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);

        const event = await Event.create({
          name: eventNames[(i + e) % eventNames.length] + ` #${i + 1}`,
          description: `Événement local à Paris - ${
            eventNames[(i + e) % eventNames.length]
          }`,
          place: places[i],
          schedule: [
            {
              startDate,
              endDate,
              timeSlots: [
                {
                  title: "Session principale",
                  startTime: "14:00",
                  endTime: "18:00",
                  collaborators: [],
                },
              ],
            },
          ],
          status: "available",
        });
        events.push(event._id);
      }
      console.log(`Events created for place ${i + 1}`);
    }

    for (let i = 0; i < 7; i++) {
      const initiatorIdx = i % 10;
      const collaboratorIdx = (i + 3) % 10;
      if (initiatorIdx !== collaboratorIdx) {
        await Partnership.create({
          initiator: users[initiatorIdx],
          collaborator: users[collaboratorIdx],
          status: i < 5 ? "accepted" : "pending",
        });
      }
    }
    console.log("Partnerships created");

    for (let i = 0; i < Math.min(8, events.length); i++) {
      const placeIdx = Math.floor(i / 2) % 10;
      const initiatorIdx = placeIdx;
      const collaboratorIdx = (placeIdx + 3) % 10;

      await EventInvitation.create({
        event: events[i],
        initiator: users[initiatorIdx],
        collaborator: users[collaboratorIdx],
        status: i < 5 ? "accepted" : "pending",
      });
    }
    console.log("Event invitations created");

    console.log("\nSeed completed successfully!");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

seed();
