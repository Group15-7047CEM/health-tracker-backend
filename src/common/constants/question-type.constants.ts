/* eslint-disable @typescript-eslint/camelcase */
export const QuestionTypeMeta = {
  multiple_choice: {
    logic_conditions: ['always', 'is', 'is_not'],
  },
  picture_choice: {
    logic_conditions: ['always', 'is', 'is_not'],
  },
  yes_no: {
    logic_conditions: ['always', 'is', 'is_not'],
  },
  dropdown: {
    logic_conditions: ['always', 'is', 'is_not'],
  },
  short_text: {
    logic_conditions: ['always', 'is_answered'],
  },
  long_text: {
    logic_conditions: ['always', 'is_answered'],
  },
  number: {
    logic_conditions: ['always', 'eq', 'not_eq', 'lt', 'gt', 'lte', 'gte'],
  },
  opinion_scale: {
    logic_conditions: ['always', 'eq', 'not_eq', 'lt', 'gt', 'lte', 'gte'],
  },
  date: {
    logic_conditions: [
      'always',
      'on',
      'not_on',
      'before_or_on',
      'before',
      'after_or_on',
      'after',
    ],
  },
  group: {},
};
