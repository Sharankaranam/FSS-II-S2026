const state = {
  selectedCity: null,
  selectedCategory: null,
  filters: { sort: 'score_desc', label: 'All' },
  userInputs: { hunger: 5, fatigue: 5, restroom: 5, hygiene: 5, budget: 5, stay: 5 },
  meta: null,
  placesByCategory: null
};

const SUPPORTED_CITIES = ['Bern', 'Basel', 'Zurich', 'Geneva', 'Lausanne', 'Lucerne'];
const serviceHighlights = ['Restaurants', 'Hotels', 'Restrooms', 'Convenience Stores', 'Pharmacies'];
const cityDescriptions = {
  Bern: 'Live data is available from your uploaded CSV files, so Bern already supports full fuzzy scoring and detail views.',
  Basel: 'The interface is ready for Basel. Add Basel rows to the CSV datasets and the city will automatically go live.',
  Zurich: 'Zurich is scaffolded in the UI and waiting for matching uploaded data rows.',
  Geneva: 'Geneva is included in the platform flow so your project can scale without redesign.',
  Lausanne: 'Lausanne is ready for future dataset growth and will appear dynamically once CSV entries exist.',
  Lucerne: 'Lucerne is available as a city option and can be activated immediately by adding dataset rows.'
};
const categoryDescriptions = {
  restaurants: 'Distance, cost, quality, taste, and ambience are combined through a restaurant-specific fuzzy rule base.',
  hotels: 'Price, distance, cleanliness, safety, and amenities are fused into a hotel sustainability score.',
  pharmacies: 'Distance, medicine availability, waiting time, service quality, and emergency availability drive the fuzzy result.',
  stores: 'Distance, price level, availability, crowd conditions, and service speed are evaluated together.',
  restrooms: 'Distance, cleanliness, safety, waiting time, accessibility, and maintenance determine restroom sustainability.'
};

const app = document.getElementById('app');
const backButton = document.getElementById('back-button');

function titleCase(value) {
  return String(value || '').toLowerCase().replace(/\b\w/g, (match) => match.toUpperCase());
}

function deriveCity(address) {
  const parts = String(address || '').split(',').map((part) => part.trim()).filter(Boolean);
  return parts.length >= 2 ? titleCase(parts[parts.length - 2]) : 'Unknown';
}

function extractCoordinates(link) {
  const match = String(link || '').match(/q=([-0-9.]+),([-0-9.]+)/i);
  return match ? { lat: Number(match[1]), lng: Number(match[2]) } : null;
}

function explainRuleLead(parameters) {
  const best = parameters.slice().sort((left, right) => right.score - left.score).slice(0, 3);
  return best.map((item) => `${item.name.toLowerCase()} is strong`).join(', ');
}

function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(l => l.trim().length > 0);
  if (!lines.length) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const rowObj = {};
    let currentWord = '';
    let inQuotes = false;
    let colIndex = 0;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        if (headers[colIndex]) rowObj[headers[colIndex]] = currentWord.trim();
        currentWord = '';
        colIndex++;
      } else {
        currentWord += char;
      }
    }
    if (headers[colIndex]) rowObj[headers[colIndex]] = currentWord.trim();
    return rowObj;
  });
}

async function fetchAndParseCSV(filename) {
  try {
    const res = await fetch('./' + filename);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    return parseCSV(text);
  } catch (err) {
    const embeddedData = window.EMBEDDED_CSV_DATA && window.EMBEDDED_CSV_DATA[filename];
    if (embeddedData) {
      console.warn("Fetch failed for", filename, "using embedded fallback data instead.", err);
      return parseCSV(embeddedData);
    }
    console.warn("Could not fetch", filename, err);
    return [];
  }
}

async function buildDataModel() {
  const categoryMap = {};
  const fileMap = {
    restaurants: 'restaurents.csv',
    hotels: 'hotels.csv',
    pharmacies: 'pharmacies.csv',
    stores: 'stores.csv',
    restrooms: 'restrooms.csv'
  };

  for (const categoryKey of Object.keys(window.FuzzyLogic.CATEGORY_CONFIGS)) {
    const filename = fileMap[categoryKey];
    if (filename) {
      const data = await fetchAndParseCSV(filename);
      const config = window.FuzzyLogic.CATEGORY_CONFIGS[categoryKey];
      categoryMap[categoryKey] = data.map((row, index) => {
        // STEP 2: Pass state.userInputs to the dynamic Priority Engine
        const scoring = window.FuzzyLogic.scoreRecord(categoryKey, row, state.userInputs);
        return {
          id: `${categoryKey}-${index + 1}`,
          category: categoryKey,
          categoryLabel: config.label,
          city: deriveCity(row.adress || row.address),
          name: row.name,
          address: row.adress || row.address || 'Address not available',
          directionsLink: row.Links || row.Link || '#',
          distanceKm: Number(Number(row.distance_km || 0).toFixed(2)),
          score: scoring.score,
          label: scoring.label,
          labelTone: scoring.labelTone,
          fuzzyScore: scoring.fuzzyScore,
          parameters: scoring.parameters,
          diagnostic: scoring.diagnostic
        };
      }).filter(item => item.name);
    } else {
      categoryMap[categoryKey] = [];
    }
  }

  const categories = Object.values(window.FuzzyLogic.CATEGORY_CONFIGS).map((config) => ({
    key: config.key,
    label: config.label,
    total: categoryMap[config.key].length,
    parameters: config.parameters
  }));

  const cities = SUPPORTED_CITIES.map((cityName) => {
    const total = Object.values(categoryMap).reduce((sum, items) => sum + items.filter((item) => item.city === cityName).length, 0);
    return { name: cityName, available: total > 0, total };
  });

  state.placesByCategory = categoryMap;
  state.meta = { categories, cities };
}

function routeParts() {
  return window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
}

function setRoute(route) {
  window.location.hash = route;
}

function scoreTone(labelTone) {
  return labelTone || 'neutral';
}

function renderLandingPage() {
  backButton.classList.add('hidden');
  app.innerHTML = `
    <section class="page page-home">
      <div class="hero">
        <article class="hero-copy panel">
          <span class="eyebrow">Master's Project - Switzerland Travel Amenities</span>
          <h1>Fuzzy Systems Project for smarter travel amenities.</h1>
          <p>
            This web application helps travelers explore important amenities across Switzerland. We currently focus on
            6 Swiss cities and 5 essential services. Fuzzy logic works quietly in the background to generate a sustainability score and label for every place.
          </p>
          <div class="hero-service-list">${serviceHighlights.map((service) => `<span class="mini-pill">${service}</span>`).join('')}</div>
          <div class="hero-actions">
            <button class="primary-button" type="button" data-action="start">Start Exploring</button>
            <button class="secondary-button" type="button" data-action="bern-demo">Open Bern Demo</button>
            <button class="secondary-button" type="button" data-action="about">About Us</button>
          </div>
        </article>
        <aside class="hero-visual panel">
          <div class="hero-metric">
            <span>Project overview</span>
            <strong>6 Cities, 5 Services</strong>
            <p>Designed as a travel support platform that compares nearby amenities and facilities through sustainability-focused scoring.</p>
          </div>
          <div class="hero-badges">
            <div class="metric-card"><span>Coverage</span><strong>${state.meta.categories.reduce((sum, item) => sum + item.total, 0)}+ places</strong></div>
            <div class="metric-card"><span>Swiss cities</span><strong>${state.meta.cities.length}</strong></div>
            <div class="metric-card"><span>Core services</span><strong>${state.meta.categories.length}</strong></div>
          </div>
        </aside>
      </div>
    </section>
  `;
}

function renderAboutPage() {
  backButton.classList.remove('hidden');
  app.innerHTML = `
      <section class="page">
      <div class="about-layout">
        <header class="section-head">
          <div>
            <h1 class="section-title">About This Project</h1>
            <p class="section-copy">This platform is a Switzerland travel amenities project built with a pure Fuzzy Inference System using Triangular membership functions. We compare different types of places, map service parameters via exact logic rules, and convert them into easy-to-understand sustainability results for travelers.</p>
          </div>
        </header>
        <section class="about-grid">
          <article class="about-card">
            <h3>What we do</h3>
            <div class="about-points">
              <div class="about-point"><strong>Swiss city coverage</strong><span>Bern, Basel, Zurich, Geneva, Lausanne, and Lucerne</span></div>
              <div class="about-point"><strong>Service categories</strong><span>Restaurants, hotels, restrooms, convenience stores, and pharmacies</span></div>
              <div class="about-point"><strong>How places are rated</strong><span>We process raw inputs, fuzzify them into L, M, H, apply complex rules arrays, and defuzzify to 1 final score.</span></div>
              <div class="about-point"><strong>Why fuzzy systems</strong><span>They replicate human reasoning directly through computational logic structures.</span></div>
            </div>
          </article>
          <article class="about-card">
            <h3>How users read the results</h3>
            <div class="rating-list">
              <div class="rating-item"><strong>Excellent</strong><span>91 - 100 Score</span></div>
              <div class="rating-item"><strong>Very Good</strong><span>76 - 90 Score</span></div>
              <div class="rating-item"><strong>Good</strong><span>61 - 75 Score</span></div>
              <div class="rating-item"><strong>Average</strong><span>41 - 60 Score</span></div>
              <div class="rating-item"><strong>Bad</strong><span>21 - 40 Score</span></div>
              <div class="rating-item"><strong>Very Bad</strong><span>0 - 20 Score</span></div>
            </div>
          </article>
        </section>
      </div>
    </section>
      `;
}

function renderCitiesPage() {
  backButton.classList.add('hidden');
  app.innerHTML = `
      <section class="page page-cities">
      <header class="section-head">
        <div>
          <h1 class="section-title">Choose a Swiss city</h1>
          <p class="section-copy">The uploaded datasets currently provide live entries for Bern. The other cities stay visible in the interface so your project can scale without redesign.</p>
        </div>
      </header>
      <section class="city-grid">
        ${state.meta.cities.map((city) => `
          <article class="city-card ${city.available ? '' : 'unavailable'}" data-city="${city.name}">
            <div>
              <span class="status-pill ${city.available ? 'available' : ''}">${city.available ? `${city.total} live records` : 'Dataset coming soon'}</span>
              <h3>${city.name}</h3>
              <p>${cityDescriptions[city.name]}</p>
            </div>
      <button class="chip-button" type="button">${city.available ? 'Explore services' : 'Preview city flow'}</button>
          </article>
      `).join('')}
      </section>
    </section>
  `;
}

function renderCategoriesPage() {
  backButton.classList.remove('hidden');
  const categoriesUnsorted = state.meta.categories.map((category) => {
    const liveCount = (state.placesByCategory[category.key] || []).filter((item) => item.city === state.selectedCity).length;
    return { ...category, liveCount };
  });

  // STEP 3: Category Priorities Integration
  // Dynamically calculate which category is most relevant to the user right now based on their sliders
  const { hunger, fatigue, restroom: urgency, hygiene, budget, stay } = state.userInputs;
  const priorities = {
    restaurants: hunger,
    hotels: stay * 0.7 + fatigue * 0.3,
    restrooms: urgency,
    pharmacies: hygiene * 0.6 + urgency * 0.4,
    stores: budget * 0.5 + hunger * 0.2
  };

  const categoriesForCity = categoriesUnsorted.map(c => ({
    ...c,
    priority: priorities[c.key] || 0
  })).sort((a, b) => b.priority - a.priority);

  app.innerHTML = `
    <section class="page">
      <header class="section-head">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%;">
          <div>
            <h1 class="section-title">${state.selectedCity} service categories</h1>
            <p class="section-copy">Pick a service type to run the fuzzy model for ${state.selectedCity}.</p>
          </div>
          <button class="secondary-button" id="open-needs-btn" style="margin-bottom: 20px;">
            Adjust My Needs
          </button>
        </div>
      </header>
      
      <div id="needs-modal" class="panel hidden" style="background: var(--bg-surface); border: 1px solid var(--border); margin-bottom: 30px; padding: 24px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div class="slider-group">
            <label>Hunger: <strong id="val-hunger">${state.userInputs.hunger}</strong></label>
            <input type="range" id="in-hunger" min="0" max="10" value="${state.userInputs.hunger}" style="width:100%;">
          </div>
          <div class="slider-group">
            <label>Fatigue: <strong id="val-fatigue">${state.userInputs.fatigue}</strong></label>
            <input type="range" id="in-fatigue" min="0" max="10" value="${state.userInputs.fatigue}" style="width:100%;">
          </div>
          <div class="slider-group">
            <label>Restroom Urgency: <strong id="val-restroom">${state.userInputs.restroom}</strong></label>
            <input type="range" id="in-restroom" min="0" max="10" value="${state.userInputs.restroom}" style="width:100%;">
          </div>
          <div class="slider-group">
            <label>Hygiene Preference: <strong id="val-hygiene">${state.userInputs.hygiene}</strong></label>
            <input type="range" id="in-hygiene" min="0" max="10" value="${state.userInputs.hygiene}" style="width:100%;">
          </div>
          <div class="slider-group">
            <label>Budget Sensitivity: <strong id="val-budget">${state.userInputs.budget}</strong></label>
            <input type="range" id="in-budget" min="0" max="10" value="${state.userInputs.budget}" style="width:100%;">
          </div>
          <div class="slider-group">
            <label>Length of Stay: <strong id="val-stay">${state.userInputs.stay}</strong></label>
            <input type="range" id="in-stay" min="0" max="10" value="${state.userInputs.stay}" style="width:100%;">
          </div>
        </div>
        <div style="margin-top: 20px; text-align: right;">
          <button class="primary-button" id="apply-needs-btn">Apply & Update Rankings</button>
        </div>
      </div>

      <section class="category-grid">
        ${categoriesForCity.map((category) => `
          <article class="category-card ${category.liveCount ? '' : 'unavailable'}" data-category="${category.key}">
            <div>
              <span class="status-pill ${category.liveCount ? 'available' : ''}">${category.liveCount ? `${category.liveCount} live records` : 'No live data yet'}</span>
              <h3>${category.label}</h3>
              <p>${categoryDescriptions[category.key]}</p>
            </div>
            <button class="chip-button" type="button">${category.liveCount ? `View ${category.label}` : 'Preview'}</button>
          </article>
        `).join('')}
      </section>
    </section>
  `;

  // --- Logic for the Modal ---
  const modal = document.getElementById('needs-modal');
  document.getElementById('open-needs-btn').onclick = () => modal.classList.toggle('hidden');

  // Update real-time number labels
  ['hunger', 'fatigue', 'restroom', 'hygiene', 'budget', 'stay'].forEach(key => {
    document.getElementById(`in-${key}`).oninput = (e) => {
      document.getElementById(`val-${key}`).innerText = e.target.value;
    };
  });

  document.getElementById('apply-needs-btn').onclick = async () => {
    state.userInputs.hunger = parseInt(document.getElementById('in-hunger').value);
    state.userInputs.fatigue = parseInt(document.getElementById('in-fatigue').value);
    state.userInputs.restroom = parseInt(document.getElementById('in-restroom').value);
    state.userInputs.hygiene = parseInt(document.getElementById('in-hygiene').value);
    state.userInputs.budget = parseInt(document.getElementById('in-budget').value);
    state.userInputs.stay = parseInt(document.getElementById('in-stay').value);

    await buildDataModel(); // Priority Engine recalculates here 
    modal.classList.add('hidden');
    renderCategoriesPage(); // Refresh counts
  };
}

function getFilteredItems() {
  let items = state.placesByCategory[state.selectedCategory] || [];
  items = items.filter((item) => item.city === state.selectedCity);
  if (state.filters.label !== 'All') items = items.filter((item) => item.label === state.filters.label);
  const sorters = {
    score_desc: (a, b) => b.score - a.score,
    score_asc: (a, b) => a.score - b.score,
    name_asc: (a, b) => a.name.localeCompare(b.name),
    distance_asc: (a, b) => a.distanceKm - b.distanceKm
  };
  return items.slice().sort(sorters[state.filters.sort] || sorters.score_desc);
}

function renderResultsPage() {
  backButton.classList.remove('hidden');
  const items = getFilteredItems();
  const hasItems = items.length > 0;
  app.innerHTML = `
    <section class="page">
      <header class="section-head">
        <div>
          <h1 class="section-title">${window.FuzzyLogic.CATEGORY_CONFIGS[state.selectedCategory].label} in ${state.selectedCity}</h1>
          <p class="section-copy">Scores are generated dynamically from your datasets using the category-specific fuzzy inference system.</p>
        </div>
      </header>
      <section class="toolbar">
        <div class="toolbar-controls">
          <h2>Filters and ranking</h2>
          <span class="mini-pill">${items.length} results</span>
        </div>
        <div class="filter-row">
          <select id="sort-select" class="filter-select">
            <option value="score_desc">Highest sustainability score</option>
            <option value="score_asc">Lowest sustainability score</option>
            <option value="name_asc">Name A-Z</option>
            <option value="distance_asc">Nearest first</option>
          </select>
          <select id="label-select" class="filter-select">
            <option value="All">All labels</option>
            <option value="Excellent">Excellent</option>
            <option value="Very Good">Very Good</option>
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="Bad">Bad</option>
            <option value="Very Bad">Very Bad</option>
          </select>
        </div>
      </section>
      <section class="cards-grid">
        ${hasItems ? items.map((item) => `
          <article class="result-card">
            <div class="card-topline">
              <span class="score-pill ${scoreTone(item.labelTone)}">${item.label}</span>
              <span class="mini-pill">${item.categoryLabel}</span>
              <span class="mini-pill">${item.distanceKm} km away</span>
            </div>
            <div><h3>${item.name}</h3><p>${item.address}</p></div>
            <div class="score-cluster">
              <div><strong>${item.score}/100</strong><div class="subtle">Sustainability score</div></div>
              <div><strong>${(item.score / 10).toFixed(1)}/10</strong><div class="subtle">Overall rating</div></div>
            </div>
            <div class="parameter-bar">${item.parameters.slice(0, 3).map((parameter) => `<span class="mini-pill">${parameter.name}: ${parameter.score}/10</span>`).join('')}</div>
            <div class="card-actions">
              <button class="primary-button" type="button" data-view-detail="${item.id}">Deep Insights</button>
              <a class="secondary-button" href="${item.directionsLink}" target="_blank" rel="noreferrer">Get Directions</a>
            </div>
          </article>
        `).join('') : `
          <article class="empty-state">
            <div>
              <h3>No ${window.FuzzyLogic.CATEGORY_CONFIGS[state.selectedCategory].label.toLowerCase()} data found for ${state.selectedCity}</h3>
              <p>Right now your uploaded CSV files contain live rows mainly for Bern. Try Bern to see restaurant and hotel results, or add ${state.selectedCity} rows to the dataset files to make this category go live.</p>
            </div>
          </article>
        `}
      </section>
    </section>
  `;
  document.getElementById('sort-select').value = state.filters.sort;
  document.getElementById('label-select').value = state.filters.label;
  document.getElementById('sort-select').addEventListener('change', (event) => { state.filters.sort = event.target.value; renderResultsPage(); });
  document.getElementById('label-select').addEventListener('change', (event) => { state.filters.label = event.target.value; renderResultsPage(); });
}

function buildRing(score) {
  const circumference = 2 * Math.PI * 52;
  const dash = score / 100 * circumference;
  return `
    <div class="score-ring">
      <svg viewBox="0 0 140 140" role="img" aria-label="Sustainability score ring">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e8f5a"></stop>
            <stop offset="100%" stop-color="#74d39b"></stop>
          </linearGradient>
        </defs>
        <circle cx="70" cy="70" r="52" fill="none" stroke="rgba(23, 50, 38, 0.08)" stroke-width="14"></circle>
        <circle class="progress-ring" cx="70" cy="70" r="52" fill="none" stroke="url(#ringGradient)" stroke-width="14" stroke-linecap="round" stroke-dasharray="${dash} ${circumference}"></circle>
        <text x="70" y="70" text-anchor="middle" dominant-baseline="middle" font-size="24">${score}</text>
        <text x="70" y="92" text-anchor="middle" font-size="9">out of 100</text>
      </svg>
    </div>
  `;
}

function renderDetailPage(id) {
  const item = (state.placesByCategory[state.selectedCategory] || []).find((entry) => entry.id === id);
  const coordinates = extractCoordinates(item.directionsLink);
  const topParameters = item.parameters.slice().sort((left, right) => right.score - left.score).slice(0, 3);

  const fuzzificationRows = item.parameters.map(p => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td style="color:var(--accent-strong);"><strong>${p.score}</strong></td>
      <td>${p.memberships.L}</td>
      <td>${p.memberships.M}</td>
      <td>${p.memberships.H}</td>
    </tr>
  `).join('');

  const activeRulesList = (item.diagnostic.activeRules || []).map((rule, idx) => `
    <tr>
      <td>R${idx + 1}</td>
      <td style="font-family: monospace;">${rule.raw}</td>
      <td>${rule.output}</td>
      <td><strong>${rule.strength}</strong></td>
    </tr>
  `).join('');

  let formulaMath = '';
  if (item.diagnostic.activeRules && item.diagnostic.activeRules.length > 0) {
    const sumProducts = item.diagnostic.activeRules.map(r => `${r.output}×${r.strength}`).join(' + ');
    const sumStrengths = item.diagnostic.activeRules.map(r => `${r.strength}`).join(' + ');
    formulaMath = `Final = Σ(output × strength) / Σ(strength)<br><br>= (${sumProducts}) / (${sumStrengths})<br>= ${item.diagnostic.numerator.toFixed(1)} / ${item.diagnostic.denominator.toFixed(2)}<br>≈ <strong>${item.score}</strong>`;
  } else {
    formulaMath = `No active rules triggered for these inputs.`;
  }

  app.innerHTML = `
    <section class="page">
      <div class="detail-layout">
        <article class="detail-summary">
          <div class="card-topline">
            <span class="score-pill ${scoreTone(item.labelTone)}">${item.label}</span>
            <span class="mini-pill">${item.categoryLabel}</span>
            <span class="mini-pill">${item.city}</span>
          </div>
          <div><h2>${item.name}</h2><p>${item.address}</p></div>
          <div class="detail-score">${item.score}</div>
          <p>Transparency view showing how the pure fuzzy logic engine calculated this label.</p>
          <div class="detail-actions">
            <a class="primary-button" href="${item.directionsLink}" target="_blank" rel="noreferrer">Get Directions</a>
            <button class="secondary-button" type="button" data-action="back-to-results">Back to Results</button>
          </div>
        </article>

        <section class="insight-grid" style="grid-template-columns: 1fr;">
          <article class="detail-chart" style="width: 100%;">
            <h3>1. Input Values & Fuzzification Table</h3>
            <p style="margin-bottom: 12px; color: var(--muted);">Every raw score (0-10) is dynamically converted into Low, Medium, and High fuzzy percentages using triangular equations.</p>
            <div class="insight-table-wrap">
              <table class="insight-table">
                <thead>
                  <tr>
                    <th>Parameter (Condition)</th><th>Raw Scratch Score (0-10)</th><th>Low (L)</th><th>Medium (M)</th><th>High (H)</th>
                  </tr>
                </thead>
                <tbody>
                  ${fuzzificationRows}
                </tbody>
              </table>
            </div>
          </article>
          
          <article class="detail-chart" style="width: 100%;">
            <h3>2. Active Applied Rules</h3>
            <p style="margin-bottom: 12px; color: var(--muted);">The system evaluates background mathematical rules and uses the minimum condition strength.</p>
            <div class="insight-table-wrap" style="max-height: 400px; overflow-y: auto;">
              <table class="insight-table">
                <thead>
                  <tr>
                    <th>Rule</th><th>Logic</th><th>Output</th><th>Strength</th>
                  </tr>
                </thead>
                <tbody>
                  ${activeRulesList || `<tr><td colspan="4">No rules found.</td></tr>`}
                </tbody>
              </table>
            </div>
          </article>

          <article class="detail-chart" style="width: 100%;">
            <h3>3. Defuzzification Engine</h3>
            <p style="margin-bottom: 12px; color: var(--muted);">Combines all active rules into the final sustainability answer.</p>
            <div class="insight-formula">${formulaMath}</div>
            
            <div style="margin-top:20px; font-size: 1.2rem; background: var(--accent-soft); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--accent);">
              <strong>🎯 Final Linguistic Output:</strong> ${item.score} points maps directly to a label of <strong>${item.label} ⭐</strong>.
            </div>
          </article>
        </section>
      </div>
    </section>
  `;
}

function applyBackBehavior(parts) {
  if (!parts.length || parts[0] === 'cities') {
    backButton.classList.add('hidden');
    return;
  }
  backButton.classList.remove('hidden');
  backButton.onclick = () => {
    if (parts[0] === 'about') return setRoute('/');
    if (parts[0] === 'city' && parts.length === 2) return setRoute('/cities');
    if (parts[0] === 'city' && parts.length === 3) return setRoute(`/city/${encodeURIComponent(state.selectedCity)}`);
    if (parts[0] === 'detail') return setRoute(`/city/${encodeURIComponent(state.selectedCity)}/${state.selectedCategory}`);
  };
}

async function router() {
  if (!state.meta) await buildDataModel();
  const parts = routeParts();
  applyBackBehavior(parts);

  if (!parts.length) return renderLandingPage();
  if (parts[0] === 'about') return renderAboutPage();
  if (parts[0] === 'cities') return renderCitiesPage();
  if (parts[0] === 'city' && parts.length >= 2) {
    state.selectedCity = decodeURIComponent(parts[1]);
    if (parts.length === 2) return renderCategoriesPage(); // Needs assessed here
    if (parts.length === 3) {
      state.selectedCategory = parts[2];
      return renderResultsPage();
    }
  }
  if (parts[0] === 'detail' && parts.length === 3) {
    state.selectedCategory = parts[1];
    return renderDetailPage(parts[2]);
  }
  renderLandingPage();
}

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-action="start"]')) return setRoute('/cities'); // Updated entry point
  if (event.target.closest('[data-action="bern-demo"]')) {
    state.selectedCity = 'Bern';
    return setRoute('/city/Bern');
  }
  if (event.target.closest('[data-action="about"]')) return setRoute('/about');
  const cityCard = event.target.closest('[data-city]');
  if (cityCard) {
    state.selectedCity = cityCard.dataset.city;
    return setRoute(`/city/${encodeURIComponent(state.selectedCity)}`);
  }
  const categoryCard = event.target.closest('[data-category]');
  if (categoryCard) {
    state.selectedCategory = categoryCard.dataset.category;
    state.filters = { sort: 'score_desc', label: 'All' };
    return setRoute(`/city/${encodeURIComponent(state.selectedCity)}/${state.selectedCategory}`);
  }
  const detailButton = event.target.closest('[data-view-detail]');
  if (detailButton) return setRoute(`/detail/${state.selectedCategory}/${detailButton.dataset.viewDetail}`);
  if (event.target.closest('[data-action="back-to-results"]')) return setRoute(`/city/${encodeURIComponent(state.selectedCity)}/${state.selectedCategory}`);
});

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);