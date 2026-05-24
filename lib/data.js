'use strict';

const fs = require('fs');
const path = require('path');
const { parseCSV } = require('./csv');
const { CATEGORY_CONFIGS, scoreRecord } = require('./fuzzy');

const DATA_DIR = path.join(__dirname, '..', 'secondround');
const SUPPORTED_CITIES = ['Bern', 'Basel', 'Zurich', 'Geneva', 'Lausanne', 'Lucerne'];
const CACHE = {};

function titleCase(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function deriveCity(address) {
  const parts = String(address || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return titleCase(parts[parts.length - 2]);
  }

  return 'Unknown';
}

function normalizeRecord(categoryKey, row, index) {
  const config = CATEGORY_CONFIGS[categoryKey];
  const address = row.adress || row.address || 'Address not available';
  const city = deriveCity(address);
  const scoring = scoreRecord(categoryKey, row);
  const directionsLink = row[config.linkColumn] || row.Link || row.Links || '#';

  return {
    id: `${categoryKey}-${index + 1}`,
    category: categoryKey,
    categoryLabel: config.label,
    city,
    name: row.name || `${config.label} ${index + 1}`,
    address,
    directionsLink,
    distanceKm: Number(Number(row.distance_km || 0).toFixed(2)),
    score: scoring.score,
    label: scoring.label,
    labelTone: scoring.labelTone,
    weightedAverageScore: scoring.weightedAverageScore,
    fuzzyScore: scoring.fuzzyScore,
    parameters: scoring.parameters,
    firedRules: scoring.firedRules
  };
}

function loadCategory(categoryKey) {
  const config = CATEGORY_CONFIGS[categoryKey];
  const csvPath = path.join(DATA_DIR, config.dataset);
  const csvText = fs.readFileSync(csvPath, 'utf8');

  return parseCSV(csvText)
    .filter((row) => row.name)
    .map((row, index) => normalizeRecord(categoryKey, row, index));
}

function getCategoryData(categoryKey) {
  if (!CACHE[categoryKey]) {
    CACHE[categoryKey] = loadCategory(categoryKey);
  }
  return CACHE[categoryKey];
}

function getAllData() {
  return Object.keys(CATEGORY_CONFIGS).reduce((collection, key) => {
    collection[key] = getCategoryData(key);
    return collection;
  }, {});
}

function getMeta() {
  const allData = getAllData();

  const cities = SUPPORTED_CITIES.map((cityName) => {
    const total = Object.values(allData).reduce((sum, records) => sum + records.filter((record) => record.city === cityName).length, 0);
    return {
      name: cityName,
      available: total > 0,
      total
    };
  });

  const categories = Object.values(CATEGORY_CONFIGS).map((config) => ({
    key: config.key,
    label: config.label,
    parameters: config.parameters,
    total: getCategoryData(config.key).length
  }));

  return {
    cities,
    categories
  };
}

function filterAndSortPlaces(categoryKey, query) {
  let records = getCategoryData(categoryKey);

  if (query.city) {
    records = records.filter((record) => record.city.toLowerCase() === String(query.city).toLowerCase());
  }

  if (query.label && query.label !== 'All') {
    records = records.filter((record) => record.label === query.label);
  }

  const sorters = {
    score_desc: (left, right) => right.score - left.score,
    score_asc: (left, right) => left.score - right.score,
    name_asc: (left, right) => left.name.localeCompare(right.name),
    distance_asc: (left, right) => left.distanceKm - right.distanceKm
  };

  const sorter = sorters[query.sort] || sorters.score_desc;
  return [...records].sort(sorter);
}

function getPlace(categoryKey, id) {
  return getCategoryData(categoryKey).find((record) => record.id === id) || null;
}

module.exports = {
  CATEGORY_CONFIGS,
  getMeta,
  filterAndSortPlaces,
  getPlace
};
