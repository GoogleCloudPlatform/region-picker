import { regionOptimizer } from './region-optimizer.js';

function bindListeners() {
  const inputs = document.querySelectorAll('.weight');
  for(const input of inputs) {
    input.addEventListener('input', recommendRegion);
  }
};

function recommendRegion() {
	regionOptimizer();
};

bindListeners();
recommendRegion();