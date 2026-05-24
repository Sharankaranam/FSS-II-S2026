'use strict';

const CATEGORY_CONFIGS = {
  restaurants: {
    key: 'restaurants',
    label: 'Restaurants',
    dataset: 'restaurents.csv',
    linkColumn: 'Links',
    parameters: ['Distance', 'Cost', 'Quality', 'Taste', 'Ambience'],
    weights: {
      Distance: 0.14,
      Cost: 0.16,
      Quality: 0.24,
      Taste: 0.26,
      Ambience: 0.2
    },
    rules: [
      { output: 96, conditions: [{ field: 'Taste', level: 'high' }, { field: 'Quality', level: 'high' }, { field: 'Ambience', level: 'high' }] },
      { output: 88, conditions: [{ field: 'Distance', level: 'high' }, { field: 'Cost', level: 'mediumOrHigh' }, { field: 'Taste', level: 'high' }] },
      { output: 74, conditions: [{ field: 'Quality', level: 'mediumOrHigh' }, { field: 'Taste', level: 'mediumOrHigh' }, { field: 'Ambience', level: 'mediumOrHigh' }] },
      { output: 52, conditions: [{ field: 'Cost', level: 'mediumOrHigh' }, { field: 'Distance', level: 'medium' }, { field: 'Taste', level: 'medium' }] },
      { output: 32, conditions: [{ field: 'Taste', level: 'low' }, { field: 'Quality', level: 'low' }] },
      { output: 18, conditions: [{ field: 'Distance', level: 'low' }, { field: 'Taste', level: 'low' }, { field: 'Ambience', level: 'low' }] }
    ]
  },
  hotels: {
    key: 'hotels',
    label: 'Hotels',
    dataset: 'hotels.csv',
    linkColumn: 'Links',
    parameters: ['Price per Night', 'Distance', 'Cleanliness', 'Safety', 'Amenities'],
    weights: {
      'Price per Night': 0.17,
      Distance: 0.14,
      Cleanliness: 0.25,
      Safety: 0.26,
      Amenities: 0.18
    },
    rules: [
      { output: 97, conditions: [{ field: 'Cleanliness', level: 'high' }, { field: 'Safety', level: 'high' }, { field: 'Amenities', level: 'mediumOrHigh' }] },
      { output: 86, conditions: [{ field: 'Price per Night', level: 'high' }, { field: 'Distance', level: 'mediumOrHigh' }, { field: 'Safety', level: 'high' }] },
      { output: 72, conditions: [{ field: 'Cleanliness', level: 'mediumOrHigh' }, { field: 'Safety', level: 'mediumOrHigh' }, { field: 'Amenities', level: 'medium' }] },
      { output: 50, conditions: [{ field: 'Price per Night', level: 'medium' }, { field: 'Amenities', level: 'medium' }] },
      { output: 30, conditions: [{ field: 'Cleanliness', level: 'low' }, { field: 'Safety', level: 'low' }] },
      { output: 14, conditions: [{ field: 'Distance', level: 'low' }, { field: 'Cleanliness', level: 'low' }, { field: 'Amenities', level: 'low' }] }
    ]
  },
  pharmacies: {
    key: 'pharmacies',
    label: 'Pharmacies',
    dataset: 'pharmacies.csv',
    linkColumn: 'Link',
    parameters: ['Distance', 'medicine availability', 'waiting time', 'service quality', 'emergency availability'],
    weights: {
      Distance: 0.14,
      'medicine availability': 0.28,
      'waiting time': 0.15,
      'service quality': 0.23,
      'emergency availability': 0.2
    },
    rules: [
      { output: 98, conditions: [{ field: 'medicine availability', level: 'high' }, { field: 'service quality', level: 'high' }, { field: 'emergency availability', level: 'mediumOrHigh' }] },
      { output: 87, conditions: [{ field: 'Distance', level: 'high' }, { field: 'waiting time', level: 'mediumOrHigh' }, { field: 'service quality', level: 'high' }] },
      { output: 73, conditions: [{ field: 'medicine availability', level: 'mediumOrHigh' }, { field: 'service quality', level: 'mediumOrHigh' }] },
      { output: 54, conditions: [{ field: 'waiting time', level: 'medium' }, { field: 'emergency availability', level: 'medium' }] },
      { output: 31, conditions: [{ field: 'medicine availability', level: 'low' }, { field: 'service quality', level: 'low' }] },
      { output: 16, conditions: [{ field: 'waiting time', level: 'low' }, { field: 'service quality', level: 'low' }, { field: 'emergency availability', level: 'low' }] }
    ]
  },
  stores: {
    key: 'stores',
    label: 'Convenience Stores',
    dataset: 'stores.csv',
    linkColumn: 'Link',
    parameters: ['Distance', 'price level', 'Availability', 'crowd', 'service speed'],
    weights: {
      Distance: 0.16,
      'price level': 0.19,
      Availability: 0.25,
      crowd: 0.16,
      'service speed': 0.24
    },
    rules: [
      { output: 95, conditions: [{ field: 'Availability', level: 'high' }, { field: 'service speed', level: 'high' }, { field: 'price level', level: 'high' }] },
      { output: 84, conditions: [{ field: 'Distance', level: 'high' }, { field: 'Availability', level: 'high' }, { field: 'crowd', level: 'mediumOrHigh' }] },
      { output: 70, conditions: [{ field: 'price level', level: 'mediumOrHigh' }, { field: 'Availability', level: 'mediumOrHigh' }, { field: 'service speed', level: 'medium' }] },
      { output: 51, conditions: [{ field: 'crowd', level: 'medium' }, { field: 'price level', level: 'medium' }] },
      { output: 29, conditions: [{ field: 'Availability', level: 'low' }, { field: 'service speed', level: 'low' }] },
      { output: 15, conditions: [{ field: 'Distance', level: 'low' }, { field: 'Availability', level: 'low' }, { field: 'crowd', level: 'low' }] }
    ]
  },
  restrooms: {
    key: 'restrooms',
    label: 'Restrooms',
    dataset: 'restrooms.csv',
    linkColumn: 'Link',
    parameters: ['Distance', 'cleanliness', 'safety', 'waiting time', 'accessibility', 'maintainence'],
    weights: {
      Distance: 0.12,
      cleanliness: 0.25,
      safety: 0.2,
      'waiting time': 0.13,
      accessibility: 0.15,
      maintainence: 0.15
    },
    rules: [
      { output: 97, conditions: [{ field: 'cleanliness', level: 'high' }, { field: 'safety', level: 'high' }, { field: 'maintainence', level: 'high' }] },
      { output: 86, conditions: [{ field: 'accessibility', level: 'high' }, { field: 'waiting time', level: 'mediumOrHigh' }, { field: 'Distance', level: 'high' }] },
      { output: 72, conditions: [{ field: 'cleanliness', level: 'mediumOrHigh' }, { field: 'safety', level: 'mediumOrHigh' }, { field: 'accessibility', level: 'mediumOrHigh' }] },
      { output: 53, conditions: [{ field: 'waiting time', level: 'medium' }, { field: 'maintainence', level: 'medium' }] },
      { output: 28, conditions: [{ field: 'cleanliness', level: 'low' }, { field: 'safety', level: 'low' }] },
      { output: 12, conditions: [{ field: 'cleanliness', level: 'low' }, { field: 'accessibility', level: 'low' }, { field: 'maintainence', level: 'low' }] }
    ]
  }
};

const LABELS = [
  { label: 'Very Bad', min: 0, max: 24.999, tone: 'very-bad' },
  { label: 'Bad', min: 25, max: 44.999, tone: 'bad' },
  { label: 'Neutral', min: 45, max: 64.999, tone: 'neutral' },
  { label: 'Good', min: 65, max: 84.999, tone: 'good' },
  { label: 'Super', min: 85, max: 100, tone: 'super' }
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function triangular(value, left, center, right) {
  if (value <= left || value >= right) {
    return 0;
  }
  if (value === center) {
    return 1;
  }
  if (value < center) {
    return (value - left) / (center - left);
  }
  return (right - value) / (right - center);
}

function trapezoidal(value, left, startTop, endTop, right) {
  if (value <= left || value >= right) {
    return 0;
  }
  if (value >= startTop && value <= endTop) {
    return 1;
  }
  if (value < startTop) {
    return (value - left) / (startTop - left);
  }
  return (right - value) / (right - endTop);
}

function membership(value) {
  const safeValue = clamp(Number(value) || 0, 0, 10);
  return {
    low: trapezoidal(safeValue, 0, 0, 3.5, 5.5),
    medium: triangular(safeValue, 3.5, 5.5, 7.5),
    high: trapezoidal(safeValue, 5.5, 7.5, 10, 10.0001)
  };
}

function evaluateCondition(levels, expectedLevel) {
  if (expectedLevel === 'mediumOrHigh') {
    return Math.max(levels.medium, levels.high);
  }
  return levels[expectedLevel] || 0;
}

function labelForScore(score) {
  return LABELS.find((item) => score >= item.min && score <= item.max) || LABELS[0];
}

function computeWeightedAverage(values, weights) {
  let totalWeight = 0;
  let weightedSum = 0;

  Object.entries(weights).forEach(([field, weight]) => {
    const numericValue = clamp(Number(values[field]) || 0, 0, 10);
    weightedSum += numericValue * weight;
    totalWeight += weight;
  });

  return totalWeight ? (weightedSum / totalWeight) * 10 : 0;
}

function evaluateRules(config, memberships) {
  const firedRules = config.rules
    .map((rule) => {
      const strength = Math.min(...rule.conditions.map((condition) => evaluateCondition(memberships[condition.field], condition.level)));

      return {
        output: rule.output,
        strength,
        conditions: rule.conditions
      };
    })
    .filter((rule) => rule.strength > 0);

  if (!firedRules.length) {
    return { crisp: 0, firedRules: [] };
  }

  const numerator = firedRules.reduce((sum, rule) => sum + (rule.output * rule.strength), 0);
  const denominator = firedRules.reduce((sum, rule) => sum + rule.strength, 0);

  return {
    crisp: numerator / denominator,
    firedRules
  };
}

function scoreRecord(categoryKey, values) {
  const config = CATEGORY_CONFIGS[categoryKey];
  if (!config) {
    throw new Error(`Unknown category: ${categoryKey}`);
  }

  const memberships = {};
  const parameters = config.parameters.map((field) => {
    const numericValue = clamp(Number(values[field]) || 0, 0, 10);
    const fuzzyLevels = membership(numericValue);
    memberships[field] = fuzzyLevels;

    return {
      name: field,
      score: Number(numericValue.toFixed(1)),
      weight: config.weights[field] || 0,
      memberships: {
        low: Number(fuzzyLevels.low.toFixed(3)),
        medium: Number(fuzzyLevels.medium.toFixed(3)),
        high: Number(fuzzyLevels.high.toFixed(3))
      }
    };
  });

  const weightedAverageScore = computeWeightedAverage(values, config.weights);
  const ruleEvaluation = evaluateRules(config, memberships);
  const crispScore = clamp((weightedAverageScore * 0.42) + (ruleEvaluation.crisp * 0.58), 0, 100);
  const roundedScore = Number(crispScore.toFixed(1));
  const label = labelForScore(roundedScore);

  return {
    score: roundedScore,
    label: label.label,
    labelTone: label.tone,
    weightedAverageScore: Number(weightedAverageScore.toFixed(1)),
    fuzzyScore: Number(ruleEvaluation.crisp.toFixed(1)),
    parameters,
    firedRules: ruleEvaluation.firedRules
      .sort((left, right) => right.strength - left.strength)
      .slice(0, 4)
      .map((rule, index) => ({
        id: `${categoryKey}-rule-${index + 1}`,
        strength: Number(rule.strength.toFixed(3)),
        output: rule.output,
        description: rule.conditions.map((condition) => `${condition.field} is ${condition.level}`).join(', ')
      }))
  };
}

module.exports = {
  CATEGORY_CONFIGS,
  scoreRecord
};
