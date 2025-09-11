"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEventData = exports.eventNameSchema = void 0;
const zod_1 = require("zod");
const commonValidations_1 = require("./commonValidations");
exports.eventNameSchema = zod_1.z
    .string()
    .min(1, "Le nom est requis")
    .min(4, "Le nom doit contenir au moins 4 caractères")
    .max(40, "Le nom ne peut pas dépasser 40 caractères")
    .regex(/^[a-zA-ZÀ-ÿ0-9\s']+$/, "Le nom ne peut contenir que des lettres, chiffres, espaces et le caractère '");
const newEventSchema = zod_1.z.object({
    name: exports.eventNameSchema,
    description: commonValidations_1.descriptionSchema,
    image: zod_1.z.string().optional(),
    schedule: zod_1.z
        .array(zod_1.z.object({
        startDate: zod_1.z.string().transform((val) => new Date(val)),
        endDate: zod_1.z.string().transform((val) => new Date(val)),
        timeSlots: zod_1.z
            .array(zod_1.z.object({
            startTime: zod_1.z.string(),
            endTime: zod_1.z.string(),
            title: zod_1.z.string(),
            collaborators: zod_1.z.array(zod_1.z.object({
                _id: zod_1.z.string(),
                name: zod_1.z.string().optional(),
                image: zod_1.z.string().optional(),
            })),
        }))
            .optional(),
    }))
        .min(1, "Le programme doit contenir au moins une date"),
});
const updateEventSchema = newEventSchema.partial();
const validateEventData = (data, isUpdate = false) => {
    const errors = {};
    let eventSchema;
    if (isUpdate) {
        eventSchema = updateEventSchema;
    }
    else {
        eventSchema = newEventSchema;
    }
    const result = eventSchema.safeParse(data);
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
exports.validateEventData = validateEventData;
