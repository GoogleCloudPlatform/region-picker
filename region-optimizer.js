/*
Copyright 2020 Google LLC
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

let regions; 
let carbonData;
let priceData;
let details;

const normalizedSuffix = "_nornalized";
const cfeAttr = "carbon_free_percent";
const priceAttr = "gce"

async function fetchData() {
    await fetch("data/regions.json")
    .then(data => data.json())
    .then(json => regions = json);

    await fetch("data/carbon.json")
    .then(data => data.json())
    .then(json => carbonData = json);

    await fetch("data/prices.json")
    .then(data => data.json())
    .then(json => priceData = json);

    await fetch("data/details.json")
    .then(data => data.json())
    .then(json => details = json);
}

function normalizeData() {
    normalizeAttributes(carbonData, cfeAttr);
    normalizeAttributes(priceData, priceAttr);
}

/**
 * Normalizes the values of a certain attribute of the given map. 
 * @param {Object} map: a map of <region, data>
 * @param {String} attribute: the attribute of the map containing the value to normalize
 */
function normalizeAttributes(map, attribute) {
    let min = Infinity;
    let max = -Infinity;
    for (const region in map) {
        let value = map[region][attribute];
        if(value > max) {
            max = value;
        }
        if(value < min) {
            min = value;
        }
    }
    for (const region in map) {
        if(map[region][attribute]) {
            map[region][attribute + normalizedSuffix] = (map[region][attribute] - min) / (max - min)
        }
    }
}

function rankRegions(inputs) {
    let results = [];

    for(const region of regions) {
        let score = 
            // carbon: higher is better
            carbonData[region]?.[cfeAttr + normalizedSuffix] * inputs.weights.carbon 
            // price: lower is better
            + (1 - priceData[region]?.[priceAttr + normalizedSuffix]) * inputs.weights.price;
        if(!isNaN(score))
        results.push({
            region: region,
            score: score,
        });
    }

    let resultSorted = results.sort(function(a, b) {
        return b.score - a.score;
    });

    return resultSorted;
}

/*
@param inputs: {
    weights: {
        latency: 0.5,
        price: 0.5
        carbon: 0.5
    },
    locations: [
        {lat, long}
    ],
    currentLocationLatencies: {
        'us-central1': 0.2
    }
}
@return [{
        region: 'us-central1'
        score: 0.2
    }]
*/
async function regionOptimizer(inputs) {
    if(!regions || !!carbonData || !priceData) {
        await fetchData();
        normalizeData();
    }
    console.log('Fetched and noralized data:')
    console.log({carbonData, priceData, regions, details});

	console.log('Optimizing with inputs:');
    console.log(inputs);

    return rankRegions(inputs);
}

export {regionOptimizer}