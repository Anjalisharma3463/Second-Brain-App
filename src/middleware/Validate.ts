import {z} from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
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
