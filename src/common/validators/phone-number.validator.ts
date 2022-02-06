import * as Joi from '@hapi/joi';

export const phoneNumberSchema = Joi.string().pattern(
  /^(\+?\d{1,3}[- ]?)?\d{8,10}$/,
);
