// Seed des categories LeafyMap (mongosh).
// Prefer: npm run seed:categories
// Manual: mongosh "mongodb://localhost:27017/leafymap" scripts/seed-categories.mongodb.js

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

function upsertByName(collectionName, item) {
  db[collectionName].updateOne(
    { name: item.name },
    { $set: item },
    { upsert: true }
  );
}

function getCategoryTypeIdsByName() {
  const idsByName = {};

  for (const type of db.categorytypes.find({}).toArray()) {
    idsByName[type.name] = type._id;
  }

  return idsByName;
}

function requireTypeId(idsByName, typeName, itemName) {
  const typeId = idsByName[typeName];

  if (!typeId) {
    throw new Error(`CategoryType introuvable pour ${itemName}: ${typeName}`);
  }

  return typeId;
}

function addCategoryTypes() {
  for (const categoryType of categoryTypes) {
    upsertByName("categorytypes", categoryType);
  }

  print(`Category types verifiees : ${categoryTypes.length}`);
}

function addTypedCategories(collectionName, categories, idsByName) {
  for (const category of categories) {
    upsertByName(collectionName, {
      name: category.name,
      type: requireTypeId(idsByName, category.typeName, category.name),
    });
  }

  print(`${collectionName} verifiees : ${categories.length}`);
}

function addPlaceCategories(idsByName) {
  for (const placeCategory of placeCategories) {
    upsertByName("placecategories", {
      name: placeCategory.name,
      types: placeCategory.typeNames.map((typeName) =>
        requireTypeId(idsByName, typeName, placeCategory.name)
      ),
    });
  }

  print(`placecategories verifiees : ${placeCategories.length}`);
}

function addEventCategories() {
  for (const eventCategory of eventCategories) {
    upsertByName("eventcategories", eventCategory);
  }

  print(`eventcategories verifiees : ${eventCategories.length}`);
}

addCategoryTypes();
const categoryTypeIdsByName = getCategoryTypeIdsByName();
addTypedCategories("usercategories", userCategories, categoryTypeIdsByName);
addPlaceCategories(categoryTypeIdsByName);
addTypedCategories("productcategories", productCategories, categoryTypeIdsByName);
addEventCategories();

print("Seed des categories termine.");
