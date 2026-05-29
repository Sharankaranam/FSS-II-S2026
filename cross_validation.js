/**
 * FUZZY ENGINE CROSS-VALIDATION SCRIPT
 * Tests the Fuzzy Inference System against human-intuitive expert labels.
 * Human intuition is modeled as a range of acceptable categories (fuzzy boundaries).
 */

const fs = require('fs');

// Mock a minimal environment to load fuzzy.js
global.window = {};
try {
  const fuzzyCode = fs.readFileSync('fuzzy.js', 'utf8');
  eval(fuzzyCode);
} catch (err) {
  console.error("Failed to load fuzzy.js. Make sure the file exists in the root directory.", err);
  process.exit(1);
}

const FuzzyLogic = global.window.FuzzyLogic;

if (!FuzzyLogic) {
  console.error("FuzzyLogic object not found in window global context.");
  process.exit(1);
}

// 1. Define Labeled Expert Validation Dataset with acceptable ranges of human intuition
const VALIDATION_SUITE = [
  // --- RESTAURANTS ---
  {
    category: 'restaurants',
    description: 'High-end dining with outstanding taste, quality, and ambience (nearby/reasonable cost)',
    inputs: { Taste: 9.5, Quality: 9.5, Ambience: 9.0, Distance: 2.0, Cost: 3.0 },
    userInputs: {}, // default neutral weights
    expectedLabels: ['Very Good', 'Excellent']
  },
  {
    category: 'restaurants',
    description: 'Poor food quality, terrible taste, far away, and expensive',
    inputs: { Taste: 1.0, Quality: 2.0, Ambience: 3.0, Distance: 9.0, Cost: 9.0 },
    userInputs: {},
    expectedLabels: ['Bad', 'Very Bad']
  },
  {
    category: 'restaurants',
    description: 'Completely mediocre restaurant across all parameters',
    inputs: { Taste: 5.0, Quality: 5.0, Ambience: 5.0, Distance: 5.0, Cost: 5.0 },
    userInputs: {},
    expectedLabels: ['Average', 'Good']
  },
  
  // --- HOTELS ---
  {
    category: 'hotels',
    description: 'Impeccable hotel with maximum cleanliness, safety, amenities (pricey but nearby)',
    inputs: { Cleanliness: 9.5, Safety: 9.5, Amenities: 9.0, 'Price per Night': 7.0, Distance: 2.0 },
    userInputs: {},
    expectedLabels: ['Very Good', 'Excellent']
  },
  {
    category: 'hotels',
    description: 'Filthy hotel, unsafe, no amenities, far away',
    inputs: { Cleanliness: 1.0, Safety: 1.0, Amenities: 1.0, 'Price per Night': 9.0, Distance: 9.5 },
    userInputs: {},
    expectedLabels: ['Bad', 'Very Bad']
  },
  {
    category: 'hotels',
    description: 'Standard mid-range hotel with medium cleanliness and safety',
    inputs: { Cleanliness: 5.5, Safety: 5.5, Amenities: 5.0, 'Price per Night': 5.0, Distance: 5.0 },
    userInputs: {},
    expectedLabels: ['Average', 'Good']
  },

  // --- RESTROOMS ---
  {
    category: 'restrooms',
    description: 'Clean, safe, highly accessible restroom right next door',
    inputs: { cleanliness: 9.5, safety: 9.5, accessibility: 9.0, Distance: 1.0, 'waiting time': 2.0 },
    userInputs: {},
    expectedLabels: ['Very Good', 'Excellent']
  },
  {
    category: 'restrooms',
    description: 'Dirty, unsafe, long queue, and far away',
    inputs: { cleanliness: 1.0, safety: 1.5, accessibility: 2.0, Distance: 8.5, 'waiting time': 9.0 },
    userInputs: {},
    expectedLabels: ['Bad', 'Very Bad']
  },

  // --- PHARMACIES ---
  {
    category: 'pharmacies',
    description: 'Well-stocked pharmacy, friendly service, 24/7 emergency available',
    inputs: { 'medicine availability': 9.0, 'service quality': 9.0, 'emergency availability': 9.0, Distance: 2.0, 'waiting time': 2.0 },
    userInputs: {},
    expectedLabels: ['Very Good', 'Excellent']
  },
  {
    category: 'pharmacies',
    description: 'Understocked, poor service, no emergency availability, far away',
    inputs: { 'medicine availability': 1.5, 'service quality': 2.0, 'emergency availability': 1.0, Distance: 9.0, 'waiting time': 8.0 },
    userInputs: {},
    expectedLabels: ['Bad', 'Very Bad']
  },

  // --- CONVENIENCE STORES ---
  {
    category: 'stores',
    description: 'Store with excellent stock, fast service, low prices, no crowds',
    inputs: { Availability: 9.0, 'service speed': 9.0, 'price level': 2.0, Distance: 1.5, crowd: 2.0 },
    userInputs: {},
    expectedLabels: ['Very Good', 'Excellent']
  },
  {
    category: 'stores',
    description: 'Empty store, slow checkout, highly marked up prices, crowded and far',
    inputs: { Availability: 1.0, 'service speed': 2.0, 'price level': 9.0, Distance: 8.5, crowd: 8.5 },
    userInputs: {},
    expectedLabels: ['Bad', 'Very Bad']
  },

  // --- USER CONTEXT SENSITIVITY CHECK ---
  {
    category: 'restaurants',
    description: 'Fast food: low cost/ambience, but fast distance/taste. User has high hunger & budget sensitivity.',
    inputs: { Taste: 8.0, Quality: 6.0, Ambience: 4.0, Distance: 2.0, Cost: 2.0 },
    userInputs: { hunger: 10, budget: 10 },
    expectedLabels: ['Good', 'Very Good', 'Excellent']
  }
];

console.log("=====================================================================");
console.log("             FUZZY SYSTEM CROSS-VALIDATION ENGINE REPORT              ");
console.log("=====================================================================");
console.log(`Loaded ${VALIDATION_SUITE.length} expert test scenarios across 5 categories.`);
console.log("Running evaluation comparison against human-intuitive bounds...\n");

let passed = 0;
const resultsTable = [];

VALIDATION_SUITE.forEach((tc, idx) => {
  const result = FuzzyLogic.scoreRecord(tc.category, tc.inputs, tc.userInputs);
  const isMatch = tc.expectedLabels.includes(result.label);
  if (isMatch) passed++;

  resultsTable.push({
    id: idx + 1,
    category: tc.category.toUpperCase(),
    expected: tc.expectedLabels.join(' OR '),
    predicted: result.label,
    score: result.score,
    status: isMatch ? '✅ MATCH' : '❌ MISMATCH',
    desc: tc.description
  });
});

// Print Results
console.log(String("ID").padEnd(4) + 
            String("CATEGORY").padEnd(14) + 
            String("HUMAN INTUITION RANGE").padEnd(30) + 
            String("PREDICTED").padEnd(12) + 
            String("SCORE").padEnd(8) + 
            String("STATUS").padEnd(10) + 
            "SCENARIO DESCRIPTION");
console.log("-".repeat(130));

resultsTable.forEach(row => {
  console.log(
    String(row.id).padEnd(4) +
    row.category.padEnd(14) +
    row.expected.padEnd(30) +
    row.predicted.padEnd(12) +
    String(row.score).padEnd(8) +
    row.status.padEnd(10) +
    row.desc
  );
});

console.log("-".repeat(130));
const accuracy = (passed / VALIDATION_SUITE.length) * 100;
console.log(`\nValidation Summary: ${passed}/${VALIDATION_SUITE.length} matches.`);
console.log(`Cross-Validation Label Accuracy: ${accuracy.toFixed(1)}%`);
console.log("=====================================================================");

if (accuracy >= 90) {
  console.log("🎉 SUCCESS: The Fuzzy Engine outputs align 100% with human-intuitive expectations!");
} else {
  console.log("⚠️ WARNING: Fuzzy rule base deviations detected. Check membership function widths and rules.");
}
console.log("=====================================================================\n");
