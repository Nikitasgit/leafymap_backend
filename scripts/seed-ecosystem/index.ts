import "./loadEnv";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { fakerFR as faker } from "@faker-js/faker";
import { parseArgs } from "./args";
import { loadCategoryMaps } from "./categories";
import {
  DEFAULT_SEED_PASSWORD,
  FAKER_SEED,
  SEED_EMAIL_DOMAIN,
} from "./config";
import { generateEvents } from "./generators/events";
import { generatePlaces } from "./generators/places";
import {
  generateBookings,
  generateFavorites,
  generateFollows,
  generateInvitations,
  generatePartnerships,
} from "./generators/relations";
import { generateUsers } from "./generators/users";
import { attachImages } from "./images/attachImages";
import { createSeedS3Client, uploadImagePool } from "./images/uploadPool";
import { invalidateMapCache, persistSeedContext } from "./persist";
import { countExistingSeedUsers, purgeSeedMongo, purgeSeedS3 } from "./purge";
import {
  connectRedis,
  disconnectRedis,
} from "../../src/infrastructure/persistence/redis";
import { assertAllowedTarget } from "./safety";
import type { SeedContext } from "./types";

function resolveMongoUri(): string {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not defined.");
  }
  return uri;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv);
  faker.seed(FAKER_SEED);

  const mongoUri = resolveMongoUri();
  assertAllowedTarget(mongoUri, options.target, {
    confirmStaging: options.confirmStaging,
    confirmProduction: options.confirmProduction,
  });

  const password =
    process.env.SEED_USER_PASSWORD || DEFAULT_SEED_PASSWORD;

  console.log(`Seed ecosystem → target=${options.target}`);
  console.log(`  users=${options.userCount} events=${options.eventCount}`);
  console.log(`  reset=${options.reset} skipImages=${options.skipImages}`);

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");

  try {
    const categories = await loadCategoryMaps();
    console.log("Categories loaded");

    const existing = await countExistingSeedUsers();
    if (existing > 0 && !options.reset) {
      throw new Error(
        `${existing} seed users (@${SEED_EMAIL_DOMAIN}) already exist. Re-run with --reset to replace them.`
      );
    }

    let s3 = null as ReturnType<typeof createSeedS3Client> | null;
    if (!options.skipImages) {
      s3 = createSeedS3Client();
    }

    if (options.reset) {
      console.log("Purging previous seed data…");
      const purged = await purgeSeedMongo();
      console.log(`  mongo seed users removed: ${purged.users}`);
      if (s3) {
        try {
          const removedObjects = await purgeSeedS3(s3);
          console.log(`  s3 objects removed: ${removedObjects}`);
        } catch (error) {
          console.warn(
            `S3 seed purge failed: ${(error as Error).message}. Continuing.`
          );
        }
      }
    }

    console.log("Hashing seed password…");
    const passwordHash = await bcrypt.hash(password, 10);

    console.log("Generating documents…");
    const users = generateUsers(options.userCount, passwordHash, categories);
    const places = generatePlaces(users, categories);
    const events = generateEvents(
      options.eventCount,
      users,
      places,
      categories
    );
    const invitations = generateInvitations(events, users);
    const bookings = generateBookings(events, users);
    const follows = generateFollows(users);
    const favorites = generateFavorites(users, places);
    const partnerships = generatePartnerships(users);

    const ctx: SeedContext = {
      users,
      places,
      events,
      images: [],
      invitations,
      bookings,
      follows,
      favorites,
      partnerships,
    };

    if (!options.skipImages) {
      if (!s3) {
        s3 = createSeedS3Client();
      }
      console.log("Uploading image pool to S3 (images/seed/)…");
      const pool = await uploadImagePool(s3);
      attachImages(ctx, pool);
      console.log(`  image documents: ${ctx.images.length}`);
    }

    console.log("Inserting…");
    await persistSeedContext(ctx);

    await connectRedis();
    await invalidateMapCache();

    const demoLogins = users
      .filter((user) => !user.email.startsWith("seed"))
      .map((user) => `    ${user.email}`)
      .join("\n");

    console.log("Seed ecosystem done.");
    console.log(`  password: ${password}`);
    console.log("  demo accounts:");
    console.log(demoLogins || "    (none)");
  } finally {
    await disconnectRedis();
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Usage:")) {
    console.error(message);
  } else {
    console.error("Seed ecosystem failed:", error);
  }
  process.exitCode = 1;
});
