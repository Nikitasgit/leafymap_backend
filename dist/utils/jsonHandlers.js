"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJson = void 0;
const parseJson = (str, fallback) => {
    try {
        return str ? JSON.parse(str) : fallback;
    }
    catch (_a) {
        return fallback;
    }
};
exports.parseJson = parseJson;
