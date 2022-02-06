export const vitalBarGraphIntensityBreakPoints = {
  sleep: [300],
  diet: [2],
  exercise: [60],
  smoke: [3],
  alcohol: [400],
  medicine: [60],
  steps: [4000],
};

export const vitalValueIntensityBreakPoints = {
  sleep: [300],
  diet: [2],
  exercise: [60],
  smoke: [3],
  alcohol: [400],
  medicine: [60],
  steps: [4000],
};

export const vitalImprintIntensityBreakPoints = {
  sleep: [0.8, 0.6],
  diet: [0.8, 0.6],
  exercise: [0.8, 0.6],
  smoke: [0.8, 0.6],
  alcohol: [0.8, 0.6],
  medicine: [0.8, 0.6],
  steps: [0.8, 0.6],
};

export const defaultAggregateMetric = {
  userId: '',
  steps: {
    current: 0,
    total: 0,
    imprints: 0,
    imprintIntensity: 0,
    currentIntensity: 0,
  },
  sleep: {
    current: 0,
    total: 0,
    imprints: 0,
    imprintIntensity: 0,
    currentIntensity: 0,
  },
  diet: {
    current: 0,
    total: 0,
    imprints: 0,
    imprintIntensity: 0,
    currentIntensity: 0,
  },
  exercise: {
    current: 0,
    total: 0,
    imprints: 0,
    imprintIntensity: 0,
    currentIntensity: 0,
  },
  smoke: {
    current: 0,
    total: 0,
    imprints: 0,
    imprintIntensity: 0,
    currentIntensity: 0,
  },
  alcohol: {
    current: 0,
    total: 0,
    imprints: 0,
    imprintIntensity: 0,
    currentIntensity: 0,
  },
  weight: {
    current: 0,
    total: 0,
    imprints: 0,
    imprintIntensity: 0,
    currentIntensity: 0,
  },
  bloodPressure: {
    current: 0,
    total: 0,
    imprints: 0,
    imprintIntensity: 0,
    currentIntensity: 0,
  },
  hb: {
    current: 0,
    total: 0,
    imprints: 0,
    imprintIntensity: 0,
    currentIntensity: 0,
  },
  glucose: {
    current: 0,
    total: 0,
    imprints: 0,
    imprintIntensity: 0,
    currentIntensity: 0,
  },
  medicine: {
    current: 0,
    total: 0,
    imprints: 0,
    imprintIntensity: 0,
    currentIntensity: 0,
  },
};

export const aggregateMetricVitalImprintMultiplier = {
  steps: 1,
  sleep: 1,
  diet: 4,
  exercise: 1,
  smoke: 1,
  alcohol: 1,
  weight: 1,
  bloodPressure: 1,
  hb: 1,
  glucose: 3,
  medicine: 1,
};
