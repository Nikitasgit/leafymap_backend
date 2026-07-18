import "dotenv/config";
import mongoose from "mongoose";
import Event from "../src/infrastructure/persistence/schemas/Event.schema";
import Place from "../models/Place";

async function migrateEventsUser() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");

  const events = await Event.find({
    user: { $exists: false },
    place: { $ne: null },
  }).select("_id place");

  let updated = 0;
  for (const event of events) {
    const place = await Place.findById(event.place).select("user");
    if (!place?.user) continue;

    event.user = place.user;
    event.online = false;
    event.location = null;
    await event.save();
    updated += 1;
  }

  console.log(`Updated ${updated} events with their owner`);
}

migrateEventsUser()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
