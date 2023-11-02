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

const normalizedSuffix = "_normalized";
const cfeAttr = "cfe";
const carbonIntensityAttr = "gCO2_kWh";
const priceAttr = "gce";
const distanceAttr = "distance";

function distance(destination, origin) {
    // Thanks https://www.movable-type.co.uk/scripts/latlong.html
    const R = 6371e3; // metres
    const φ1 = origin.latitude * Math.PI / 180; // φ, λ in radians
    const φ2 = destination.latitude * Math.PI / 180;
    const Δφ = (destination.latitude - origin.latitude) * Math.PI / 180;
    const Δλ = (destination.longitude - origin.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
}

/**
 * Normalizes a certain attribute of the given region map.
 * Creates a new attribute "ATTRIBUTE_nornalized".
 * @param {Object} map: a map of <region, data>
 * @param {String} attribute: the attribute in data to normalize against
 */
function normalizeAttributes(map, attribute) {
    let min = Infinity;
    let max = -Infinity;
    for (const region in map) {
        let value = map[region][attribute];
        if (value > max) {
            max = value;
        }
        if (value < min) {
            min = value;
        }
    }
    for (const region in map) {
        if (map[region][attribute] !== undefined) {
            map[region][attribute + normalizedSuffix] = (map[region][attribute] - min) / (max - min)
        }
    }
}

/**
 * Filter out any region from the results that isn't in the list of allowed regions
 * @param {Set} allowedRegions set of allowed regions
 * @param {Array} sortedResults array of results, sorted by score
 */
function keepOnlyAllowedRegionsFromResults(allowedRegions, sortedResults) {
    return sortedResults.filter(result => allowedRegions.has(result.region));
}




function rankRegions(regions, inputs) {
    let results = [];
    let latencyData;

    normalizeAttributes(regions, cfeAttr);
    normalizeAttributes(regions, carbonIntensityAttr);
    normalizeAttributes(regions, priceAttr);

    // If latency is a criteria and some locations have been specified,
    // score each region based on proximity to locations.
    if (inputs.weights.latency > 0 && inputs.locations.length > 0) {
        latencyData = {};
        for (const region in regions) {
            let d = 0;
            for (const location of inputs.locations) {
                d += distance(location, regions[region]);
            }
            latencyData[region] = { distance: d };
        }
        normalizeAttributes(latencyData, distanceAttr);
    }

    for (const region in regions) {
        let score = 0;
        // price: lower is better
        score += (1 - regions[region]?.[priceAttr + normalizedSuffix]) * inputs.weights.price;
        // carbon
        if (regions[region]?.[cfeAttr] !== undefined) {
            // CFE: higher is better
            score += regions[region]?.[cfeAttr + normalizedSuffix] * inputs.weights.carbon;
        } else {
            // Carbon Intensity: Lower is better
            score += (1 - regions[region]?.[carbonIntensityAttr + normalizedSuffix]) * inputs.weights.carbon;
        }

        if (inputs.weights.latency > 0 && inputs.locations.length > 0) {
            // latency: lower is better
            score += (1 - latencyData?.[region]?.[distanceAttr + normalizedSuffix]) * inputs.weights.latency;
        }

        if (!isNaN(score)) {
            results.push({
                region: region,
                properties: regions[region],
                score: score,
            });
        }
    }

    const resultSorted = results.sort(function (a, b) {
        return b.score - a.score;
    });

    const resultFilteredSorted = keepOnlyAllowedRegionsFromResults(inputs.allowedRegions, resultSorted);

    return resultFilteredSorted;
}

/*
@param regions: {
    region: {}
}
@param inputs: {
    weights: {
        latency: 0.5,
        price: 0.5
        carbon: 0.5
    },
    locations: [
        {latitude, longitude}
    ],
    allowedRegions: ['us-central1', 'us-east1']
}
@return [{
        region: 'us-central1',
        name: '' 
        score: 0.2
    }]
*/
async function regionOptimizer(regions, inputs) {
    console.log('Optimizing with:', 'Regions:', regions, 'Inputs:', inputs)

    return rankRegions(regions, inputs);
}

export { regionOptimizer }