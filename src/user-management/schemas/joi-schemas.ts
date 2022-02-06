import * as Joi from '@hapi/joi';
import {
  passwordErrMessage, passwordSchema, phoneNumberSchema
} from '../../common/validators';
import { userRoles, userStatuses } from '../enums';

export const userManagementValidationSchema = Joi.object().keys({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string()
    .email()
    .required(),
  phoneNumber: phoneNumberSchema
    .required()
    .error(new Error('Invalid phone number provided.')),
  lastLoginAt: Joi.date().timestamp(),
  password: passwordSchema.error(new Error(passwordErrMessage)),
  role: Joi.string().required(),
  projectIds: Joi.array().items(Joi.string()),
  status: Joi.string().valid(...userStatuses),
  therapistId: Joi.string().when('role', {
    is: userRoles[2],
    then: Joi.required(),
  }),
  meetingLink: Joi.string(),
});

export const globalSearch = Joi.object().keys({
  q: Joi.string().required()
})

export const createSearchEntry = Joi.object().keys({
  keyword: Joi.string().required()
})

export const getUsersValidationSchema = Joi.object().keys({
  search: Joi.string(),
  page: Joi.number(),
  size: Joi.number(),
  role: Joi.string()
    .valid(...userRoles)
    .error(new Error('Invalid role provided.')),
  status: Joi.string().valid(...userStatuses),
  orderBy: Joi.string().valid('asc', 'desc'),
  sortBy: Joi.string().valid('firstName'),
  therapistId: Joi.string(),
});

export const updateUserByIdSchema = Joi.object().keys({
  firstName: Joi.string(),
  lastName: Joi.string(),
  profileImage: Joi.string().allow(null),
  status: Joi.string().valid(...userStatuses),
  meetingLink: Joi.string(),
  designation: Joi.string().max(255),
  hospitalName: Joi.string().max(255),
  hospitalAddress: Joi.string().max(255),
  age: Joi.number()
    .min(18)
    .max(120),
  nickname: Joi.string(),
});

export const updateUserShippingAddressSchema = Joi.object().keys({
  // eslint-disable-next-line @typescript-eslint/camelcase
  line_1: Joi.string().required(),
  // eslint-disable-next-line @typescript-eslint/camelcase
  line_2: Joi.string(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipCode: Joi.string().required(),
});

export const updateUserIntrosSchema = Joi.object().keys({
  profileIntro: Joi.string(),
  groupIntro: Joi.string(),
});

export const insertOneUserSchema = Joi.object().keys({
  firstName: Joi.string().required(),
  lastName: Joi.string(),
  email: Joi.string()
    .email()
    .required(),
  phoneNumber: phoneNumberSchema
    .required()
    .error(new Error('Invalid phone number provided.')),
  role: Joi.string().required(),
  password: passwordSchema.error(new Error(passwordErrMessage)),
  profileImage: Joi.string(),
});

export const progressOnboard = Joi.object().keys({
  step: Joi.string().required().invalid('init'),
  data: Joi.object()
})
