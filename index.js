import { regionOptimizer } from './region-optimizer.js';

let inputs;

function bindListeners() {
  inputs = document.querySelectorAll('.weight');
  for(const input of inputs) {
    input.addEventListener('input', recommendRegion);
  }
};

function recommendRegion() {
  let params = {
    weights: {}
  };
  for(const input of inputs) {
    params.weights[input.name] = parseInt(input.value, 10) / 100;
  }
	regionOptimizer(params)
  .then(results => console.log(results));
};

bindListeners();
recommendRegion();