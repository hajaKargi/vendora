import Joi from "joi";

export const walletChallengeValidation = {
  body: Joi.object().keys({
    walletAddress: Joi.string().required().messages({
      'any.required': 'Wallet address is required',
    })
  }),
};

export const walletVerificationValidation = {
  body: Joi.object().keys({
    walletAddress: Joi.string().required().messages({
      'any.required': 'Wallet address is required',
    }),
    signature: Joi.string().required().messages({
      'any.required': 'Signature is required',
    })
  }),
};