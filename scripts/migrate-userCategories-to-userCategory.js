/**
 * Migration script: userCategories (array) -> userCategory (single ObjectId)
 *
 * Run with: mongosh <connection_string> <database_name> migrate-userCategories-to-userCategory.js
 * Or: node migrate-userCategories-to-userCategory.js (if using mongoose connection)
 *
 * Steps:
 * 1. Copy userCategories[0] to userCategory for users that have at least one category
 * 2. Remove the userCategories field from all users
 */

const migration = async (db) => {
  const users = db.collection("users");

  // Step 1: Set userCategory from first element of userCategories (for users that have at least one)
  const result1 = await users.updateMany(
    { "userCategories.0": { $exists: true } },
    [{ $set: { userCategory: { $arrayElemAt: ["$userCategories", 0] } } }]
  );
  console.log(
    `Step 1: Updated ${result1.modifiedCount} users with userCategory from userCategories[0]`
  );

  // Step 2: Remove userCategories field from all users
  const result2 = await users.updateMany(
    {},
    { $unset: { userCategories: "" } }
  );
  console.log(
    `Step 2: Removed userCategories field from ${result2.modifiedCount} users`
  );

  console.log("Migration completed successfully.");
};

// Support running directly with mongosh
if (typeof db !== "undefined") {
  migration(db);
} else {
  console.log(
    "Run this script with mongosh: mongosh <connection_string> <database_name> migrate-userCategories-to-userCategory.js"
  );
}
