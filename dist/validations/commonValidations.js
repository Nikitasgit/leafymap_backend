"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressSchema = exports.descriptionSchema = exports.websiteSchema = exports.emailSchema = exports.phoneSchema = void 0;
const zod_1 = require("zod");
exports.phoneSchema = zod_1.z
    .string()
    .min(1, "Le téléphone est requis")
    .regex(/^[0-9]{10}$/, "Le numéro de téléphone doit contenir 10 chiffres");
exports.emailSchema = zod_1.z
    .string()
    .min(1, "L'email est requis")
    .email("L'email n'est pas valide");
exports.websiteSchema = zod_1.z
    .string()
    .optional()
    .refine((val) => {
    if (!val || val.trim() === "")
        return true;
    const urlToValidate = val.replace(/^https?:\/\//, "");
    if (urlToValidate.length < 3)
        return false;
    if (!urlToValidate.includes("."))
        return false;
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(urlToValidate))
        return false;
    try {
        let url = val;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }
        new URL(url);
        return true;
    }
    catch (_a) {
        return false;
    }
}, {
    message: "L'URL du site web n'est pas valide",
});
exports.descriptionSchema = zod_1.z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(300, "La description ne peut pas dépasser 300 caractères");
exports.addressSchema = zod_1.z.object({
    number: zod_1.z
        .string()
        .min(1, "Le numéro est requis, veuillez indiquer zéro si vous n'avez pas de numéro"),
    street: zod_1.z.string().min(2, "La rue doit contenir au moins 2 caractères"),
    code: zod_1.z.string().min(5, "Le code postal doit contenir au moins 5 caractères"),
    extra: zod_1.z.string().optional(),
});
