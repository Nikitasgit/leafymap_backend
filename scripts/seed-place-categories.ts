import "dotenv/config";
import mongoose from "mongoose";
import PlaceCategory from "../models/PlaceCategory";
import { CategoryPlaceType } from "../types/models/placeCategory";

type PlaceCategorySeed = {
  name: string;
  description: string;
  types: CategoryPlaceType[];
};

/**
 * Slugs anglais (clé i18n côté frontend : placeCategories.{name}).
 * Usage :
 *   npm run seed:place-categories
 *   npm run seed:place-categories -- --suggested
 */
const HOSPITALITY_CATEGORIES: PlaceCategorySeed[] = [
  {
    name: "comedy_club",
    description: "Venue hosting stand-up comedy and live humor shows",
    types: ["art"],
  },
  {
    name: "bar_restaurant",
    description: "Bar and restaurant hosting tastings, live music and local events",
    types: ["food", "art"],
  },
  {
    name: "bar",
    description: "Bar hosting concerts, DJ sets, tastings and meetups",
    types: ["food", "art"],
  },
  {
    name: "hotel",
    description: "Hotel hosting conferences, exhibitions and private events",
    types: ["food", "art"],
  },
  {
    name: "restaurant",
    description: "Restaurant hosting themed dinners, workshops and local events",
    types: ["food"],
  },
];

const HIGH_PRIORITY_EVENT_CATEGORIES: PlaceCategorySeed[] = [
  {
    name: "music_venue",
    description: "Concert hall or live music venue",
    types: ["art"],
  },
  {
    name: "theater",
    description: "Theater hosting plays, performances and cultural events",
    types: ["art"],
  },
  {
    name: "museum",
    description: "Museum hosting exhibitions, talks and cultural events",
    types: ["art"],
  },
  {
    name: "cinema",
    description: "Cinema hosting screenings, festivals and special events",
    types: ["art"],
  },
  {
    name: "nightclub",
    description: "Nightclub hosting parties, DJ sets and live shows",
    types: ["art", "food"],
  },
  {
    name: "brewery",
    description: "Brewery or taproom hosting tastings and local events",
    types: ["food", "art"],
  },
];

/** Priorité moyenne — option --suggested */
const OPTIONAL_EVENT_CATEGORIES: PlaceCategorySeed[] = [
  {
    name: "conference_center",
    description: "Conference center for professional and public events",
    types: ["art"],
  },
  {
    name: "community_center",
    description: "Community center hosting local workshops and gatherings",
    types: ["art", "craft"],
  },
  {
    name: "rooftop",
    description: "Rooftop terrace hosting seasonal events and pop-ups",
    types: ["food", "art"],
  },
  {
    name: "pop_up_space",
    description: "Temporary or flexible space for pop-up events",
    types: ["art", "craft", "food"],
  },
];

async function upsertCategories(categories: PlaceCategorySeed[]) {
  let created = 0;
  let skipped = 0;

  for (const category of categories) {
    const existing = await PlaceCategory.findOne({ name: category.name });

    if (existing) {
      console.log(`Skip (exists): ${category.name}`);
      skipped += 1;
      continue;
    }

    await PlaceCategory.create(category);
    console.log(`Created: ${category.name}`);
    created += 1;
  }

  return { created, skipped };
}

async function seed() {
  const includeSuggested = process.argv.includes("--suggested");

  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    const categories = includeSuggested
      ? [
          ...HOSPITALITY_CATEGORIES,
          ...HIGH_PRIORITY_EVENT_CATEGORIES,
          ...OPTIONAL_EVENT_CATEGORIES,
        ]
      : [...HOSPITALITY_CATEGORIES, ...HIGH_PRIORITY_EVENT_CATEGORIES];

    const { created, skipped } = await upsertCategories(categories);

    console.log("");
    console.log(`Done: ${created} created, ${skipped} skipped`);
    if (!includeSuggested) {
      console.log(
        "Tip: run with --suggested to also insert conference_center, community_center, rooftop and pop_up_space."
      );
    }
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
