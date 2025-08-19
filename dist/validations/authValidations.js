"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidationErrors = exports.validateLoginData = exports.validateRegisterData = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Schéma de validation pour l'inscription
exports.registerSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
        .max(30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères")
        .regex(/^[a-zA-Z0-9_-]+$/, "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores"),
    email: zod_1.z
        .string()
        .email("Veuillez entrer une adresse email valide")
        .min(1, "L'email est requis"),
    password: zod_1.z
        .string()
        .min(10, "Le mot de passe doit contenir au moins 10 caractères")
        .max(100, "Le mot de passe ne peut pas dépasser 100 caractères")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"),
});
// Schéma de validation pour la connexion
exports.loginSchema = zod_1.z.object({
    identifier: zod_1.z.string().min(1, "L'email ou nom d'utilisateur est requis"),
    password: zod_1.z.string().min(1, "Le mot de passe est requis"),
});
// Fonction utilitaire pour valider les données d'inscription
const validateRegisterData = (data) => {
    return exports.registerSchema.parse(data);
};
exports.validateRegisterData = validateRegisterData;
// Fonction utilitaire pour valider les données de connexion
const validateLoginData = (data) => {
    return exports.loginSchema.parse(data);
};
exports.validateLoginData = validateLoginData;
// Fonction pour obtenir les erreurs de validation formatées
const getValidationErrors = (error) => {
    const errors = {};
    error.errors.forEach((err) => {
        const field = err.path.join(".");
        errors[field] = err.message;
    });
    return errors;
};
exports.getValidationErrors = getValidationErrors;
