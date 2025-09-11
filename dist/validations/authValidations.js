"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLoginData = exports.validateRegisterData = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const commonValidations_1 = require("./commonValidations");
exports.registerSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
        .max(30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères")
        .regex(/^[a-zA-Z0-9_-]+$/, "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores"),
    email: commonValidations_1.emailSchema,
    password: zod_1.z
        .string()
        .min(10, "Le mot de passe doit contenir au moins 10 caractères")
        .max(100, "Le mot de passe ne peut pas dépasser 100 caractères")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"),
});
const identifierSchema = zod_1.z
    .string()
    .min(1, "L'identifiant est requis")
    .refine((val) => {
    const emailResult = commonValidations_1.emailSchema.safeParse(val);
    if (emailResult.success)
        return true;
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(val);
}, {
    message: "L'identifiant doit être un email valide ou un nom d'utilisateur valide (3-30 caractères, lettres, chiffres, tirets et underscores uniquement)",
});
exports.loginSchema = zod_1.z.object({
    identifier: identifierSchema,
    password: zod_1.z.string().min(1, "Le mot de passe est requis"),
});
const validateRegisterData = (data) => {
    const errors = {};
    const result = exports.registerSchema.safeParse(data);
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
exports.validateRegisterData = validateRegisterData;
const validateLoginData = (data) => {
    const errors = {};
    const result = exports.loginSchema.safeParse(data);
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
exports.validateLoginData = validateLoginData;
