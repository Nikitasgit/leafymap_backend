import "dotenv/config";
import mongoose from "mongoose";
import ProductCategory from "../models/ProductCategory";
import { Types } from "mongoose";

const CATEGORY_IDS = {
  art: new Types.ObjectId("695174672dbc3826b88fcc0f"),
  craft: new Types.ObjectId("695174672dbc3826b88fcc10"),
  food: new Types.ObjectId("695174672dbc3826b88fcc11"),
};

const PRODUCT_CATEGORIES = [
  { name: "chocolate", category: CATEGORY_IDS.food },
  { name: "honey", category: CATEGORY_IDS.food },
  { name: "jam", category: CATEGORY_IDS.food },
  { name: "bread", category: CATEGORY_IDS.food },
  { name: "cheese", category: CATEGORY_IDS.food },
  { name: "olive_oil", category: CATEGORY_IDS.food },
  { name: "pastry", category: CATEGORY_IDS.food },
  { name: "painting", category: CATEGORY_IDS.art },
  { name: "sculpture", category: CATEGORY_IDS.art },
  { name: "pottery", category: CATEGORY_IDS.art },
  { name: "jewelry", category: CATEGORY_IDS.art },
  { name: "photography", category: CATEGORY_IDS.art },
  { name: "print", category: CATEGORY_IDS.art },
  { name: "collage", category: CATEGORY_IDS.art },
  { name: "candle", category: CATEGORY_IDS.craft },
  { name: "soap", category: CATEGORY_IDS.craft },
  { name: "basket", category: CATEGORY_IDS.craft },
  { name: "leather", category: CATEGORY_IDS.craft },
  { name: "textile", category: CATEGORY_IDS.craft },
  { name: "woodwork", category: CATEGORY_IDS.craft },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI or MONGO_URI is not defined");
    }
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    const existingNames = await ProductCategory.find()
      .select("name")
      .lean();
    const existingSet = new Set(existingNames.map((c) => c.name));
    const toInsert = PRODUCT_CATEGORIES.filter((p) => !existingSet.has(p.name));

    if (toInsert.length === 0) {
      console.log("All 20 product categories already exist. Skipping insert.");
    } else {
      await ProductCategory.insertMany(toInsert);
      console.log(`Inserted ${toInsert.length} product categories.`);
    }

    const total = await ProductCategory.countDocuments();
    console.log(`Total product categories in DB: ${total}`);
    console.log("\nSeed product categories completed successfully.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

seed();
