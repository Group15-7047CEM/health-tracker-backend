import * as Joi from '@hapi/joi';

export const addWeightTracking = Joi.object().keys({
  trackedDate: Joi.string().required(),
  weight: Joi.number().required()
});

export const addWaterTracking = Joi.object().keys({
  trackedDate: Joi.string().required(),
  waterIntake: Joi.number().required()
});

export const addStepTracking = Joi.object().keys({
  trackedDate: Joi.string().required(),
  steps: Joi.number().required(),
  activityMins: Joi.number() 
});

export const addSleepTracking = Joi.object().keys({
  trackedDate: Joi.string().required(),
  sleepStartTime: Joi.date().required(),
  sleepEndTime: Joi.date().required()
});

export const addFoodTracking = Joi.object().keys({
  trackedDate: Joi.string().required(),
  food: Joi.string().required(),
  calories: Joi.number().required()
});

export const getWeightReadings = Joi.object().keys({
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
});

export const getWaterIntakeReadings = Joi.object().keys({
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
});

export const getStepReadings = Joi.object().keys({
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
});

export const getSleepReadings = Joi.object().keys({
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
});

export const getFoodReadings = Joi.object().keys({
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
});
