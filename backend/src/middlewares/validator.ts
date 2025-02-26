import Joi, { ObjectSchema } from "joi";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../core/api/ApiError";
import { pick } from "../utils/helpers/validation";

const validateRequest =
  (schema: object) => (req: Request, res: Response, next: NextFunction) => {
    const validSchema = pick(schema, ["body", "params", "query"]);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: "key" }, abortEarly: false })
      .validate(object);

    if (value.body?.stockType === "unlimited") {
      delete value.body.stockLimit;
    }

    if (error) {
      const errorMessage = error.details
        .map((details) => details.message)
        .join(", ");
      return next(new BadRequestError(errorMessage));
    }
    Object.assign(req, value);
    return next();
  };

export default validateRequest;
