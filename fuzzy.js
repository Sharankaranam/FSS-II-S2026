'use strict';

/**
 * FUZZY LOGIC ENGINE - Integrated Priority Engine Edition
 * Implements: User Need Sliders -> Priority Engine -> Service Scoring -> Results
 */

const CATEGORY_CONFIGS = {
  restaurants: {
    key: 'restaurants',
    label: 'Restaurants',
    parameters: ['Distance', 'Cost', 'Quality', 'Taste', 'Ambience'],
    baseWeights: { Distance: 0.15, Cost: 0.15, Quality: 0.25, Taste: 0.3, Ambience: 0.15 },
    levelScores: { L: 10, M: 60, H: 100 },
    rules: [
      "IF Taste=H AND Quality=H → 95",
      "IF Taste=H AND Quality=H AND Ambience=H → 95",
      "IF Quality=H AND Ambience=H → 90",
      "IF Taste=H AND Ambience=H → 90",
      "IF Distance=L AND Taste=H AND Quality=H → 90",
      "IF Cost=L AND Quality=H AND Taste=H → 95",
      "IF Distance=L AND Cost=L AND Taste=H → 90",
      "IF Distance=L AND Cost=L AND Quality=H → 90",
      "IF Taste=H AND Quality=H AND Cost=M → 85",
      "IF Taste=H AND Quality=H AND Distance=M → 85",
      "IF Taste=H AND Ambience=M AND Quality=H → 85",
      "IF Distance=L AND Cost=M AND Taste=H → 85",
      "IF Taste=M AND Quality=H → 80",
      "IF Taste=H AND Quality=M → 80",
      "IF Taste=M AND Quality=M AND Ambience=H → 75",
      "IF Taste=H AND Quality=M AND Ambience=M → 75",
      "IF Cost=M AND Distance=M AND Taste=H → 75",
      "IF Distance=M AND Quality=H → 80",
      "IF Cost=M AND Quality=H → 80",
      "IF Taste=M AND Ambience=H → 75",
      "IF Quality=M AND Ambience=H → 75",
      "IF Distance=L AND Taste=M AND Quality=M → 75",
      "IF Cost=L AND Taste=M AND Quality=M → 75",
      "IF Distance=M AND Cost=L AND Taste=H → 80",
      "IF Distance=L AND Cost=M AND Quality=M → 75",
      "IF Taste=M AND Quality=M → 70",
      "IF Distance=M AND Cost=M → 70",
      "IF Cost=M AND Quality=M → 70",
      "IF Distance=M AND Taste=M → 70",
      "IF Ambience=M AND Taste=M → 70",
      "IF Ambience=M AND Quality=M → 70",
      "IF Distance=H AND Taste=M AND Quality=M → 65",
      "IF Cost=H AND Taste=M AND Quality=M → 65",
      "IF Distance=M AND Cost=H AND Quality=M → 65",
      "IF Distance=H AND Cost=M AND Taste=M → 65",
      "IF Distance=M AND Cost=M AND Ambience=M → 70",
      "IF Distance=M AND Quality=M AND Ambience=M → 70",
      "IF Cost=M AND Quality=M AND Ambience=M → 70",
      "IF Taste=L → 30",
      "IF Quality=L → 30",
      "IF Taste=L AND Quality=L → 10",
      "IF Distance=H AND Cost=H → 30",
      "IF Distance=H AND Taste=L → 20",
      "IF Cost=H AND Taste=L → 20",
      "IF Distance=H AND Quality=L → 20",
      "IF Cost=H AND Quality=L → 20",
      "IF Distance=H AND Cost=H AND Taste=L → 10",
      "IF Distance=H AND Cost=H AND Quality=L → 10",
      "IF Taste=L AND Ambience=L → 20",
      "IF Quality=L AND Ambience=L → 20"
    ]
  },
  hotels: {
    key: 'hotels',
    label: 'Hotels',
    parameters: ['Price per Night', 'Distance', 'Cleanliness', 'Safety', 'Amenities'],
    baseWeights: { 'Price per Night': 0.15, Distance: 0.1, Cleanliness: 0.25, Safety: 0.3, Amenities: 0.2 },
    levelScores: { L: 15, M: 65, H: 100 },
    rules: [
      "IF Cleanliness=H AND Safety=H AND Amenities=H → 100",
      "IF Cleanliness=H AND Safety=H → 90",
      "IF Price per Night=L AND Cleanliness=H AND Safety=H → 95",
      "IF Distance=L AND Cleanliness=H AND Safety=H → 90",
      "IF Cleanliness=M AND Safety=H AND Amenities=M → 75",
      "IF Price per Night=M AND Cleanliness=M → 70",
      "IF Distance=M AND Cleanliness=M AND Safety=M → 65",
      "IF Cleanliness=L → 20",
      "IF Safety=L → 15",
      "IF Price per Night=H AND Cleanliness=L → 10",
      "IF Distance=H AND Safety=L → 10",
      "IF Cleanliness=H AND Amenities=M → 80",
      "IF Safety=H AND Amenities=L → 60",
      "IF Price per Night=H AND Amenities=H → 75",
      "IF Cleanliness=H AND Distance=L AND Price per Night=H → 85",
      "IF Distance=L AND Price per Night=L AND Amenities=H → 95",
      "IF Distance=H AND Amenities=H AND Cleanliness=H → 85",
      "IF Safety=M AND Cleanliness=M AND Price per Night=L → 70",
      "IF Safety=H AND Distance=H AND Price per Night=M → 75",
      "IF Cleanliness=H AND Safety=H AND Distance=M → 85",
      "IF Amenities=L AND Cleanliness=L → 10",
      "IF Price per Night=H AND Safety=M AND Distance=M → 55",
      "IF Cleanliness=H AND Safety=M → 75",
      "IF Amenities=M AND Distance=L AND Cleanliness=M → 70",
      "IF Price per Night=L AND Cleanliness=H → 90",
      "IF Distance=M AND Distance=M AND Safety=H → 70",
      "IF Cleanliness=M AND Safety=M AND Amenities=M AND Distance=M → 60",
      "IF Distance=L AND Amenities=H AND Safety=H → 90",
      "IF Price per Night=L AND Cleanliness=L → 30",
      "IF Safety=H AND Cleanliness=H AND Price per Night=L AND Amenities=H → 100",
      "IF Distance=H AND Cleanliness=L AND Safety=L → 5",
      "IF Price per Night=M AND Distance=L AND Amenities=M → 65",
      "IF Cleanliness=M AND Safety=L → 35",
      "IF Safety=H AND Amenities=H → 85",
      "IF Price per Night=H AND Cleanliness=M AND Amenities=M → 60",
      "IF Cleanliness=H AND Distance=H → 75",
      "IF Distance=L AND Cleanliness=L → 25",
      "IF Distance=M AND Safety=M AND Price per Night=H → 50",
      "IF Amenities=H AND Cleanliness=M → 75",
      "IF Safety=H AND Distance=L AND Cleanliness=M → 80",
      "IF Price per Night=L AND Cleanliness=H AND Amenities=M → 85",
      "IF Cleanliness=L AND Distance=M → 15",
      "IF Safety=L AND Amenities=M → 20",
      "IF Distance=H AND Cleanliness=H AND Price per Night=L → 80",
      "IF Distance=L AND Safety=H AND Cleanliness=L → 40",
      "IF Price per Night=H AND Cleanliness=H AND Safety=H → 85",
      "IF Amenities=H AND Safety=H AND Distance=M → 85",
      "IF Distance=L AND Amenities=L → 60",
      "IF Cleanliness=M AND Distance=H AND Price per Night=M → 55",
      "IF Price per Night=L AND Amenities=H AND Distance=H → 75",
      "IF Safety=H AND Cleanliness=H AND Amenities=L → 65",
      "IF Distance=M AND Amenities=M AND Cleanliness=H → 80",
      "IF Price per Night=M AND Cleanliness=H AND Safety=H → 90"
    ]
  },
  pharmacies: {
    key: 'pharmacies',
    label: 'Pharmacies',
    parameters: ['Distance', 'medicine availability', 'waiting time', 'service quality', 'emergency availability'],
    baseWeights: { Distance: 0.1, 'medicine availability': 0.3, 'waiting time': 0.15, 'service quality': 0.2, 'emergency availability': 0.25 },
    levelScores: { L: 5, M: 60, H: 100 },
    rules: [
      "IF medicine availability=H AND service quality=H AND emergency availability=H → 100",
      "IF medicine availability=H AND service quality=H → 90",
      "IF Distance=L AND medicine availability=H → 95",
      "IF waiting time=L AND service quality=H → 85",
      "IF medicine availability=M AND service quality=M → 65",
      "IF waiting time=M AND emergency availability=M → 60",
      "IF Distance=M AND service quality=M → 65",
      "IF medicine availability=L → 20",
      "IF service quality=L → 25",
      "IF Distance=H AND medicine availability=L → 10",
      "IF waiting time=H AND service quality=L → 15",
      "IF emergency availability=H AND Distance=L → 95",
      "IF medicine availability=H AND emergency availability=H → 95",
      "IF medicine availability=L AND waiting time=H → 5",
      "IF service quality=H AND Distance=L AND waiting time=L → 95",
      "IF Distance=M AND medicine availability=H AND emergency availability=M → 80",
      "IF medicine availability=H AND waiting time=M → 80",
      "IF Distance=L AND medicine availability=M AND service quality=H → 85",
      "IF emergency availability=L AND medicine availability=L → 10",
      "IF service quality=M AND emergency availability=H → 75",
      "IF Distance=H AND medicine availability=H AND service quality=H → 85",
      "IF medicine availability=M AND emergency availability=L → 40",
      "IF waiting time=H AND emergency availability=H → 70",
      "IF Distance=L AND emergency availability=H AND service quality=M → 85",
      "IF medicine availability=H AND service quality=L → 50",
      "IF waiting time=M AND service quality=M AND Distance=M → 60",
      "IF emergency availability=H AND waiting time=L AND medicine availability=M → 85",
      "IF service quality=H AND emergency availability=H → 90",
      "IF Distance=M AND medicine availability=L → 15",
      "IF waiting time=L AND medicine availability=H AND service quality=H → 100",
      "IF Distance=H AND emergency availability=L → 20",
      "IF service quality=L AND emergency availability=L → 15",
      "IF medicine availability=M AND Distance=M → 60",
      "IF waiting time=M AND medicine availability=H → 75",
      "IF Distance=L AND service quality=H AND emergency availability=M → 85",
      "IF Distance=L AND waiting time=H → 60",
      "IF service quality=H AND Distance=H AND medicine availability=M → 75",
      "IF emergency availability=H AND Distance=M AND waiting time=M → 75",
      "IF medicine availability=H AND service quality=H AND Distance=M → 85",
      "IF waiting time=L AND emergency availability=M AND service quality=M → 70",
      "IF medicine availability=L AND service quality=L AND emergency availability=L → 5",
      "IF Distance=H AND medicine availability=H AND waiting time=L → 80",
      "IF service quality=H AND emergency availability=L → 60",
      "IF medicine availability=H AND waiting time=H → 65",
      "IF Distance=L AND medicine availability=L → 30",
      "IF waiting time=M AND service quality=H AND emergency availability=H → 90",
      "IF service quality=M AND medicine availability=H AND Distance=L → 85",
      "IF emergency availability=H AND medicine availability=L → 50",
      "IF waiting time=L AND Distance=M AND service quality=M → 70",
      "IF medicine availability=M AND service quality=H AND emergency availability=H → 90",
      "IF Distance=L AND emergency availability=M AND waiting time=L → 80",
      "IF service quality=H AND emergency availability=H AND Distance=H → 85"
    ]
  },
  stores: {
    key: 'stores',
    label: 'Convenience Stores',
    parameters: ['Distance', 'price level', 'Availability', 'crowd', 'service speed'],
    baseWeights: { Distance: 0.2, 'price level': 0.2, Availability: 0.25, crowd: 0.15, 'service speed': 0.2 },
    levelScores: { L: 20, M: 65, H: 100 },
    rules: [
      "IF Availability=H AND service speed=H AND price level=L → 100",
      "IF Availability=H AND service speed=H → 90",
      "IF Distance=L AND Availability=H → 95",
      "IF crowd=L AND service speed=H → 85",
      "IF Availability=M AND service speed=M → 65",
      "IF price level=M AND crowd=M → 60",
      "IF Distance=M AND service speed=M → 65",
      "IF Availability=L → 20",
      "IF service speed=L → 25",
      "IF Distance=H AND Availability=L → 10",
      "IF crowd=H AND service speed=L → 15",
      "IF Distance=L AND price level=L AND crowd=L → 95",
      "IF Availability=H AND distance=L AND crowd=H → 75",
      "IF price level=H AND Availability=H → 70",
      "IF crowd=L AND Availability=H AND Distance=M → 85",
      "IF service speed=H AND price level=L → 90",
      "IF Availability=L AND price level=H → 5",
      "IF crowd=H AND Distance=L AND Availability=M → 60",
      "IF Distance=H AND price level=L AND Availability=H → 80",
      "IF service speed=M AND crowd=M AND Availability=H → 75",
      "IF price level=M AND service speed=H AND distance=L → 85",
      "IF Availability=H AND crowd=M AND price level=M → 80",
      "IF Distance=L AND Availability=H AND service speed=L → 65",
      "IF crowd=L AND service speed=M AND price level=M → 70",
      "IF Availability=M AND Distance=M AND price level=M → 60",
      "IF price level=L AND service speed=H AND crowd=M → 80",
      "IF Availability=L AND crowd=H AND service speed=L → 5",
      "IF Distance=M AND price level=L AND Availability=M → 70",
      "IF crowd=L AND Availability=H AND Distance=L → 95",
      "IF service speed=H AND price level=L AND Distance=H → 75",
      "IF Availability=H AND crowd=H AND price level=H → 50",
      "IF Distance=L AND service speed=H AND price level=H → 70",
      "IF Availability=M AND Distance=L AND crowd=L → 80",
      "IF price level=M AND Availability=H AND Distance=M → 80",
      "IF crowd=M AND service speed=M AND Availability=M → 65",
      "IF Availability=H AND Distance=H AND crowd=L → 85",
      "IF price level=H AND Availability=M → 45",
      "IF Distance=M AND crowd=L AND service speed=H → 80",
      "IF Availability=H AND service speed=M AND crowd=M → 75",
      "IF price level=L AND crowd=H AND service speed=M → 60",
      "IF Distance=L AND Availability=M AND price level=M → 70",
      "IF Availability=M AND service speed=L AND price level=H → 30",
      "IF crowd=L AND service speed=H AND Availability=M → 75",
      "IF Distance=M AND service speed=H AND price level=M → 75",
      "IF Availability=H AND price level=H AND crowd=L → 75",
      "IF price level=L AND service speed=H AND Distance=L → 95",
      "IF Availability=L AND Distance=L → 25",
      "IF crowd=M AND Availability=H AND Distance=L → 85",
      "IF service speed=M AND price level=L AND crowd=M → 65",
      "IF Distance=H AND service speed=H AND Availability=H → 85",
      "IF Availability=M AND crowd=L AND price level=L → 85",
      "IF price level=M AND service speed=H AND Availability=H → 90"
    ]
  },
  restrooms: {
    key: 'restrooms',
    label: 'Restrooms',
    parameters: ['Distance', 'cleanliness', 'safety', 'waiting time', 'accessibility'],
    baseWeights: { Distance: 0.1, cleanliness: 0.3, safety: 0.25, 'waiting time': 0.15, accessibility: 0.2 },
    levelScores: { L: 0, M: 60, H: 100 },
    rules: [
      "IF cleanliness=H AND safety=H AND accessibility=H → 100",
      "IF cleanliness=H AND safety=H → 90",
      "IF accessibility=H AND cleanliness=H → 95",
      "IF Distance=L AND safety=H → 85",
      "IF cleanliness=M AND safety=M → 65",
      "IF waiting time=M AND cleanliness=M → 60",
      "IF accessibility=M AND cleanliness=M → 65",
      "IF cleanliness=L → 15",
      "IF safety=L → 10",
      "IF Distance=H AND cleanliness=L → 5",
      "IF waiting time=H AND safety=L → 10",
      "IF Distance=L AND cleanliness=H AND accessibility=H → 95",
      "IF cleanliness=H AND waiting time=L → 90",
      "IF safety=H AND cleanliness=H AND waiting time=L → 95",
      "IF accessibility=H AND safety=H AND Distance=M → 85",
      "IF cleanliness=H AND Distance=M AND waiting time=M → 80",
      "IF safety=M AND cleanliness=M AND accessibility=M → 65",
      "IF Distance=L AND waiting time=L AND cleanliness=M → 80",
      "IF safety=H AND Distance=L AND cleanliness=M → 80",
      "IF cleanliness=L AND accessibility=L → 5",
      "IF waiting time=H AND cleanliness=M AND safety=M → 50",
      "IF Distance=H AND cleanliness=H AND safety=H → 85",
      "IF accessibility=L AND safety=H AND cleanliness=H → 75",
      "IF cleanliness=H AND waiting time=H → 70",
      "IF safety=H AND cleanliness=M AND waiting time=M → 75",
      "IF Distance=M AND cleanliness=H AND accessibility=M → 80",
      "IF cleanliness=L AND safety=M → 20",
      "IF accessibility=M AND Distance=L AND cleanliness=M → 70",
      "IF waiting time=M AND accessibility=H AND cleanliness=H → 85",
      "IF safety=H AND Distance=M AND cleanliness=M → 70",
      "IF cleanliness=M AND waiting time=L AND safety=M → 75",
      "IF Distance=H AND cleanliness=M AND safety=H → 70",
      "IF accessibility=H AND cleanliness=L → 30",
      "IF safety=M AND waiting time=M AND accessibility=M → 60",
      "IF cleanliness=H AND safety=M AND accessibility=M → 80",
      "IF Distance=L AND safety=M AND cleanliness=H → 85",
      "IF accessibility=M AND safety=H AND cleanliness=H → 90",
      "IF waiting time=H AND cleanliness=L AND safety=L → 5",
      "IF Distance=M AND accessibility=M AND cleanliness=M → 60",
      "IF cleanliness=H AND Distance=M AND safety=H → 85",
      "IF safety=L AND cleanliness=L AND accessibility=L → 0",
      "IF waiting time=L AND safety=H AND accessibility=H → 90",
      "IF Distance=L AND cleanliness=L AND safety=H → 40",
      "IF cleanliness=M AND Distance=L AND accessibility=H → 80",
      "IF safety=H AND accessibility=H AND waiting time=M → 80",
      "IF cleanliness=H AND accessibility=H AND Distance=H → 85",
      "IF Distance=M AND waiting time=M AND cleanliness=M → 65",
      "IF safety=H AND cleanliness=H AND Distance=L AND waiting time=L → 100",
      "IF accessibility=L AND Distance=H AND cleanliness=M → 40",
      "IF waiting time=M AND safety=M AND cleanliness=M AND Distance=M → 60",
      "IF cleanliness=H AND safety=H AND accessibility=M → 85",
      "IF Distance=L AND cleanliness=H AND safety=H → 95"
    ]
  }
};

const LABELS = [
  { label: 'Very Bad', min: 0, max: 20, tone: 'very-bad' },
  { label: 'Bad', min: 21, max: 40, tone: 'bad' },
  { label: 'Average', min: 41, max: 60, tone: 'neutral' },
  { label: 'Good', min: 61, max: 75, tone: 'good' },
  { label: 'Very Good', min: 76, max: 90, tone: 'super' },
  { label: 'Excellent', min: 91, max: 100, tone: 'super' }
];

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

function membership(value) {
  const v = clamp(Number(value) || 0, 0, 10);
  return {
    L: Math.max(0, 1 - Math.abs(v - 0) / 5),
    M: Math.max(0, 1 - Math.abs(v - 5) / 5),
    H: Math.max(0, 1 - Math.abs(v - 10) / 5)
  };
}

/**
 * STEP 2: PRIORITY ENGINE
 * Adjusts weights based on the "Your current needs" sliders.
 */
function getDynamicWeights(categoryKey, userInputs = {}) {
  const config = CATEGORY_CONFIGS[categoryKey];
  let weights = { ...config.baseWeights };

  // Hunger boosts Taste/Quality in Restaurants and Availability in Stores
  if (userInputs.hunger) {
    const boost = 1 + (userInputs.hunger / 10);
    if (categoryKey === 'restaurants') {
      weights.Taste *= boost;
      weights.Quality *= boost;
    }
    if (categoryKey === 'stores') {
      weights.Availability *= boost;
    }
  }

  // Fatigue boosts Distance across all categories, and Amenities in Hotels
  if (userInputs.fatigue) {
    const boost = 1 + (userInputs.fatigue / 10);
    if (weights.Distance !== undefined) weights.Distance *= boost;
    if (categoryKey === 'hotels' && weights.Amenities !== undefined) weights.Amenities *= boost;
  }

  // Restroom Urgency significantly boosts Distance and Waiting Time for restrooms
  if (userInputs.restroom && categoryKey === 'restrooms') {
    const boost = 1 + (userInputs.restroom / 10);
    if (weights.Distance !== undefined) weights.Distance *= boost;
    if (weights['waiting time'] !== undefined) weights['waiting time'] *= boost;
  }

  // Hygiene Preference boosts any cleanliness and quality parameters
  if (userInputs.hygiene) {
    const boost = 1 + (userInputs.hygiene / 10);
    if (weights.Cleanliness !== undefined) weights.Cleanliness *= boost;
    if (weights.cleanliness !== undefined) weights.cleanliness *= boost;
    if (weights.Quality !== undefined) weights.Quality *= boost;
    if (weights['service quality'] !== undefined) weights['service quality'] *= boost;
  }

  // Budget Sensitivity boosts price/cost-related parameters
  if (userInputs.budget) {
    const boost = 1 + (userInputs.budget / 10);
    if (weights.Cost !== undefined) weights.Cost *= boost;
    if (weights['Price per Night'] !== undefined) weights['Price per Night'] *= boost;
    if (weights['price level'] !== undefined) weights['price level'] *= boost;
  }

  // Normalization: Ensure Sum of Weights = 1.0 (Fair Competition)
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  Object.keys(weights).forEach(k => weights[k] /= total);

  return weights;
}

function labelForScore(score) {
  const rounded = Math.round(score);
  return LABELS.find(l => rounded >= l.min && rounded <= l.max) || LABELS[0];
}

/**
 * STEP 3 & 4: SERVICE SCORING & AGGREGATION
 */
function scoreRecord(categoryKey, values, userInputs = {}) {
  const config = CATEGORY_CONFIGS[categoryKey];
  const dynamicWeights = getDynamicWeights(categoryKey, userInputs);

  let totalScore = 0;
  const parameters = [];
  const diagnosticRules = [];
  const paramMemberships = {};

  config.parameters.forEach((field) => {
    const dataKey = Object.keys(values).find(k => k.toLowerCase() === field.toLowerCase());
    const rawVal = clamp(Number(dataKey ? values[dataKey] : 0), 0, 10);
    const m = membership(rawVal);
    paramMemberships[field.toLowerCase()] = m;
    parameters.push({ name: field, score: rawVal, memberships: m });
  });

  let numerator = 0;
  let denominator = 0;

  if (config.rules && config.rules.length > 0) {
    config.rules.forEach(ruleStr => {
      let parts = ruleStr.replace(/^IF\s+/i, '').split('→');
      if (parts.length < 2) parts = ruleStr.replace(/^IF\s+/i, '').split('->');
      if (parts.length < 2) return;

      const conditionsStr = parts[0].trim();
      const outputVal = parseFloat(parts[1].trim());

      const conditions = conditionsStr.split(/\s+AND\s+/i);
      let baseStrength = 1.0;
      let totalDynamicWeight = 0;

      conditions.forEach(c => {
        let cParts = c.split('=');
        if (cParts.length !== 2) return;
        const field = cParts[0].trim().toLowerCase();
        const level = cParts[1].trim(); // H, M, L

        const mem = paramMemberships[field] ? paramMemberships[field][level] : 0;
        baseStrength = Math.min(baseStrength, mem);

        // Find correct case field for dynamic weights
        const weightField = Object.keys(dynamicWeights).find(k => k.toLowerCase() === field);
        if (weightField) {
          totalDynamicWeight += dynamicWeights[weightField];
        }
      });

      // Modulate rule strength by the sum of dynamic weights of its components
      const finalStrength = baseStrength * (totalDynamicWeight || 1);

      if (finalStrength > 0) {
        numerator += finalStrength * outputVal;
        denominator += finalStrength;

        diagnosticRules.push({
          raw: ruleStr,
          output: outputVal.toFixed(1),
          strength: finalStrength.toFixed(4)
        });
      }
    });
  }

  if (denominator > 0) {
    totalScore = numerator / denominator;
  } else {
    // Fallback if no rules matched
    totalScore = 0;
  }

  const roundedScore = Number(totalScore.toFixed(1));
  const labelResult = labelForScore(roundedScore);

  return {
    score: roundedScore,
    label: labelResult.label,
    labelTone: labelResult.tone,
    parameters,
    diagnostic: {
      activeRules: diagnosticRules.sort((a, b) => parseFloat(b.strength) - parseFloat(a.strength)),
      numerator: numerator,
      denominator: denominator
    }
  };
}

if (typeof window !== 'undefined') {
  window.FuzzyLogic = { CATEGORY_CONFIGS, LABELS, scoreRecord };
}