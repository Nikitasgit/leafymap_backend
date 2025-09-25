"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNewUserData = exports.creatorNameSchema = void 0;
const zod_1 = require("zod");
const commonValidations_1 = require("./commonValidations");
exports.creatorNameSchema = zod_1.z
    .string()
    .min(1, "Le nom est requis")
    .min(4, "Le nom doit contenir au moins 4 caractères")
    .max(30, "Le nom ne peut pas dépasser 30 caractères")
    .regex(/^[a-zA-ZÀ-ÿ0-9\s']+$/, "Le nom ne peut contenir que des lettres, chiffres, espaces et le caractère '");
const creatorCategoriesSchema = zod_1.z
    .array(zod_1.z.string())
    .min(1, "Veuillez sélectionner une catégorie");
const newCreatorSchema = zod_1.z.object({
    userType: zod_1.z.literal("creator"),
    creatorName: exports.creatorNameSchema,
    creatorCategories: creatorCategoriesSchema,
    description: commonValidations_1.descriptionSchema,
    website: commonValidations_1.websiteSchema.optional(),
});
const newOrganizerSchema = zod_1.z.object({
    userType: zod_1.z.literal("organizer"),
});
const validateNewUserData = (data) => {
    const errors = {};
    let result;
    if (data.userType === "creator") {
        result = newCreatorSchema.safeParse(data);
    }
    else if (data.userType === "organizer") {
        result = newOrganizerSchema.safeParse(data);
    }
    if (result && !result.success) {
        result.error.errors.forEach((err) => {
            const field = err.path.join(".");
            errors[field] = err.message;
        });
    }
    return {
        errors,
        isValid: Object.keys(errors).length === 0,
    };
};
exports.validateNewUserData = validateNewUserData;
