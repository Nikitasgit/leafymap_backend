"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLocation = exports.parseJson = void 0;
const parseJson = (str, fallback) => {
    try {
        return str ? JSON.parse(str) : fallback;
    }
    catch (_a) {
        return fallback;
    }
};
exports.parseJson = parseJson;
const parseLocation = (location) => {
    try {
        const parsed = JSON.parse(location);
        if (!parsed.coordinates ||
            !Array.isArray(parsed.coordinates) ||
            parsed.coordinates.length !== 2 ||
            !parsed.label ||
            !parsed.id ||
            !parsed.type) {
            throw new Error("Invalid location fields");
        }
        return parsed;
    }
    catch (_a) {
        return null;
    }
};
exports.parseLocation = parseLocation;
