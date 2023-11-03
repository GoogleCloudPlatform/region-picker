/*
Copyright 2021 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { regionOptimizer } from './region-optimizer.js';

const regionsToDisplay = 10;

let inputs = document.querySelectorAll('.weight');
let initialized = false;
let userCoords;
let regions;
let fetching;

async function initializeCountrySelect() {
  let countries;

  await fetch("data/countries.json")
    .then(data => data.json())
    .then(json => countries = json);

  // Sort countries by name.
  countries.sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });

  const locationsSelect = document.getElementById('locations');
  for (const country of countries) {
    // Store the stringified object as option value.
    // Adding the actual values as data- attribute mighe be nicer.
    locationsSelect.add(new Option(country.name, JSON.stringify(country)));
  }
}

/**
 * Should this product be selected by default?
 * @param {String} product the proeuct to check
 * @returns {boolean} true if product should be selected
 */
function defaultSelectedProduct(product) {
  let defaultProducts = [
    "Compute Engine",
    "Cloud Storage",
    "Google Kubernetes Engine",
    "Cloud Run"
  ];
  return defaultProducts.includes(product);
}

async function initializeProductSelect() {
  let products;

  await fetch("data/products.json")
  .then(data => data.json())
  .then(json => products = json);

  const productsSelect = document.getElementById('products');

  for (const product in products) {
    productsSelect.add(new Option(product, JSON.stringify(products[product]), defaultSelectedProduct(product), defaultSelectedProduct(product)));
  }
}

async function fetchData() {
  fetching = true;
  let carbonData;
  let priceData;

  // Fetch data in parrallel
  await Promise.all([
      fetch("https://googlecloudplatform.github.io/region-carbon-info/data/yearly/2022.csv")
          .then(data => data.text())
          .then(text => carbonData = parseCarbonCSV(text)),
      fetch("data/prices.json")
          .then(data => data.json())
          .then(json => priceData = json),
      fetch("data/regions.json")
          .then(data => data.json())
          .then(json => regions = json)
  ]);

  fetching = false;

  // Merge all data in regions object.
  for (let region in regions) {
      Object.assign(regions[region], priceData[region]);
      Object.assign(regions[region], carbonData[region]);
  }
}

/**
 * Parse CSV file from https://github.com/GoogleCloudPlatform/region-carbon-info/ 
 * @param {String} text : CSV file as a string. First row is title, next rows are 'region', 'name', 'CFE', 'intensity'.
 * @return Parsed carbon data as Object { 'region': {} }
 */
 function parseCarbonCSV(text) {
  // First split each newlines, then split comma. 
  let rows = text.split('\n').map(row => row.split(','));

  let carbonData = {};
  for (let r = 1; r < rows.length; r++) {
      let row = rows[r];

      let regionCarbonData = {};
      regionCarbonData.gCO2_kWh = parseInt(row[3], 10)
      let cfe = parseFloat(row[2]);
      if (cfe) {
          regionCarbonData.cfe = cfe;
      }
      carbonData[row[0]] = regionCarbonData;
  };

  return carbonData;
}

function bindListeners() {
  for (const input of inputs) {
    input.addEventListener('input', recommendRegion);
    input.addEventListener('input', grayOutWhenZero);
  }

  document.getElementById('locations').addEventListener('change', recommendRegion);

  document.getElementById('products').addEventListener('change', recommendRegion);

  document.getElementById('share').addEventListener('click', () => {
    navigator.share({
      title: 'Google Cloud region recommender',
      url: document.location.href,
    });
  });

  document.getElementById('more').addEventListener('click', (event) => {
    event.target.remove();
    document.getElementById('results').classList.remove('short');
  });
};

function regionToLeaves(region) {
  if(region.cfe) {
    return Math.floor(region.cfe * 4);
  } else {
    if(region.gCO2_kWh < 200) {
      return 3;
    } else if(region.gCO2_kWh < 400) {
      return 2;
    } else if(region.gCO2_kWh < 600) {
      return 1;
    } else {
      return 0;
    }
  }
}

function regionToDollars(region) {
  return Math.floor(region.gce_normalized * 2.9 + 1)
}

function updateList(list, results) {
  // clean the list
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  // Print top regions
  for (let i = 0; i < Math.min(regionsToDisplay, results.length); i++) {
    printResultInList(list, results[i]);
  }
}

function printResults(results) {
  console.log("Results:", results);
  const list = document.getElementById('results');

  if(!document.startViewTransition) {
    updateList(list, results);
  } else {
    document.startViewTransition(() => updateList(list, results));
  }
}

/**
 * Append the given result to the list in the DOM 
 * @param {*} list DOM <li>
 * @param {*} result {region, properties, score}
 */
function printResultInList(list, result) {
  let row = document.getElementById('result-row').content.cloneNode(true);
  row.querySelector('li').style.viewTransitionName = result.region;
  row.querySelector('.region').textContent = result.region;
  row.querySelector('.name').textContent = result.properties.name;
  row.querySelector('.price').textContent = result.properties.gce;
  if(!result.properties.cfe) {
    row.querySelector('.cfe-sentence').remove();
  } else {
    row.querySelector('.cfe').textContent = Math.round(result.properties.cfe * 100);
  }
  row.querySelector('.gCO2_kWh').textContent = result.properties.gCO2_kWh;

  row.querySelector('.flag').src = result.properties.flag;

  row.querySelector('.leaves').classList.add("n" + regionToLeaves(result.properties));
  row.querySelector('.dollars').classList.add("n" + regionToDollars(result.properties));

  list.appendChild(row);
}

/** When the input is set to 0, provide a visual indicator that the inpt isn't used */
function grayOutWhenZero(event) {
  if(parseInt(event.target.value, 10) === 0) {
    document.querySelector('.weight-group.' + event.target.id).classList.add('zero');
    if(event.target.id === 'latency') {
      document.getElementById('locations-group').classList.add('zero');
      document.getElementById('locations').disabled = true;
    }
  } else {
    document.querySelector('.weight-group.' + event.target.id).classList.remove('zero');
    if(event.target.id === 'latency') {
      document.getElementById('locations-group').classList.remove('zero');
      document.getElementById('locations').disabled = false;
    }
  }
}

async function recommendRegion() {
  if(!regions) {
    if(!fetching) {
      await fetchData();
    } else {
      return;
    }
  }
  
  let params = {
    weights: {},
    locations: [],
  };

  // Add weights
  for (const input of inputs) {
    params.weights[input.name] = parseInt(input.value, 10) / 10;
  }

  // Add current location and any other selected country.
  const locationSelect = document.getElementById('locations')
  for (const option of locationSelect.options) {
    if (option.selected) {
      if (option.value === "--current-location--") {
        if (userCoords) {
          params.locations.push(userCoords);
        } else {
          console.log("Current location not available.");
        }
      } else {
        params.locations.push(JSON.parse(option.value));
      }
    }
  }

  // Array of allowed regions, based on selected products
  params.allowedRegions = new Set();
  // get currently selected products
  const productSelect = document.getElementById('products');
  if(productSelect.selectedIndex === -1) {
    console.warn("No selected product");
  } else {

    // Start with all regions in which the first selected product is available
    const firstSelectedOption = productSelect.selectedOptions[0];
    const firstSelectionRegionsMap = JSON.parse(firstSelectedOption.value);
    for (const region of Object.keys(firstSelectionRegionsMap)) {
      if(firstSelectionRegionsMap[region]) {
        params.allowedRegions.add(region);
      }
    }

    // For all other selected products, remove from the previous set any region where it's not available
    for (let o = 1; o < productSelect.selectedOptions.length; o++) {
      const regionsMap = JSON.parse(productSelect.selectedOptions[o].value);
      for (const region of Object.keys(regionsMap)) {
        if(!regionsMap[region]) {
          params.allowedRegions.delete(region);
        }
      }
    }
  }
  
  // TODO: Should we always store params in URL? or only when user hits 'Share'?
  // In any case, we need to handle the user coordinates in a special way:
  // First because it's an object that doesn't transforms well in JS.
  // Second, because we request location by default, so we probably don't want it to be captured in URL.
  // window.location.hash = encodeURIComponent(JSON.stringify(params));

  regionOptimizer(regions, params).then(printResults);
};

async function initialize() {
  if(!initialized) {
    await initializeCountrySelect();
    await initializeProductSelect();
    bindListeners();    
    initialized = true;
  }
}

navigator.geolocation.getCurrentPosition(async (position) => {
  userCoords = position.coords;
  await initialize();
  recommendRegion();
});

// TODO: Load params from URL
if(window.location.hash) {
  let urlParams = JSON.parse(decodeURIComponent(window.location.hash.slice(1)));
  console.log('TODO: load URL params', urlParams);
}

await initialize();
recommendRegion();