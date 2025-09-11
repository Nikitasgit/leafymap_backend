"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePlaceData = exports.placeTypeSchema = exports.locationSchema = exports.placeCategorySchema = exports.placeNameSchema = void 0;
const zod_1 = require("zod");
const commonValidations_1 = require("./commonValidations");
exports.placeNameSchema = zod_1.z
    .string()
    .min(1, "Le nom est requis")
    .min(4, "Le nom doit contenir au moins 4 caractères")
    .max(40, "Le nom ne peut pas dépasser 40 caractères")
    .regex(/^[a-zA-ZÀ-ÿ0-9\s']+$/, "Le nom ne peut contenir que des lettres, chiffres, espaces et le caractère '");
exports.placeCategorySchema = zod_1.z
    .string()
    .min(1, "La catégorie du lieu est requise");
exports.locationSchema = zod_1.z.object({
    id: zod_1.z.string(),
    label: zod_1.z.string(),
    coordinates: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]),
    type: zod_1.z.literal("Point"),
});
exports.placeTypeSchema = zod_1.z
    .array(zod_1.z.enum(["art", "food", "craft"]))
    .min(1, "Le type de lieu est requis");
const newPlaceSchema = zod_1.z.object({
    placeCategory: exports.placeCategorySchema,
    location: exports.locationSchema,
    active: zod_1.z.boolean(),
    name: exports.placeNameSchema,
});
const newOrganizerPlaceSchema = newPlaceSchema.extend({
    email: commonValidations_1.emailSchema,
    active: zod_1.z.literal(true),
    website: commonValidations_1.websiteSchema.optional(),
    phone: commonValidations_1.phoneSchema,
    placeType: exports.placeTypeSchema,
    description: commonValidations_1.descriptionSchema,
});
const updatePlaceSchema = newPlaceSchema.partial();
const updateOrganizerPlaceSchema = newOrganizerPlaceSchema.partial();
const validatePlaceData = (data, userType, isUpdate = false) => {
    const errors = {};
    let placeSchema;
    if (isUpdate) {
        placeSchema =
            userType === "organizer" ? updateOrganizerPlaceSchema : updatePlaceSchema;
    }
    else {
        placeSchema =
            userType === "organizer" ? newOrganizerPlaceSchema : newPlaceSchema;
    }
    const result = placeSchema.safeParse(data);
    if (!result.success) {
        result.error.errors.forEach((err) => {
            const field = err.path.join(".");
            errors[field] = err.message;
        });
    }
    if (!isUpdate && !data.location) {
        errors.location = "L'adresse du lieu est obligatoire";
    }
    return {
        errors,
        isValid: Object.keys(errors).length === 0,
    };
};
exports.validatePlaceData = validatePlaceData;
