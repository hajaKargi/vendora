import Joi from "joi";

export const registerValidation = {
  body: Joi.object().keys({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(8).required().messages({
      "string.min": "Password must be at least 8 characters long",
      "any.required": "Password is required",
    }),
    firstName: Joi.string().required().messages({
      "any.required": "First name is required",
    }),
    lastName: Joi.string().required().messages({
      "any.required": "Last name is required",
    }),
    walletAddress: Joi.string().required().messages({
      "any.required": "Wallet address is required",
    }),
  }),
};

export const loginValidation = {
  body: Joi.object().keys({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
    deviceToken: Joi.string().optional(),
    appVersion: Joi.string().optional(),
  }),
};

export const verifyEmailValidation = {
  query: Joi.object().keys({
    token: Joi.string().required().messages({
      "any.required": "Verification token is required",
    }),
  }),
};

export const forgotPasswordValidation = {
  body: Joi.object().keys({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  }),
};

export const resetPasswordValidation = {
  body: Joi.object().keys({
    token: Joi.string().required().messages({
      "any.required": "Reset token is required",
    }),
    newPassword: Joi.string().min(8).required().messages({
      "string.min": "Password must be at least 8 characters long",
      "any.required": "New password is required",
    }),
  }),
};

export const verifyWalletValidation = {
  body: Joi.object().keys({
    walletAddress: Joi.string().required().messages({
      "any.required": "Wallet address is required",
    }),
    signature: Joi.string().required().messages({
      "any.required": "Signature is required",
    }),
  }),
};
