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

function bindListeners() {
  inputs = document.querySelectorAll('.weight');
  for(const input of inputs) {
    input.addEventListener('input', recommendRegion);
  }
};

function printResults(results) {
  console.log("Results:");
  console.log(results);
  const list = document.getElementById('results');
  const template = document.getElementById('result-row');

  // clean the list
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  // Print top regions
  for(let i = 0; i < 5; i++) {
    let row = template.content.cloneNode(true);
    row.querySelector('.region').textContent = results[i].region;
    row.querySelector('.name').textContent = results[i].name;
    list.appendChild(row);
  }

}

function recommendRegion() {
  let params = {
    weights: {}
  };
  for(const input of inputs) {
    params.weights[input.name] = parseInt(input.value, 10) / 10;
  }
	regionOptimizer(params).then(printResults);
};

bindListeners();
recommendRegion();