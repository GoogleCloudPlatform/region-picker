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

let inputs;
let userCoords;
let countries;

async function initializeCountrySelect() {
  await fetch("data/countries.json")
  .then(data => data.json())
  .then(json => countries = json);

  // Sort countries by name.
  countries.sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });

  const locationsSelect = document.getElementById('locations');
  for(const country of countries) {
    const option = document.createElement("option");
    // Stoe the stringified object as option value.
    // Adding the actual values as data- attribute mighe be nicer.
    option.value = JSON.stringify(country);
    option.text = country.name;
    locationsSelect.add(option);
  }
}

function bindListeners() {
  inputs = document.querySelectorAll('.weight');
  for(const input of inputs) {
    input.addEventListener('input', recommendRegion);
  }

  document.getElementById('locations').addEventListener('change', recommendRegion); 
};

function printResults(results) {
  console.log("Results:");
  console.log(results);
  const list = document.getElementById('results');

  // clean the list
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  // Print top regions
  for(let i = 0; i < Math.min(10, results.length); i++) {
    printResultInList(list, results[i]);
  }
}

/**
 * Append the given result to the list in the DOM 
 * @param {*} list DOM <li>
 * @param {*} result {region, properties, score}
 */
function printResultInList(list, result) {
  let row = document.getElementById('result-row').content.cloneNode(true);
  row.querySelector('.region').textContent = result.region;
  row.querySelector('.name').textContent = result.properties.name;
  row.querySelector('.price').textContent = result.properties.gce;
  row.querySelector('.cfe').textContent = result.properties.carbon_free_percent;
  list.appendChild(row);
}

function recommendRegion() {
  let params = {
    weights: {},
    locations: [],
  };

  // Add weights
  for(const input of inputs) {
    params.weights[input.name] = parseInt(input.value, 10) / 10;
  }

  // Add current location and any other selected country.
  const locationSelect = document.getElementById('locations')
  for(const option of locationSelect.options) {
    if(option.selected) {
      if(option.value === "--current-location--") {
        if(userCoords) {
          params.locations.push(userCoords);
        } else {
          console.log("Current location not available.");
        }
      } else {
        params.locations.push(JSON.parse(option.value));
      }
    }
  }

  regionOptimizer(params).then(printResults);
};

navigator.geolocation.getCurrentPosition((position) => { 
    userCoords = position.coords;
    recommendRegion();
});

initializeCountrySelect();
bindListeners();
recommendRegion();