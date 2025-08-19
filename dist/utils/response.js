"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIResponse = void 0;
const APIResponse = (response, data, message, status = 200) => {
    const responseData = {
        message,
        data,
    };
    response.status(status).json(responseData);
};
exports.APIResponse = APIResponse;
