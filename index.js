import { regionOptimizer } from './region-optimizer.js';

let inputs;

function bindListeners() {
  inputs = document.querySelectorAll('.weight');
  for(const input of inputs) {
    input.addEventListener('input', recommendRegion);
  }
};

function printResults(results) {
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
    list.appendChild(row);
  }

}

function recommendRegion() {
  let params = {
    weights: {}
  };
  for(const input of inputs) {
    params.weights[input.name] = parseInt(input.value, 10) / 100;
  }
	regionOptimizer(params).then(printResults);
};

bindListeners();
recommendRegion();