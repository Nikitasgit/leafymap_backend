import { fakerFR as faker } from "@faker-js/faker";
import { Types } from "mongoose";
import {
  ARCHETYPES,
  CREATOR_RATIO,
  CITIES,
  DEMO_ACCOUNTS,
  GUEST_DESCRIPTIONS,
  PLACE_RATIO_AMONG_CREATORS,
  SEED_EMAIL_DOMAIN,
  type CityCluster,
  type CreatorArchetype,
} from "../config";
import { requireCategoryId } from "../categories";
import type { CategoryMaps, SeedUserDoc } from "../types";

function pickCity(): CityCluster {
  const total = CITIES.reduce((sum, city) => sum + city.weight, 0);
  let roll = faker.number.int({ min: 1, max: total });
  for (const city of CITIES) {
    roll -= city.weight;
    if (roll <= 0) {
      return city;
    }
  }
  return CITIES[0];
}

function slugUsername(firstname: string, lastname: string, index: number): string {
  const base = `${firstname} ${lastname}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const withIndex = base.length <= 26 ? `${base} ${index}` : `${base.slice(0, 26)} ${index}`;
  const clipped = withIndex.slice(0, 30).trim();
  return clipped.length >= 4 ? clipped : `Createur ${index}`.slice(0, 30);
}

function guestUsername(firstname: string, lastname: string, index: number): string {
  const base = `${firstname} ${lastname}`
    .replace(/[^a-zA-ZÀ-ÿ0-9\s']/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const candidate = `${base} ${index}`.slice(0, 30).trim();
  return candidate.length >= 4 ? candidate : `Invite ${index}`.slice(0, 30);
}

function frenchPhone(): string {
  const rest = faker.string.numeric(8);
  return `06${rest}`;
}

function postalCode(city: CityCluster): string {
  const suffix = faker.string.numeric(2);
  if (city.slug === "paris") {
    const arr = faker.number.int({ min: 1, max: 20 }).toString().padStart(2, "0");
    return `750${arr}`;
  }
  return `${city.postalPrefix}${suffix}`.slice(0, 5);
}

function userAddress(city: CityCluster) {
  return {
    number: faker.location.buildingNumber().replace(/\D/g, "").slice(0, 4) || "12",
    street: faker.location.street(),
    code: postalCode(city),
  };
}

function clipDescription(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length < 10) {
    return "Créateur local, événements et rencontres tout au long de l'année.";
  }
  return trimmed.slice(0, 300);
}

function pickInterests(
  categories: CategoryMaps,
  count: number
): Types.ObjectId[] {
  const ids = [...categories.user.values()];
  faker.helpers.shuffle(ids);
  return ids.slice(0, Math.min(count, ids.length));
}

function creatorWebsite(username: string): string {
  const slug = username
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `https://www.${slug || "leafy-crea"}.fr`;
}

export function generateUsers(
  userCount: number,
  passwordHash: string,
  categories: CategoryMaps
): SeedUserDoc[] {
  const creatorCount = Math.max(1, Math.round(userCount * CREATOR_RATIO));
  const guestCount = Math.max(0, userCount - creatorCount);
  const users: SeedUserDoc[] = [];
  const usedUsernames = new Set<string>();

  const uniqueUsername = (candidate: string): string => {
    let name = candidate;
    let suffix = 2;
    while (usedUsernames.has(name.toLowerCase())) {
      const base = candidate.slice(0, 27).trim();
      name = `${base} ${suffix}`.slice(0, 30).trim();
      suffix += 1;
    }
    usedUsernames.add(name.toLowerCase());
    return name;
  };

  const buildCreator = (params: {
    email: string;
    archetype: CreatorArchetype;
    nameIndex: number;
    index: number;
  }): SeedUserDoc => {
    const city = pickCity();
    const name =
      params.archetype.nameParts[
        params.nameIndex % params.archetype.nameParts.length
      ];
    const firstname = name.firstname;
    const lastname = name.lastname;
    const pretty = `${firstname} ${lastname}`.replace(/\s+/g, " ").trim().slice(0, 30);
    const username = uniqueUsername(
      pretty.length >= 4 ? pretty : slugUsername(firstname, lastname, params.index)
    );
    const description = clipDescription(
      faker.helpers.arrayElement(params.archetype.descriptions)
    );

    return {
      _id: new Types.ObjectId(),
      email: params.email,
      password: passwordHash,
      firstname,
      lastname,
      username,
      userType: "creator",
      role: "user",
      userCategory: requireCategoryId(
        categories.user,
        params.archetype.userCategory,
        "UserCategory"
      ),
      description,
      website: faker.datatype.boolean({ probability: 0.7 })
        ? creatorWebsite(username)
        : undefined,
      phone: frenchPhone(),
      country: "FR",
      address: userAddress(city),
      followers: 0,
      acceptedAt: faker.date.past({ years: 1 }),
      emailVerified: true,
      deleted: false,
      preferences: { emailNotifications: false },
      city,
      archetype: params.archetype,
    };
  };

  DEMO_ACCOUNTS.forEach((demo, index) => {
    if (users.length >= creatorCount) {
      return;
    }
    const archetype = ARCHETYPES.find((item) => item.key === demo.archetypeKey);
    if (!archetype) {
      throw new Error(`Demo archetype introuvable: ${demo.archetypeKey}`);
    }
    users.push(
      buildCreator({
        email: `${demo.emailLocalPart}@${SEED_EMAIL_DOMAIN}`,
        archetype,
        nameIndex: demo.nameIndex,
        index: index + 1,
      })
    );
  });

  let creatorIndex = users.length;
  while (users.length < creatorCount) {
    creatorIndex += 1;
    const archetype = ARCHETYPES[users.length % ARCHETYPES.length];
    users.push(
      buildCreator({
        email: `seed${creatorIndex}@${SEED_EMAIL_DOMAIN}`,
        archetype,
        nameIndex: creatorIndex,
        index: creatorIndex,
      })
    );
  }

  for (let i = 0; i < guestCount; i += 1) {
    const city = pickCity();
    const firstname = faker.person.firstName();
    const lastname = faker.person.lastName();
    const n = creatorCount + i + 1;
    users.push({
      _id: new Types.ObjectId(),
      email: `seed${n}@${SEED_EMAIL_DOMAIN}`,
      password: passwordHash,
      firstname,
      lastname,
      username: uniqueUsername(guestUsername(firstname, lastname, n)),
      userType: "guest",
      role: "user",
      description: clipDescription(
        faker.helpers.arrayElement(GUEST_DESCRIPTIONS)
      ),
      phone: frenchPhone(),
      country: "FR",
      address: userAddress(city),
      followers: 0,
      interests: pickInterests(categories, faker.number.int({ min: 2, max: 6 })),
      acceptedAt: faker.date.past({ years: 1 }),
      emailVerified: true,
      deleted: false,
      preferences: { emailNotifications: false },
      city,
    });
  }

  const creators = users.filter((user) => user.userType === "creator");
  const placeTarget = Math.round(creators.length * PLACE_RATIO_AMONG_CREATORS);
  let assigned = 0;
  for (const creator of creators) {
    if (!creator.archetype?.placeCategory) {
      continue;
    }
    if (assigned >= placeTarget) {
      break;
    }
    assigned += 1;
    creator.place = new Types.ObjectId();
  }

  return users;
}

export function creatorsWithPlace(users: SeedUserDoc[]): SeedUserDoc[] {
  return users.filter((user) => user.userType === "creator" && user.place);
}

export function creatorUsers(users: SeedUserDoc[]): SeedUserDoc[] {
  return users.filter((user) => user.userType === "creator");
}

export function guestUsers(users: SeedUserDoc[]): SeedUserDoc[] {
  return users.filter((user) => user.userType === "guest");
}
