"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({
            message: "Validation error",
            errors: result.error.format(),
        });
        return;
    }
    req.body = result.data; // Ensure TypeScript knows this data is validated
    next();
};
exports.validate = validate;
