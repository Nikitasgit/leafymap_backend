import "dotenv/config";
import mongoose from "mongoose";
import CategoryType from "../src/infrastructure/persistence/schemas/CategoryType.schema";
import UserCategory from "../src/infrastructure/persistence/schemas/UserCategory.schema";
import PlaceCategory from "../src/infrastructure/persistence/schemas/PlaceCategory.schema";
import ProductCategory from "../src/infrastructure/persistence/schemas/ProductCategory.schema";
import EventCategory from "../src/infrastructure/persistence/schemas/EventCategory.schema";

const categoryTypes = [
  { name: "art" },
  { name: "craft" },
  { name: "food" },
  { name: "organization" },
];

const userCategories = [
  { name: "weaver", typeName: "craft" },
  { name: "cabinetmaker", typeName: "craft" },
  { name: "blacksmith", typeName: "craft" },
  { name: "winemaker", typeName: "food" },
  { name: "organizer", typeName: "organization" },
  { name: "market_gardener", typeName: "food" },
  { name: "beekeeper", typeName: "food" },
  { name: "herbalist", typeName: "food" },
  { name: "farmer", typeName: "food" },
  { name: "fisher", typeName: "food" },
  { name: "livestock_breeder", typeName: "food" },
  { name: "printmaker", typeName: "art" },
  { name: "installation_artist", typeName: "art" },
  { name: "sound_artist", typeName: "art" },
  { name: "leatherworker", typeName: "craft" },
  { name: "basketmaker", typeName: "craft" },
  { name: "candlemaker", typeName: "craft" },
  { name: "dyer", typeName: "craft" },
  { name: "cheesemaker", typeName: "food" },
  { name: "brewer", typeName: "food" },
  { name: "baker", typeName: "food" },
  { name: "butcher", typeName: "food" },
  { name: "olive_oil_producer", typeName: "food" },
  { name: "spice_mixer", typeName: "food" },
  { name: "food_collective", typeName: "organization" },
  { name: "sculptor", typeName: "art" },
  { name: "illustrator", typeName: "art" },
  { name: "calligrapher", typeName: "art" },
  { name: "ceramic_artist", typeName: "art" },
  { name: "art_collective", typeName: "organization" },
  { name: "jeweler", typeName: "craft" },
  { name: "knife_maker", typeName: "craft" },
  { name: "instrument_maker", typeName: "craft" },
  { name: "shoemaker", typeName: "craft" },
  { name: "craft_collective", typeName: "organization" },
  { name: "chocolatier", typeName: "food" },
  { name: "fishmonger", typeName: "food" },
  { name: "food_organizer", typeName: "organization" },
  { name: "painter", typeName: "art" },
  { name: "photographer", typeName: "art" },
  { name: "muralist", typeName: "art" },
  { name: "mixed_media_artist", typeName: "art" },
  { name: "tailor", typeName: "craft" },
  { name: "embroiderer", typeName: "craft" },
  { name: "cooper", typeName: "craft" },
  { name: "coffee_roaster", typeName: "food" },
  { name: "digital_artist", typeName: "art" },
  { name: "glass_artist", typeName: "art" },
  { name: "performance_artist", typeName: "art" },
  { name: "textile_artist", typeName: "art" },
  { name: "wood_artist", typeName: "art" },
  { name: "potter", typeName: "craft" },
  { name: "soapmaker", typeName: "craft" },
  { name: "stonecarver", typeName: "craft" },
  { name: "metalworker", typeName: "craft" },
  { name: "toy_maker", typeName: "craft" },
  { name: "cider_maker", typeName: "food" },
  { name: "pastry_chef", typeName: "food" },
  { name: "tea_maker", typeName: "food" },
];

const placeCategories = [
  { name: "workshop", typeNames: ["art"] },
  { name: "gallery", typeNames: ["art"] },
  { name: "street_stand", typeNames: ["craft", "food"] },
  { name: "boutique", typeNames: ["craft"] },
  { name: "food_market", typeNames: ["food"] },
  { name: "cooperative_store", typeNames: ["craft", "food"] },
  { name: "festival", typeNames: ["art", "craft"] },
  { name: "craft_fair", typeNames: ["craft"] },
  { name: "cultural_center", typeNames: ["art", "craft"] },
  { name: "farm", typeNames: ["food"] },
  { name: "library", typeNames: ["art"] },
  { name: "tasting_room", typeNames: ["food"] },
  { name: "showroom", typeNames: ["art", "craft", "food"] },
  { name: "artist_studio", typeNames: ["art"] },
  { name: "farmers_market", typeNames: ["food"] },
  { name: "artisan_market", typeNames: ["art", "craft"] },
  { name: "cultural_fair", typeNames: ["art", "craft"] },
  { name: "comedy_club", typeNames: ["art"] },
  { name: "bar_restaurant", typeNames: ["food", "art"] },
  { name: "bar", typeNames: ["food", "art"] },
  { name: "hotel", typeNames: ["food", "art"] },
  { name: "restaurant", typeNames: ["food"] },
  { name: "music_venue", typeNames: ["art"] },
  { name: "theater", typeNames: ["art"] },
  { name: "museum", typeNames: ["art"] },
  { name: "cinema", typeNames: ["art"] },
  { name: "nightclub", typeNames: ["art", "food"] },
  { name: "brewery", typeNames: ["food", "art"] },
  { name: "conference_center", typeNames: ["art"] },
  { name: "community_center", typeNames: ["art", "craft"] },
  { name: "rooftop", typeNames: ["food", "art"] },
  { name: "pop_up_space", typeNames: ["art", "craft", "food"] },
];

const productCategories = [
  { name: "drawing", typeName: "art" },
  { name: "engraving", typeName: "art" },
  { name: "print", typeName: "art" },
  { name: "ceramic_artwork", typeName: "art" },
  { name: "glass_artwork", typeName: "art" },
  { name: "textile_artwork", typeName: "art" },
  { name: "mixed_media_artwork", typeName: "art" },
  { name: "illustration_print", typeName: "art" },
  { name: "mural", typeName: "art" },
  { name: "digital_artwork", typeName: "art" },
  { name: "pottery", typeName: "craft" },
  { name: "leather_goods", typeName: "craft" },
  { name: "jewelry", typeName: "craft" },
  { name: "basketry", typeName: "craft" },
  { name: "soap", typeName: "craft" },
  { name: "candle", typeName: "craft" },
  { name: "woodwork", typeName: "craft" },
  { name: "metalwork", typeName: "craft" },
  { name: "knife", typeName: "craft" },
  { name: "embroidered_item", typeName: "craft" },
  { name: "cheese", typeName: "food" },
  { name: "jam", typeName: "food" },
  { name: "bread", typeName: "food" },
  { name: "chocolate", typeName: "food" },
  { name: "beer", typeName: "food" },
  { name: "cider", typeName: "food" },
  { name: "olive_oil", typeName: "food" },
  { name: "spices", typeName: "food" },
  { name: "tea", typeName: "food" },
  { name: "coffee", typeName: "food" },
];

const eventCategories = [
  { name: "workshop" },
  { name: "exhibition" },
  { name: "market" },
  { name: "tasting" },
  { name: "concert" },
  { name: "festival" },
  { name: "conference" },
  { name: "performance" },
  { name: "meetup" },
  { name: "online_event" },
];

async function getCategoryTypeIdsByName(): Promise<Record<string, mongoose.Types.ObjectId>> {
  const idsByName: Record<string, mongoose.Types.ObjectId> = {};
  const types = await CategoryType.find().lean();

  for (const type of types) {
    idsByName[type.name] = type._id;
  }

  return idsByName;
}

function requireTypeId(
  idsByName: Record<string, mongoose.Types.ObjectId>,
  typeName: string,
  itemName: string
): mongoose.Types.ObjectId {
  const typeId = idsByName[typeName];

  if (!typeId) {
    throw new Error(`CategoryType introuvable pour ${itemName}: ${typeName}`);
  }

  return typeId;
}

async function seed() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");

  try {
    for (const categoryType of categoryTypes) {
      await CategoryType.updateOne(
        { name: categoryType.name },
        { $set: { name: categoryType.name } },
        { upsert: true }
      );
    }
    console.log(`Category types verifiees : ${categoryTypes.length}`);

    const categoryTypeIdsByName = await getCategoryTypeIdsByName();

    for (const userCategory of userCategories) {
      await UserCategory.updateOne(
        { name: userCategory.name },
        {
          $set: {
            name: userCategory.name,
            type: requireTypeId(
              categoryTypeIdsByName,
              userCategory.typeName,
              userCategory.name
            ),
          },
        },
        { upsert: true }
      );
    }
    console.log(`usercategories verifiees : ${userCategories.length}`);

    for (const placeCategory of placeCategories) {
      await PlaceCategory.updateOne(
        { name: placeCategory.name },
        {
          $set: {
            name: placeCategory.name,
            types: placeCategory.typeNames.map((typeName) =>
              requireTypeId(categoryTypeIdsByName, typeName, placeCategory.name)
            ),
          },
        },
        { upsert: true }
      );
    }
    console.log(`placecategories verifiees : ${placeCategories.length}`);

    for (const productCategory of productCategories) {
      await ProductCategory.updateOne(
        { name: productCategory.name },
        {
          $set: {
            name: productCategory.name,
            type: requireTypeId(
              categoryTypeIdsByName,
              productCategory.typeName,
              productCategory.name
            ),
          },
        },
        { upsert: true }
      );
    }
    console.log(`productcategories verifiees : ${productCategories.length}`);

    for (const eventCategory of eventCategories) {
      await EventCategory.updateOne(
        { name: eventCategory.name },
        { $set: { name: eventCategory.name } },
        { upsert: true }
      );
    }
    console.log(`eventcategories verifiees : ${eventCategories.length}`);

    console.log("Seed des categories termine.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

void seed();
