import * as Joi from '@hapi/joi';
import { userRoles } from 'src/user-management/enums';
import {
  passwordErrMessage, passwordSchema, phoneNumberSchema
} from '../../common/validators';


export const loginSchema = Joi.object()
  .keys({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string().required(),
    fcmToken: Joi.string(),
  })
  .required();

export const mobileLoginSchema = Joi.object()
  .keys({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string().required(),
    fcmToken: Joi.string(),
  })
  .required();

export const logoutSchema = Joi.object()
  .keys({
    fcmToken: Joi.string(),
  })
  .required();

export const signUpSchema = Joi.object()
  .keys({
    firstName: Joi.string().required(),
    lastName: Joi.string(),
    email: Joi.string()
      .email()
      .required(),
    // phoneNumber: phoneNumberSchema
    //   .required()
    //   .error(new Error('Invalid phone number provided.')),
    password: passwordSchema.required().error(new Error(passwordErrMessage)),
    role: Joi.string()
      .valid(...userRoles)
      .required()
      .error(new Error('Invalid role provided.')),
  })
  .required();

export const changePasswordSchema = Joi.object()
  .keys({
    currentPassword: Joi.string().required(),
    newPassword: passwordSchema.required().error(new Error(passwordErrMessage)),
  })
  .required();

export const forgotPasswordSchema = Joi.object()
  .keys({
    password: passwordSchema.required().error(new Error(passwordErrMessage)),
    token: Joi.string().required(),
  })
  .required();

export const forgotPasswordVerifySchema = Joi.object()
  .keys({
    email: Joi.string().required(),
  })
  .required();

export const otpVerifySchema = Joi.object()
  .keys({
    otp: Joi.number().required(),
    phoneNumber: phoneNumberSchema
      .required()
      .error(new Error('Invalid phone number provided.')),
  })
  .required();

export const resendOtpSchema = Joi.object()
  .keys({
    phoneNumber: phoneNumberSchema
      .required()
      .error(new Error('Invalid phone number provided.')),
  })
  .required();

export const setPasswordSchema = Joi.object()
  .keys({
    password: passwordSchema.required().error(new Error(passwordErrMessage)),
    token: Joi.string().required(),
  })
  .required();

export const verifyEmailSchema = Joi.object()
  .keys({
    email: Joi.string().required(),
    emailVerifyToken: Joi.string().required(),
  })
  .required();
